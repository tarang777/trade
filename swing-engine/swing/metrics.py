"""Performance, trade and regime diagnostics, plus overfitting statistics."""
from __future__ import annotations

import math
from statistics import NormalDist

import numpy as np
import pandas as pd

TRADING_DAYS = 252
_N = NormalDist()


def compute_metrics(res) -> dict:
    eq = res.equity
    r = eq.pct_change().dropna()
    years = max(len(eq) / TRADING_DAYS, 1e-9)
    cagr = (eq.iloc[-1] / eq.iloc[0]) ** (1 / years) - 1 if eq.iloc[0] > 0 else float("nan")
    vol = r.std() * math.sqrt(TRADING_DAYS)
    sharpe = r.mean() / r.std() * math.sqrt(TRADING_DAYS) if r.std() > 0 else 0.0
    dn = r[r < 0].std()
    sortino = r.mean() / dn * math.sqrt(TRADING_DAYS) if dn and dn > 0 else 0.0
    dd = eq / eq.cummax() - 1
    mdd = dd.min()
    m = {
        "start": str(res.start.date()), "end": str(res.end.date()),
        "cagr": cagr, "vol": vol, "sharpe": sharpe, "sortino": sortino, "max_dd": mdd,
        "calmar": cagr / abs(mdd) if mdd < 0 else 0.0, "exposure": float(res.exposure.mean()),
        "final_equity": float(eq.iloc[-1]),
    }
    t = res.trades
    if len(t):
        wins, losses = t[t.pnl > 0], t[t.pnl <= 0]
        m.update({
            "trades": len(t), "win_rate": len(wins) / len(t),
            "avg_win": wins.ret.mean() if len(wins) else 0.0,
            "avg_loss": losses.ret.mean() if len(losses) else 0.0,
            "profit_factor": wins.pnl.sum() / -losses.pnl.sum() if losses.pnl.sum() < 0 else float("inf"),
            "expectancy_r": t.r_multiple.mean(), "avg_hold_days": t.hold_days.mean(),
            "median_hold_days": float(t.hold_days.median()),
            "pct_hold_3to6m": float(((t.hold_days >= 63) & (t.hold_days <= 130)).mean()),
            "exit_mix": t.exit_reason.value_counts(normalize=True).round(3).to_dict(),
        })
    else:
        m.update({"trades": 0, "win_rate": 0.0, "expectancy_r": 0.0, "avg_hold_days": 0.0,
                  "profit_factor": 0.0, "pct_hold_3to6m": 0.0, "exit_mix": {}})
    m["by_regime"] = regime_breakdown(t)
    return m


def regime_breakdown(t: pd.DataFrame, min_trades: int = 1) -> dict:
    if t is None or not len(t):
        return {}
    g = t.groupby("entry_regime")
    out = {}
    for k, d in g:
        if len(d) >= min_trades:
            out[k] = {"trades": len(d), "win_rate": float((d.pnl > 0).mean()),
                      "expectancy_r": float(d.r_multiple.mean()), "pnl": float(d.pnl.sum())}
    return out


def objective(m: dict, min_trades: int = 30, target_dd: float = 0.20) -> float:
    """Single number the loop maximises.

    Risk-adjusted return (Sharpe), penalised for drawdowns deeper than
    ``target_dd`` and for statistically thin samples. A swing system for a
    3-6 month horizon should also actually *hold* for months, so a mild bonus
    rewards trades that live in that window.
    """
    if m.get("trades", 0) < min_trades:
        return -1.0 + m.get("trades", 0) / (10 * min_trades)
    dd_pen = max(0.0, abs(m["max_dd"]) - target_dd) * 3
    horizon_bonus = 0.25 * m.get("pct_hold_3to6m", 0.0)
    return m["sharpe"] - dd_pen + horizon_bonus


# ----------------------------------------------------------------------
# Overfitting control (Bailey & Lopez de Prado)
# ----------------------------------------------------------------------
def probabilistic_sharpe(returns: pd.Series, sr_benchmark: float = 0.0) -> float:
    """P(true per-period Sharpe > sr_benchmark) given sample length, skew, kurtosis."""
    r = returns.dropna()
    n = len(r)
    if n < 30 or r.std() == 0:
        return 0.0
    sr = r.mean() / r.std()
    skew, kurt = float(r.skew()), float(r.kurt()) + 3
    denom = math.sqrt(max(1e-12, 1 - skew * sr + (kurt - 1) / 4 * sr**2))
    return _N.cdf((sr - sr_benchmark) * math.sqrt(n - 1) / denom)


def deflated_sharpe(returns: pd.Series, trial_sharpes: list[float]) -> float:
    """PSR against the Sharpe you'd expect from the best of N *useless* trials.

    ``trial_sharpes`` are per-period (daily) Sharpes of every configuration
    tried. The more you search, the higher the bar.
    """
    n_trials = max(len(trial_sharpes), 1)
    if n_trials < 2:
        return probabilistic_sharpe(returns, 0.0)
    var = float(np.var(trial_sharpes, ddof=1)) or 1e-12
    g = 0.5772156649
    sr0 = math.sqrt(var) * ((1 - g) * _N.inv_cdf(1 - 1 / n_trials) + g * _N.inv_cdf(1 - 1 / (n_trials * math.e)))
    return probabilistic_sharpe(returns, sr0)


def daily_sharpe(equity: pd.Series) -> float:
    r = equity.pct_change().dropna()
    return float(r.mean() / r.std()) if r.std() > 0 else 0.0


def fmt_metrics(m: dict) -> str:
    keys = [("cagr", "{:.1%}"), ("sharpe", "{:.2f}"), ("max_dd", "{:.1%}"), ("trades", "{}"),
            ("win_rate", "{:.0%}"), ("expectancy_r", "{:.2f}R"), ("avg_hold_days", "{:.0f}d"),
            ("pct_hold_3to6m", "{:.0%}"), ("exposure", "{:.0%}")]
    out = []
    for k, f in keys:
        v = m.get(k)
        out.append(f"{k}={f.format(v) if v is not None and not (isinstance(v, float) and math.isnan(v)) else 'n/a'}")
    return "  ".join(out)
