import numpy as np
import pandas as pd
import traceback
from data.loaders.dataset_loader import load_dataset_as_df


async def run_backtest(code: str, dataset_key: str) -> dict:
    try:
        df = load_dataset_as_df(dataset_key)
        namespace = {"pd": pd, "np": np, "data": df}
        exec(compile(code, "<strategy>", "exec"), namespace)
        strategy_fn = namespace.get("strategy")
        if not strategy_fn:
            return {"error": "No 'strategy' function found in code"}

        signals = strategy_fn(df.copy())
        if signals is None:
            return {"error": "strategy() returned None"}

        result = compute_backtest_metrics(df, signals)
        return result
    except Exception:
        return {"error": traceback.format_exc()}


def compute_backtest_metrics(df: pd.DataFrame, signals: pd.Series) -> dict:
    prices = df["close"] if "close" in df.columns else df.iloc[:, 1]
    signals = signals.reindex(prices.index).fillna(0)
    signals = signals.clip(-1, 1)

    daily_returns = prices.pct_change().fillna(0)
    strategy_returns = signals.shift(1).fillna(0) * daily_returns

    transaction_cost = 0.001
    trades = signals.diff().abs().fillna(0)
    costs = trades * transaction_cost
    strategy_returns = strategy_returns - costs

    cumulative = (1 + strategy_returns).cumprod()
    total_return = float(cumulative.iloc[-1] - 1)
    annualized_return = float((1 + total_return) ** (252 / len(strategy_returns)) - 1)
    volatility = float(strategy_returns.std() * np.sqrt(252))
    sharpe = float(annualized_return / volatility) if volatility > 0 else 0.0

    downside = strategy_returns[strategy_returns < 0]
    downside_vol = float(downside.std() * np.sqrt(252)) if len(downside) > 0 else 0.0
    sortino = float(annualized_return / downside_vol) if downside_vol > 0 else 0.0

    rolling_max = cumulative.cummax()
    drawdown = (cumulative - rolling_max) / rolling_max
    max_drawdown = float(drawdown.min())

    benchmark_returns = daily_returns
    cov = np.cov(strategy_returns, benchmark_returns)
    beta = float(cov[0, 1] / cov[1, 1]) if cov[1, 1] != 0 else 0.0
    alpha = float(annualized_return - beta * (benchmark_returns.mean() * 252))

    turnover = float(trades.mean())

    cumulative_list = [round(v, 6) for v in cumulative.tolist()]
    dates = [str(d)[:10] for d in cumulative.index.tolist()]
    sample_step = max(1, len(dates) // 252)

    return {
        "sharpe_ratio": round(sharpe, 4),
        "sortino_ratio": round(sortino, 4),
        "total_return": round(total_return, 4),
        "annualized_return": round(annualized_return, 4),
        "volatility": round(volatility, 4),
        "max_drawdown": round(max_drawdown, 4),
        "alpha": round(alpha, 4),
        "beta": round(beta, 4),
        "turnover": round(turnover, 6),
        "num_days": len(strategy_returns),
        "equity_curve": {"dates": dates[::sample_step], "values": cumulative_list[::sample_step]},
    }
