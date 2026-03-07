import os
import sys
import numpy as np
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "datasets")
os.makedirs(DATA_DIR, exist_ok=True)


def generate_sp500():
    np.random.seed(0)
    n = 2000
    dates = pd.bdate_range("2016-01-01", periods=n)
    returns = np.random.normal(0.0004, 0.012, n)
    prices = 2000 * np.cumprod(1 + returns)
    df = pd.DataFrame({
        "open": prices * (1 + np.random.normal(0, 0.002, n)),
        "high": prices * (1 + np.abs(np.random.normal(0, 0.005, n))),
        "low": prices * (1 - np.abs(np.random.normal(0, 0.005, n))),
        "close": prices,
        "volume": np.random.randint(1_000_000, 10_000_000, n).astype(float),
    }, index=dates)
    df.index.name = "date"
    path = os.path.join(DATA_DIR, "sp500_daily.parquet")
    df.to_parquet(path)
    print(f"Saved: {path}")


def generate_forex():
    np.random.seed(1)
    n = 2000
    dates = pd.bdate_range("2016-01-01", periods=n)
    eurusd = 1.1 * np.cumprod(1 + np.random.normal(0, 0.005, n))
    gbpusd = 1.3 * np.cumprod(1 + np.random.normal(0, 0.006, n))
    df = pd.DataFrame({"EURUSD": eurusd, "GBPUSD": gbpusd, "close": eurusd}, index=dates)
    df.index.name = "date"
    path = os.path.join(DATA_DIR, "forex_daily.parquet")
    df.to_parquet(path)
    print(f"Saved: {path}")


def generate_mean_revert():
    np.random.seed(2)
    n = 1000
    dates = pd.bdate_range("2020-01-01", periods=n)
    prices = [100.0]
    for _ in range(n - 1):
        prices.append(prices[-1] + 0.05 * (100 - prices[-1]) + np.random.normal(0, 1.5))
    df = pd.DataFrame({"close": prices}, index=dates)
    df.index.name = "date"
    path = os.path.join(DATA_DIR, "synthetic_mean_revert.parquet")
    df.to_parquet(path)
    print(f"Saved: {path}")


def generate_trend():
    np.random.seed(3)
    n = 1000
    dates = pd.bdate_range("2020-01-01", periods=n)
    returns = np.random.normal(0.0008, 0.01, n)
    prices = 100 * np.cumprod(1 + returns)
    df = pd.DataFrame({"close": prices}, index=dates)
    df.index.name = "date"
    path = os.path.join(DATA_DIR, "synthetic_trend.parquet")
    df.to_parquet(path)
    print(f"Saved: {path}")


if __name__ == "__main__":
    generate_sp500()
    generate_forex()
    generate_mean_revert()
    generate_trend()
    print("All datasets seeded.")
