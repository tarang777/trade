# Swing engine - self-improvement run

Windows: train ['2013-01-28', '2021-05-25'], validation ['2021-05-26', '2024-02-19'], hold-out ['2024-02-20', '2026-11-20']

**Verdict:** CAUTION: profitable out-of-sample but weak evidence (deflated Sharpe 0.99, hold-out PSR 0.66) -> paper-trade first. Loop changes: no clear out-of-sample gain vs baseline (objective -0.03); treat champion and baseline as equivalent

Trials (distinct train configs): 67 - deflated Sharpe on train: 0.99 - PSR on hold-out: 0.66

## Results

| run | CAGR | Sharpe | MaxDD | trades | win% | exp. R | avg hold (d) | held 3-6m |
|---|---|---|---|---|---|---|---|---|
| baseline / train | 31.4% | 1.65 | -33.6% | 319 | 44% | 0.91 | 50 | 33% |
| baseline / val | 36.8% | 1.88 | -24.7% | 122 | 45% | 0.87 | 47 | 27% |
| baseline / hold_out | 3.5% | 0.29 | -15.8% | 112 | 37% | 0.12 | 39 | 21% |
| champion / train | 23.7% | 1.60 | -29.5% | 319 | 44% | 0.91 | 50 | 33% |
| champion / val | 27.7% | 1.90 | -19.0% | 122 | 45% | 0.87 | 47 | 27% |
| champion / hold_out | 2.6% | 0.26 | -13.8% | 112 | 37% | 0.13 | 39 | 21% |

## Lineage (accepted improvements)

- iter 0: `{}` - baseline (train obj 1.33, val obj 1.81)
- iter 1: `{'risk.risk_per_trade': 0.0075}` - Deep drawdown: cut risk per trade (train obj 1.40, val obj 1.97)

## Champion hold-out by market regime at entry

| regime | trades | win% | exp. R |
|---|---|---|---|
| up/highvol | 71 | 41% | 0.28 |
| up/lowvol | 41 | 29% | -0.14 |

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
