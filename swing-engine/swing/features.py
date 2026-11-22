"""Feature panel: trailing-only indicators on wide (dates x symbols) frames.

All features at date t use data up to and including the close of t. Orders
generated from them are filled at the *next* open, so there is no look-ahead.
"""
from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np
import pandas as pd

from .data import RawData

BREAKOUT_LOOKBACKS = (20, 50, 100)
MA_LENGTHS = (20, 50, 100, 150, 200)


def atr(high: pd.DataFrame, low: pd.DataFrame, close: pd.DataFrame, n: int = 14) -> pd.DataFrame:
    prev = close.shift(1)
    tr = np.maximum(high - low, np.maximum((high - prev).abs(), (low - prev).abs()))
    return tr.ewm(alpha=1 / n, adjust=False, min_periods=n).mean()


def rsi(close: pd.DataFrame, n: int = 14) -> pd.DataFrame:
    d = close.diff()
    up = d.clip(lower=0).ewm(alpha=1 / n, adjust=False, min_periods=n).mean()
    dn = (-d.clip(upper=0)).ewm(alpha=1 / n, adjust=False, min_periods=n).mean()
    return 100 - 100 / (1 + up / dn.replace(0, np.nan))


def xs_rank(df: pd.DataFrame) -> pd.DataFrame:
    """Cross-sectional percentile rank per date (0..1), NaN-aware."""
    return df.rank(axis=1, pct=True)


@dataclass
class Panel:
    dates: pd.DatetimeIndex
    symbols: list[str]
    px: dict[str, pd.DataFrame]  # open/high/low/close/volume
    f: dict[str, pd.DataFrame]  # features
    bench: pd.DataFrame
    regime: pd.DataFrame  # per date: trend ("up"/"down"), vol ("high"/"low"), label
    np_cache: dict = field(default_factory=dict, repr=False)

    def arr(self, name: str) -> np.ndarray:
        """Numpy view of a price or feature frame (cached)."""
        if name not in self.np_cache:
            src = self.px.get(name)
            if src is None:
                src = self.f[name]
            self.np_cache[name] = src.to_numpy(dtype=float)
        return self.np_cache[name]


def build_panel(raw: RawData) -> Panel:
    o, h, l, c, v = (raw.ohlcv[k] for k in ("open", "high", "low", "close", "volume"))
    f: dict[str, pd.DataFrame] = {}
    for n in MA_LENGTHS:
        f[f"sma{n}"] = c.rolling(n, min_periods=n).mean()
    f["sma200_slope"] = f["sma200"] / f["sma200"].shift(21) - 1
    f["atr14"] = atr(h, l, c, 14)
    f["atr63"] = atr(h, l, c, 63)
    f["atr_pct"] = f["atr14"] / c
    f["contraction"] = f["atr14"] / f["atr63"]  # < 1: volatility contracting (VCP-like base)
    f["rsi14"] = rsi(c, 14)
    # Momentum: 3m, 6m and 12-1m (skip the most recent month: short-term reversal).
    f["mom63"] = c / c.shift(63) - 1
    f["mom126"] = c / c.shift(126) - 1
    f["mom252x21"] = c.shift(21) / c.shift(252) - 1
    hi252 = h.rolling(252, min_periods=200).max()
    lo252 = l.rolling(252, min_periods=200).min()
    f["dist_52w_high"] = c / hi252 - 1  # 0 = at the high, -0.2 = 20% below
    f["above_52w_low"] = c / lo252 - 1
    for n in BREAKOUT_LOOKBACKS:
        f[f"breakout{n}"] = (c >= c.shift(1).rolling(n, min_periods=n).max()).astype(float)
    f["adv20"] = (c * v).rolling(20, min_periods=20).mean()  # avg traded value
    f["vol_ratio"] = v.rolling(10).mean() / v.rolling(50).mean()
    f["vol63"] = np.log(c).diff().rolling(63).std() * np.sqrt(252)
    # Relative strength vs benchmark (6m), then cross-sectional percentile ranks.
    bret = raw.bench["close"] / raw.bench["close"].shift(126) - 1
    f["rs126"] = f["mom126"].sub(bret, axis=0)
    f["r_mom63"] = xs_rank(f["mom63"])
    f["r_mom126"] = xs_rank(f["mom126"])
    f["r_mom252"] = xs_rank(f["mom252x21"])
    f["r_high"] = xs_rank(f["dist_52w_high"])
    f["r_lowvol"] = xs_rank(-f["vol63"])
    f["rs_pct"] = xs_rank(0.4 * f["r_mom63"] + 0.3 * f["r_mom126"] + 0.3 * f["r_mom252"])  # IBD-style RS rating

    regime = market_regime(raw.bench)
    return Panel(c.index, list(c.columns), {"open": o, "high": h, "low": l, "close": c, "volume": v},
                 f, raw.bench, regime)


def market_regime(bench: pd.DataFrame) -> pd.DataFrame:
    bc = bench["close"]
    sma200 = bc.rolling(200, min_periods=150).mean()
    rv = np.log(bc).diff().rolling(20).std() * np.sqrt(252)
    rv_med = rv.rolling(252, min_periods=120).median()
    trend = np.where(bc > sma200, "up", "down")
    vol = np.where(rv > rv_med, "high", "low")
    out = pd.DataFrame({"trend": trend, "vol": vol, "bench_rv": rv, "bench_above_200": bc > sma200}, index=bench.index)
    out["label"] = out["trend"] + "/" + out["vol"] + "vol"
    return out
