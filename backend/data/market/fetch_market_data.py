import os
import time
import pandas as pd
import numpy as np
import urllib.request

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "datasets")
os.makedirs(DATA_DIR, exist_ok=True)

STOOQ_SYMBOLS = {
    "spy_daily":       ("SPY.US",   "SPY (S&P 500 ETF)"),
    "nifty_daily":     ("^NIF50",   "NIFTY 50"),
    "banknifty_daily": ("^NBAN",    "Bank Nifty"),
    "eurusd_daily":    ("EURUSD",   "EUR/USD"),
    "inrusd_daily":    ("INRUSD",   "INR/USD"),
    "jpyusd_daily":    ("JPYUSD",   "JPY/USD"),
    "crude_daily":     ("CL.F",     "Crude Oil Futures"),
    "natgas_daily":    ("NG.F",     "Natural Gas Futures"),
    "gold_daily":      ("GC.F",     "Gold Futures"),
    "silver_daily":    ("SI.F",     "Silver Futures"),
}


def stooq_url(symbol: str) -> str:
    return f"https://stooq.com/q/d/l/?s={symbol}&i=d"


def fetch_stooq(symbol: str, label: str) -> pd.DataFrame | None:
    url = stooq_url(symbol)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            df = pd.read_csv(resp, parse_dates=["Date"])
        df.columns = [c.lower() for c in df.columns]
        if "date" not in df.columns or len(df) < 50:
            return None
        df = df.set_index("date").sort_index()
        df = df[df["close"] > 0].dropna(subset=["close"])
        df = df.tail(2000)
        print(f"  {label}: {len(df)} rows")
        return df
    except Exception as e:
        print(f"  {label}: FAILED — {e}")
        return None


def make_synthetic(key: str, n: int = 1000) -> pd.DataFrame:
    np.random.seed(abs(hash(key)) % 9999)
    dates = pd.bdate_range("2020-01-01", periods=n)
    seed_price = {"spy_daily": 400, "nifty_daily": 17000, "banknifty_daily": 42000,
                  "eurusd_daily": 1.10, "inrusd_daily": 0.012, "jpyusd_daily": 0.0067,
                  "crude_daily": 75, "natgas_daily": 3.0, "gold_daily": 1900, "silver_daily": 24}.get(key, 100)
    vol = 0.012
    returns = np.random.normal(0.0003, vol, n)
    prices = seed_price * np.cumprod(1 + returns)
    df = pd.DataFrame({"open": prices * (1 + np.random.normal(0, 0.002, n)),
                        "high": prices * (1 + np.abs(np.random.normal(0, 0.005, n))),
                        "low":  prices * (1 - np.abs(np.random.normal(0, 0.005, n))),
                        "close": prices,
                        "volume": np.random.randint(1_000_000, 50_000_000, n).astype(float)}, index=dates)
    df.index.name = "date"
    return df


def fetch_all():
    print("Fetching market data from Stooq...")
    results = {}
    for key, (symbol, label) in STOOQ_SYMBOLS.items():
        path = os.path.join(DATA_DIR, f"{key}.parquet")
        df = fetch_stooq(symbol, label)
        if df is None or len(df) < 50:
            print(f"  {label}: using synthetic fallback")
            df = make_synthetic(key)
        df.to_parquet(path)
        results[key] = len(df)
        time.sleep(0.5)

    print("\nSynthetic fallbacks for extras:")
    extras = {
        "synthetic_mean_revert": None,
        "synthetic_trend": None,
        "sp500_daily": "SPY.US",
        "forex_daily": "EURUSD",
    }
    for key in extras:
        path = os.path.join(DATA_DIR, f"{key}.parquet")
        if not os.path.exists(path):
            df = make_synthetic(key)
            df.to_parquet(path)
            print(f"  {key}: synthetic created")

    print(f"\nDone. {len(results)} datasets saved to {DATA_DIR}")
    return results


if __name__ == "__main__":
    fetch_all()
