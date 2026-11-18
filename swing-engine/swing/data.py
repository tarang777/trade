"""Market data providers.

Every provider returns a ``RawData``: wide OHLCV frames (dates x symbols) for the
universe plus an OHLC frame for the benchmark index. The engine itself never
talks to the network, so the same research loop runs on Yahoo Finance, your own
CSV exports (e.g. from your broker / NSE bhavcopies), or synthetic data.
"""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pandas as pd

FIELDS = ("open", "high", "low", "close", "volume")

# A liquid large-cap starter universe (NSE). For real research use a broader,
# point-in-time universe (e.g. Nifty 500 constituents per date) to limit
# survivorship bias -- see README "Known biases".
NSE_LARGE_CAPS = [
    "RELIANCE", "TCS", "HDFCBANK", "ICICIBANK", "INFY", "HINDUNILVR", "ITC", "SBIN",
    "BHARTIARTL", "KOTAKBANK", "LT", "AXISBANK", "ASIANPAINT", "MARUTI", "BAJFINANCE",
    "HCLTECH", "SUNPHARMA", "TITAN", "ULTRACEMCO", "WIPRO", "NESTLEIND", "ONGC", "NTPC",
    "POWERGRID", "M&M", "TATASTEEL", "ADANIENT", "ADANIPORTS", "JSWSTEEL", "COALINDIA",
    "BAJAJFINSV", "TECHM", "GRASIM", "HINDALCO", "DRREDDY", "CIPLA", "EICHERMOT",
    "BRITANNIA", "APOLLOHOSP", "DIVISLAB", "HEROMOTOCO", "BAJAJ-AUTO", "INDUSINDBK",
    "SBILIFE", "HDFCLIFE", "TATACONSUM", "BPCL", "SHRIRAMFIN", "TRENT", "BEL",
]


@dataclass
class RawData:
    ohlcv: dict[str, pd.DataFrame]  # field -> wide frame (dates x symbols)
    bench: pd.DataFrame  # columns open/high/low/close, same index

    @property
    def symbols(self) -> list[str]:
        return list(self.ohlcv["close"].columns)


def _assemble(per_symbol: dict[str, pd.DataFrame], bench: pd.DataFrame, min_history: int = 260) -> RawData:
    per_symbol = {s: d for s, d in per_symbol.items() if d["close"].notna().sum() >= min_history}
    if not per_symbol:
        raise ValueError("no symbols with enough history")
    index = bench.index
    wide = {}
    for f in FIELDS:
        frame = pd.DataFrame({s: d[f] for s, d in per_symbol.items()}).reindex(index)
        wide[f] = frame
    # Forward-fill prices across holidays/suspensions (never backwards: no look-ahead).
    for f in ("open", "high", "low", "close"):
        wide[f] = wide[f].ffill()
    wide["volume"] = wide["volume"].fillna(0.0)
    return RawData(wide, bench[["open", "high", "low", "close"]].ffill())


def _normalise(df: pd.DataFrame) -> pd.DataFrame:
    df = df.rename(columns=str.lower)
    if "adj close" in df.columns and "close" in df.columns:
        # Back-adjust OHLC for splits/dividends using the adj-close ratio.
        ratio = df["adj close"] / df["close"]
        for c in ("open", "high", "low", "close"):
            df[c] = df[c] * ratio
    df.index = pd.to_datetime(df.index).tz_localize(None).normalize()
    df = df[~df.index.duplicated(keep="last")].sort_index()
    return df[[c for c in FIELDS if c in df.columns]].astype(float)


class CSVProvider:
    """One CSV per symbol: Date,Open,High,Low,Close,Volume[,Adj Close].

    The benchmark file is ``<benchmark>.csv`` in the same directory.
    """

    def __init__(self, directory: str, benchmark: str = "NIFTY50"):
        self.dir = Path(directory)
        self.benchmark = benchmark

    def load(self, symbols: list[str] | None = None) -> RawData:
        files = {p.stem: p for p in self.dir.glob("*.csv")}
        if self.benchmark not in files:
            raise FileNotFoundError(f"benchmark file {self.benchmark}.csv not found in {self.dir}")
        bench = _normalise(pd.read_csv(files.pop(self.benchmark), index_col=0, parse_dates=True))
        names = symbols or sorted(files)
        per = {s: _normalise(pd.read_csv(files[s], index_col=0, parse_dates=True)) for s in names if s in files}
        return _assemble(per, bench)


class YFinanceProvider:
    """Yahoo Finance via ``yfinance``. NSE symbols get the ``.NS`` suffix.

    Downloads are cached as CSV under ``cache_dir`` so experiments are repeatable
    and do not hammer the API.
    """

    def __init__(self, suffix: str = ".NS", benchmark: str = "^NSEI", start: str = "2012-01-01",
                 end: str | None = None, cache_dir: str = "data_cache"):
        self.suffix, self.benchmark, self.start, self.end = suffix, benchmark, start, end
        self.cache = Path(cache_dir)

    def _fetch(self, ticker: str) -> pd.DataFrame:
        import yfinance as yf

        self.cache.mkdir(parents=True, exist_ok=True)
        path = self.cache / f"{ticker.replace('^', '_')}.csv"
        if path.exists():
            return _normalise(pd.read_csv(path, index_col=0, parse_dates=True))
        df = yf.download(ticker, start=self.start, end=self.end, auto_adjust=False, progress=False)
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)
        if df.empty:
            return df
        df.to_csv(path)
        return _normalise(df)

    def load(self, symbols: list[str] | None = None) -> RawData:
        symbols = symbols or NSE_LARGE_CAPS
        bench = self._fetch(self.benchmark)
        if bench.empty:
            raise RuntimeError(f"could not download benchmark {self.benchmark}")
        per = {}
        for s in symbols:
            df = self._fetch(s + self.suffix)
            if not df.empty:
                per[s] = df
        return _assemble(per, bench)


class SyntheticProvider:
    """Regime-switching synthetic market for offline development and tests.

    The market factor alternates between bull/bear and calm/volatile states.
    Each stock has a beta, its own volatility and a slowly mean-reverting
    "alpha" drift, so intermediate-term momentum genuinely exists -- but it is
    noisy, and breakouts in calm markets are deliberately less reliable. This
    gives the research loop something real (but not trivial) to discover.
    """

    def __init__(self, n_symbols: int = 120, years: float = 12, seed: int = 7, start: str = "2012-01-02"):
        self.n, self.days, self.seed, self.start = n_symbols, int(years * 252), seed, start

    def load(self, symbols: list[str] | None = None) -> RawData:
        rng = np.random.default_rng(self.seed)
        T, N = self.days, self.n
        dates = pd.bdate_range(self.start, periods=T)

        # Market regimes: Markov chain over (bull/bear) x (calm/volatile).
        trend = np.empty(T, dtype=int)
        volst = np.empty(T, dtype=int)
        trend[0], volst[0] = 1, 0
        for t in range(1, T):
            trend[t] = trend[t - 1] if rng.random() > (1 / 300 if trend[t - 1] else 1 / 120) else 1 - trend[t - 1]
            volst[t] = volst[t - 1] if rng.random() > 1 / 90 else 1 - volst[t - 1]
        mkt_mu = np.where(trend == 1, 0.14, -0.20) / 252
        mkt_sig = np.where(volst == 1, 0.26, 0.11) / np.sqrt(252)
        mkt_ret = mkt_mu + mkt_sig * rng.standard_normal(T)

        beta = rng.uniform(0.6, 1.5, N)
        idio_sig = rng.uniform(0.18, 0.45, N) / np.sqrt(252)
        alpha = np.zeros((T, N))
        a = rng.normal(0, 0.10, N)
        phi = 1 - 1 / 180  # alpha half-life ~ 4-6 months -> momentum persists
        for t in range(T):
            a = phi * a + np.sqrt(1 - phi**2) * rng.normal(0, 0.18, N)
            alpha[t] = a
        # Calm markets: idiosyncratic noise is relatively larger vs trend -> more false breakouts.
        noise_mult = np.where(volst == 1, 1.0, 1.25)[:, None]
        ret = beta * mkt_ret[:, None] + alpha / 252 + idio_sig * noise_mult * rng.standard_normal((T, N))
        # Occasional idiosyncratic shocks (earnings gaps).
        shocks = (rng.random((T, N)) < 0.004) * rng.normal(0, 0.08, (T, N))
        ret = ret + shocks

        close = 100 * np.exp(np.cumsum(ret, axis=0)) * rng.uniform(0.3, 5, N)
        gap = rng.normal(0, 0.004, (T, N))
        open_ = np.vstack([close[:1], close[:-1]]) * np.exp(gap)
        rng_hl = np.abs(rng.normal(0, 1, (T, N))) * (idio_sig + mkt_sig[:, None]) * 0.9
        high = np.maximum(open_, close) * np.exp(rng_hl * rng.uniform(0.3, 1, (T, N)))
        low = np.minimum(open_, close) * np.exp(-rng_hl * rng.uniform(0.3, 1, (T, N)))
        vol = np.exp(rng.normal(13, 0.5, N) + rng.normal(0, 0.35, (T, N)) + 8 * np.abs(ret))

        syms = symbols or [f"SYN{i:03d}" for i in range(N)]
        mk = lambda arr: pd.DataFrame(arr, index=dates, columns=syms)
        wide = {"open": mk(open_), "high": mk(high), "low": mk(low), "close": mk(close), "volume": mk(vol)}

        bclose = 10000 * np.exp(np.cumsum(mkt_ret))
        bopen = np.r_[bclose[0], bclose[:-1]]
        bench = pd.DataFrame({"open": bopen, "high": np.maximum(bopen, bclose) * 1.003,
                              "low": np.minimum(bopen, bclose) * 0.997, "close": bclose}, index=dates)
        return RawData(wide, bench)


def load_universe_file(path: str) -> list[str]:
    with open(path) as fh:
        return [ln.strip().split(",")[0] for ln in fh if ln.strip() and not ln.startswith("#")]


def make_provider(source: str, **kw):
    if source == "synthetic":
        return SyntheticProvider(seed=int(kw.get("seed") or 7))
    if source == "csv":
        return CSVProvider(kw["csv_dir"], benchmark=kw.get("benchmark") or "NIFTY50")
    if source == "yfinance":
        return YFinanceProvider(suffix=kw.get("suffix", ".NS"), benchmark=kw.get("benchmark") or "^NSEI",
                                start=kw.get("start") or "2012-01-01",
                                cache_dir=kw.get("cache_dir") or os.path.join(os.getcwd(), "data_cache"))
    raise ValueError(f"unknown source {source!r}")
