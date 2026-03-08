import os
import pandas as pd
import numpy as np
from core.config import get_settings

settings = get_settings()

DATASET_MAP = {
    # ETFs / Indices
    "spy_daily":             "spy_daily.parquet",
    "nifty_daily":           "nifty_daily.parquet",
    "banknifty_daily":       "banknifty_daily.parquet",
    # Country indices
    "us_spx_daily":          "us_spx_daily.parquet",
    "uk_ftse_daily":         "uk_ftse_daily.parquet",
    "jp_n225_daily":         "jp_n225_daily.parquet",
    "hk_hsi_daily":          "hk_hsi_daily.parquet",
    "pl_wig_daily":          "pl_wig_daily.parquet",
    "de_dax_daily":          "de_dax_daily.parquet",
    # FX
    "eurusd_daily":          "eurusd_daily.parquet",
    "inrusd_daily":          "inrusd_daily.parquet",
    "jpyusd_daily":          "jpyusd_daily.parquet",
    # Commodities
    "crude_daily":           "crude_daily.parquet",
    "natgas_daily":          "natgas_daily.parquet",
    "gold_daily":            "gold_daily.parquet",
    "silver_daily":          "silver_daily.parquet",
    # Aliases
    "sp500_daily":           "spy_daily.parquet",
    "forex_daily":           "eurusd_daily.parquet",
    # Synthetic
    "synthetic_mean_revert": "synthetic_mean_revert.parquet",
    "synthetic_trend":       "synthetic_trend.parquet",
}

DATASET_LABELS = {
    "spy_daily":             "S&P 500 (SPY)",
    "nifty_daily":           "NIFTY 50",
    "banknifty_daily":       "Bank Nifty",
    "us_spx_daily":          "US — S&P 500",
    "uk_ftse_daily":         "UK — FTSE 100",
    "jp_n225_daily":         "Japan — Nikkei 225",
    "hk_hsi_daily":          "Hong Kong — Hang Seng",
    "pl_wig_daily":          "Poland — WIG",
    "de_dax_daily":          "Germany — DAX",
    "eurusd_daily":          "EUR/USD",
    "inrusd_daily":          "INR/USD",
    "jpyusd_daily":          "JPY/USD",
    "crude_daily":           "Crude Oil (CL)",
    "natgas_daily":          "Natural Gas (NG)",
    "gold_daily":            "Gold (GC)",
    "silver_daily":          "Silver (SI)",
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
    seeds = {"spy_daily": 400, "us_spx_daily": 4200, "uk_ftse_daily": 7500,
             "jp_n225_daily": 32000, "hk_hsi_daily": 18000, "pl_wig_daily": 68000,
             "nifty_daily": 17000, "crude_daily": 75, "gold_daily": 1900}
    np.random.seed(abs(hash(key)) % 9999)
    n = 1200
    dates = pd.bdate_range("2019-01-01", periods=n)
    base = seeds.get(key, 100)
    prices = base * np.cumprod(1 + np.random.normal(0.0003, 0.012, n))
    df = pd.DataFrame({
        "open":   prices * (1 + np.random.normal(0, 0.002, n)),
        "high":   prices * (1 + np.abs(np.random.normal(0, 0.005, n))),
        "low":    prices * (1 - np.abs(np.random.normal(0, 0.005, n))),
        "close":  prices,
        "volume": np.random.randint(1_000_000, 10_000_000, n).astype(float),
    }, index=dates)
    df.index.name = "date"
    return df
