# Swing engine - self-improvement run

Windows: train ['2013-01-28', '2021-05-21'], validation ['2021-05-24', '2024-02-15'], hold-out ['2024-02-16', '2026-11-18']

**Verdict:** CANDIDATE FOR PAPER TRADING: profitable out-of-sample (hold-out PSR 0.82) and survives multiple-testing deflation (DSR 0.99). Loop changes: no clear out-of-sample gain vs baseline (objective -0.08); treat champion and baseline as equivalent

Trials (distinct train configs): 67 - deflated Sharpe on train: 0.99 - PSR on hold-out: 0.82

## Results

| run | CAGR | Sharpe | MaxDD | trades | win% | exp. R | avg hold (d) | held 3-6m |
|---|---|---|---|---|---|---|---|---|
| baseline / train | 31.4% | 1.65 | -33.6% | 318 | 44% | 0.92 | 50 | 33% |
| baseline / val | 39.2% | 1.99 | -27.0% | 126 | 46% | 0.88 | 45 | 26% |
| baseline / hold_out | 9.9% | 0.65 | -14.4% | 107 | 42% | 0.29 | 42 | 22% |
| champion / train | 23.7% | 1.61 | -29.5% | 318 | 44% | 0.92 | 50 | 33% |
| champion / val | 29.5% | 2.00 | -20.8% | 126 | 46% | 0.88 | 45 | 26% |
| champion / hold_out | 6.9% | 0.57 | -12.2% | 107 | 42% | 0.29 | 42 | 22% |

## Lineage (accepted improvements)

- iter 0: `{}` - baseline (train obj 1.33, val obj 1.84)
- iter 1: `{'risk.risk_per_trade': 0.0075}` - Deep drawdown: cut risk per trade (train obj 1.40, val obj 2.04)

## Champion hold-out by market regime at entry

| regime | trades | win% | exp. R |
|---|---|---|---|
| up/highvol | 73 | 49% | 0.47 |
| up/lowvol | 34 | 26% | -0.10 |

## Champion spec

```json
{
  "name": "momentum_trend_v1.i1h2",
  "entry": {
    "trend_template": true,
    "min_rs_pct": 0.8,
    "max_dist_52w_high": 0.25,
    "min_above_52w_low": 0.3,
    "require_breakout": false,
    "breakout_lookback": 50,
    "max_contraction": null,
    "rsi_max": 80.0,
    "min_volume_ratio": null,
    "min_adv": 50000000.0
  },
  "filters": {
    "regime_filter": true,
    "market_vol": null,
    "max_atr_pct": null
  },
  "exit": {
    "stop_atr_mult": 3.0,
    "trail_atr_mult": 5.0,
    "ma_exit": "sma100",
    "max_hold_days": 126,
    "min_hold_days": 0,
    "profit_target_r": null
  },
  "risk": {
    "max_positions": 10,
    "risk_per_trade": 0.0075,
    "max_position_weight": 0.15,
    "cost_bps": 25.0
  },
  "rank": {
    "w_mom63": 0.2,
    "w_mom126": 0.3,
    "w_mom252": 0.3,
    "w_high": 0.2,
    "w_lowvol": 0.0
  },
  "rebalance_every": 5
}
```
