"""Export the dashboard's data files from a finished `evolve` run.

    python -m swing --source yfinance --universe universes/nifty500.txt \
        dashboard --run runs/nifty500-real

Writes one JSON file per dataset into <run>/dashboard/, each shaped
{"rows": [...], "meta": [...]}, with this script's own source in meta so a
reader can see exactly how every number was produced.
"""
from __future__ import annotations

import json
import math
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd

from .backtest import run_backtest
from .features import Panel
from .loop import WARMUP_DAYS
from .scanner import scan
from .strategy import StrategySpec


def _clean(v):
    if isinstance(v, (np.floating, float)):
        return None if not math.isfinite(float(v)) else round(float(v), 6)
    if isinstance(v, (np.integer,)):
        return int(v)
    if isinstance(v, (np.bool_,)):
        return bool(v)
    if isinstance(v, (pd.Timestamp, datetime)):
        return v.strftime("%Y-%m-%d")
    if hasattr(v, "isoformat"):
        return v.isoformat()
    return v


def _rows(df: pd.DataFrame) -> list[dict]:
    return [{k: _clean(v) for k, v in r.items()} for r in df.to_dict("records")]


def export_dashboard(p: Panel, run_dir: str | Path, capital: float = 1_000_000.0, top: int = 25) -> Path:
    run = Path(run_dir)
    out = run / "dashboard"
    out.mkdir(exist_ok=True)
    summary = json.loads((run / "summary.json").read_text())
    spec = StrategySpec.from_dict(json.loads((run / "champion.json").read_text()))
    code = Path(__file__).read_text()
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    asof = p.dates[-1].strftime("%Y-%m-%d")
    meta = [
        {"label": "export.py", "value": code, "type": "code", "lang": "python"},
        {"label": "Input", "value": f"Daily prices of {len(p.symbols)} Nifty 500 stocks and the Nifty 50 "
                                    f"from Yahoo Finance, to {asof}; strategy {run / 'champion.json'}"},
        {"label": "Generated", "value": now},
    ]

    def write(name, rows):
        (out / f"{name}.json").write_text(json.dumps({"rows": rows, "meta": meta}, default=str))

    # Today's scan: candidates and the model portfolio
    sc = scan(spec, p, capital, top)
    c = sc["candidates"].copy()
    if len(c):
        c.insert(0, "rank", range(1, len(c) + 1))
    write("picks", _rows(c))
    mp = sc["model_portfolio"].copy()
    write("portfolio", _rows(mp) if len(mp) else [])

    # Status: one row
    write("status", [{
        "as_of": asof, "regime": sc["regime"], "entries_allowed": "Yes" if sc["entries_allowed"] else "No",
        "candidates": int(len(c)), "positions": int(len(mp)), "verdict": summary["verdict"].split(":")[0],
        "verdict_text": summary["verdict"], "trials": summary["trials"],
        "deflated_sharpe": summary["deflated_sharpe_train"], "psr_hold_out": summary["psr_hold_out"],
        "exit_rules": sc["exit_rules"], "capital": capital, "risk_per_trade": spec.risk.risk_per_trade,
    }])

    # Equity curve of the champion vs Nifty 50, rebased to 100, weekly
    start = p.dates[WARMUP_DAYS]
    res = run_backtest(spec, p, start, None, capital)
    eq = res.equity / res.equity.iloc[0] * 100
    nifty = p.bench["close"].loc[eq.index]
    nifty = nifty / nifty.iloc[0] * 100
    w = summary["windows"]

    def window(d):
        d = d.strftime("%Y-%m-%d")
        return "Hold-out" if d >= w["hold_out"][0] else ("Validation" if d >= w["val"][0] else "Train")

    weekly = pd.DataFrame({"strategy": eq, "nifty50": nifty}).resample("W-FRI").last().dropna()
    weekly["date"] = weekly.index
    weekly["period"] = [window(d) for d in weekly.index]
    write("equity", _rows(weekly[["date", "strategy", "nifty50", "period"]]))

    # Market regime: Nifty 50 vs its 200-day average, last ~2 years
    bc = p.bench["close"]
    m = pd.DataFrame({"nifty50": bc, "sma200": bc.rolling(200, min_periods=150).mean()}).iloc[-504:]
    m["date"] = m.index
    m["above_200dma"] = m.nifty50 > m.sma200
    write("market", _rows(m[["date", "nifty50", "sma200", "above_200dma"]]))

    # Backtest results by window, with the Nifty 50 over the same window
    rows = []
    for lbl, key in (("Train", "train"), ("Validation", "val"), ("Hold-out", "hold_out")):
        a, b = w[key]
        s = bc.loc[a:b]
        r = s.pct_change().dropna()
        yrs = len(s) / 252
        for who in ("baseline", "champion"):
            mm = summary[who][key]
            rows.append({"period": lbl, "strategy": who.capitalize(), "from": a, "to": b,
                         "cagr": mm["cagr"], "sharpe": mm["sharpe"], "max_dd": mm["max_dd"],
                         "trades": mm["trades"], "win_rate": mm.get("win_rate"),
                         "expectancy_r": mm.get("expectancy_r"), "avg_hold_days": mm.get("avg_hold_days")})
        rows.append({"period": lbl, "strategy": "Nifty 50", "from": a, "to": b,
                     "cagr": (s.iloc[-1] / s.iloc[0]) ** (1 / yrs) - 1,
                     "sharpe": r.mean() / r.std() * math.sqrt(252), "max_dd": (s / s.cummax() - 1).min(),
                     "trades": None, "win_rate": None, "expectancy_r": None, "avg_hold_days": None})
    write("results", _rows(pd.DataFrame(rows)))

    # Research log: every hypothesis the loop tested
    log = []
    led = run / "experiments.jsonl"
    if led.exists():
        for ln in led.read_text().splitlines():
            e = json.loads(ln)
            log.append({"iteration": e["iteration"], "idea": e["rationale"],
                        "change": ", ".join(f"{k} = {v}" for k, v in e["changes"].items()),
                        "train_change": e["delta_obj"], "outcome": e["status"].replace("rejected:", "rejected: ")
                        .replace("_", " ")})
    write("research", [{k: _clean(v) for k, v in r.items()} for r in log])
    return out
