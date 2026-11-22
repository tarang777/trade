"""Turn the champion strategy into today's actionable watchlist."""
from __future__ import annotations

import numpy as np
import pandas as pd

from .backtest import run_backtest
from .features import Panel
from .strategy import StrategySpec, entry_mask, score


def scan(spec: StrategySpec, p: Panel, capital: float = 1_000_000.0, top: int = 20, asof=None) -> dict:
    """Candidates that pass every entry rule on the latest bar, ranked.

    Also replays the strategy over the past year so you can see which
    positions the system would *currently* be holding and where their stops sit.
    """
    i = len(p.dates) - 1 if asof is None else int(p.dates.searchsorted(pd.Timestamp(asof), side="right")) - 1
    d = p.dates[i]
    # Stock-level rules only; the market-regime gate is reported separately so the
    # watchlist stays useful (leaders in a correction are tomorrow's breakouts).
    stock_only = spec.with_changes({"filters.regime_filter": False, "filters.market_vol": None})
    mask, sc = entry_mask(stock_only, p)[i], score(spec, p)[i]
    A = p.arr
    rows = []
    risk_budget = capital * spec.risk.risk_per_trade
    for s in np.flatnonzero(mask):
        c, a = A("close")[i, s], A("atr14")[i, s]
        stop = c - spec.exit.stop_atr_mult * a
        shares = int(min(risk_budget / (c - stop), capital * spec.risk.max_position_weight / c))
        rows.append({
            "symbol": p.symbols[s], "score": sc[s], "close": c, "rs_pct": A("rs_pct")[i, s],
            "mom_6m": A("mom126")[i, s], "mom_12_1m": A("mom252x21")[i, s],
            "off_52w_high": A("dist_52w_high")[i, s], "atr_pct": A("atr_pct")[i, s],
            "initial_stop": stop, "risk_pct": (c - stop) / c, "shares": shares, "position_value": shares * c,
        })
    cands = pd.DataFrame(rows)
    if len(cands):
        cands = cands.sort_values("score", ascending=False).head(top).reset_index(drop=True)
        cands.index += 1

    reg = p.regime.iloc[i]
    replay = run_backtest(spec, p, p.dates[max(0, i - 260)], d, capital)
    t = replay.trades
    open_pos = t[t.exit_reason == "end_of_test"].copy() if len(t) else pd.DataFrame()
    if len(open_pos):
        open_pos = open_pos[["symbol", "entry_date", "entry_px", "exit_px", "ret", "hold_days", "stop"]].rename(
            columns={"exit_px": "last_close", "ret": "open_return"})
        # Trading days -> calendar estimate (business days; ignores exchange holidays).
        open_pos["time_exit_due"] = [(pd.Timestamp(e) + pd.offsets.BDay(spec.exit.max_hold_days)).date()
                                     for e in open_pos.entry_date]
        open_pos["entry_date"] = pd.to_datetime(open_pos.entry_date).dt.date
    if len(cands):
        held = set(open_pos.symbol) if len(open_pos) else set()
        cands["held"] = cands.symbol.isin(held)
    entries_allowed = True
    if spec.filters.regime_filter and not bool(reg["bench_above_200"]):
        entries_allowed = False
    if spec.filters.market_vol == "avoid_high" and reg["vol"] == "high":
        entries_allowed = False
    if spec.filters.market_vol == "avoid_low" and reg["vol"] == "low":
        entries_allowed = False
    return {"date": d, "regime": reg["label"], "entries_allowed": entries_allowed,
            "candidates": cands, "model_portfolio": open_pos,
            "exit_rules": _exit_text(spec)}


def _exit_text(spec: StrategySpec) -> str:
    e = spec.exit
    parts = [f"initial stop {e.stop_atr_mult}x ATR14 below entry"]
    if e.trail_atr_mult:
        parts.append(f"trail {e.trail_atr_mult}x ATR14 below the highest close")
    if e.ma_exit:
        parts.append(f"exit next open on a close below the {e.ma_exit.upper()}"
                     + (f" (after {e.min_hold_days} days)" if e.min_hold_days else ""))
    if e.profit_target_r:
        parts.append(f"take profit at {e.profit_target_r}R")
    parts.append(f"time stop after {e.max_hold_days} trading days (~{e.max_hold_days / 21:.0f} months)")
    return "; ".join(parts)


def format_scan(r: dict) -> str:
    out = [f"Scan as of {r['date'].date()} | market regime: {r['regime']} | "
           f"new entries {'ALLOWED' if r['entries_allowed'] else 'BLOCKED by regime filter'}",
           f"Exit plan: {r['exit_rules']}", ""]
    c = r["candidates"]
    if len(c):
        out.append("Ranked candidates (enter next session's open; size so a stop-out costs the risk budget):")
        out.append(c.to_string(float_format=lambda x: f"{x:,.3f}" if abs(x) < 10 else f"{x:,.0f}"))
    else:
        out.append("No stocks pass every entry rule today.")
    if len(c) and not r["entries_allowed"]:
        out.insert(3, "(WATCH ONLY - market regime filter blocks new entries today)")
    mp = r["model_portfolio"]
    if len(mp):
        out += ["", "Model portfolio (positions the system would hold right now):",
                mp.to_string(index=False, float_format=lambda x: f"{x:,.3f}" if abs(x) < 10 else f"{x:,.0f}")]
    return "\n".join(out)
