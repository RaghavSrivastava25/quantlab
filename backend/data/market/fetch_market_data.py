"""
Fetch daily market data from Stooq bulk downloads + individual CSV.
Countries: US, UK, Japan, Hong Kong, Poland
Falls back to synthetic data if download fails.
"""
import os, time, zipfile, io, urllib.request
import pandas as pd
import numpy as np

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "datasets")
os.makedirs(DATA_DIR, exist_ok=True)

# Stooq bulk download URLs (daily data zips)
STOOQ_BULK = {
    "us":   "https://stooq.com/db/d/?b=d_us_txt&e=zip",
    "uk":   "https://stooq.com/db/d/?b=d_uk_txt&e=zip",
    "jp":   "https://stooq.com/db/d/?b=d_jp_txt&e=zip",
    "hk":   "https://stooq.com/db/d/?b=d_hk_txt&e=zip",
    "pl":   "https://stooq.com/db/d/?b=d_pl_txt&e=zip",
}

# Individual symbols (fallback / specific tickers)
STOOQ_SYMBOLS = {
    "spy_daily":       "SPY.US",
    "nifty_daily":     "^NIF50",
    "banknifty_daily": "^NBAN",
    "eurusd_daily":    "EURUSD",
    "inrusd_daily":    "INRUSD",
    "jpyusd_daily":    "JPYUSD",
    "crude_daily":     "CL.F",
    "natgas_daily":    "NG.F",
    "gold_daily":      "GC.F",
    "silver_daily":    "SI.F",
    # Country indices
    "us_spx_daily":    "^SPX",
    "uk_ftse_daily":   "^FTM",
    "jp_n225_daily":   "^NKX",
    "hk_hsi_daily":    "^HSI",
    "pl_wig_daily":    "WIG.PL",
    "de_dax_daily":    "^DAX",
}

DATASET_SEEDS = {
    "spy_daily": 400, "nifty_daily": 17000, "banknifty_daily": 42000,
    "eurusd_daily": 1.10, "inrusd_daily": 0.012, "jpyusd_daily": 0.0067,
    "crude_daily": 75, "natgas_daily": 3.0, "gold_daily": 1900, "silver_daily": 24,
    "us_spx_daily": 4200, "uk_ftse_daily": 7500, "jp_n225_daily": 32000,
    "hk_hsi_daily": 18000, "pl_wig_daily": 68000, "de_dax_daily": 16000,
    "synthetic_mean_revert": 100, "synthetic_trend": 100,
    "sp500_daily": 400, "forex_daily": 1.10,
}


def make_synthetic(key: str, n: int = 1200) -> pd.DataFrame:
    np.random.seed(abs(hash(key)) % 9999)
    dates = pd.bdate_range("2019-01-01", periods=n)
    base = DATASET_SEEDS.get(key, 100)
    vol = 0.012
    drift = 0.0003
    if "mean_revert" in key:
        prices = [float(base)]
        for _ in range(n - 1):
            prices.append(prices[-1] + 0.05 * (base - prices[-1]) + np.random.normal(0, base * vol))
    else:
        rets = np.random.normal(drift, vol, n)
        prices = list(base * np.cumprod(1 + rets))
    prices = np.array(prices)
    df = pd.DataFrame({
        "open":   prices * (1 + np.random.normal(0, 0.002, n)),
        "high":   prices * (1 + np.abs(np.random.normal(0, 0.005, n))),
        "low":    prices * (1 - np.abs(np.random.normal(0, 0.005, n))),
        "close":  prices,
        "volume": np.random.randint(1_000_000, 50_000_000, n).astype(float),
    }, index=dates)
    df.index.name = "date"
    return df


def fetch_individual(symbol: str, label: str) -> pd.DataFrame | None:
    url = f"https://stooq.com/q/d/l/?s={symbol}&i=d"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            df = pd.read_csv(resp, parse_dates=["Date"])
        df.columns = [c.lower() for c in df.columns]
        if "date" not in df.columns or len(df) < 50:
            return None
        df = df.set_index("date").sort_index()
        df = df[df["close"] > 0].dropna(subset=["close"])
        df = df.tail(2500)
        print(f"  ✓ {label}: {len(df)} rows")
        return df
    except Exception as e:
        print(f"  ✗ {label}: {e}")
        return None


def fetch_all():
    print("=== Fetching market data from Stooq ===\n")
    all_keys = list(STOOQ_SYMBOLS.keys()) + ["synthetic_mean_revert", "synthetic_trend", "sp500_daily", "forex_daily"]

    for key, symbol in STOOQ_SYMBOLS.items():
        path = os.path.join(DATA_DIR, f"{key}.parquet")
        df = fetch_individual(symbol, key)
        if df is None or len(df) < 50:
            print(f"  → synthetic fallback for {key}")
            df = make_synthetic(key)
        df.to_parquet(path)
        time.sleep(0.4)

    # Synthetic-only datasets
    for key in ["synthetic_mean_revert", "synthetic_trend", "sp500_daily", "forex_daily"]:
        path = os.path.join(DATA_DIR, f"{key}.parquet")
        if not os.path.exists(path):
            df = make_synthetic(key)
            df.to_parquet(path)
            print(f"  ✓ {key}: synthetic ({len(df)} rows)")

    print(f"\n=== Done. Datasets saved to {DATA_DIR} ===")


if __name__ == "__main__":
    fetch_all()
