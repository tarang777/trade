"""Portfolio-level daily backtester for multi-month swing trades.

Timeline per trading day i:
  1. At the open: fill exits scheduled yesterday, then entries scheduled yesterday.
  2. Intraday: protective stops (gap-aware: a gap below the stop fills at the open).
  3. Intraday: profit target (if configured).
  4. At the close: ratchet trailing stops; schedule MA / time exits for tomorrow's open.
  5. Mark to market.
  6. On scan days: rank today's signals and schedule entries for tomorrow's open.
"""
from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np
import pandas as pd

from .features import Panel
from .strategy import StrategySpec, entry_mask, score


@dataclass
class Position:
    sym: int
    shares: int
    entry_i: int
    entry_px: float
    stop: float
    init_risk: float  # per share
    high_close: float
    regime: str


@dataclass
class BacktestResult:
    spec: StrategySpec
    equity: pd.Series
    trades: pd.DataFrame
    exposure: pd.Series
    start: pd.Timestamp
    end: pd.Timestamp
    metrics: dict = field(default_factory=dict)


def run_backtest(spec: StrategySpec, p: Panel, start=None, end=None, capital: float = 1_000_000.0) -> BacktestResult:
    from .metrics import compute_metrics

    dates = p.dates
    i0 = 0 if start is None else int(dates.searchsorted(pd.Timestamp(start)))
    i1 = len(dates) - 1 if end is None else int(dates.searchsorted(pd.Timestamp(end), side="right")) - 1
    i0 = max(i0, 1)
    O, H, L, C = p.arr("open"), p.arr("high"), p.arr("low"), p.arr("close")
    ATR = p.arr("atr14")
    MA = p.arr(spec.exit.ma_exit) if spec.exit.ma_exit else None
    mask = entry_mask(spec, p)
    sc = score(spec, p)
    regime_lbl = p.regime["label"].to_numpy()
    ex, rk = spec.exit, spec.risk
    cost = rk.cost_bps / 1e4

    cash = capital
    positions: dict[int, Position] = {}
    pending_exit: dict[int, str] = {}
    pending_entry: list[int] = []
    trades = []
    eq = np.empty(i1 - i0 + 1)
    expo = np.empty(i1 - i0 + 1)

    def close_pos(pos: Position, i: int, px: float, reason: str):
        nonlocal cash
        cash += pos.shares * px * (1 - cost)
        gross_in = pos.shares * pos.entry_px * (1 + cost)
        pnl = pos.shares * px * (1 - cost) - gross_in
        trades.append({
            "symbol": p.symbols[pos.sym], "entry_date": dates[pos.entry_i], "exit_date": dates[i],
            "entry_px": pos.entry_px, "exit_px": px, "shares": pos.shares, "pnl": pnl,
            "ret": pnl / gross_in, "r_multiple": (px - pos.entry_px) / pos.init_risk,
            "hold_days": i - pos.entry_i, "exit_reason": reason, "entry_regime": pos.regime,
            "stop": pos.stop,
        })
        del positions[pos.sym]

    for k, i in enumerate(range(i0, i1 + 1)):
        # 1. opens: exits then entries
        for s, reason in list(pending_exit.items()):
            if s in positions:
                close_pos(positions[s], i, O[i, s], reason)
        pending_exit.clear()
        if pending_entry:
            equity_now = cash + sum(ps.shares * C[i - 1, ps.sym] for ps in positions.values())
            for s in pending_entry:
                if len(positions) >= rk.max_positions or s in positions:
                    continue
                px, a = O[i, s], ATR[i - 1, s]
                if not (np.isfinite(px) and np.isfinite(a) and a > 0 and px > 0):
                    continue
                risk_ps = ex.stop_atr_mult * a
                n = int(min(equity_now * rk.risk_per_trade / risk_ps,
                            equity_now * rk.max_position_weight / px,
                            cash / (px * (1 + cost))))
                if n <= 0:
                    continue
                cash -= n * px * (1 + cost)
                positions[s] = Position(s, n, i, px, px - risk_ps, risk_ps, px, regime_lbl[i - 1])
            pending_entry = []

        # 2-3. intraday stops and targets
        for pos in list(positions.values()):
            s = pos.sym
            if L[i, s] <= pos.stop:
                fill = min(O[i, s], pos.stop) if i > pos.entry_i else pos.stop
                close_pos(pos, i, fill, "stop" if pos.stop < pos.entry_px else "trail_stop")
                continue
            if ex.profit_target_r:
                tgt = pos.entry_px + ex.profit_target_r * pos.init_risk
                if H[i, s] >= tgt:
                    close_pos(pos, i, max(O[i, s], tgt) if i > pos.entry_i else tgt, "target")

        # 4. end-of-day management
        for pos in positions.values():
            s = pos.sym
            pos.high_close = max(pos.high_close, C[i, s])
            if ex.trail_atr_mult and np.isfinite(ATR[i, s]):
                pos.stop = max(pos.stop, pos.high_close - ex.trail_atr_mult * ATR[i, s])
            held = i - pos.entry_i
            if held >= ex.max_hold_days:
                pending_exit[s] = "time"
            elif MA is not None and held >= ex.min_hold_days and C[i, s] < MA[i, s]:
                pending_exit[s] = "ma_exit"

        # 5. mark to market
        mv = sum(ps.shares * C[i, ps.sym] for ps in positions.values())
        eq[k] = cash + mv
        expo[k] = mv / eq[k] if eq[k] > 0 else 0.0
        # 6. scan days are anchored to the data start (not the window start) so they stay stable
        if i < i1 and i % spec.rebalance_every == 0:
            free = rk.max_positions - (len(positions) - len(pending_exit))
            if free > 0:
                cand = np.flatnonzero(mask[i])
                cand = [s for s in cand[np.argsort(-sc[i, cand])] if s not in positions]
                pending_entry = cand[:free]

    for pos in list(positions.values()):
        close_pos(pos, i1, C[i1, pos.sym], "end_of_test")

    idx = dates[i0:i1 + 1]
    res = BacktestResult(spec, pd.Series(eq, idx, name="equity"),
                         pd.DataFrame(trades), pd.Series(expo, idx, name="exposure"), idx[0], idx[-1])
    res.metrics = compute_metrics(res)
    return res
