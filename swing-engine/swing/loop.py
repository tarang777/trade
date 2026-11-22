"""The self-improvement loop.

    01 RESEARCH    -> researcher.propose(): hypotheses from the diagnosis
    02 DEVELOP     -> hypothesis.apply(): a new, validated StrategySpec
    03 TEST        -> run_backtest() on the TRAIN window
    04 EVALUATE    -> objective + diagnose() (regimes, exits, holding period)
    05 IMPROVE     -> promote only if it beats the champion on TRAIN by a margin,
                      survives a parameter-neighbourhood robustness check, and
                      does not degrade on the VALIDATION window
    06 REVALIDATE  -> once, at the end, on the untouched HOLD-OUT window,
                      plus a Deflated Sharpe Ratio that charges for every trial

Data is split chronologically: TRAIN | VALIDATION | HOLD-OUT. The hold-out is
never seen by the loop until step 06, so its result is an honest estimate.
"""
from __future__ import annotations

import json
import time
from dataclasses import asdict, dataclass
from pathlib import Path

import numpy as np

from .backtest import run_backtest
from .features import Panel
from .metrics import daily_sharpe, deflated_sharpe, fmt_metrics, objective, probabilistic_sharpe
from .research import Hypothesis, diagnose
from .strategy import StrategySpec, neighbours

WARMUP_DAYS = 260  # 52-week features need a year of history


@dataclass
class LoopConfig:
    iterations: int = 8
    hypotheses_per_iter: int = 6
    train_frac: float = 0.6
    val_frac: float = 0.2
    min_trades: int = 30
    min_improvement: float = 0.05  # objective units the challenger must add on TRAIN
    val_tolerance: float = 0.1  # challenger VAL objective >= champion VAL - tolerance
    robustness_ratio: float = 0.5  # neighbours must keep >= this share of the gain
    capital: float = 1_000_000.0


def split_dates(p: Panel, cfg: LoopConfig):
    d = p.dates[WARMUP_DAYS:]
    n = len(d)
    a, b = int(n * cfg.train_frac), int(n * (cfg.train_frac + cfg.val_frac))
    return (d[0], d[a - 1]), (d[a], d[b - 1]), (d[b], d[-1])


class Lab:
    """Runs and caches backtests; logs every experiment to a JSONL ledger."""

    def __init__(self, panel: Panel, cfg: LoopConfig, out_dir: Path):
        self.p, self.cfg, self.out = panel, cfg, out_dir
        self.train, self.val, self.hold = split_dates(panel, cfg)
        self.cache: dict[tuple, dict] = {}
        self.trial_sharpes: list[float] = []  # daily Sharpe of every distinct TRAIN trial
        self.ledger = out_dir / "experiments.jsonl"
        self.n_runs = 0

    def evaluate(self, spec: StrategySpec, window: str) -> dict:
        key = (spec.fingerprint(), window)
        if key not in self.cache:
            start, end = getattr(self, window)
            res = run_backtest(spec, self.p, start, end, self.cfg.capital)
            m = dict(res.metrics)
            m["objective"] = objective(m, self.cfg.min_trades)
            m["_daily_sharpe"] = daily_sharpe(res.equity)
            m["_returns"] = res.equity.pct_change().dropna()
            self.cache[key] = m
            self.n_runs += 1
            if window == "train":
                self.trial_sharpes.append(m["_daily_sharpe"])
        return self.cache[key]

    def log(self, rec: dict):
        with open(self.ledger, "a") as fh:
            fh.write(json.dumps(rec, default=str) + "\n")


def _public(m: dict) -> dict:
    return {k: v for k, v in m.items() if not k.startswith("_")}


def robustness(lab: Lab, spec: StrategySpec, changes: dict, base_obj: float, cand_obj: float) -> tuple[bool, float]:
    """Perturb each changed parameter to its grid neighbours; the edge must not vanish.

    A real effect sits on a plateau; an overfit one sits on a spike.
    """
    gain = cand_obj - base_obj
    objs = []
    for path, value in changes.items():
        for nv in neighbours(path, value):
            try:
                objs.append(lab.evaluate(spec.with_changes({path: nv}), "train")["objective"])
            except ValueError:
                continue
    if not objs:
        return True, cand_obj
    med = float(np.median(objs))
    return (med - base_obj) >= lab.cfg.robustness_ratio * gain or med >= cand_obj - 0.1, med


def evolve(panel: Panel, base: StrategySpec, researcher, cfg: LoopConfig, out_dir: str | Path,
           verbose: bool = True) -> dict:
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    lab = Lab(panel, cfg, out)
    say = print if verbose else (lambda *a, **k: None)
    say(f"windows  train {lab.train[0].date()}..{lab.train[1].date()} | "
        f"val {lab.val[0].date()}..{lab.val[1].date()} | hold-out {lab.hold[0].date()}..{lab.hold[1].date()} (locked)")

    champ = base
    c_tr, c_val = lab.evaluate(champ, "train"), lab.evaluate(champ, "val")
    say(f"baseline [{champ.name}] train obj={c_tr['objective']:.2f}  {fmt_metrics(c_tr)}")
    tried = {champ.fingerprint()}
    history: list[dict] = []
    lineage = [{"iteration": 0, "name": champ.name, "train_obj": c_tr["objective"], "val_obj": c_val["objective"],
                "rationale": "baseline", "changes": {}}]

    for it in range(1, cfg.iterations + 1):
        say(f"\n=== iteration {it} ===")
        notes = diagnose(c_tr)
        for n in notes:
            say(f"  evaluate: {n}")
        # 01 RESEARCH
        hyps: list[Hypothesis] = researcher.propose(champ, _public(c_tr), tried, cfg.hypotheses_per_iter,
                                                    history=history)
        results = []
        for j, h in enumerate(hyps):
            # 02 DEVELOP
            try:
                spec = h.apply(champ, name=f"{base.name}.i{it}h{j}")
            except ValueError as e:
                say(f"  develop: rejected ({e})")
                continue
            tried.add(spec.fingerprint())
            # 03 TEST
            m = lab.evaluate(spec, "train")
            delta = m["objective"] - c_tr["objective"]
            say(f"  test: {delta:+.2f}  {h.rationale[:90]}")
            rec = {"ts": time.time(), "iteration": it, "spec": spec.name, "fingerprint": spec.fingerprint(),
                   "source": h.source, "rationale": h.rationale, "changes": h.changes,
                   "train": _public(m), "delta_obj": delta, "status": "tested"}
            results.append((delta, h, spec, m, rec))

        # 04 EVALUATE + 05 IMPROVE (try challengers best-first)
        promoted = None
        for delta, h, spec, m, rec in sorted(results, key=lambda r: -r[0]):
            if delta < cfg.min_improvement:
                rec["status"] = "rejected:insufficient_gain"
                continue
            if promoted:
                rec["status"] = "not_needed"
                continue
            ok, nb = robustness(lab, champ, h.changes, c_tr["objective"], m["objective"])
            rec["neighbour_median_obj"] = nb
            if not ok:
                rec["status"] = "rejected:fragile"
                say(f"  improve: fragile (neighbours median {nb:.2f}) -> {h.rationale[:60]}")
                continue
            v = lab.evaluate(spec, "val")
            rec["val"] = _public(v)
            if v["objective"] < c_val["objective"] - cfg.val_tolerance:
                rec["status"] = "rejected:validation"
                say(f"  improve: failed validation ({v['objective']:.2f} < {c_val['objective']:.2f})")
                continue
            rec["status"] = "promoted"
            promoted = (spec, m, v, h)
        for *_, rec in results:
            lab.log(rec)
            history.append({"changes": rec["changes"], "rationale": rec["rationale"],
                            "delta_train_obj": round(rec["delta_obj"], 3), "status": rec["status"]})
        if promoted:
            champ, c_tr, c_val, h = promoted
            lineage.append({"iteration": it, "name": champ.name, "train_obj": c_tr["objective"],
                            "val_obj": c_val["objective"], "rationale": h.rationale, "changes": h.changes})
            say(f"  ** promoted {champ.name}: train obj={c_tr['objective']:.2f} val obj={c_val['objective']:.2f}")
            say(f"     {fmt_metrics(c_tr)}")
        else:
            say("  no challenger promoted; champion unchanged")

    # 06 REVALIDATE on the hold-out (first and only look)
    b_hold = lab.evaluate(base, "hold")
    c_hold = lab.evaluate(champ, "hold")
    dsr = deflated_sharpe(c_tr["_returns"], lab.trial_sharpes)
    psr_hold = probabilistic_sharpe(c_hold["_returns"])
    verdict = _verdict(lab.evaluate(base, "train"), b_hold, c_tr, c_hold, dsr, psr_hold, champ is base)
    say("\n=== revalidate (hold-out) ===")
    say(f"  baseline  {fmt_metrics(b_hold)}")
    say(f"  champion  {fmt_metrics(c_hold)}")
    say(f"  deflated Sharpe (train, {len(lab.trial_sharpes)} trials) = {dsr:.2f}; PSR(hold-out) = {psr_hold:.2f}")
    say(f"  verdict: {verdict}")

    summary = {
        "windows": {"train": [str(x.date()) for x in lab.train], "val": [str(x.date()) for x in lab.val],
                    "hold_out": [str(x.date()) for x in lab.hold]},
        "config": asdict(cfg), "trials": len(lab.trial_sharpes), "backtests_run": lab.n_runs,
        "baseline": {"spec": base.to_dict(), "train": _public(lab.evaluate(base, "train")),
                     "val": _public(lab.evaluate(base, "val")), "hold_out": _public(b_hold)},
        "champion": {"spec": champ.to_dict(), "train": _public(c_tr), "val": _public(c_val),
                     "hold_out": _public(c_hold)},
        "deflated_sharpe_train": dsr, "psr_hold_out": psr_hold, "verdict": verdict, "lineage": lineage,
    }
    (out / "champion.json").write_text(json.dumps(champ.to_dict(), indent=2))
    (out / "summary.json").write_text(json.dumps(summary, indent=2, default=str))
    (out / "report.md").write_text(render_report(summary))
    return summary


def _verdict(b_tr, b_hold, c_tr, c_hold, dsr, psr_hold, unchanged: bool) -> str:
    """Two questions: does the strategy work out-of-sample, and did the loop's changes help?"""
    if c_hold.get("trades", 0) < 10:
        return "INCONCLUSIVE: too few hold-out trades"
    if c_hold["sharpe"] <= 0:
        return "REJECT: champion loses money out-of-sample"
    if dsr < 0.9 or psr_hold < 0.8:
        strategy = (f"CAUTION: profitable out-of-sample but weak evidence "
                    f"(deflated Sharpe {dsr:.2f}, hold-out PSR {psr_hold:.2f}) -> paper-trade first")
    else:
        strategy = (f"CANDIDATE FOR PAPER TRADING: profitable out-of-sample (hold-out PSR {psr_hold:.2f}) "
                    f"and survives multiple-testing deflation (DSR {dsr:.2f})")
    if unchanged:
        return strategy + ". Loop changes: none survived; baseline kept"
    gain = c_hold["objective"] - b_hold["objective"]
    if gain < -0.1:
        return ("REJECT CHANGES: champion is worse than baseline out-of-sample -> keep the baseline. "
                "Baseline: " + ("profitable" if b_hold["sharpe"] > 0 else "unprofitable") + " out-of-sample")
    if gain <= 0.1:
        return strategy + (f". Loop changes: no clear out-of-sample gain vs baseline "
                           f"(objective {gain:+.2f}); treat champion and baseline as equivalent")
    return strategy + f". Loop changes: improved on baseline out-of-sample (objective {gain:+.2f})"


def render_report(s: dict) -> str:
    def row(name, m):
        return (f"| {name} | {m['cagr']:.1%} | {m['sharpe']:.2f} | {m['max_dd']:.1%} | {m['trades']} | "
                f"{m.get('win_rate', 0):.0%} | {m.get('expectancy_r', 0):.2f} | {m.get('avg_hold_days', 0):.0f} | "
                f"{m.get('pct_hold_3to6m', 0):.0%} |")
    hdr = "| run | CAGR | Sharpe | MaxDD | trades | win% | exp. R | avg hold (d) | held 3-6m |\n|---|---|---|---|---|---|---|---|---|"
    lines = ["# Swing engine - self-improvement run", "",
             f"Windows: train {s['windows']['train']}, validation {s['windows']['val']}, "
             f"hold-out {s['windows']['hold_out']}", "",
             f"**Verdict:** {s['verdict']}", "",
             f"Trials (distinct train configs): {s['trials']} - deflated Sharpe on train: "
             f"{s['deflated_sharpe_train']:.2f} - PSR on hold-out: {s['psr_hold_out']:.2f}", "",
             "## Results", "", hdr]
    for who in ("baseline", "champion"):
        for w in ("train", "val", "hold_out"):
            lines.append(row(f"{who} / {w}", s[who][w]))
    lines += ["", "## Lineage (accepted improvements)", ""]
    for l in s["lineage"]:
        lines.append(f"- iter {l['iteration']}: `{l['changes']}` - {l['rationale']} "
                     f"(train obj {l['train_obj']:.2f}, val obj {l['val_obj']:.2f})")
    lines += ["", "## Champion hold-out by market regime at entry", "", "| regime | trades | win% | exp. R |", "|---|---|---|---|"]
    for k, v in sorted(s["champion"]["hold_out"].get("by_regime", {}).items()):
        lines.append(f"| {k} | {v['trades']} | {v['win_rate']:.0%} | {v['expectancy_r']:.2f} |")
    lines += ["", "## Champion spec", "", "```json", json.dumps(s["champion"]["spec"], indent=2), "```", ""]
    return "\n".join(lines)
