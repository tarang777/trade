"""Command line: backtest | evolve | scan."""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

from .backtest import run_backtest
from .data import load_universe_file, make_provider
from .features import build_panel
from .loop import LoopConfig, evolve
from .metrics import fmt_metrics
from .research import LLMResearcher, RuleResearcher, diagnose
from .scanner import format_scan, scan
from .strategy import StrategySpec


def _panel(a):
    prov = make_provider(a.source, csv_dir=a.csv_dir, benchmark=a.benchmark, start=a.start, seed=a.seed,
                         suffix=a.suffix, refresh=a.refresh)
    symbols = load_universe_file(a.universe) if a.universe else None
    raw = prov.load(symbols)
    print(f"loaded {len(raw.symbols)} symbols, {len(raw.bench)} bars "
          f"({raw.bench.index[0].date()}..{raw.bench.index[-1].date()})", file=sys.stderr)
    return build_panel(raw)


def _spec(path):
    return StrategySpec.from_dict(json.loads(Path(path).read_text())) if path else StrategySpec()


def main(argv=None):
    ap = argparse.ArgumentParser(prog="swing", description=__doc__)
    ap.add_argument("--source", choices=["synthetic", "yfinance", "csv"], default="synthetic")
    ap.add_argument("--csv-dir")
    ap.add_argument("--universe", help="file with one symbol per line")
    ap.add_argument("--benchmark", help="benchmark ticker / CSV stem (default ^NSEI / NIFTY50)")
    ap.add_argument("--suffix", default=".NS", help="yfinance exchange suffix (.NS NSE, .BO BSE, '' US)")
    ap.add_argument("--start", default="2012-01-01")
    ap.add_argument("--seed", type=int, default=7, help="synthetic data seed")
    ap.add_argument("--capital", type=float, default=1_000_000)
    ap.add_argument("--refresh", action="store_true", help="re-download prices (yfinance) instead of using the cache")
    sub = ap.add_subparsers(dest="cmd", required=True)

    b = sub.add_parser("backtest", help="backtest a spec and print diagnostics")
    b.add_argument("--spec")
    b.add_argument("--from", dest="frm")
    b.add_argument("--to")
    b.add_argument("--trades-csv")

    e = sub.add_parser("evolve", help="run the research -> test -> evaluate -> improve loop")
    e.add_argument("--spec")
    e.add_argument("--iterations", type=int, default=8)
    e.add_argument("--hypotheses", type=int, default=6)
    e.add_argument("--llm", action="store_true", help="use Claude to generate hypotheses")
    e.add_argument("--model", default="claude-fable-5-2")
    e.add_argument("--out", default=None)

    s = sub.add_parser("scan", help="today's ranked candidates for a spec")
    s.add_argument("--spec")
    s.add_argument("--top", type=int, default=20)
    s.add_argument("--asof")
    s.add_argument("--csv-out")

    d = sub.add_parser("dashboard", help="export dashboard data files from an evolve run")
    d.add_argument("--run", required=True, help="run folder holding summary.json and champion.json")
    d.add_argument("--top", type=int, default=25)

    a = ap.parse_args(argv)
    p = _panel(a)
    spec = _spec(getattr(a, "spec", None))

    if a.cmd == "backtest":
        r = run_backtest(spec, p, a.frm or p.dates[260], a.to, a.capital)
        print(fmt_metrics(r.metrics))
        print("exit mix:", r.metrics.get("exit_mix"))
        for k, v in sorted(r.metrics["by_regime"].items()):
            print(f"  {k:14s} trades={v['trades']:4d} win={v['win_rate']:.0%} exp={v['expectancy_r']:+.2f}R")
        for n in diagnose(r.metrics):
            print("  -", n)
        if a.trades_csv:
            r.trades.to_csv(a.trades_csv, index=False)
    elif a.cmd == "evolve":
        researcher = LLMResearcher(model=a.model) if a.llm else RuleResearcher(seed=a.seed)
        out = a.out or f"runs/{datetime.now():%Y%m%d-%H%M%S}"
        cfg = LoopConfig(iterations=a.iterations, hypotheses_per_iter=a.hypotheses, capital=a.capital)
        evolve(p, spec, researcher, cfg, out)
        print(f"\nreport: {out}/report.md   champion spec: {out}/champion.json")
    elif a.cmd == "dashboard":
        from .export import export_dashboard

        out = export_dashboard(p, a.run, a.capital, a.top)
        print(f"dashboard data written to {out}/")
    elif a.cmd == "scan":
        r = scan(spec, p, a.capital, a.top, a.asof)
        print(format_scan(r))
        if a.csv_out and len(r["candidates"]):
            r["candidates"].to_csv(a.csv_out)


if __name__ == "__main__":
    main()
