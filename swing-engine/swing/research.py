"""Steps 01 RESEARCH and 04 EVALUATE: diagnose results, propose hypotheses.

Two researchers share one interface (``propose(spec, metrics, history, k)``):

* ``RuleResearcher`` -- deterministic heuristics that read the diagnosis
  (weak regimes, exit mix, holding period, drawdown) and propose targeted
  fixes, plus random single-parameter exploration.
* ``LLMResearcher`` -- sends the same diagnosis to Claude, which returns
  hypotheses as structured JSON. Every proposed change is validated against
  ``SEARCH_SPACE``; the LLM cannot run code or touch the hold-out data.
"""
from __future__ import annotations

import json
import random
from dataclasses import dataclass

from .strategy import SEARCH_SPACE, StrategySpec, validate_change


@dataclass
class Hypothesis:
    rationale: str
    changes: dict  # param path -> new value
    source: str = "rules"

    def apply(self, spec: StrategySpec, name: str) -> StrategySpec:
        return spec.with_changes(self.changes, name=name)


def diagnose(m: dict, min_regime_trades: int = 8) -> list[str]:
    """Plain-language findings from a backtest (the EVALUATE step)."""
    notes = []
    regimes = {k: v for k, v in m.get("by_regime", {}).items() if v["trades"] >= min_regime_trades}
    if regimes:
        worst = min(regimes.items(), key=lambda kv: kv[1]["expectancy_r"])
        best = max(regimes.items(), key=lambda kv: kv[1]["expectancy_r"])
        notes.append(f"best regime {best[0]}: {best[1]['expectancy_r']:.2f}R over {best[1]['trades']} trades; "
                     f"worst {worst[0]}: {worst[1]['expectancy_r']:.2f}R over {worst[1]['trades']} trades")
    mix = m.get("exit_mix", {})
    if mix.get("stop", 0) > 0.45:
        notes.append(f"{mix['stop']:.0%} of trades exit at the initial stop -> stops may be too tight or entries too extended")
    if m.get("avg_hold_days", 0) and m["avg_hold_days"] < 45:
        notes.append(f"average hold {m['avg_hold_days']:.0f}d is short of the 3-6 month target")
    if mix.get("time", 0) > 0.4:
        notes.append(f"{mix['time']:.0%} of trades hit the time stop -> winners may be cut by the clock")
    if abs(m.get("max_dd", 0)) > 0.25:
        notes.append(f"max drawdown {m['max_dd']:.0%} is deep")
    if m.get("trades", 0) < 40:
        notes.append(f"only {m.get('trades', 0)} trades -> filters may be too strict to be statistically meaningful")
    if m.get("win_rate", 1) < 0.38:
        notes.append(f"win rate {m['win_rate']:.0%} is low -> consider stricter entry quality")
    if m.get("exposure", 1) < 0.4:
        notes.append(f"average exposure {m['exposure']:.0%} -> capital often idle")
    return notes


class RuleResearcher:
    def __init__(self, seed: int = 0):
        self.rng = random.Random(seed)

    def propose(self, spec: StrategySpec, m: dict, tried: set[str], k: int = 6,
                history: list[dict] | None = None) -> list[Hypothesis]:
        hyps: list[Hypothesis] = []
        regimes = {r: v for r, v in m.get("by_regime", {}).items() if v["trades"] >= 8}
        mix = m.get("exit_mix", {})

        def add(rationale, changes):
            changes = {p: v for p, v in changes.items() if spec.get(p) != v}
            if not changes:
                return
            try:
                for p, v in changes.items():
                    validate_change(p, v)
            except ValueError:
                return
            if spec.with_changes(changes).fingerprint() not in tried:
                hyps.append(Hypothesis(rationale, changes))

        if regimes:
            worst, w = min(regimes.items(), key=lambda kv: kv[1]["expectancy_r"])
            if w["expectancy_r"] < 0.1:
                trend, vol = worst.split("/")
                if vol == "lowvol":
                    add(f"Trades entered in {worst} lose ({w['expectancy_r']:.2f}R): skip low-volatility markets",
                        {"filters.market_vol": "avoid_low"})
                    add(f"Weak in {worst}: demand a confirmed breakout so quiet-market drift doesn't trigger entries",
                        {"entry.require_breakout": True})
                else:
                    add(f"Trades entered in {worst} lose ({w['expectancy_r']:.2f}R): skip high-volatility markets",
                        {"filters.market_vol": "avoid_high"})
                    add(f"Weak in {worst}: cap stock volatility", {"filters.max_atr_pct": 0.04})
                if trend == "down":
                    add(f"Losses concentrated in {worst}: enforce the 200-DMA market regime filter",
                        {"filters.regime_filter": True})
        if mix.get("stop", 0) > 0.45:
            add("Too many initial-stop exits: widen the stop", {"exit.stop_atr_mult": _step(spec, "exit.stop_atr_mult", +1)})
            add("Too many initial-stop exits: avoid overextended entries", {"entry.rsi_max": 75.0})
        if m.get("avg_hold_days", 999) < 45:
            add("Holds too short for a 3-6m horizon: loosen the trailing stop",
                {"exit.trail_atr_mult": _step(spec, "exit.trail_atr_mult", +1)})
            add("Holds too short: use a slower trend-exit MA", {"exit.ma_exit": "sma150", "exit.min_hold_days": 21})
        if mix.get("time", 0) > 0.4:
            add("Many time exits: let winners run longer", {"exit.max_hold_days": 126})
        if abs(m.get("max_dd", 0)) > 0.25:
            add("Deep drawdown: cut risk per trade", {"risk.risk_per_trade": _step(spec, "risk.risk_per_trade", -1)})
            add("Deep drawdown: diversify across more positions", {"risk.max_positions": _step(spec, "risk.max_positions", +1)})
        if m.get("trades", 0) < 40:
            add("Too few trades: relax relative-strength threshold", {"entry.min_rs_pct": _step(spec, "entry.min_rs_pct", -1)})
        if m.get("win_rate", 1) < 0.38:
            add("Low win rate: require volatility contraction before entry (VCP-style base)", {"entry.max_contraction": 0.85})
            add("Low win rate: raise the relative-strength bar", {"entry.min_rs_pct": _step(spec, "entry.min_rs_pct", +1)})

        # Exploration: random single-parameter mutations.
        paths = list(SEARCH_SPACE)
        attempts = 0
        while len(hyps) < k and attempts < 200:
            attempts += 1
            p = self.rng.choice(paths)
            v = self.rng.choice(SEARCH_SPACE[p])
            add(f"Explore: {p} = {v}", {p: v})
        return hyps[:k]


def _step(spec: StrategySpec, path: str, direction: int):
    grid = SEARCH_SPACE[path]
    cur = spec.get(path)
    # None sorts as "off" at the start of the grid
    i = grid.index(cur) if cur in grid else 0
    return grid[max(0, min(len(grid) - 1, i + direction))]


# ----------------------------------------------------------------------
# LLM researcher (Claude)
# ----------------------------------------------------------------------
_HYPOTHESIS_SCHEMA = {
    "type": "object",
    "properties": {
        "hypotheses": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "rationale": {"type": "string"},
                    "changes": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "path": {"type": "string", "enum": sorted(SEARCH_SPACE)},
                                "value": {"anyOf": [{"type": "number"}, {"type": "boolean"},
                                                    {"type": "string"}, {"type": "null"}]},
                            },
                            "required": ["path", "value"],
                            "additionalProperties": False,
                        },
                    },
                },
                "required": ["rationale", "changes"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["hypotheses"],
    "additionalProperties": False,
}

_SYSTEM = """You are the research step of a self-improving swing-trading system \
(holding period 3-6 months, long-only equities). You receive the current strategy \
spec, in-sample backtest metrics with a per-regime breakdown, a diagnosis, and the \
log of hypotheses already tested with their outcomes.

Propose new, testable hypotheses. Each hypothesis changes 1-3 parameters, and every \
value must come from the allowed grid you are given. Prefer hypotheses grounded in \
the diagnosis and in well-documented effects (intermediate-term momentum, 52-week-high \
proximity, trend/regime filters, volatility contraction, ATR-based risk). Avoid \
re-testing ideas that already failed, and avoid stacking many filters that would \
cut the trade count below what is statistically meaningful. Keep each rationale to \
one or two sentences stating the expected mechanism."""


class LLMResearcher:
    """Hypothesis generation with Claude (model named in the loop diagram: Fable 5.2)."""

    def __init__(self, model: str = "claude-fable-5-2", effort: str = "high"):
        import anthropic

        self.client = anthropic.Anthropic()
        self.model, self.effort = model, effort
        self.fallback = RuleResearcher(seed=1)

    def propose(self, spec: StrategySpec, m: dict, tried: set[str], k: int = 6,
                history: list[dict] | None = None) -> list[Hypothesis]:
        import anthropic

        payload = {
            "current_spec": spec.to_dict(),
            "in_sample_metrics": {kk: v for kk, v in m.items() if kk not in ("start", "end")},
            "diagnosis": diagnose(m),
            "allowed_values": SEARCH_SPACE,
            "recent_experiments": (history or [])[-40:],
            "n_hypotheses": k,
        }
        try:
            resp = self.client.beta.messages.create(
                model=self.model,
                max_tokens=16000,
                system=_SYSTEM,
                messages=[{"role": "user", "content": json.dumps(payload, default=str)}],
                output_config={"effort": self.effort,
                               "format": {"type": "json_schema", "schema": _HYPOTHESIS_SCHEMA}},
                betas=["server-side-fallback-2026-07-01"],
                fallbacks="default",
            )
        except anthropic.APIConnectionError as e:
            print(f"  [llm] connection error ({e}); falling back to rule-based research")
            return self.fallback.propose(spec, m, tried, k)
        except anthropic.APIStatusError as e:
            print(f"  [llm] API error {e.status_code}; falling back to rule-based research")
            return self.fallback.propose(spec, m, tried, k)
        if resp.stop_reason in ("refusal", "max_tokens"):
            print(f"  [llm] stop_reason={resp.stop_reason}; falling back to rule-based research")
            return self.fallback.propose(spec, m, tried, k)
        text = next(b.text for b in resp.content if b.type == "text")
        out = []
        for h in json.loads(text)["hypotheses"]:
            changes = {c["path"]: _coerce(c["path"], c["value"]) for c in h["changes"]}
            try:
                for p, v in changes.items():
                    validate_change(p, v)
            except ValueError as e:
                print(f"  [llm] rejected hypothesis ({e})")
                continue
            if changes and spec.with_changes(changes).fingerprint() not in tried:
                out.append(Hypothesis(h["rationale"], changes, source="llm"))
        return out[:k] or self.fallback.propose(spec, m, tried, k)


def _coerce(path: str, value):
    """JSON numbers come back as float/int; match the grid's representation."""
    for g in SEARCH_SPACE[path]:
        if g == value and type(g) is not bool and type(value) is not bool:
            return g
        if g is value:
            return g
    return value
