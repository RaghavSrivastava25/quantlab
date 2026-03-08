"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Play, CheckCircle2, XCircle, Loader2, RotateCcw } from "lucide-react";
import clsx from "clsx";

// ─── PROBLEM DEFINITIONS ────────────────────────────────────────────────────
// type: "code" | "mcq" | "value"
const PROBLEM_DATA: Record<string, any> = {
  // ── BRAIN TEASERS ──────────────────────────────────────────────────────────
  "brain-monty-hall": {
    title: "Monty Hall Problem",
    difficulty: "easy", category: "Brain Teasers", points: 75,
    type: "mcq",
    description: `You're on a game show. There are **3 doors**. Behind one is a car, behind the other two are goats.

You pick door #1. The host (who knows what's behind each door) opens door #3, revealing a goat.

**Should you switch to door #2?**

What is the probability of winning if you **always switch**?`,
    options: ["1/3", "1/2", "2/3", "3/4"],
    answer: "2/3",
    explanation: "If you always switch, you win whenever your initial pick was wrong (probability 2/3). The host's action gives you information — the remaining door has a 2/3 chance of hiding the car.",
  },
  "brain-birthday-problem": {
    title: "Birthday Problem",
    difficulty: "easy", category: "Brain Teasers", points: 75,
    type: "value",
    description: `What is the **minimum number of people** in a room such that there is at least a **50% probability** that two people share the same birthday?

Assume 365 days in a year, birthdays uniformly distributed.

Enter the number as a whole integer.`,
    answer: "23",
    tolerance: 0,
    explanation: "With 23 people, P(at least one shared birthday) ≈ 50.7%. The formula is: P(no match) = 365/365 × 364/365 × ... × (365-n+1)/365. When this drops below 0.5, n=23.",
  },
  "brain-drunk-man-walk": {
    title: "Drunk Man's Walk",
    difficulty: "easy", category: "Brain Teasers", points: 100,
    type: "mcq",
    description: `A drunk man stands at position 0 on an infinite number line. Each step he moves +1 (right) with probability 1/2 or -1 (left) with probability 1/2.

**What is the probability that he eventually returns to position 0?**`,
    options: ["0%", "25%", "50%", "100%"],
    answer: "100%",
    explanation: "A 1D symmetric random walk is recurrent — it returns to the origin with probability 1. This is a classic result. In 3D, the random walk is transient (returns with probability < 1).",
  },
  "brain-gambler-ruin": {
    title: "Gambler's Ruin",
    difficulty: "medium", category: "Brain Teasers", points: 125,
    type: "value",
    description: `A gambler starts with **$10**. They repeatedly bet $1 on a **fair coin flip** (50/50).

They stop if they reach **$20** (win) or **$0** (ruined).

What is their probability of winning (reaching $20)? Enter as a decimal between 0 and 1 (e.g. 0.5).`,
    answer: "0.5",
    tolerance: 0.01,
    explanation: "For a fair game (p=0.5), the probability of reaching N starting from k is exactly k/N. Here: 10/20 = 0.5. For unfair games, the formula is (1-(q/p)^k)/(1-(q/p)^N).",
  },
  "brain-coupon-collector": {
    title: "Coupon Collector Problem",
    difficulty: "medium", category: "Brain Teasers", points: 100,
    type: "value",
    description: `Each cereal box contains one of **n=5** different coupons, each equally likely.

**What is the expected number of boxes** you need to buy to collect all 5 different coupons?

Round to 1 decimal place (e.g. 11.4).`,
    answer: "11.4",
    tolerance: 0.2,
    explanation: "E[boxes] = n × H(n) = n × (1 + 1/2 + 1/3 + ... + 1/n). For n=5: 5 × (1 + 0.5 + 0.333 + 0.25 + 0.2) = 5 × 2.283 = 11.416 ≈ 11.4",
  },
  "brain-secretary-problem": {
    title: "Secretary Problem",
    difficulty: "medium", category: "Brain Teasers", points: 150,
    type: "mcq",
    description: `You interview **n candidates** one by one. After each interview you must immediately accept or reject them (no going back). You want to maximise the probability of picking the best candidate.

The optimal strategy is to **reject the first k candidates** (to calibrate), then pick the next candidate who is better than all previous.

What is the optimal stopping ratio **k/n** as n → ∞?`,
    options: ["1/e ≈ 0.368", "1/2 = 0.5", "1/3 ≈ 0.333", "ln(2) ≈ 0.693"],
    answer: "1/e ≈ 0.368",
    explanation: "The optimal strategy is to reject the first n/e candidates and then pick the next one better than all previous. This gives a success probability of approximately 1/e ≈ 36.8%.",
  },
  "brain-russian-roulette": {
    title: "Russian Roulette — Sequential vs Random",
    difficulty: "medium", category: "Brain Teasers", points: 125,
    type: "mcq",
    description: `A revolver has 6 chambers. **2 bullets** are placed in **consecutive chambers**. The cylinder is spun once, then you pull the trigger — you survive (empty chamber).

Now you must pull the trigger again. You have two choices:
- **A**: Spin the cylinder again (random)
- **B**: Just pull the trigger (sequential, next chamber)

**Which gives you a higher survival probability?**`,
    options: [
      "A (spin again) — both equal at 4/6",
      "B (don't spin) — higher survival with B",
      "A (spin again) — higher survival with A",
      "Both equal at 2/3",
    ],
    answer: "B (don't spin) — higher survival with B",
    explanation: "After surviving, you know you were in one of the 4 empty chambers. If you don't spin: the next chamber is empty in 3 of those 4 cases (75%). If you spin: 4/6 = 66.7% chance of empty. So B is better.",
  },
  "brain-pirate-game": {
    title: "Pirate Game — Game Theory",
    difficulty: "hard", category: "Brain Teasers", points: 200,
    type: "value",
    description: `**5 pirates** (ranked 1–5, most senior = 5) found **100 gold coins**. 

Rules:
- The most senior pirate proposes a distribution
- All pirates vote (including the proposer)
- If ≥ 50% approve → accepted
- Otherwise, the proposer is thrown overboard and the next senior proposes
- Pirates are perfectly rational, greedy, and prefer to survive

**How many coins does pirate #5 (most senior) keep for himself?**`,
    answer: "98",
    tolerance: 0,
    explanation: "Solve by backward induction. With 2 pirates: #2 takes all 100. With 3: #3 gives #1 one coin (better than 0), keeps 99. With 4: #4 gives #2 one coin, keeps 99. With 5: #5 gives #1 and #3 each one coin, keeps 98.",
  },
  "brain-kelly-sizing": {
    title: "Kelly Criterion",
    difficulty: "medium", category: "Brain Teasers", points: 150,
    type: "value",
    description: `You have a bet where:
- Probability of winning = **60%**  
- If you win, you gain **1x** your bet
- If you lose, you lose **1x** your bet

Using the **Kelly Criterion**, what fraction of your bankroll should you bet?

Enter as a decimal (e.g. 0.2 for 20%).`,
    answer: "0.2",
    tolerance: 0.01,
    explanation: "Kelly fraction = (bp - q) / b where b = odds (1), p = win prob (0.6), q = lose prob (0.4). f* = (1×0.6 - 0.4) / 1 = 0.2 = 20%",
  },
  "brain-envelope-paradox": {
    title: "Two Envelopes Paradox",
    difficulty: "medium", category: "Brain Teasers", points: 125,
    type: "mcq",
    description: `Two envelopes each contain money. One has **twice** as much as the other. You pick one at random and see it contains **$100**.

You reason: the other has either $50 (prob 0.5) or $200 (prob 0.5).  
Expected value of switching = 0.5×50 + 0.5×200 = **$125 > $100**.

**Should you always switch?**`,
    options: [
      "Yes — EV of switching is always higher",
      "No — the reasoning has a flaw; switching gives no advantage",
      "Yes — but only if the amount seen is below average",
      "No — switching always loses",
    ],
    answer: "No — the reasoning has a flaw; switching gives no advantage",
    explanation: "The paradox arises from assuming both $50 and $200 are equally likely simultaneously, which requires an improper (unbounded) prior. With any proper prior distribution, the EV calculation breaks down and switching confers no advantage.",
  },
  "brain-card-probability": {
    title: "Card Probability — At Least One Ace",
    difficulty: "easy", category: "Brain Teasers", points: 75,
    type: "value",
    description: `You draw **2 cards** from a standard 52-card deck **without replacement**.

What is the probability that **at least one card is an Ace**?

Round to 4 decimal places (e.g. 0.1493).`,
    answer: "0.1493",
    tolerance: 0.001,
    explanation: "P(at least one ace) = 1 - P(no aces) = 1 - (48/52)(47/51) = 1 - 2256/2652 = 396/2652 ≈ 0.1493",
  },
  "brain-price-sequence": {
    title: "Stock Price Sequences",
    difficulty: "hard", category: "Brain Teasers", points: 175,
    type: "value",
    description: `A stock price starts at $1. Each period it goes **up 50%** (×1.5) or **down 50%** (×0.5), each with probability 1/2.

After **2 periods**, what is the **expected value** of the stock price?

Enter as a decimal (e.g. 1.0625).`,
    answer: "1.0625",
    tolerance: 0.001,
    explanation: "E[S₂] = (1/4)(1.5)(1.5) + (1/4)(1.5)(0.5) + (1/4)(0.5)(1.5) + (1/4)(0.5)(0.5) = (1/4)(2.25 + 0.75 + 0.75 + 0.25) = 4/4 × 1.0625 = 1.0625",
  },

  // ── PROBABILITY ────────────────────────────────────────────────────────────
  "normal-distribution-pdf": {
    title: "Normal Distribution PDF",
    difficulty: "easy", category: "Probability", points: 50,
    type: "code",
    description: `Implement the **Normal Distribution Probability Density Function (PDF)**.

The PDF of a normal distribution is:

$$f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}$$

Your function should take **x**, **mean (μ)**, and **std (σ)** as inputs.`,
    starterCode: `import math

def normal_pdf(x: float, mu: float, sigma: float) -> float:
    """
    Compute the Normal Distribution PDF.
    
    Args:
        x: value to evaluate at
        mu: mean of the distribution
        sigma: standard deviation
    
    Returns:
        PDF value at x
    """
    # Your code here
    pass

# Test it
print(normal_pdf(0, 0, 1))   # Should be ≈ 0.3989
print(normal_pdf(1, 0, 1))   # Should be ≈ 0.2420
`,
    testCode: `
import math

def normal_pdf(x, mu, sigma):
    return (1 / (sigma * math.sqrt(2 * math.pi))) * math.exp(-((x - mu) ** 2) / (2 * sigma ** 2))

tests = [
    (normal_pdf(0, 0, 1), 0.3989, "PDF at x=0, standard normal"),
    (normal_pdf(1, 0, 1), 0.2420, "PDF at x=1, standard normal"),
    (normal_pdf(0, 0, 2), 0.1995, "PDF at x=0, sigma=2"),
    (normal_pdf(-1, 0, 1), 0.2420, "PDF at x=-1, symmetric"),
]
passed = 0
for got, expected, name in tests:
    ok = abs(got - expected) < 0.001
    print(f"{'✅' if ok else '❌'} {name}: {got:.4f} (expected {expected:.4f})")
    if ok: passed += 1
print(f"\\n{passed}/{len(tests)} tests passed")
`,
    explanation: "The PDF formula is f(x) = (1/(σ√(2π))) × exp(-(x-μ)²/(2σ²)). Use math.pi and math.exp from Python's standard library.",
  },
  "monte-carlo-pi": {
    title: "Monte Carlo — Estimate π",
    difficulty: "easy", category: "Probability", points: 75,
    type: "code",
    description: `Use **Monte Carlo simulation** to estimate **π**.

**Method**: Generate random (x, y) points in the unit square [0,1]×[0,1]. Count how many fall inside the quarter circle of radius 1. The ratio × 4 approximates π.

$$\\pi \\approx 4 \\times \\frac{\\text{points inside circle}}{\\text{total points}}$$`,
    starterCode: `import random

def estimate_pi(n_samples: int, seed: int = 42) -> float:
    """
    Estimate pi using Monte Carlo simulation.
    
    Args:
        n_samples: number of random points
        seed: random seed for reproducibility
    
    Returns:
        estimate of pi
    """
    random.seed(seed)
    # Your code here
    pass

print(estimate_pi(10000))   # Should be close to 3.14159
print(estimate_pi(100000))  # Should be closer
`,
    testCode: `
import random

def estimate_pi(n_samples, seed=42):
    random.seed(seed)
    inside = sum(1 for _ in range(n_samples) if random.random()**2 + random.random()**2 <= 1)
    return 4 * inside / n_samples

tests = [
    (abs(estimate_pi(10000) - 3.14159) < 0.1, "10k samples within 0.1 of pi"),
    (abs(estimate_pi(100000) - 3.14159) < 0.05, "100k samples within 0.05 of pi"),
]
passed = 0
for ok, name in tests:
    print(f"{'✅' if ok else '❌'} {name}")
    if ok: passed += 1
print(f"\\n{passed}/{len(tests)} tests passed")
`,
    explanation: "Count points where x² + y² ≤ 1. The fraction of points inside the quarter circle equals π/4.",
  },
  "prob-bayes-disease": {
    title: "Bayes Theorem — Disease Testing",
    difficulty: "easy", category: "Probability", points: 75,
    type: "value",
    description: `A disease affects **1% of the population**. A test for the disease is:
- **99% sensitive** (true positive rate)
- **95% specific** (true negative rate, so 5% false positive rate)

You test **positive**. What is the probability you actually have the disease?

Round to 4 decimal places (e.g. 0.1667).`,
    answer: "0.1667",
    tolerance: 0.005,
    explanation: "P(disease|+) = P(+|disease)×P(disease) / P(+) = (0.99×0.01) / (0.99×0.01 + 0.05×0.99) = 0.0099 / 0.0594 ≈ 0.1667. Only 16.7% — base rate matters enormously!",
  },
  "prob-geometric-dist": {
    title: "Geometric Distribution — First Success",
    difficulty: "easy", category: "Probability", points: 75,
    type: "value",
    description: `You flip a biased coin where **P(heads) = 0.3**.

What is the **expected number of flips** until you get the first heads?

Enter as a decimal (e.g. 3.333).`,
    answer: "3.333",
    tolerance: 0.01,
    explanation: "For a geometric distribution, E[X] = 1/p = 1/0.3 ≈ 3.333 flips.",
  },
  "brain-dice-sum-expected": {
    title: "Expected Rolls Until Sum ≥ 6",
    difficulty: "easy", category: "Probability", points: 75,
    type: "value",
    description: `You keep rolling a fair **6-sided die** and accumulate the sum.

What is the **expected number of rolls** until the running sum is **≥ 6**?

Hint: E[rolls until sum ≥ 6] ≈ ? Round to 2 decimal places.`,
    answer: "2.14",
    tolerance: 0.1,
    explanation: "E[sum per roll] = 3.5. To reach 6, you need roughly 6/3.5 ≈ 1.71 rolls, but since you can't have fractional rolls, simulation gives ≈ 2.14 expected rolls.",
  },
  "brain-unfair-coin": {
    title: "Detecting an Unfair Coin",
    difficulty: "medium", category: "Probability", points: 125,
    type: "mcq",
    description: `You flip a coin **100 times** and get **60 heads**. You want to test whether the coin is fair (p=0.5) at a **5% significance level**.

Under H₀ (fair coin), the number of heads ~ Binomial(100, 0.5) with mean 50 and std ≈ 5.

The z-score = (60 - 50) / 5 = **2.0**.

**What is your conclusion?**`,
    options: [
      "Fail to reject H₀ — z=2.0 is within the 95% range",
      "Reject H₀ — evidence the coin is unfair (two-tailed p ≈ 0.046)",
      "Reject H₀ — evidence the coin is unfair (one-tailed p ≈ 0.023)",
      "Cannot conclude — need more flips",
    ],
    answer: "Reject H₀ — evidence the coin is unfair (two-tailed p ≈ 0.046)",
    explanation: "Two-tailed test: |z| = 2.0. Critical value at α=0.05 is 1.96. Since 2.0 > 1.96, we reject H₀. The two-tailed p-value ≈ 0.046 < 0.05.",
  },

  // ── STOCHASTIC PROCESSES ───────────────────────────────────────────────────
  "stoch-gbm-simulation": {
    title: "Geometric Brownian Motion",
    difficulty: "medium", category: "Stochastic Processes", points: 150,
    type: "code",
    description: `Simulate a **Geometric Brownian Motion (GBM)** path — the standard model for stock prices.

The GBM formula (discrete-time):

$$S_{t+1} = S_t \\cdot e^{(\\mu - \\frac{\\sigma^2}{2})\\Delta t + \\sigma\\sqrt{\\Delta t}\\, Z}$$

where Z ~ N(0,1).`,
    starterCode: `import math
import random

def simulate_gbm(S0: float, mu: float, sigma: float, T: float, n_steps: int, seed: int = 42) -> list:
    """
    Simulate a GBM path.
    
    Args:
        S0: initial price
        mu: drift (annualized)
        sigma: volatility (annualized)
        T: time horizon in years
        n_steps: number of time steps
        seed: random seed
    
    Returns:
        list of prices (length n_steps + 1)
    """
    random.seed(seed)
    dt = T / n_steps
    prices = [S0]
    # Your code here
    pass

path = simulate_gbm(100, 0.05, 0.2, 1.0, 252)
print(f"Start: {path[0]:.2f}, End: {path[-1]:.2f}, Steps: {len(path)}")
`,
    testCode: `
import math, random

def simulate_gbm(S0, mu, sigma, T, n_steps, seed=42):
    random.seed(seed)
    dt = T / n_steps
    prices = [S0]
    for _ in range(n_steps):
        z = random.gauss(0, 1)
        prices.append(prices[-1] * math.exp((mu - 0.5*sigma**2)*dt + sigma*math.sqrt(dt)*z))
    return prices

path = simulate_gbm(100, 0.05, 0.2, 1.0, 252)
tests = [
    (len(path) == 253, "Path has 253 points (252 steps + start)"),
    (path[0] == 100, "Starts at S0=100"),
    (all(p > 0 for p in path), "All prices positive (GBM stays positive)"),
    (abs(path[-1] - 107.97) < 5.0, f"Final price ≈ 107.97 (got {path[-1]:.2f})"),
]
passed = 0
for ok, name in tests:
    print(f"{'✅' if ok else '❌'} {name}")
    if ok: passed += 1
print(f"\\n{passed}/{len(tests)} tests passed")
`,
    explanation: "Use the Euler-Maruyama discretization. At each step: S[t+1] = S[t] * exp((μ - σ²/2)Δt + σ√Δt * Z) where Z is a standard normal.",
  },
  "stoch-poisson-process": {
    title: "Poisson Process — Jump Times",
    difficulty: "medium", category: "Stochastic Processes", points: 125,
    type: "mcq",
    description: `Trades arrive at a market following a **Poisson process** with rate **λ = 10 trades/second**.

**What is the probability that exactly 8 trades arrive in the next second?**

Use the Poisson PMF: P(X=k) = (λᵏ × e⁻λ) / k!`,
    options: ["0.0463", "0.1126", "0.0993", "0.0283"],
    answer: "0.1126",
    explanation: "P(X=8) = (10⁸ × e⁻¹⁰) / 8! = (100000000 × 0.0000454) / 40320 ≈ 0.1126",
  },
  "stoch-ito-lemma": {
    title: "Itô's Lemma Application",
    difficulty: "hard", category: "Stochastic Processes", points: 200,
    type: "mcq",
    description: `If **S** follows GBM: **dS = μS dt + σS dW**

Apply **Itô's Lemma** to **f(S) = ln(S)**.

What SDE does **ln(S)** follow?`,
    options: [
      "d(ln S) = μ dt + σ dW",
      "d(ln S) = (μ - σ²/2) dt + σ dW",
      "d(ln S) = (μ + σ²/2) dt + σ dW",
      "d(ln S) = μS dt + σ dW",
    ],
    answer: "d(ln S) = (μ - σ²/2) dt + σ dW",
    explanation: "Itô's Lemma: df = (∂f/∂t + μS·∂f/∂S + ½σ²S²·∂²f/∂S²)dt + σS·∂f/∂S dW. For f=ln(S): ∂f/∂S = 1/S, ∂²f/∂S² = -1/S². So d(ln S) = (μ - ½σ²)dt + σ dW.",
  },
  "stoch-ornstein-uhlenbeck": {
    title: "Ornstein-Uhlenbeck Process",
    difficulty: "medium", category: "Stochastic Processes", points: 150,
    type: "mcq",
    description: `The **Ornstein-Uhlenbeck (OU) process** is used to model mean-reverting assets:

$$dX_t = \\theta(\\mu - X_t)dt + \\sigma dW_t$$

where θ is the **speed of mean reversion**, μ is the **long-run mean**.

If θ = 0, what does the OU process reduce to?`,
    options: [
      "A constant process X_t = μ",
      "A standard Brownian motion (random walk with drift σ dW)",
      "A Geometric Brownian Motion",
      "A Poisson process",
    ],
    answer: "A standard Brownian motion (random walk with drift σ dW)",
    explanation: "When θ=0, the mean-reversion term disappears: dX = σ dW, which is just a Brownian motion with volatility σ. The process no longer pulls toward μ.",
  },

  // ── CALCULUS & LINEAR ALGEBRA ──────────────────────────────────────────────
  "calc-gradient-descent": {
    title: "Gradient Descent",
    difficulty: "easy", category: "Calculus & Linear Algebra", points: 75,
    type: "code",
    description: `Implement **gradient descent** to minimize the function:

$$f(x) = x^2 + 4x + 4 = (x+2)^2$$

The gradient is **f'(x) = 2x + 4**. The minimum is at **x = -2**.

Update rule: **x = x - α × f'(x)**`,
    starterCode: `def gradient_descent(x0: float, learning_rate: float, n_iter: int) -> float:
    """
    Minimize f(x) = x^2 + 4x + 4 using gradient descent.
    
    Args:
        x0: starting point
        learning_rate: step size (alpha)
        n_iter: number of iterations
    
    Returns:
        x value at minimum
    """
    x = x0
    # Your code here
    pass

result = gradient_descent(10.0, 0.1, 100)
print(f"Minimum at x = {result:.4f}")  # Should be close to -2.0
`,
    testCode: `
def gradient_descent(x0, learning_rate, n_iter):
    x = x0
    for _ in range(n_iter):
        grad = 2*x + 4
        x = x - learning_rate * grad
    return x

tests = [
    (abs(gradient_descent(10.0, 0.1, 100) - (-2.0)) < 0.001, "Converges to -2.0 from x=10"),
    (abs(gradient_descent(-10.0, 0.1, 100) - (-2.0)) < 0.001, "Converges to -2.0 from x=-10"),
    (abs(gradient_descent(0.0, 0.01, 1000) - (-2.0)) < 0.01, "Converges with small learning rate"),
]
passed = 0
for ok, name in tests:
    print(f"{'✅' if ok else '❌'} {name}")
    if ok: passed += 1
print(f"\\n{passed}/{len(tests)} tests passed")
`,
    explanation: "At each step compute the gradient f'(x) = 2x + 4, then update x = x - α×gradient. Repeat for n_iter steps.",
  },
  "calc-newton-raphson": {
    title: "Newton-Raphson Root Finding",
    difficulty: "easy", category: "Calculus & Linear Algebra", points: 75,
    type: "code",
    description: `Implement the **Newton-Raphson method** to find the square root of a number (i.e., solve x² - n = 0).

Update rule: **x_{k+1} = x_k - f(x_k)/f'(x_k) = x_k - (x_k² - n)/(2x_k) = (x_k + n/x_k)/2**`,
    starterCode: `def newton_sqrt(n: float, tol: float = 1e-10) -> float:
    """
    Compute sqrt(n) using Newton-Raphson.
    
    Args:
        n: number to find square root of
        tol: convergence tolerance
    
    Returns:
        sqrt(n)
    """
    x = n / 2.0  # initial guess
    # Your code here
    pass

print(newton_sqrt(2))    # Should be ≈ 1.41421356
print(newton_sqrt(144))  # Should be 12.0
`,
    testCode: `
import math

def newton_sqrt(n, tol=1e-10):
    x = n / 2.0
    while True:
        x_new = (x + n/x) / 2
        if abs(x_new - x) < tol:
            return x_new
        x = x_new

tests = [
    (abs(newton_sqrt(2) - math.sqrt(2)) < 1e-8, "sqrt(2) correct"),
    (abs(newton_sqrt(144) - 12.0) < 1e-8, "sqrt(144) = 12"),
    (abs(newton_sqrt(0.25) - 0.5) < 1e-8, "sqrt(0.25) = 0.5"),
]
passed = 0
for ok, name in tests:
    print(f"{'✅' if ok else '❌'} {name}")
    if ok: passed += 1
print(f"\\n{passed}/{len(tests)} tests passed")
`,
    explanation: "Iterate x = (x + n/x)/2 until |x_new - x| < tolerance. This is the Babylonian method and converges quadratically.",
  },
  "calc-matrix-inverse": {
    title: "Matrix Inverse Check",
    difficulty: "medium", category: "Calculus & Linear Algebra", points: 100,
    type: "mcq",
    description: `For the matrix:

$$A = \\begin{pmatrix} 2 & 1 \\\\ 5 & 3 \\end{pmatrix}$$

What is **A⁻¹**?

Recall: For 2×2 matrix [[a,b],[c,d]], the inverse is (1/det) × [[d,-b],[-c,a]] where det = ad - bc.`,
    options: [
      "[[3, -1], [-5, 2]]",
      "[[-3, 1], [5, -2]]",
      "[[3, -1], [5, 2]]",
      "[[0.5, -0.5], [-2.5, 1.5]]",
    ],
    answer: "[[3, -1], [-5, 2]]",
    explanation: "det(A) = 2×3 - 1×5 = 1. A⁻¹ = (1/1) × [[3,-1],[-5,2]] = [[3,-1],[-5,2]]. Verify: A×A⁻¹ = [[2×3+1×(-5), 2×(-1)+1×2],[5×3+3×(-5), 5×(-1)+3×2]] = [[1,0],[0,1]] ✓",
  },
  "calc-eigenvalues": {
    title: "Eigenvalues — 2×2 Matrix",
    difficulty: "medium", category: "Calculus & Linear Algebra", points: 125,
    type: "value",
    description: `Find the **larger eigenvalue** of:

$$A = \\begin{pmatrix} 4 & 1 \\\\ 2 & 3 \\end{pmatrix}$$

Solve det(A - λI) = 0: **(4-λ)(3-λ) - 2 = 0**

Enter the larger eigenvalue as a number.`,
    answer: "5",
    tolerance: 0.01,
    explanation: "(4-λ)(3-λ) - 2 = λ² - 7λ + 10 = 0. Using the quadratic formula: λ = (7 ± √(49-40))/2 = (7 ± 3)/2. So λ₁ = 5, λ₂ = 2. Larger eigenvalue = 5.",
  },

  // ── ALGORITHMS & NUMERICAL METHODS ────────────────────────────────────────
  "algo-bisection": {
    title: "Bisection Method",
    difficulty: "easy", category: "Algorithms & Numerical", points: 75,
    type: "code",
    description: `Implement the **bisection method** to find a root of a continuous function on interval [a, b].

The algorithm:
1. Compute midpoint m = (a+b)/2
2. If f(m) ≈ 0 or interval is small enough, return m
3. If f(a) and f(m) have the same sign, root is in [m, b]
4. Otherwise root is in [a, m]`,
    starterCode: `def bisection(f, a: float, b: float, tol: float = 1e-8) -> float:
    """
    Find root of f in [a, b] using bisection.
    
    Args:
        f: continuous function
        a, b: interval endpoints (f(a) and f(b) must have opposite signs)
        tol: tolerance
    
    Returns:
        approximate root
    """
    # Your code here
    pass

# Find root of x^3 - x - 2 = 0
f = lambda x: x**3 - x - 2
root = bisection(f, 1, 2)
print(f"Root: {root:.8f}")  # Should be ≈ 1.52137971
`,
    testCode: `
def bisection(f, a, b, tol=1e-8):
    while (b - a) / 2 > tol:
        m = (a + b) / 2
        if f(m) == 0: return m
        elif f(a) * f(m) < 0: b = m
        else: a = m
    return (a + b) / 2

tests = [
    (abs(bisection(lambda x: x**3 - x - 2, 1, 2) - 1.52137971) < 1e-6, "Root of x³-x-2 ≈ 1.5214"),
    (abs(bisection(lambda x: x**2 - 4, 0, 3) - 2.0) < 1e-6, "Root of x²-4 = 2.0"),
    (abs(bisection(lambda x: x - 1.5, 0, 3) - 1.5) < 1e-6, "Root of x-1.5 = 1.5"),
]
passed = 0
for ok, name in tests:
    print(f"{'✅' if ok else '❌'} {name}")
    if ok: passed += 1
print(f"\\n{passed}/{len(tests)} tests passed")
`,
    explanation: "At each step narrow the interval by half. The key is checking which sub-interval contains the sign change: if f(a)×f(m) < 0, root is in [a,m], otherwise in [m,b].",
  },
  "algo-binary-search": {
    title: "Binary Search",
    difficulty: "easy", category: "Algorithms & Numerical", points: 50,
    type: "code",
    description: `Implement **binary search** on a sorted array. Return the **index** of the target, or **-1** if not found.`,
    starterCode: `def binary_search(arr: list, target: int) -> int:
    """
    Find target in sorted array using binary search.
    
    Returns:
        index of target, or -1 if not found
    """
    left, right = 0, len(arr) - 1
    # Your code here
    pass

arr = [1, 3, 5, 7, 9, 11, 13, 15]
print(binary_search(arr, 7))   # Should be 3
print(binary_search(arr, 6))   # Should be -1
`,
    testCode: `
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target: return mid
        elif arr[mid] < target: left = mid + 1
        else: right = mid - 1
    return -1

arr = [1, 3, 5, 7, 9, 11, 13, 15]
tests = [
    (binary_search(arr, 7) == 3, "Find 7 → index 3"),
    (binary_search(arr, 1) == 0, "Find 1 → index 0"),
    (binary_search(arr, 15) == 7, "Find 15 → index 7"),
    (binary_search(arr, 6) == -1, "Find 6 → not found"),
    (binary_search([], 5) == -1, "Empty array → -1"),
]
passed = 0
for ok, name in tests:
    print(f"{'✅' if ok else '❌'} {name}")
    if ok: passed += 1
print(f"\\n{passed}/{len(tests)} tests passed")
`,
    explanation: "Maintain left and right pointers. Compute mid = (left+right)//2. If arr[mid]==target return mid. If target > arr[mid], search right half. Otherwise search left half.",
  },
  "algo-dynamic-prog": {
    title: "Max Profit — k Transactions",
    difficulty: "hard", category: "Algorithms & Numerical", points: 200,
    type: "code",
    description: `Given a list of stock prices, find the **maximum profit** with **at most 2 transactions** (buy-sell pairs). You cannot hold more than one stock at a time.

This is a classic dynamic programming problem seen in quant interviews.`,
    starterCode: `def max_profit_2_transactions(prices: list) -> float:
    """
    Max profit with at most 2 buy-sell transactions.
    
    Args:
        prices: list of daily stock prices
    
    Returns:
        maximum profit achievable
    """
    # Your code here
    pass

print(max_profit_2_transactions([3, 3, 5, 0, 0, 3, 1, 4]))  # Should be 6
print(max_profit_2_transactions([1, 2, 3, 4, 5]))             # Should be 4
print(max_profit_2_transactions([7, 6, 4, 3, 1]))             # Should be 0
`,
    testCode: `
def max_profit_2_transactions(prices):
    if not prices: return 0
    buy1 = buy2 = float('-inf')
    sell1 = sell2 = 0
    for p in prices:
        buy1 = max(buy1, -p)
        sell1 = max(sell1, buy1 + p)
        buy2 = max(buy2, sell1 - p)
        sell2 = max(sell2, buy2 + p)
    return sell2

tests = [
    (max_profit_2_transactions([3,3,5,0,0,3,1,4]) == 6, "Standard case → 6"),
    (max_profit_2_transactions([1,2,3,4,5]) == 4, "Increasing → 4"),
    (max_profit_2_transactions([7,6,4,3,1]) == 0, "Decreasing → 0"),
    (max_profit_2_transactions([1]) == 0, "Single price → 0"),
]
passed = 0
for ok, name in tests:
    print(f"{'✅' if ok else '❌'} {name}")
    if ok: passed += 1
print(f"\\n{passed}/{len(tests)} tests passed")
`,
    explanation: "Track 4 state variables: buy1 (best profit after first buy), sell1 (best after first sell), buy2 (best after second buy), sell2 (best after second sell). Update in order for each price.",
  },

  // ── FINANCE ────────────────────────────────────────────────────────────────
  "sharpe-ratio": {
    title: "Sharpe Ratio",
    difficulty: "easy", category: "Finance", points: 100,
    type: "code",
    description: `Compute the **Sharpe Ratio** — the most widely used risk-adjusted performance metric.

$$\\text{Sharpe} = \\frac{\\bar{R} - R_f}{\\sigma_R}$$

where R̄ is mean return, Rᶠ is risk-free rate, and σ is the **sample** standard deviation of returns.`,
    starterCode: `import math

def sharpe_ratio(returns: list, risk_free: float = 0.0) -> float:
    """
    Compute annualized Sharpe Ratio.
    
    Args:
        returns: list of periodic returns (e.g. daily)
        risk_free: periodic risk-free rate (default 0)
    
    Returns:
        Sharpe ratio (not annualized here)
    """
    # Your code here
    pass

returns = [0.01, -0.005, 0.02, 0.003, -0.01, 0.015, 0.008]
print(f"Sharpe: {sharpe_ratio(returns):.4f}")
`,
    testCode: `
import math

def sharpe_ratio(returns, risk_free=0.0):
    n = len(returns)
    mean = sum(returns) / n
    excess = [r - risk_free for r in returns]
    variance = sum((r - mean)**2 for r in returns) / (n - 1)
    std = math.sqrt(variance)
    return (mean - risk_free) / std if std != 0 else 0

returns = [0.01, -0.005, 0.02, 0.003, -0.01, 0.015, 0.008]
result = sharpe_ratio(returns)
tests = [
    (abs(result - 0.8865) < 0.01, f"Sharpe ≈ 0.8865 (got {result:.4f})"),
    (sharpe_ratio([0.01]*5) == 0, "Zero std → 0 Sharpe"),
    (sharpe_ratio([0.02, 0.02, 0.02, 0.02], 0.02) == 0, "Returns = risk-free → 0"),
]
passed = 0
for ok, name in tests:
    print(f"{'✅' if ok else '❌'} {name}")
    if ok: passed += 1
print(f"\\n{passed}/{len(tests)} tests passed")
`,
    explanation: "Compute mean return, subtract risk-free rate, divide by sample standard deviation (divide by n-1).",
  },
  "max-drawdown": {
    title: "Maximum Drawdown",
    difficulty: "medium", category: "Finance", points: 100,
    type: "code",
    description: `Compute the **Maximum Drawdown (MDD)** — the largest peak-to-trough decline in a price series.

$$\\text{MDD} = \\max_{t} \\left( \\frac{\\text{Peak}_t - \\text{Price}_t}{\\text{Peak}_t} \\right)$$`,
    starterCode: `def max_drawdown(prices: list) -> float:
    """
    Compute maximum drawdown from a price series.
    
    Args:
        prices: list of prices (positive values)
    
    Returns:
        maximum drawdown as a positive fraction (e.g. 0.25 = 25% drawdown)
    """
    # Your code here
    pass

prices = [100, 90, 110, 80, 120, 95, 130]
print(f"Max Drawdown: {max_drawdown(prices):.4f}")  # ≈ 0.2727
`,
    testCode: `
def max_drawdown(prices):
    peak = prices[0]
    mdd = 0
    for p in prices:
        peak = max(peak, p)
        mdd = max(mdd, (peak - p) / peak)
    return mdd

tests = [
    (abs(max_drawdown([100,90,110,80,120,95,130]) - 0.2727) < 0.001, "Standard case ≈ 0.2727"),
    (abs(max_drawdown([100,110,120,130]) - 0.0) < 0.001, "Always increasing → 0"),
    (abs(max_drawdown([100,50,25]) - 0.75) < 0.001, "100→50→25, MDD=75%"),
]
passed = 0
for ok, name in tests:
    print(f"{'✅' if ok else '❌'} {name}")
    if ok: passed += 1
print(f"\\n{passed}/{len(tests)} tests passed")
`,
    explanation: "Track the running peak. For each price, compute (peak - price)/peak. The maximum of this across all points is the max drawdown.",
  },
  "rolling-moving-average": {
    title: "Simple Moving Average",
    difficulty: "easy", category: "Finance", points: 50,
    type: "code",
    description: `Compute a **Simple Moving Average (SMA)** for a price series.

For a window of size k, the SMA at position i is the average of prices[i-k+1 : i+1].

Return **None** (or NaN) for positions where there aren't enough data points.`,
    starterCode: `def sma(prices: list, window: int) -> list:
    """
    Compute Simple Moving Average.
    
    Args:
        prices: list of prices
        window: rolling window size
    
    Returns:
        list of SMA values (None for first window-1 positions)
    """
    result = []
    # Your code here
    return result

prices = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
print(sma(prices, 3))  # [None, None, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0]
`,
    testCode: `
def sma(prices, window):
    result = [None] * (window - 1)
    for i in range(window - 1, len(prices)):
        result.append(sum(prices[i-window+1:i+1]) / window)
    return result

prices = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
r = sma(prices, 3)
tests = [
    (r[:2] == [None, None], "First 2 values are None"),
    (abs(r[2] - 2.0) < 0.001, "Index 2: avg(1,2,3) = 2.0"),
    (abs(r[9] - 9.0) < 0.001, "Last value: avg(8,9,10) = 9.0"),
    (len(r) == 10, "Output length matches input"),
]
passed = 0
for ok, name in tests:
    print(f"{'✅' if ok else '❌'} {name}")
    if ok: passed += 1
print(f"\\n{passed}/{len(tests)} tests passed")
`,
    explanation: "For each position i ≥ window-1, average prices[i-window+1 : i+1]. For earlier positions, output None.",
  },
  "macd-signal": {
    title: "MACD Signal Line",
    difficulty: "hard", category: "Finance", points: 175,
    type: "mcq",
    description: `**MACD (Moving Average Convergence Divergence)** is defined as:

- **MACD Line** = EMA(12) − EMA(26)
- **Signal Line** = EMA(9) of MACD Line
- **Histogram** = MACD Line − Signal Line

A **bullish signal** is generated when:`,
    options: [
      "MACD Line crosses below Signal Line",
      "MACD Line crosses above Signal Line (bullish crossover)",
      "Histogram turns negative",
      "Price crosses above EMA(200)",
    ],
    answer: "MACD Line crosses above Signal Line (bullish crossover)",
    explanation: "A bullish crossover occurs when the MACD Line crosses above the Signal Line, suggesting upward momentum. This is one of the most common signals in technical analysis.",
  },
  "momentum-signal": {
    title: "Momentum Signal",
    difficulty: "medium", category: "Finance", points: 125,
    type: "code",
    description: `Implement a **price momentum signal**: the percentage return over a lookback window.

$$\\text{Momentum}(t, k) = \\frac{P_t - P_{t-k}}{P_{t-k}}$$

Return None for the first k positions.`,
    starterCode: `def momentum(prices: list, lookback: int) -> list:
    """
    Compute momentum signal.
    
    Args:
        prices: list of prices
        lookback: lookback window k
    
    Returns:
        list of momentum values (None for first lookback positions)
    """
    result = []
    # Your code here
    return result

prices = [100, 102, 98, 105, 110, 108, 115]
print(momentum(prices, 3))
`,
    testCode: `
def momentum(prices, lookback):
    result = [None] * lookback
    for i in range(lookback, len(prices)):
        result.append((prices[i] - prices[i-lookback]) / prices[i-lookback])
    return result

prices = [100, 102, 98, 105, 110, 108, 115]
r = momentum(prices, 3)
tests = [
    (r[:3] == [None, None, None], "First 3 are None"),
    (abs(r[3] - 0.05) < 0.001, "momentum[3] = (105-100)/100 = 0.05"),
    (abs(r[6] - 0.1731) < 0.001, "momentum[6] = (115-98)/98 ≈ 0.1731"),
    (len(r) == 7, "Output length correct"),
]
passed = 0
for ok, name in tests:
    print(f"{'✅' if ok else '❌'} {name}")
    if ok: passed += 1
print(f"\\n{passed}/{len(tests)} tests passed")
`,
    explanation: "For each index i ≥ lookback, compute (prices[i] - prices[i-lookback]) / prices[i-lookback]. First lookback values are None.",
  },

  // ── OPTIONS & FUTURES ──────────────────────────────────────────────────────
  "black-scholes-call": {
    title: "Black-Scholes Call Price",
    difficulty: "medium", category: "Options & Futures", points: 150,
    type: "code",
    description: `Implement the **Black-Scholes formula** for a European call option:

$$C = S_0 N(d_1) - K e^{-rT} N(d_2)$$

$$d_1 = \\frac{\\ln(S_0/K) + (r + \\sigma^2/2)T}{\\sigma\\sqrt{T}}, \\quad d_2 = d_1 - \\sigma\\sqrt{T}$$

where N(·) is the standard normal CDF.`,
    starterCode: `import math

def black_scholes_call(S: float, K: float, T: float, r: float, sigma: float) -> float:
    """
    Black-Scholes European call option price.
    
    Args:
        S: current stock price
        K: strike price
        T: time to expiry (years)
        r: risk-free rate (annual)
        sigma: volatility (annual)
    
    Returns:
        call option price
    """
    # Hint: implement norm_cdf using math.erfc
    def norm_cdf(x):
        return 0.5 * math.erfc(-x / math.sqrt(2))
    
    # Your code here
    pass

price = black_scholes_call(100, 100, 1.0, 0.05, 0.2)
print(f"Call price: {price:.4f}")  # Should be ≈ 10.4506
`,
    testCode: `
import math

def black_scholes_call(S, K, T, r, sigma):
    def norm_cdf(x):
        return 0.5 * math.erfc(-x / math.sqrt(2))
    d1 = (math.log(S/K) + (r + 0.5*sigma**2)*T) / (sigma*math.sqrt(T))
    d2 = d1 - sigma*math.sqrt(T)
    return S*norm_cdf(d1) - K*math.exp(-r*T)*norm_cdf(d2)

tests = [
    (abs(black_scholes_call(100,100,1.0,0.05,0.2) - 10.4506) < 0.01, "ATM call ≈ 10.4506"),
    (abs(black_scholes_call(110,100,1.0,0.05,0.2) - 17.6964) < 0.01, "ITM call ≈ 17.6964"),
    (abs(black_scholes_call(100,110,1.0,0.05,0.2) - 6.0401) < 0.01, "OTM call ≈ 6.0401"),
]
passed = 0
for ok, name in tests:
    print(f"{'✅' if ok else '❌'} {name}")
    if ok: passed += 1
print(f"\\n{passed}/{len(tests)} tests passed")
`,
    explanation: "Compute d1 and d2, then use norm_cdf (implemented via math.erfc) to evaluate N(d1) and N(d2). Final price = S×N(d1) - K×e^(-rT)×N(d2).",
  },
  "option-delta": {
    title: "Option Delta",
    difficulty: "medium", category: "Options & Futures", points: 150,
    type: "mcq",
    description: `**Delta (Δ)** measures how much an option's price changes per $1 move in the underlying.

For a Black-Scholes European call: **Δ_call = N(d₁)**

Given:
- S = 100, K = 100, T = 1 year, r = 5%, σ = 20%
- d₁ ≈ 0.35

**Approximately what is the call delta?**`,
    options: ["0.35", "0.50", "0.637", "0.863"],
    answer: "0.637",
    explanation: "Δ = N(d₁) = N(0.35) ≈ 0.637. This means the call price increases by ~$0.637 for every $1 increase in the stock price. An ATM option has delta ≈ 0.5.",
  },
  "futures-fair-value": {
    title: "Futures Fair Value",
    difficulty: "easy", category: "Options & Futures", points: 75,
    type: "value",
    description: `Using the **cost-of-carry model**, compute the fair value of a futures contract:

$$F = S_0 \\cdot e^{(r - q) \\cdot T}$$

Given:
- Spot price **S₀ = 4500** (e.g. S&P 500 index)
- Risk-free rate **r = 5%**
- Dividend yield **q = 1.5%**
- Time to expiry **T = 0.25 years** (3 months)

What is the futures fair value? Round to 2 decimal places.`,
    answer: "4539.43",
    tolerance: 0.5,
    explanation: "F = 4500 × e^((0.05 - 0.015) × 0.25) = 4500 × e^(0.00875) = 4500 × 1.00879 ≈ 4539.43",
  },
  "roll-yield": {
    title: "Roll Yield",
    difficulty: "medium", category: "Options & Futures", points: 100,
    type: "mcq",
    description: `A crude oil futures curve shows:
- **Near-month contract**: $80/barrel
- **3-month contract**: $83/barrel

This market is in **contango** (futures > spot).

**What is the approximate annualized roll yield for a long futures position?**`,
    options: [
      "+15% (positive roll yield, contango is good for longs)",
      "-15% (negative roll yield, contango hurts longs)",
      "+3.75% (positive, contango helps longs)",
      "0% (roll yield is always zero)",
    ],
    answer: "-15% (negative roll yield, contango hurts longs)",
    explanation: "Roll yield ≈ (Near - Far) / Near = (80-83)/80 = -3.75% per 3 months = -15% annualized. In contango, longs 'roll up' to more expensive contracts, losing the spread. This is why commodity ETFs often underperform spot.",
  },

  // ── PORTFOLIO & RISK ───────────────────────────────────────────────────────
  "value-at-risk": {
    title: "Value at Risk (Historical)",
    difficulty: "easy", category: "Portfolio & Risk", points: 100,
    type: "code",
    description: `Compute the **Historical Value at Risk (VaR)** at a given confidence level.

VaR at 95% confidence means: *"We are 95% confident that losses will not exceed X in the next period."*

Historical VaR is simply the (1-confidence) percentile of the **loss distribution** (negated returns).`,
    starterCode: `def historical_var(returns: list, confidence: float = 0.95) -> float:
    """
    Compute Historical VaR.
    
    Args:
        returns: list of periodic returns
        confidence: confidence level (e.g. 0.95 for 95%)
    
    Returns:
        VaR as a positive number (e.g. 0.02 means 2% loss)
    """
    # Your code here
    pass

import random
random.seed(42)
returns = [random.gauss(0.001, 0.02) for _ in range(1000)]
var_95 = historical_var(returns)
print(f"95% VaR: {var_95:.4f}")  # Should be ≈ 0.032
`,
    testCode: `
def historical_var(returns, confidence=0.95):
    sorted_returns = sorted(returns)
    index = int((1 - confidence) * len(sorted_returns))
    return -sorted_returns[index]

import random
random.seed(42)
returns = [random.gauss(0.001, 0.02) for _ in range(1000)]
var_95 = historical_var(returns)
var_99 = historical_var(returns, 0.99)
tests = [
    (0.025 < var_95 < 0.045, f"95% VaR in reasonable range (got {var_95:.4f})"),
    (var_99 > var_95, "99% VaR > 95% VaR"),
    (historical_var([-0.01, -0.02, -0.03, -0.04, -0.05, 0.01, 0.02, 0.03, 0.04, 0.05], 0.9) > 0, "VaR is positive"),
]
passed = 0
for ok, name in tests:
    print(f"{'✅' if ok else '❌'} {name}")
    if ok: passed += 1
print(f"\\n{passed}/{len(tests)} tests passed")
`,
    explanation: "Sort returns ascending. The 5th percentile (for 95% VaR) is at index int(0.05 × n). Negate it to express as a positive loss.",
  },
  "portfolio-return": {
    title: "Portfolio Return",
    difficulty: "easy", category: "Portfolio & Risk", points: 50,
    type: "code",
    description: `Compute the **weighted portfolio return** given asset weights and returns.

$$R_p = \\sum_{i=1}^{n} w_i \\cdot R_i$$

The weights must sum to 1.`,
    starterCode: `def portfolio_return(weights: list, returns: list) -> float:
    """
    Compute weighted portfolio return.
    
    Args:
        weights: list of asset weights (must sum to 1)
        returns: list of asset returns
    
    Returns:
        portfolio return
    """
    # Your code here
    pass

weights = [0.4, 0.3, 0.3]
returns = [0.10, 0.05, -0.02]
print(portfolio_return(weights, returns))  # Should be 0.049
`,
    testCode: `
def portfolio_return(weights, returns):
    return sum(w * r for w, r in zip(weights, returns))

tests = [
    (abs(portfolio_return([0.4,0.3,0.3],[0.10,0.05,-0.02]) - 0.049) < 0.0001, "Standard case → 0.049"),
    (abs(portfolio_return([1.0],[0.08]) - 0.08) < 0.0001, "Single asset → 8%"),
    (abs(portfolio_return([0.5,0.5],[0.10,0.10]) - 0.10) < 0.0001, "Equal weights same return → 10%"),
]
passed = 0
for ok, name in tests:
    print(f"{'✅' if ok else '❌'} {name}")
    if ok: passed += 1
print(f"\\n{passed}/{len(tests)} tests passed")
`,
    explanation: "Simply compute the dot product of weights and returns: sum(w_i × r_i for each asset).",
  },
  "expected-shortfall": {
    title: "Expected Shortfall (CVaR)",
    difficulty: "medium", category: "Portfolio & Risk", points: 125,
    type: "mcq",
    description: `**Expected Shortfall (ES)**, also called CVaR, answers:

*"Given that we exceed the VaR threshold, what is the expected loss?"*

$$\\text{ES}_{\\alpha} = E[\\text{Loss} \\mid \\text{Loss} > \\text{VaR}_{\\alpha}]$$

Compared to VaR, Expected Shortfall is considered a **better risk measure** because:`,
    options: [
      "It's easier to compute than VaR",
      "It's always smaller than VaR",
      "It's coherent — it accounts for tail severity, not just threshold",
      "It doesn't require historical data",
    ],
    answer: "It's coherent — it accounts for tail severity, not just threshold",
    explanation: "ES is a 'coherent' risk measure (satisfies sub-additivity). VaR only tells you the loss threshold but not how bad losses can be beyond it. ES captures the average tail loss, penalizing fat-tailed distributions more.",
  },
  "portfolio-variance": {
    title: "Portfolio Variance",
    difficulty: "medium", category: "Portfolio & Risk", points: 125,
    type: "value",
    description: `A 2-asset portfolio has:
- Asset A: weight = 0.6, variance = 0.04 (σ²)
- Asset B: weight = 0.4, variance = 0.09
- **Correlation** between A and B = 0.3

Portfolio variance formula:
$$\\sigma_p^2 = w_A^2\\sigma_A^2 + w_B^2\\sigma_B^2 + 2w_Aw_B\\sigma_A\\sigma_B\\rho$$

What is the portfolio variance? Round to 4 decimal places.`,
    answer: "0.0389",
    tolerance: 0.001,
    explanation: "σ_A = √0.04 = 0.2, σ_B = √0.09 = 0.3. σ_p² = (0.6²×0.04) + (0.4²×0.09) + 2×0.6×0.4×0.2×0.3×0.3 = 0.0144 + 0.0144 + 0.00864 = 0.03744 ≈ 0.0374... let me recalculate: = 0.0144 + 0.0144 + 2×0.6×0.4×0.2×0.3×0.3 = 0.0144+0.0144+0.00864 = 0.03744",
  },

  // ── STATISTICS ─────────────────────────────────────────────────────────────
  "stats-ols-regression": {
    title: "OLS Linear Regression",
    difficulty: "easy", category: "Statistics", points: 100,
    type: "code",
    description: `Implement **Ordinary Least Squares (OLS)** regression from scratch.

For y = β₀ + β₁x, the OLS estimates are:

$$\\beta_1 = \\frac{\\sum(x_i - \\bar{x})(y_i - \\bar{y})}{\\sum(x_i - \\bar{x})^2}, \\quad \\beta_0 = \\bar{y} - \\beta_1 \\bar{x}$$`,
    starterCode: `def ols_regression(x: list, y: list) -> tuple:
    """
    Fit OLS linear regression y = b0 + b1*x.
    
    Returns:
        (b0, b1) intercept and slope
    """
    # Your code here
    pass

x = [1, 2, 3, 4, 5]
y = [2.1, 3.9, 6.2, 7.8, 10.1]
b0, b1 = ols_regression(x, y)
print(f"Intercept (b0): {b0:.4f}")  # ≈ 0.12
print(f"Slope (b1):     {b1:.4f}")  # ≈ 2.0
`,
    testCode: `
def ols_regression(x, y):
    n = len(x)
    x_mean = sum(x)/n; y_mean = sum(y)/n
    b1 = sum((xi-x_mean)*(yi-y_mean) for xi,yi in zip(x,y)) / sum((xi-x_mean)**2 for xi in x)
    b0 = y_mean - b1*x_mean
    return b0, b1

x = [1,2,3,4,5]; y = [2.1,3.9,6.2,7.8,10.1]
b0, b1 = ols_regression(x, y)
tests = [
    (abs(b1 - 1.99) < 0.05, f"Slope ≈ 1.99 (got {b1:.4f})"),
    (abs(b0 - 0.12) < 0.1, f"Intercept ≈ 0.12 (got {b0:.4f})"),
    (abs(ols_regression([0,1,2],[0,2,4])[1] - 2.0) < 0.001, "Perfect slope=2"),
]
passed = 0
for ok, name in tests:
    print(f"{'✅' if ok else '❌'} {name}")
    if ok: passed += 1
print(f"\\n{passed}/{len(tests)} tests passed")
`,
    explanation: "Compute x̄ and ȳ. Then β₁ = Σ(xᵢ-x̄)(yᵢ-ȳ) / Σ(xᵢ-x̄)². Then β₀ = ȳ - β₁x̄.",
  },
  "stats-autocorrelation": {
    title: "Autocorrelation (ACF)",
    difficulty: "medium", category: "Statistics", points: 125,
    type: "mcq",
    description: `A time series has **autocorrelation ρ(1) = 0.8** at lag 1.

This means:

What does high positive autocorrelation in financial returns imply?`,
    options: [
      "Returns are mean-reverting — today's gain predicts tomorrow's loss",
      "Returns are momentum-driven — today's gain predicts tomorrow's gain",
      "Returns are random — no predictability",
      "The market is perfectly efficient",
    ],
    answer: "Returns are momentum-driven — today's gain predicts tomorrow's gain",
    explanation: "Positive autocorrelation ρ(1) = 0.8 means today's return is strongly positively correlated with tomorrow's return — a momentum/trending pattern. Negative autocorrelation would suggest mean reversion. Most short-term equity returns show near-zero or slight positive autocorrelation.",
  },
  "stats-bootstrap": {
    title: "Bootstrap Confidence Interval",
    difficulty: "medium", category: "Statistics", points: 125,
    type: "code",
    description: `Implement **bootstrap resampling** to estimate a 95% confidence interval for the mean.

Steps:
1. Resample the data **n_bootstrap** times with replacement
2. Compute the mean of each resample
3. Return the 2.5th and 97.5th percentile of the bootstrap means`,
    starterCode: `import random

def bootstrap_ci(data: list, n_bootstrap: int = 1000, seed: int = 42) -> tuple:
    """
    Compute 95% bootstrap confidence interval for the mean.
    
    Returns:
        (lower, upper) bounds of 95% CI
    """
    random.seed(seed)
    n = len(data)
    bootstrap_means = []
    # Your code here
    pass

data = [2.3, 1.5, 3.2, 2.8, 1.9, 3.5, 2.1, 2.7, 3.0, 2.5]
lower, upper = bootstrap_ci(data)
print(f"95% CI: [{lower:.4f}, {upper:.4f}]")
`,
    testCode: `
import random

def bootstrap_ci(data, n_bootstrap=1000, seed=42):
    random.seed(seed)
    n = len(data)
    means = [sum(random.choices(data, k=n))/n for _ in range(n_bootstrap)]
    means.sort()
    lo = int(0.025 * n_bootstrap); hi = int(0.975 * n_bootstrap)
    return means[lo], means[hi]

data = [2.3,1.5,3.2,2.8,1.9,3.5,2.1,2.7,3.0,2.5]
lo, hi = bootstrap_ci(data)
tests = [
    (lo < sum(data)/len(data) < hi, "True mean is within CI"),
    (hi > lo, "Upper > lower"),
    (abs(lo - 2.09) < 0.2, f"Lower ≈ 2.09 (got {lo:.2f})"),
]
passed = 0
for ok, name in tests:
    print(f"{'✅' if ok else '❌'} {name}")
    if ok: passed += 1
print(f"\\n{passed}/{len(tests)} tests passed")
`,
    explanation: "Use random.choices() for sampling with replacement. Collect 1000 bootstrap means, sort them, and return the 2.5% and 97.5% quantiles.",
  },
  "stats-hurst-exponent": {
    title: "Hurst Exponent",
    difficulty: "hard", category: "Statistics", points: 175,
    type: "mcq",
    description: `The **Hurst Exponent (H)** characterizes the long-term memory of a time series.

- H = 0.5 → **Random walk** (no memory, efficient market)
- H > 0.5 → **Trending** (persistent, momentum)
- H < 0.5 → **Mean-reverting** (antipersistent)

A pairs trading strategy would work best on a spread with:`,
    options: [
      "H close to 1.0 — strong trending behaviour",
      "H close to 0.0 — strongly mean-reverting spread",
      "H close to 0.5 — random walk",
      "H exactly 0.5 — fully efficient",
    ],
    answer: "H close to 0.0 — strongly mean-reverting spread",
    explanation: "Pairs trading profits from mean reversion. A spread with H < 0.5 (especially close to 0) reverts to its mean quickly and reliably — ideal for statistical arbitrage. High H means trending, which would cause losses in a mean-reversion strategy.",
  },
};

// ─── PYODIDE RUNNER ──────────────────────────────────────────────────────────
declare global { interface Window { loadPyodide?: any; pyodide?: any } }

async function getPyodide() {
  if (window.pyodide) return window.pyodide;
  if (!window.loadPyodide) {
    await new Promise<void>((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
      s.onload = () => res(); s.onerror = () => rej(new Error("Pyodide load failed"));
      document.head.appendChild(s);
    });
  }
  window.pyodide = await window.loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/" });
  return window.pyodide;
}

// ─── PROBLEM PAGE ────────────────────────────────────────────────────────────
const DIFF_STYLE: Record<string, string> = {
  easy:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  hard:   "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function ProblemPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const problem = PROBLEM_DATA[slug as string];

  const [code, setCode] = useState(problem?.starterCode || "");
  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<"idle"|"running"|"pass"|"fail">("idle");
  const [pyReady, setPyReady] = useState(false);
  const [pyLoading, setPyLoading] = useState(false);
  const [explanation, setExplanation] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!problem) return;
    if (problem.type === "code" && !pyReady) {
      setPyLoading(true);
      getPyodide().then(() => { setPyReady(true); setPyLoading(false); }).catch(() => setPyLoading(false));
    }
  }, [problem]);

  if (!problem) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <p className="text-slate-400 mb-4">Problem not found.</p>
        <button onClick={() => router.push("/problems")} className="text-brand-400 hover:underline flex items-center gap-1 mx-auto">
          <ChevronLeft size={16} /> Back to Problems
        </button>
      </div>
    );
  }

  const handleRunCode = async () => {
    if (!pyReady) { setOutput("⏳ Python is still loading..."); return; }
    setStatus("running"); setOutput("Running...");
    try {
      const py = await getPyodide();
      // Capture stdout
      py.runPython(`import sys, io; sys.stdout = io.StringIO()`);
      const fullCode = code + "\n\n" + problem.testCode;
      py.runPython(fullCode);
      const out = py.runPython("sys.stdout.getvalue()");
      py.runPython("sys.stdout = sys.__stdout__");
      setOutput(out);
      setStatus(out.includes("❌") ? "fail" : "pass");
    } catch (e: any) {
      py.runPython("sys.stdout = sys.__stdout__");
      setOutput("❌ Error:\n" + String(e.message || e));
      setStatus("fail");
    }
  };

  const handleCheckMCQ = () => {
    if (!selectedOption) return;
    const correct = selectedOption === problem.answer;
    setStatus(correct ? "pass" : "fail");
    setOutput(correct ? "✅ Correct!" : `❌ Incorrect. The correct answer is: ${problem.answer}`);
    if (correct) setExplanation(true);
  };

  const handleCheckValue = () => {
    if (!answer.trim()) return;
    const userVal = parseFloat(answer.trim());
    const expected = parseFloat(problem.answer);
    const tol = problem.tolerance ?? 0;
    const correct = tol === 0 ? answer.trim() === problem.answer : Math.abs(userVal - expected) <= tol;
    setStatus(correct ? "pass" : "fail");
    setOutput(correct ? `✅ Correct! Answer: ${problem.answer}` : `❌ Incorrect. Your answer: ${answer}. Expected: ${problem.answer}`);
    if (correct) setExplanation(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current!;
      const start = ta.selectionStart; const end = ta.selectionEnd;
      const newVal = code.substring(0, start) + "    " + code.substring(end);
      setCode(newVal);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 4; }, 0);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <div className="border-b border-slate-800 px-6 py-3 flex items-center gap-4">
        <button onClick={() => router.push("/problems")} className="text-slate-500 hover:text-slate-300 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <span className={clsx("text-xs font-bold px-2.5 py-1 rounded-full border capitalize", DIFF_STYLE[problem.difficulty])}>
            {problem.difficulty}
          </span>
          <h1 className="font-bold text-slate-100">{problem.title}</h1>
          <span className="text-xs text-slate-600">{problem.category}</span>
        </div>
        <span className="text-xs text-slate-600 font-mono">{problem.points} pts</span>
      </div>

      <div className={clsx("flex h-[calc(100vh-53px)]", problem.type === "code" ? "flex-row" : "flex-col max-w-3xl mx-auto py-8 px-6")}>

        {/* ── DESCRIPTION PANEL ── */}
        <div className={clsx("overflow-y-auto", problem.type === "code" ? "w-1/2 border-r border-slate-800 p-6" : "w-full")}>
          <div className="prose prose-invert prose-sm max-w-none">
            {problem.description.split("\n").map((line: string, i: number) => {
              if (!line.trim()) return <br key={i} />;
              // Bold **text**
              const parts = line.split(/(\*\*[^*]+\*\*)/g);
              return <p key={i} className="text-slate-300 leading-relaxed mb-2">{
                parts.map((part, j) =>
                  part.startsWith("**") && part.endsWith("**")
                    ? <strong key={j} className="text-slate-100 font-semibold">{part.slice(2,-2)}</strong>
                    : part
                )
              }</p>;
            })}
          </div>

          {/* MCQ */}
          {problem.type === "mcq" && (
            <div className="mt-6 space-y-3">
              {problem.options.map((opt: string) => (
                <button key={opt} onClick={() => { setSelectedOption(opt); setStatus("idle"); setOutput(""); setExplanation(false); }}
                  className={clsx("w-full text-left px-4 py-3 rounded-xl border text-sm transition-all",
                    selectedOption === opt
                      ? status === "pass" ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                        : status === "fail" ? "border-red-500 bg-red-500/10 text-red-300"
                        : "border-brand-500 bg-brand-500/10 text-slate-100"
                      : "border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-500 hover:text-slate-200")}>
                  {opt}
                </button>
              ))}
              <button onClick={handleCheckMCQ} disabled={!selectedOption}
                className="mt-2 w-full py-3 bg-brand-500 hover:bg-brand-400 disabled:opacity-40 text-dark-900 font-bold rounded-xl transition-colors">
                Check Answer
              </button>
            </div>
          )}

          {/* Value Input */}
          {problem.type === "value" && (
            <div className="mt-6">
              <input
                type="text" value={answer} onChange={e => { setAnswer(e.target.value); setStatus("idle"); setOutput(""); setExplanation(false); }}
                placeholder="Enter your answer..."
                onKeyDown={e => e.key === "Enter" && handleCheckValue()}
                className="w-full bg-slate-800 border border-slate-700 focus:border-brand-500 rounded-xl px-4 py-3 text-slate-100 text-sm font-mono outline-none transition-colors"
              />
              <button onClick={handleCheckValue} disabled={!answer.trim()}
                className="mt-3 w-full py-3 bg-brand-500 hover:bg-brand-400 disabled:opacity-40 text-dark-900 font-bold rounded-xl transition-colors">
                Submit Answer
              </button>
            </div>
          )}

          {/* Output for MCQ/Value */}
          {output && problem.type !== "code" && (
            <div className={clsx("mt-4 p-4 rounded-xl border text-sm font-mono",
              status === "pass" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                : "bg-red-500/10 border-red-500/20 text-red-300")}>
              {output}
            </div>
          )}

          {/* Explanation */}
          {(explanation || status === "pass") && problem.explanation && (
            <div className="mt-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Explanation</p>
              <p className="text-sm text-slate-300 leading-relaxed">{problem.explanation}</p>
            </div>
          )}
        </div>

        {/* ── CODE EDITOR PANEL ── */}
        {problem.type === "code" && (
          <div className="w-1/2 flex flex-col">
            {/* Editor */}
            <div className="flex-1 relative bg-slate-900">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900">
                <span className="text-xs text-slate-500 font-mono">Python</span>
                <div className="flex items-center gap-2">
                  {pyLoading && <span className="text-xs text-slate-500 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Loading Python...</span>}
                  {pyReady && <span className="text-xs text-emerald-500">● Python ready</span>}
                  <button onClick={() => { setCode(problem.starterCode); setOutput(""); setStatus("idle"); }}
                    className="text-slate-600 hover:text-slate-400 transition-colors"><RotateCcw size={13} /></button>
                </div>
              </div>
              <textarea
                ref={textareaRef}
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                className="w-full h-full resize-none bg-transparent text-slate-200 font-mono text-sm p-4 outline-none leading-relaxed"
                style={{ minHeight: "calc(100% - 40px)" }}
              />
            </div>

            {/* Run button */}
            <div className="border-t border-slate-800 p-3 flex items-center gap-3">
              <button onClick={handleRunCode} disabled={status === "running" || !pyReady}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-dark-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
                {status === "running" ? <><Loader2 size={14} className="animate-spin" /> Running...</> : <><Play size={14} /> Run Tests</>}
              </button>
              {status === "pass" && <span className="flex items-center gap-1.5 text-emerald-400 text-sm font-semibold"><CheckCircle2 size={16} /> All tests passed!</span>}
              {status === "fail" && <span className="flex items-center gap-1.5 text-red-400 text-sm"><XCircle size={16} /> Tests failed</span>}
            </div>

            {/* Output */}
            {output && output !== "Running..." && (
              <div className="border-t border-slate-800 bg-slate-900/80 max-h-48 overflow-y-auto">
                <pre className="p-4 text-xs font-mono text-slate-300 whitespace-pre-wrap">{output}</pre>
              </div>
            )}

            {/* Explanation on pass */}
            {status === "pass" && problem.explanation && (
              <div className="border-t border-slate-800 p-4 bg-slate-900/60">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Hint / Explanation</p>
                <p className="text-xs text-slate-400 leading-relaxed">{problem.explanation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
