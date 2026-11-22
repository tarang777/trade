# Swing Engine: a self-improving swing-stock finder (3–6 month holds)

This engine follows the *Research → Develop → Test → Evaluate → Improve → Revalidate* loop
from the "Self-Improving Trading AI" diagram. It is aimed at one product: **a ranked list
of stocks to buy now and hold for 3–6 months, each with a stop, a position size and an
exit plan.** It also keeps a measured record of why the rules are what they are.

```
python -m swing evolve          # improve the strategy (the loop)
python -m swing scan            # today's candidates from the best strategy
python -m swing backtest        # inspect any strategy in detail
```

---

## 1. What the diagram gets right, and what it leaves out

The diagram's loop is sound. As drawn, though, it is a fast way to **overfit**: if you
generate hypotheses, backtest them and keep the winners for long enough, something will
always look good on past data. The practical example ("breakout is weak in low volatility
→ add a volatility filter → compare → revalidate") is exactly the kind of change that can
help on past data and fail on new data.

The engine adds the guardrails the diagram doesn't show:

| Diagram step | What the engine does | Guardrail added |
|---|---|---|
| 01 Research | `research.py`: hypotheses come from a diagnosis (weak regimes, exit mix, holding period, drawdown, win rate), plus random exploration. With `--llm`, Claude proposes them. | Every change must be a value from a fixed grid (`SEARCH_SPACE`). Nobody, including the LLM, writes free-form code. |
| 02 Develop | Each hypothesis is applied to a declarative `StrategySpec` (JSON). | The spec *is* the experiment, so it is reproducible and identified by a fingerprint. |
| 03 Test | Portfolio backtest (`backtest.py`): signals at the close, fills at the next open, stops that account for gaps, costs on both sides. | No look-ahead (there's a test for it). Real position limits and sizing. |
| 04 Evaluate | Objective = Sharpe − drawdown penalty + a bonus for trades that actually last 3–6 months. Breakdown by market regime (trend × volatility). | Too few trades is penalised: a high Sharpe on 12 trades is noise. |
| 05 Improve | A challenger replaces the champion only if (a) it beats it on **train** by a margin, (b) **neighbouring parameter values** also help (a plateau, not a spike), and (c) it doesn't get worse on **validation**. | Stops "lucky parameter" promotions. |
| 06 Revalidate | One look at a **locked hold-out** period, plus a **Deflated Sharpe Ratio** that accounts for every configuration tried. | Gives an honest answer to "would this have worked on data it never saw?" |

Data is split by date: `TRAIN (60%) | VALIDATION (20%) | HOLD-OUT (20%, untouched until the end)`.
Every experiment goes into `runs/<id>/experiments.jsonl`, including failures. That record
is what lets the next round of research avoid repeating dead ends.

### What it can improve (bottom row of the diagram)

| Area | Tunable parameters |
|---|---|
| Entry conditions | trend template, RS percentile, distance from 52-week high/low, breakout lookback, volatility contraction, RSI cap, volume surge |
| Exit logic | ATR stop, ATR chandelier trail, MA exit, minimum hold, time stop (63/90/126 days), profit target |
| Parameters | ranking weights (3m / 6m / 12-1m momentum, 52-week-high proximity, low volatility) |
| Market filters | benchmark above its 200-DMA; avoid high- or low-volatility markets; cap on stock ATR% |
| Risk settings | max positions, risk per trade, max position weight, costs |

## 2. The research behind the default strategy

For a 3–6 month horizon, the best-documented edges are **intermediate-term momentum and
trend persistence**, not short-term chart patterns:

- **Cross-sectional momentum**: stocks with the best 3–12 month returns keep outperforming
  for roughly the next 3–12 months (Jegadeesh & Titman, 1993). Skipping the most recent
  month avoids short-term reversal, hence the `mom252x21` (12-1) feature. The effect has
  been documented across many markets, including India. NSE publishes momentum indices
  (e.g. Nifty200 Momentum 30) built on the same idea.
- **52-week-high proximity**: stocks near their 52-week high tend to keep outperforming,
  because anchoring makes investors slow to react to good news (George & Hwang, 2004).
  See `dist_52w_high` and the `max_dist_52w_high` filter.
- **Trend / regime filter**: momentum strategies suffer their worst crashes in bear
  markets and rebounds (Daniel & Moskowitz, 2016). A simple rule of "benchmark above its
  200-day average" cuts much of that drawdown (Faber, 2007). See `filters.regime_filter`.
- **Stage-2 trend template / volatility contraction**: practitioner rules (Weinstein,
  O'Neil, Minervini): price > 50 > 150 > 200-DMA with the 200-DMA rising, a strong RS
  rating, and a tightening base before a breakout. These appear as hypotheses for the
  loop to *test*, not as assumptions.
- **ATR-based risk**: stops and position sizes scale with each stock's volatility, so each
  trade risks the same fraction of equity (`risk_per_trade`).
- **Overfitting control**: Probabilistic and Deflated Sharpe Ratio (Bailey & López de
  Prado, 2014). The more variants you try, the higher the bar a winner must clear.

The baseline `momentum_trend_v1` combines these: a trend-template uptrend, RS ≥ 80th
percentile, within 25% of the 52-week high, ranked by blended 3/6/12-1 month momentum,
with a 3×ATR initial stop, a 5×ATR trailing stop, an exit on a close below the 100-DMA,
and a 6-month time stop.

## 3. Usage

```bash
pip install -r requirements.txt
python -m pytest -q tests                      # 9 tests incl. a no-look-ahead check

# Offline (synthetic regime-switching market, no network needed)
python -m swing backtest
python -m swing evolve --iterations 10
python -m swing scan --spec runs/<id>/champion.json

# Real NSE data via Yahoo Finance (uses a built-in large-cap list unless --universe is given)
python -m swing --source yfinance --universe my_nifty500.txt evolve --iterations 10
python -m swing --source yfinance --universe my_nifty500.txt scan --spec runs/<id>/champion.json --csv-out picks.csv

# Your own data: one CSV per symbol (Date,Open,High,Low,Close,Volume) + NIFTY50.csv benchmark
python -m swing --source csv --csv-dir ./bhavcopy_csvs scan

# US market
python -m swing --source yfinance --suffix "" --benchmark SPY --universe sp500.txt evolve

# Let Claude generate hypotheses (needs ANTHROPIC_API_KEY)
python -m swing evolve --llm                    # model: claude-fable-5-2 (as in the diagram)
```

The `--llm` researcher sends Claude the current spec, the train-window metrics, the
diagnosis and the recent experiment log. It gets back structured JSON hypotheses, and
each one is validated against the grid before it is run. Refusal fallbacks are enabled
(`fallbacks: "default"`). If the API is unreachable, the engine falls back to the rule
researcher. The LLM **never sees validation or hold-out results**.

### What a scan gives you

```
Scan as of 2021-03-01 | market regime: down/lowvol | new entries BLOCKED by regime filter
Exit plan: initial stop 3.0x ATR14 below entry; trail 5.0x ATR14 below the highest close;
           exit next open on a close below the SMA100; time stop after 126 trading days (~6 months)
(WATCH ONLY - market regime filter blocks new entries today)
Ranked candidates:  symbol score close rs_pct mom_6m mom_12_1m off_52w_high atr_pct initial_stop risk_pct shares ...
Model portfolio (positions the system would hold right now): symbol entry_date entry_px last_close open_return hold_days time_exit_due
```

When the regime filter blocks new entries, the list is still shown, marked *WATCH ONLY*.

## 4. Results

### Real data: Nifty 500, 2012 – Nov 2026 (`runs/nifty500-real/`)

`python -m swing --source yfinance --universe universes/nifty500.txt evolve --iterations 15 --hypotheses 8`

| period | strategy CAGR | Sharpe | MaxDD | Nifty 50 CAGR | Nifty 50 Sharpe | Nifty 50 MaxDD |
|---|---|---|---|---|---|---|
| train 2013–2021 | 31.4% | 1.65 | −34% | 12.0% | 0.73 | −38% |
| **hold-out Feb 2024 – Nov 2026 (unseen)** | **3.5%** | **0.29** | **−16%** | 5.1% | 0.44 | −16% |

- **The out-of-sample edge is small and fragile.** An earlier run, identical except that
  the weekly scan fell on a different weekday, made 9.9% a year (Sharpe 0.65) over the same
  hold-out. The current run trails the Nifty. Scan days are now anchored to the start of
  the data, so results no longer shift as new days are added. The sensitivity itself is
  real, though: average over all five scan weekdays before trusting a result.
- Of 67 variants, only one change was promoted (risk per trade 1% → 0.75%). It made no
  difference out-of-sample.
- Survivorship bias inflates these numbers: the universe is *today's* Nifty 500.
- Seven unadjusted splits/demergers in Yahoo data (CGCL, GPIL, MOTILALOFS, VEDL, HEGAM, JSL,
  PATANJALI) are back-adjusted automatically by `fix_discontinuities`.

### Dashboard

`python -m swing --source yfinance --universe universes/nifty500.txt --refresh dashboard --run runs/nifty500-real`
downloads fresh prices, re-runs the scan and writes the dashboard's data files to
`runs/nifty500-real/dashboard/` (status, picks, portfolio, results, equity, market, research),
each as `{rows, meta}` JSON with the exporter's source code in `meta`.

### Synthetic data (shows the mechanics only)

`python -m swing --seed N evolve --iterations 10`:

| seed | train objective (base → champion) | hold-out Sharpe (base → champion) | verdict |
|---|---|---|---|
| 11 | 0.28 → 0.64 | 1.23 → 1.35 (max DD −13% → −6.5%) | CAUTION: held up out-of-sample; DSR 0.67 → paper-trade first |
| 23 | −0.03 → 0.79 | −1.58 → −1.69 | REJECT: train gains did not generalise |
| 7 | −0.05 → 0.12 | −0.54 → −0.57 | REJECT: loses money out-of-sample |

Seed 23 is the important case. The loop made six "improvements" that looked better on
both train and validation, and the hold-out still caught them. That is the job of step 06.

## 5. Known biases and next steps

- **Survivorship bias.** A static list of today's large caps leaves out stocks that were
  delisted or dropped from the index. Use point-in-time index membership for real research.
- **Data quality.** Yahoo's adjusted prices are fine for research, but check corporate
  actions before you trust a backtest. For production, use exchange bhavcopies or a
  broker feed through `CSVProvider`.
- **Costs.** The default is 25 bps per side (brokerage + STT + slippage for delivery
  trades in India). Raise it for small caps.
- **Fundamentals.** Earnings growth and quality filters (as in CAN SLIM) are a natural
  next feature group, but they need point-in-time fundamental data to avoid look-ahead.
- **Walk-forward.** For more confidence, repeat the loop on rolling windows and keep only
  rules that are selected again and again.
- **Not investment advice.** Treat a "CANDIDATE FOR PAPER TRADING" verdict as exactly
  that. Paper-trade the scanner for a few months before you put money behind it.

## Layout

```
swing/data.py       providers: synthetic, yfinance (cached), CSV; NSE large-cap starter list
swing/features.py   trailing-only indicators, cross-sectional ranks, market regime
swing/strategy.py   StrategySpec + SEARCH_SPACE + vectorised entry mask / ranking
swing/backtest.py   portfolio backtester (next-open fills, gap-aware stops, trailing, time stop)
swing/metrics.py    performance, regime breakdown, objective, PSR / Deflated Sharpe
swing/research.py   diagnosis, RuleResearcher, LLMResearcher (Claude, structured output)
swing/loop.py       the 6-step loop, gates, ledger, report
swing/scanner.py    today's ranked candidates + model portfolio
swing/cli.py        backtest | evolve | scan
```
