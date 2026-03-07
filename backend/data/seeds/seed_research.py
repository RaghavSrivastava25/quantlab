import asyncio, sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db.database import AsyncSessionLocal
from models.models import ResearchModule

MODULES = [
  {
    "slug": "stats-rolling-indicators",
    "title": "Rolling Statistical Indicators",
    "description": "SMA, EMA, Bollinger Bands, Z-Score — the building blocks of every quant strategy.",
    "category": "statistics",
    "order_index": 1,
    "papers": [
      {"title": "Technical Analysis of Financial Markets (Murphy, 1999)", "key_idea": "Moving averages as trend filters. SMA lags, EMA reacts faster.", "math": "EMA_t = α·P_t + (1-α)·EMA_{t-1}, α = 2/(n+1)"},
      {"title": "Bollinger on Bollinger Bands (Bollinger, 2002)", "key_idea": "Price channels using rolling mean ± k·σ to identify breakouts.", "math": "BB_{upper} = μ_n + 2σ_n, BB_{lower} = μ_n - 2σ_n"},
      {"title": "The Efficient Market Hypothesis (Fama, 1970)", "key_idea": "Prices reflect all available information — yet statistical patterns persist.", "math": "E[P_{t+1} | I_t] = P_t"},
    ],
    "content": """## Rolling Statistical Indicators

Rolling indicators are the foundation of quantitative analysis. They transform raw price series into signals by computing statistics over a moving window.

### Simple Moving Average (SMA)
The SMA smooths price data to reveal the underlying trend:

$$SMA_t = \\frac{1}{n} \\sum_{i=0}^{n-1} P_{t-i}$$

### Exponential Moving Average (EMA)
EMA gives exponentially more weight to recent observations:

$$EMA_t = \\alpha \\cdot P_t + (1-\\alpha) \\cdot EMA_{t-1}, \\quad \\alpha = \\frac{2}{n+1}$$

### Bollinger Bands
Standard deviation bands around SMA identify volatility regimes:

$$Upper = \\mu_n + 2\\sigma_n \\quad Lower = \\mu_n - 2\\sigma_n$$

### Rolling Z-Score
Normalises price relative to recent history — the core of mean-reversion strategies:

$$z_t = \\frac{P_t - \\mu_n}{\\sigma_n}$$

### Key Papers
See the papers section for foundational reading.

### Implement It
""",
    "starter_code": """import numpy as np

# prices is a list of closing prices
prices = [100, 102, 101, 105, 103, 107, 110, 108, 112, 115]

def bollinger_bands(prices, window=5, num_std=2):
    \"\"\"Return (upper, middle, lower) bands\"\"\"
    pass

upper, middle, lower = bollinger_bands(prices)
print(f"Upper: {upper}")
print(f"Middle: {middle}")
print(f"Lower: {lower}")
"""
  },

  {
    "slug": "options-black-scholes",
    "title": "Black-Scholes & Option Pricing",
    "description": "The most famous formula in finance. Derive, understand, and implement options pricing from first principles.",
    "category": "options",
    "order_index": 10,
    "papers": [
      {"title": "The Pricing of Options and Corporate Liabilities (Black & Scholes, 1973)", "key_idea": "A risk-free portfolio of option + stock eliminates randomness, giving a deterministic PDE.", "math": "C = S·N(d₁) - K·e^{-rT}·N(d₂)"},
      {"title": "Theory of Rational Option Pricing (Merton, 1973)", "key_idea": "Extended B-S to continuous dividends and showed options are redundant securities.", "math": "C = S·e^{-qT}·N(d₁) - K·e^{-rT}·N(d₂)"},
      {"title": "The Volatility Smile (Rubinstein, 1994)", "key_idea": "Post-1987 crash: implied vol varies by strike — Black-Scholes assumes constant vol incorrectly.", "math": "σ_implied = σ_implied(K, T)"},
      {"title": "A Simple Approach to the Valuation of Risky Streams (Cox, Ross, Rubinstein, 1979)", "key_idea": "Binomial tree converges to B-S in the limit. More intuitive and handles American options.", "math": "C = e^{-rΔt}[p·C_u + (1-p)·C_d]"},
      {"title": "Stochastic Volatility Models (Heston, 1993)", "key_idea": "Vol is itself stochastic, mean-reverting. Explains the volatility smile.", "math": "dv_t = κ(θ - v_t)dt + ξ√v_t dW_t"},
    ],
    "content": """## Black-Scholes Option Pricing

The Black-Scholes model assumes geometric Brownian motion for the stock price:

$$dS = \\mu S\\, dt + \\sigma S\\, dW_t$$

### The Formula

$$C = S \\cdot N(d_1) - K e^{-rT} N(d_2)$$

$$d_1 = \\frac{\\ln(S/K) + (r + \\sigma^2/2)T}{\\sigma\\sqrt{T}}, \\quad d_2 = d_1 - \\sigma\\sqrt{T}$$

### Option Greeks

| Greek | Formula | Meaning |
|-------|---------|---------|
| Delta (Δ) | N(d₁) | Change in option price per $1 move in S |
| Gamma (Γ) | φ(d₁)/(Sσ√T) | Rate of change of delta |
| Theta (Θ) | -(Sσφ(d₁))/(2√T) - rKe^{-rT}N(d₂) | Time decay |
| Vega (ν) | S√T·φ(d₁) | Sensitivity to volatility |

### Implement It
""",
    "starter_code": """import math

def N(x):
    \"\"\"Standard normal CDF\"\"\"
    return (1 + math.erf(x / math.sqrt(2))) / 2

def bs_call(S, K, T, r, sigma):
    \"\"\"Black-Scholes European call price\"\"\"
    pass

def bs_greeks(S, K, T, r, sigma):
    \"\"\"Return dict of delta, gamma, theta, vega\"\"\"
    pass

# Test
price = bs_call(100, 100, 1.0, 0.05, 0.2)
greeks = bs_greeks(100, 100, 1.0, 0.05, 0.2)
print(f"Call price: {price:.4f}")
print(f"Greeks: {greeks}")
"""
  },

  {
    "slug": "risk-var-cvar",
    "title": "Value at Risk & Expected Shortfall",
    "description": "Measure and manage portfolio risk. Historical simulation, parametric VaR, and CVaR (Expected Shortfall).",
    "category": "risk",
    "order_index": 20,
    "papers": [
      {"title": "RiskMetrics Technical Document (J.P. Morgan, 1994)", "key_idea": "Introduced EWMA volatility and parametric VaR as industry standard risk measure.", "math": "VaR_α = μ + z_α · σ"},
      {"title": "Coherent Measures of Risk (Artzner et al., 1999)", "key_idea": "VaR is not subadditive — violates coherence. CVaR (ES) is coherent and preferred.", "math": "ES_α = -E[R | R < -VaR_α]"},
      {"title": "An Introduction to Copulas (Nelsen, 1999)", "key_idea": "Model joint distribution of assets separately from marginals — captures tail dependence.", "math": "F(x,y) = C(F_X(x), F_Y(y))"},
      {"title": "Extreme Value Theory in Finance (Embrechts, 1997)", "key_idea": "Normal distribution underestimates tail risk. Fat tails require EVT.", "math": "P(X > x) ~ L(x) · x^{-α}"},
    ],
    "content": """## Value at Risk (VaR)

VaR answers: *What is the maximum loss at a given confidence level over a horizon?*

### Historical Simulation VaR

$$VaR_\\alpha = -\\text{percentile}(R, 1-\\alpha)$$

### Parametric (Normal) VaR

$$VaR_\\alpha = -(\\mu + z_\\alpha \\cdot \\sigma)$$

### Expected Shortfall (CVaR)

CVaR is the expected loss **given** that we exceed VaR. It's coherent (VaR is not):

$$ES_\\alpha = -E[R \\mid R < -VaR_\\alpha]$$

### EWMA Volatility

J.P. Morgan RiskMetrics: exponentially weight recent observations more heavily:

$$\\sigma_t^2 = \\lambda \\sigma_{t-1}^2 + (1-\\lambda) r_{t-1}^2, \\quad \\lambda = 0.94$$

### Implement It
""",
    "starter_code": """import math

returns = [-0.05, -0.03, -0.01, 0.01, 0.02, 0.04, 0.06, -0.02, 0.03, -0.04,
           -0.08, 0.05, -0.02, 0.01, 0.03, -0.06, 0.02, -0.01, 0.04, 0.01]

def historical_var(returns, confidence=0.95):
    pass

def expected_shortfall(returns, confidence=0.95):
    pass

def ewma_volatility(returns, lam=0.94):
    \"\"\"Return list of EWMA volatility estimates\"\"\"
    pass

print(f"VaR (95%): {historical_var(returns):.4f}")
print(f"CVaR (95%): {expected_shortfall(returns):.4f}")
"""
  },

  {
    "slug": "portfolio-markowitz",
    "title": "Markowitz Portfolio Optimization",
    "description": "The efficient frontier, minimum variance portfolio, and Sharpe ratio maximisation.",
    "category": "portfolio",
    "order_index": 30,
    "papers": [
      {"title": "Portfolio Selection (Markowitz, 1952)", "key_idea": "Mean-variance optimisation: for a given return, minimise variance. Diversification reduces risk.", "math": "min w'Σw s.t. w'μ = μ_target, w'1 = 1"},
      {"title": "Capital Asset Pricing Model (Sharpe, 1964)", "key_idea": "In equilibrium, expected return is proportional to market beta.", "math": "E[R_i] = R_f + β_i(E[R_m] - R_f)"},
      {"title": "Common Risk Factors in Returns (Fama & French, 1993)", "key_idea": "Market, size (SMB), and value (HML) factors explain cross-sectional returns.", "math": "R_i - R_f = α + β_m·MKT + β_s·SMB + β_v·HML"},
      {"title": "Black-Litterman Model (Black & Litterman, 1992)", "key_idea": "Blend market equilibrium with investor views using Bayesian updating.", "math": "μ_BL = [(τΣ)^{-1} + P'Ω^{-1}P]^{-1}[(τΣ)^{-1}Π + P'Ω^{-1}Q]"},
      {"title": "Risk Parity (Qian, 2005)", "key_idea": "Allocate by risk contribution, not dollar weight. Each asset contributes equally to portfolio risk.", "math": "RC_i = w_i · (Σw)_i / σ_p"},
    ],
    "content": """## Markowitz Portfolio Optimization

### The Problem

Given n assets with return vector μ and covariance Σ, find weights w that:

$$\\min_{w} \\frac{1}{2} w^T \\Sigma w \\quad \\text{s.t.} \\quad w^T \\mu = \\mu_{target}, \\quad w^T \\mathbf{1} = 1$$

### Efficient Frontier

Each point on the frontier represents a portfolio with the minimum risk for a given expected return.

### Sharpe Ratio Maximisation

The tangency portfolio maximises the Sharpe ratio:

$$\\max_w \\frac{w^T\\mu - r_f}{\\sqrt{w^T\\Sigma w}}$$

### CAPM

In equilibrium (Sharpe 1964):

$$E[R_i] = R_f + \\beta_i(E[R_m] - R_f), \\quad \\beta_i = \\frac{Cov(R_i, R_m)}{Var(R_m)}$$

### Fama-French Three Factor Model

$$R_i - R_f = \\alpha + \\beta_m \\cdot MKT + \\beta_s \\cdot SMB + \\beta_v \\cdot HML + \\epsilon$$

### Implement It
""",
    "starter_code": """import math

# 3-asset example
# Returns (annualised): [8%, 12%, 6%]
# Covariance matrix (annualised)
mu = [0.08, 0.12, 0.06]
cov = [
    [0.04, 0.02, 0.01],
    [0.02, 0.09, 0.03],
    [0.01, 0.03, 0.02],
]
rf = 0.02

def portfolio_return(weights, mu):
    return sum(w * r for w, r in zip(weights, mu))

def portfolio_variance(weights, cov):
    n = len(weights)
    return sum(weights[i] * weights[j] * cov[i][j]
               for i in range(n) for j in range(n))

def sharpe_ratio(weights, mu, cov, rf):
    r = portfolio_return(weights, mu)
    v = portfolio_variance(weights, cov)
    return (r - rf) / v**0.5 if v > 0 else 0

# Equal weight portfolio
w = [1/3, 1/3, 1/3]
print(f"Return: {portfolio_return(w, mu):.4f}")
print(f"Std Dev: {portfolio_variance(w, cov)**0.5:.4f}")
print(f"Sharpe: {sharpe_ratio(w, mu, cov, rf):.4f}")
"""
  },

  {
    "slug": "probability-stochastic-processes",
    "title": "Stochastic Processes in Finance",
    "description": "Brownian motion, GBM, Ito's lemma — the mathematical engine of options pricing.",
    "category": "probability",
    "order_index": 40,
    "papers": [
      {"title": "Brownian Motion and Stochastic Calculus (Karatzas & Shreve, 1991)", "key_idea": "Rigorous foundation of continuous-time stochastic processes used in finance.", "math": "W_t - W_s ~ N(0, t-s), independent increments"},
      {"title": "Ito's Formula (Ito, 1951)", "key_idea": "Chain rule for stochastic calculus. Essential for deriving B-S PDE.", "math": "df = (∂f/∂t + μ∂f/∂x + ½σ²∂²f/∂x²)dt + σ∂f/∂x dW"},
      {"title": "Monte Carlo Methods in Finance (Boyle, 1977)", "key_idea": "Simulate asset paths to price complex derivatives without closed forms.", "math": "S_T = S_0 exp((μ - σ²/2)T + σ√T·Z), Z~N(0,1)"},
      {"title": "The Kelly Criterion (Kelly, 1956)", "key_idea": "Optimal bet sizing that maximises long-run growth rate.", "math": "f* = (bp - q) / b = edge / odds"},
    ],
    "content": """## Stochastic Processes in Finance

### Brownian Motion (Wiener Process)

$W_t$ is a standard Brownian motion if:
1. $W_0 = 0$
2. Increments $W_t - W_s \\sim N(0, t-s)$
3. Increments are independent

### Geometric Brownian Motion (GBM)

Stock prices are modelled as GBM:

$$dS_t = \\mu S_t dt + \\sigma S_t dW_t$$

Solving via Ito's lemma gives:

$$S_T = S_0 \\exp\\left(\\left(\\mu - \\frac{\\sigma^2}{2}\\right)T + \\sigma W_T\\right)$$

### Ito's Lemma

For $f(t, S_t)$:

$$df = \\frac{\\partial f}{\\partial t}dt + \\frac{\\partial f}{\\partial S}dS + \\frac{1}{2}\\frac{\\partial^2 f}{\\partial S^2}(dS)^2$$

### Kelly Criterion

Optimal fraction of capital to bet:

$$f^* = \\frac{bp - q}{b} = \\frac{\\text{edge}}{\\text{odds}}$$

where p=win prob, q=1-p, b=odds.

### Implement It
""",
    "starter_code": """import math, random

def simulate_gbm(S0, mu, sigma, T, n_steps, seed=42):
    \"\"\"Simulate one GBM path. Return list of prices.\"\"\"
    random.seed(seed)
    dt = T / n_steps
    prices = [S0]
    for _ in range(n_steps):
        z = random.gauss(0, 1)
        prices.append(prices[-1] * math.exp((mu - sigma**2/2)*dt + sigma*dt**0.5*z))
    return prices

def kelly_fraction(win_prob, odds):
    \"\"\"Kelly optimal bet fraction\"\"\"
    pass

# Simulate
path = simulate_gbm(100, 0.08, 0.20, 1.0, 252)
print(f"Start: {path[0]:.2f}, End: {path[-1]:.2f}")
print(f"Kelly (p=0.6, odds=1): {kelly_fraction(0.6, 1):.4f}")
"""
  },

  {
    "slug": "strategies-mean-reversion",
    "title": "Mean Reversion Strategies",
    "description": "Pairs trading, Ornstein-Uhlenbeck process, cointegration, and the Hurst exponent.",
    "category": "strategies",
    "order_index": 50,
    "papers": [
      {"title": "Pairs Trading (Gatev, Goetzmann & Rouwenhorst, 2006)", "key_idea": "Historically cointegrated pairs revert to equilibrium. Long underperformer, short outperformer.", "math": "spread_t = P_A - β·P_B, z_t = (spread_t - μ)/σ"},
      {"title": "Statistical Arbitrage in the U.S. Equities Market (Avellaneda & Lee, 2010)", "key_idea": "PCA-based stat arb: factor out market/sector, trade residuals that mean-revert.", "math": "dX_t = -κ(X_t - θ)dt + σdW_t (OU process)"},
      {"title": "Cointegration and Error Correction (Engle & Granger, 1987)", "key_idea": "Two non-stationary series can share a long-run equilibrium. Nobel Prize 2003.", "math": "Δy_t = α(y_{t-1} - βx_{t-1}) + ε_t"},
      {"title": "The Hurst Exponent (Hurst, 1951)", "key_idea": "H < 0.5 = mean-reverting, H = 0.5 = random walk, H > 0.5 = trending.", "math": "E[R(n)/S(n)] = C·n^H"},
    ],
    "content": """## Mean Reversion Strategies

### Ornstein-Uhlenbeck Process

Mean-reverting continuous-time model:

$$dX_t = \\kappa(\\theta - X_t)dt + \\sigma dW_t$$

- κ = speed of mean reversion
- θ = long-run mean
- σ = volatility of process

### Pairs Trading Mechanism

1. Find two cointegrated stocks A, B
2. Compute spread: $S_t = P_A - \\beta P_B$
3. Normalise: $z_t = (S_t - \\mu) / \\sigma$
4. Enter when |z| > 2, exit when |z| < 0.5

### Hurst Exponent

Measures long-range dependence:

$$H = \\frac{\\log(R/S)}{\\log(n)}$$

- H = 0.5: Random walk (no memory)
- H < 0.5: Mean-reverting
- H > 0.5: Trending/persistent

### Implement It
""",
    "starter_code": """import math, random

def hurst_exponent(prices, max_lag=20):
    \"\"\"
    Estimate Hurst exponent using R/S analysis.
    Returns H value.
    \"\"\"
    pass

def ou_half_life(spread_series):
    \"\"\"
    Estimate half-life of mean reversion from spread series.
    Fit: spread[t] = a + b*spread[t-1] + e
    half_life = -log(2)/log(b)
    \"\"\"
    pass

# Synthetic mean-reverting series
random.seed(42)
prices = [100.0]
for _ in range(500):
    prices.append(prices[-1] + 0.1*(100 - prices[-1]) + random.gauss(0, 1))

h = hurst_exponent(prices)
print(f"Hurst exponent: {h:.4f}")
print(f"Series type: {'Mean-reverting' if h<0.45 else 'Trending' if h>0.55 else 'Random walk'}")
"""
  },

  {
    "slug": "futures-commodities",
    "title": "Futures, Carry & Commodity Markets",
    "description": "Cost of carry, convenience yield, contango/backwardation, and commodity trading strategies.",
    "category": "futures",
    "order_index": 60,
    "papers": [
      {"title": "The Theory of Storage (Kaldor, 1939)", "key_idea": "Futures price = spot + cost of carry - convenience yield. Explains contango and backwardation.", "math": "F = S·e^{(r+u-c)T} where u=storage cost, c=convenience yield"},
      {"title": "Fact and Fantasy in Commodity Futures (Gorton & Rouwenhorst, 2006)", "key_idea": "Commodity futures historically have equity-like returns with negative correlation to stocks.", "math": "Roll return = (F_near - F_far) / F_near"},
      {"title": "A Century of Futures Returns (Bhardwaj et al., 2015)", "key_idea": "Roll yield is the primary driver of long-run commodity futures returns, not spot price changes.", "math": "Total return = Spot return + Roll yield + Collateral return"},
    ],
    "content": """## Futures & Commodity Markets

### Cost of Carry Model

$$F = S \\cdot e^{(r + u - c)T}$$

- r = risk-free rate
- u = storage/carrying cost
- c = convenience yield
- T = time to expiry

### Contango vs Backwardation

| State | Condition | Roll Yield |
|-------|-----------|-----------|
| Contango | F > S (normal) | Negative |
| Backwardation | F < S | Positive |

### Roll Return

As a futures contract approaches expiry, it must be "rolled" to the next contract:

$$\\text{Roll yield} = \\frac{F_{near} - F_{far}}{F_{near}} \\times \\frac{\\text{days}}{365}$$

### Calendar Spread

The spread between two expiry dates reflects the market's expectation of future supply/demand:

$$\\text{Calendar spread} = F_{near} - F_{far}$$

### Implement It
""",
    "starter_code": """import math

def futures_curve(spot, r, convenience_yield, storage_cost, maturities):
    \"\"\"
    Compute futures prices at different maturities.
    maturities: list of T values in years
    Returns list of futures prices.
    \"\"\"
    pass

def annualised_roll_yield(near_price, far_price, days_between):
    pass

# Oil market example
spot = 75.0
r = 0.05
c = 0.03  # convenience yield
u = 0.02  # storage cost
maturities = [1/12, 2/12, 3/12, 6/12, 1.0]

curve = futures_curve(spot, r, c, u, maturities)
print("Futures curve:")
for T, F in zip(maturities, curve):
    print(f"  T={T:.2f}y: F={F:.2f}")
"""
  },
]


async def seed():
    async with AsyncSessionLocal() as db:
        from sqlalchemy import select
        for m in MODULES:
            ex = await db.execute(select(ResearchModule).where(ResearchModule.slug == m["slug"]))
            if ex.scalar_one_or_none():
                print(f"  skip: {m['slug']}")
                continue
            db.add(ResearchModule(**m))
            print(f"  added: {m['slug']}")
        await db.commit()
        print(f"Done — {len(MODULES)} modules processed.")

if __name__ == "__main__":
    asyncio.run(seed())
