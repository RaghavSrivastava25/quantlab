import os
import pandas as pd
import numpy as np
from core.config import get_settings

settings = get_settings()

DATASET_MAP = {
    "spy_daily":             "spy_daily.parquet",
    "nifty_daily":           "nifty_daily.parquet",
    "banknifty_daily":       "banknifty_daily.parquet",
    "eurusd_daily":          "eurusd_daily.parquet",
    "inrusd_daily":          "inrusd_daily.parquet",
    "jpyusd_daily":          "jpyusd_daily.parquet",
    "crude_daily":           "crude_daily.parquet",
    "natgas_daily":          "natgas_daily.parquet",
    "gold_daily":            "gold_daily.parquet",
    "silver_daily":          "silver_daily.parquet",
    "sp500_daily":           "spy_daily.parquet",
    "forex_daily":           "eurusd_daily.parquet",
    "synthetic_mean_revert": "synthetic_mean_revert.parquet",
    "synthetic_trend":       "synthetic_trend.parquet",
}

DATASET_LABELS = {
    "spy_daily":       "S&P 500 (SPY)",
    "nifty_daily":     "NIFTY 50",
    "banknifty_daily": "Bank Nifty",
    "eurusd_daily":    "EUR/USD",
    "inrusd_daily":    "INR/USD",
    "jpyusd_daily":    "JPY/USD",
    "crude_daily":     "Crude Oil",
    "natgas_daily":    "Natural Gas",
    "gold_daily":      "Gold",
    "silver_daily":    "Silver",
    "synthetic_mean_revert": "Synthetic Mean-Reverting",
    "synthetic_trend":       "Synthetic Trending",
}


def get_dataset_path(key: str) -> str:
    filename = DATASET_MAP.get(key)
    if not filename:
        raise ValueError(f"Unknown dataset: {key}")
    return os.path.join(settings.data_dir, filename)


def load_dataset_as_df(key: str) -> pd.DataFrame:
    path = get_dataset_path(key)
    if os.path.exists(path):
        return pd.read_parquet(path)
    return _generate_synthetic(key)


def load_dataset(key: str) -> dict | None:
    try:
        df = load_dataset_as_df(key)
        return {"dates": [str(d)[:10] for d in df.index.tolist()], "close": df["close"].tolist()}
    except Exception:
        return None


def _generate_synthetic(key: str) -> pd.DataFrame:
    np.random.seed(abs(hash(key)) % 9999)
    n = 1000
    dates = pd.bdate_range("2020-01-01", periods=n)
    seed_prices = {"spy_daily": 400, "nifty_daily": 17000, "banknifty_daily": 42000,
                   "crude_daily": 75, "gold_daily": 1900}
    base = seed_prices.get(key, 100)
    returns = np.random.normal(0.0003, 0.012, n)
    prices = base * np.cumprod(1 + returns)
    df = pd.DataFrame({"open": prices * (1 + np.random.normal(0, 0.002, n)),
                        "high": prices * (1 + np.abs(np.random.normal(0, 0.005, n))),
                        "low":  prices * (1 - np.abs(np.random.normal(0, 0.005, n))),
                        "close": prices,
                        "volume": np.random.randint(1_000_000, 10_000_000, n).astype(float)}, index=dates)
    df.index.name = "date"
    return df
