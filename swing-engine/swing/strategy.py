"""Strategy specification: a declarative, JSON-serialisable rule set.

The research loop never edits Python code -- it edits a ``StrategySpec``.
That keeps every experiment reproducible (the spec *is* the experiment),
makes hypotheses cheap to generate (by rules or by an LLM), and lets the
engine validate every change against ``SEARCH_SPACE`` before it runs.
"""
from __future__ import annotations

import copy
import hashlib
import json
from dataclasses import asdict, dataclass, field

import numpy as np

from .features import BREAKOUT_LOOKBACKS, Panel


@dataclass
class Entry:
    trend_template: bool = True  # close > sma50 > sma150 > sma200 and sma200 rising (Stage-2 uptrend)
    min_rs_pct: float = 0.80  # cross-sectional relative-strength percentile
    max_dist_52w_high: float = 0.25  # within 25% of the 52-week high
    min_above_52w_low: float = 0.30  # at least 30% above the 52-week low
    require_breakout: bool = False
    breakout_lookback: int = 50
    max_contraction: float | None = None  # ATR14/ATR63 ceiling (volatility contraction)
    rsi_max: float | None = 80.0  # skip short-term overextended names
    min_volume_ratio: float | None = None  # 10d/50d volume (accumulation)
    min_adv: float = 5e7  # min 20d avg traded value (₹5 cr) -- liquidity


@dataclass
class Filters:
    regime_filter: bool = True  # new entries only when the benchmark is above its 200-DMA
    market_vol: str | None = None  # None | "avoid_high" | "avoid_low"
    max_atr_pct: float | None = None  # skip very volatile stocks


@dataclass
class Exit:
    stop_atr_mult: float = 3.0  # initial stop = entry - k * ATR
    trail_atr_mult: float | None = 5.0  # chandelier trail from highest close
    ma_exit: str | None = "sma100"  # exit next open after a close below this MA
    max_hold_days: int = 126  # ~6 months: hard time stop
    min_hold_days: int = 0  # ignore MA exit before this many days
    profit_target_r: float | None = None  # take profit at k * initial risk


@dataclass
class Risk:
    max_positions: int = 10
    risk_per_trade: float = 0.01  # equity fraction lost if the initial stop is hit
    max_position_weight: float = 0.15
    cost_bps: float = 25.0  # per side: brokerage + STT + slippage (delivery, India)


@dataclass
class Rank:
    w_mom63: float = 0.2
    w_mom126: float = 0.3
    w_mom252: float = 0.3
    w_high: float = 0.2
    w_lowvol: float = 0.0


@dataclass
class StrategySpec:
    name: str = "momentum_trend_v1"
    entry: Entry = field(default_factory=Entry)
    filters: Filters = field(default_factory=Filters)
    exit: Exit = field(default_factory=Exit)
    risk: Risk = field(default_factory=Risk)
    rank: Rank = field(default_factory=Rank)
    rebalance_every: int = 5  # scan for new entries weekly

    # -- serialisation -------------------------------------------------
    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, d: dict) -> "StrategySpec":
        return cls(name=d.get("name", "spec"), entry=Entry(**d.get("entry", {})),
                   filters=Filters(**d.get("filters", {})), exit=Exit(**d.get("exit", {})),
                   risk=Risk(**d.get("risk", {})), rank=Rank(**d.get("rank", {})),
                   rebalance_every=d.get("rebalance_every", 5))

    def fingerprint(self) -> str:
        d = self.to_dict()
        d.pop("name")
        return hashlib.sha1(json.dumps(d, sort_keys=True).encode()).hexdigest()[:12]

    def get(self, path: str):
        obj = self
        for p in path.split("."):
            obj = getattr(obj, p)
        return obj

    def with_changes(self, changes: dict, name: str | None = None) -> "StrategySpec":
        new = copy.deepcopy(self)
        for path, value in changes.items():
            validate_change(path, value)
            *parents, leaf = path.split(".")
            obj = new
            for p in parents:
                obj = getattr(obj, p)
            setattr(obj, leaf, value)
        if name:
            new.name = name
        return new


# Allowed values per tunable parameter. Discrete grids keep the search honest:
# fewer effective trials -> less data-snooping, and neighbours are well defined
# for robustness checks.
SEARCH_SPACE: dict[str, list] = {
    "entry.trend_template": [True, False],
    "entry.min_rs_pct": [0.6, 0.7, 0.8, 0.85, 0.9],
    "entry.max_dist_52w_high": [0.1, 0.15, 0.25, 0.35],
    "entry.min_above_52w_low": [0.0, 0.3, 0.5],
    "entry.require_breakout": [False, True],
    "entry.breakout_lookback": list(BREAKOUT_LOOKBACKS),
    "entry.max_contraction": [None, 1.0, 0.85, 0.7],
    "entry.rsi_max": [None, 85.0, 80.0, 75.0],
    "entry.min_volume_ratio": [None, 1.0, 1.2],
    "filters.regime_filter": [True, False],
    "filters.market_vol": [None, "avoid_high", "avoid_low"],
    "filters.max_atr_pct": [None, 0.06, 0.04, 0.03],
    "exit.stop_atr_mult": [2.0, 2.5, 3.0, 4.0],
    "exit.trail_atr_mult": [None, 3.0, 4.0, 5.0, 6.0],
    "exit.ma_exit": [None, "sma50", "sma100", "sma150"],
    "exit.max_hold_days": [63, 90, 126],
    "exit.min_hold_days": [0, 10, 21],
    "exit.profit_target_r": [None, 3.0, 5.0, 8.0],
    "risk.max_positions": [5, 8, 10, 15],
    "risk.risk_per_trade": [0.005, 0.0075, 0.01, 0.015],
    "rank.w_mom63": [0.0, 0.2, 0.4],
    "rank.w_mom126": [0.0, 0.3, 0.5],
    "rank.w_mom252": [0.0, 0.3, 0.5],
    "rank.w_high": [0.0, 0.2, 0.4],
    "rank.w_lowvol": [0.0, 0.2],
}


def validate_change(path: str, value) -> None:
    if path not in SEARCH_SPACE:
        raise ValueError(f"{path} is not a tunable parameter")
    if value not in SEARCH_SPACE[path]:
        raise ValueError(f"{path}={value!r} not in allowed values {SEARCH_SPACE[path]}")


def neighbours(path: str, value) -> list:
    """Adjacent grid values (for parameter-robustness checks)."""
    grid = SEARCH_SPACE[path]
    i = grid.index(value)
    return [grid[j] for j in (i - 1, i + 1) if 0 <= j < len(grid)]


# ----------------------------------------------------------------------
# Signal generation (vectorised over the whole panel)
# ----------------------------------------------------------------------
def entry_mask(spec: StrategySpec, p: Panel) -> np.ndarray:
    e, flt = spec.entry, spec.filters
    A = p.arr
    c = A("close")
    with np.errstate(invalid="ignore"):
        m = np.isfinite(c) & np.isfinite(A("sma200")) & (A("adv20") >= e.min_adv)
        if e.trend_template:
            m &= (c > A("sma50")) & (A("sma50") > A("sma150")) & (A("sma150") > A("sma200")) & (A("sma200_slope") > 0)
        m &= A("dist_52w_high") >= -e.max_dist_52w_high
        m &= A("above_52w_low") >= e.min_above_52w_low
        m &= A("rs_pct") >= e.min_rs_pct
        if e.require_breakout:
            m &= A(f"breakout{e.breakout_lookback}") > 0.5
        if e.max_contraction is not None:
            m &= A("contraction") <= e.max_contraction
        if e.rsi_max is not None:
            m &= A("rsi14") <= e.rsi_max
        if e.min_volume_ratio is not None:
            m &= A("vol_ratio") >= e.min_volume_ratio
        if flt.max_atr_pct is not None:
            m &= A("atr_pct") <= flt.max_atr_pct
    day_ok = np.ones(len(p.dates), dtype=bool)
    if flt.regime_filter:
        day_ok &= p.regime["bench_above_200"].to_numpy()
    if flt.market_vol == "avoid_high":
        day_ok &= (p.regime["vol"] == "low").to_numpy()
    elif flt.market_vol == "avoid_low":
        day_ok &= (p.regime["vol"] == "high").to_numpy()
    return m & day_ok[:, None]


def score(spec: StrategySpec, p: Panel) -> np.ndarray:
    r = spec.rank
    A = p.arr
    s = (r.w_mom63 * np.nan_to_num(A("r_mom63")) + r.w_mom126 * np.nan_to_num(A("r_mom126"))
         + r.w_mom252 * np.nan_to_num(A("r_mom252")) + r.w_high * np.nan_to_num(A("r_high"))
         + r.w_lowvol * np.nan_to_num(A("r_lowvol")))
    if not any((r.w_mom63, r.w_mom126, r.w_mom252, r.w_high, r.w_lowvol)):
        s = np.nan_to_num(A("rs_pct"))
    return s
