"""Self-improving swing-trading research engine (3-6 month holding horizon)."""
from .strategy import StrategySpec, SEARCH_SPACE
from .features import build_panel, Panel
from .backtest import run_backtest
from .loop import evolve, LoopConfig

__all__ = ["StrategySpec", "SEARCH_SPACE", "build_panel", "Panel", "run_backtest", "evolve", "LoopConfig"]
