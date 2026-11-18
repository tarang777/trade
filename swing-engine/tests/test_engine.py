import json

import numpy as np
import pandas as pd
import pytest

from swing.backtest import run_backtest
from swing.data import SyntheticProvider
from swing.features import build_panel
from swing.loop import LoopConfig, evolve
from swing.research import RuleResearcher, _coerce
from swing.scanner import scan
from swing.strategy import SEARCH_SPACE, StrategySpec, entry_mask


@pytest.fixture(scope="module")
def raw():
    return SyntheticProvider(n_symbols=40, years=6, seed=3).load()


@pytest.fixture(scope="module")
def panel(raw):
    return build_panel(raw)


def test_no_lookahead_in_features_and_signals(raw, panel):
    """Corrupting the future must not change any feature or signal up to the cut date."""
    cut = 900
    fut = {k: v.copy() for k, v in raw.ohlcv.items()}
    for k in ("open", "high", "low", "close"):
        fut[k].iloc[cut + 1:] *= 3.0
    bench = raw.bench.copy()
    bench.iloc[cut + 1:] *= 0.5
    p2 = build_panel(type(raw)(fut, bench))
    for name in ("sma200", "atr14", "rs_pct", "dist_52w_high", "breakout50", "mom252x21"):
        a, b = panel.f[name].iloc[: cut + 1], p2.f[name].iloc[: cut + 1]
        pd.testing.assert_frame_equal(a, b, check_exact=False, rtol=1e-9)
    spec = StrategySpec()
    assert (entry_mask(spec, panel)[: cut + 1] == entry_mask(spec, p2)[: cut + 1]).all()


def test_backtest_sane(panel):
    r = run_backtest(StrategySpec(), panel, panel.dates[260])
    t = r.trades
    assert len(t) > 20
    assert (r.equity > 0).all()
    assert (t.exit_date >= t.entry_date).all()
    assert (t.hold_days <= StrategySpec().exit.max_hold_days + 1).all()
    assert r.exposure.max() <= 1.0 + 1e-9
    # stop-outs lose roughly 1R or more (gaps can be worse), never gain
    assert (t[t.exit_reason == "stop"].r_multiple <= 0).all()


def test_entries_fill_next_open(panel):
    r = run_backtest(StrategySpec(), panel, panel.dates[260])
    O = panel.px["open"]
    for _, row in r.trades.head(20).iterrows():
        assert row.entry_px == pytest.approx(O.loc[row.entry_date, row.symbol])


def test_spec_roundtrip_and_validation():
    s = StrategySpec()
    s2 = StrategySpec.from_dict(json.loads(json.dumps(s.to_dict())))
    assert s.fingerprint() == s2.fingerprint()
    s3 = s.with_changes({"exit.stop_atr_mult": 2.5})
    assert s3.exit.stop_atr_mult == 2.5 and s.exit.stop_atr_mult == 3.0
    with pytest.raises(ValueError):
        s.with_changes({"exit.stop_atr_mult": 2.7})
    with pytest.raises(ValueError):
        s.with_changes({"entry.made_up": 1})


def test_defaults_are_on_grid():
    s = StrategySpec()
    for path in SEARCH_SPACE:
        assert s.get(path) in SEARCH_SPACE[path], path


def test_rule_researcher_proposes_valid_untested(panel):
    s = StrategySpec()
    m = run_backtest(s, panel, panel.dates[260]).metrics
    hyps = RuleResearcher(seed=0).propose(s, m, {s.fingerprint()}, k=8)
    assert hyps
    for h in hyps:
        h.apply(s, "x")  # validates


def test_coerce_llm_numbers():
    assert _coerce("risk.max_positions", 10.0) == 10
    assert _coerce("exit.trail_atr_mult", None) is None
    assert _coerce("entry.require_breakout", True) is True


def test_loop_end_to_end(panel, tmp_path):
    cfg = LoopConfig(iterations=2, hypotheses_per_iter=3, min_trades=10)
    s = evolve(panel, StrategySpec(), RuleResearcher(seed=0), cfg, tmp_path, verbose=False)
    assert (tmp_path / "report.md").exists() and (tmp_path / "experiments.jsonl").exists()
    assert s["trials"] >= 1 and s["verdict"]
    # hold-out window must start after validation ends
    assert s["windows"]["hold_out"][0] > s["windows"]["val"][1] > s["windows"]["train"][1]


def test_scan(panel):
    r = scan(StrategySpec(), panel, top=5)
    assert len(r["candidates"]) <= 5
    if len(r["candidates"]):
        c = r["candidates"]
        assert (c.initial_stop < c.close).all()
