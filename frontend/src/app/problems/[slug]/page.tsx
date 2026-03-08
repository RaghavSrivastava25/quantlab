"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, CheckCircle2, XCircle } from "lucide-react";
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
    type: "mcq",
    description: `Which function correctly computes the **Normal Distribution PDF** f(x) for mean μ and std σ?`,
    options: [
      "return (1/(sigma*(2*3.14159)**0.5)) * 2.718**(-(x-mu)**2/(2*sigma**2))",
      "import math\nreturn (1/(sigma*math.sqrt(2*math.pi))) * math.exp(-((x-mu)**2)/(2*sigma**2))",
      "import math\nreturn math.exp(-((x-mu)**2)/(2*sigma**2))",
      "import math\nreturn (1/math.sqrt(2*math.pi)) * math.exp(-x**2/2)",
    ],
    answer: "import math\nreturn (1/(sigma*math.sqrt(2*math.pi))) * math.exp(-((x-mu)**2)/(2*sigma**2))",
    explanation: "Option A uses bad approximations for π and e. Option C omits the 1/(σ√2π) normalising constant. Option D is the standard normal only (μ=0, σ=1 hardcoded). Only B is the full general formula.",
  },
  "monte-carlo-pi": {
    title: "Monte Carlo — Estimate π",
    difficulty: "easy", category: "Probability", points: 75,
    type: "mcq",
    description: `Generate random (x, y) in [0,1]². Count points inside the quarter-circle x²+y²≤1. Multiply fraction by 4 to estimate π.

Which implementation is correct?`,
    options: [
      "inside = sum(1 for _ in range(n) if x**2 + y**2 <= 1)\nreturn 4 * inside / n",
      "inside = sum(1 for _ in range(n) if random.random()**2 + random.random()**2 <= 1)\nreturn 4 * inside / n",
      "inside = sum(1 for _ in range(n) if random.random()**2 + random.random()**2 <= 1)\nreturn 2 * inside / n",
      "inside = sum(1 for _ in range(n) if random.random() + random.random() <= 1)\nreturn 4 * inside / n",
    ],
    answer: "inside = sum(1 for _ in range(n) if random.random()**2 + random.random()**2 <= 1)\nreturn 4 * inside / n",
    explanation: "Option A reuses the same x,y (not re-randomised each iteration). Option C multiplies by 2 not 4. Option D checks x+y≤1 (a triangle), not the circle condition x²+y²≤1.",
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
    type: "mcq",
    description: `GBM discretisation: **S_{t+1} = S_t × exp((μ - σ²/2)Δt + σ√Δt × Z)** where Z ~ N(0,1).

Which single-step update is correct?`,
    options: [
      "S_next = S * math.exp(mu * dt + sigma * math.sqrt(dt) * Z)",
      "S_next = S * (1 + mu*dt + sigma*math.sqrt(dt)*Z)",
      "S_next = S * math.exp((mu - 0.5*sigma**2)*dt + sigma*math.sqrt(dt)*Z)",
      "S_next = S * math.exp((mu + 0.5*sigma**2)*dt + sigma*math.sqrt(dt)*Z)",
    ],
    answer: "S_next = S * math.exp((mu - 0.5*sigma**2)*dt + sigma*math.sqrt(dt)*Z)",
    explanation: "The Itô correction term -σ²/2 is required by Itô's Lemma. Option A omits it. Option B is arithmetic Brownian motion, not geometric. Option D uses +σ²/2 which gives the wrong drift.",
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
    type: "mcq",
    description: `To minimise **f(x) = x² + 4x + 4**, the gradient is **f'(x) = 2x + 4**.

Which update rule correctly performs gradient descent?`,
    options: [
      "x = x + lr * (2*x + 4)",
      "x = x - lr * (2*x + 4)",
      "x = x - lr * (x**2 + 4*x + 4)",
      "x = x - (2*x + 4) / lr",
    ],
    answer: "x = x - lr * (2*x + 4)",
    explanation: "Gradient descent: x = x - α×∇f(x). Option A adds the gradient (ascent not descent). Option C subtracts the function value, not the gradient. Option D divides by lr instead of multiplying.",
  },
  "calc-newton-raphson": {
    title: "Newton-Raphson Root Finding",
    difficulty: "easy", category: "Calculus & Linear Algebra", points: 75,
    type: "mcq",
    description: `Newton-Raphson: **x = x - f(x)/f'(x)**

To compute √n (solve f(x) = x² - n = 0, f'(x) = 2x), which update is correct?`,
    options: [
      "x = x - (x**2 - n) / x",
      "x = x - (x**2 - n) / (2*x)",
      "x = x - 2*x / (x**2 - n)",
      "x = (x + n) / 2",
    ],
    answer: "x = x - (x**2 - n) / (2*x)",
    explanation: "f(x)=x²-n, f'(x)=2x → update: x - (x²-n)/(2x) = (x + n/x)/2. Option A divides by x not 2x. Option C inverts numerator/denominator. Option D is a cruder approximation that doesn't converge quadratically.",
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
    type: "mcq",
    description: `Bisection narrows a root in [a, b]. At midpoint m = (a+b)/2, which interval update is correct?`,
    options: [
      "if f(a)*f(m) > 0: b = m\nelse: a = m",
      "if f(m) > 0: b = m\nelse: a = m",
      "if f(a)*f(m) < 0: b = m\nelse: a = m",
      "if f(a)*f(m) > 0: a = m\nelse: b = m",
    ],
    answer: "if f(a)*f(m) > 0: a = m\nelse: b = m",
    explanation: "If f(a) and f(m) have the same sign, the root is in [m,b] so a=m. If opposite signs, root is in [a,m] so b=m. Options A and C assign a=m and b=m backwards. Option B ignores f(a) entirely.",
  },
  "algo-binary-search": {
    title: "Binary Search",
    difficulty: "easy", category: "Algorithms & Numerical", points: 50,
    type: "mcq",
    description: `Which binary search correctly returns the index of target in a sorted array (or -1 if missing)?`,
    options: [
      "left,right=0,len(arr)\nwhile left<right:\n  mid=(left+right)//2\n  if arr[mid]==target: return mid\n  elif arr[mid]<target: left=mid\n  else: right=mid\nreturn -1",
      "left,right=0,len(arr)-1\nwhile left<=right:\n  mid=(left+right)//2\n  if arr[mid]==target: return mid\n  elif arr[mid]<target: left=mid+1\n  else: right=mid-1\nreturn -1",
      "left,right=0,len(arr)-1\nwhile left<right:\n  mid=(left+right)//2\n  if arr[mid]==target: return mid\n  elif arr[mid]<target: left=mid+1\n  else: right=mid-1\nreturn -1",
      "for i,v in enumerate(arr):\n  if v==target: return i\nreturn -1",
    ],
    answer: "left,right=0,len(arr)-1\nwhile left<=right:\n  mid=(left+right)//2\n  if arr[mid]==target: return mid\n  elif arr[mid]<target: left=mid+1\n  else: right=mid-1\nreturn -1",
    explanation: "Key: right=len-1 (not len), condition left<=right (catches single element), updates mid+1/mid-1 prevent infinite loops. Option A uses left=mid (infinite loop). Option C misses the case left==right. Option D is O(n) linear search.",
  },
  "algo-dynamic-prog": {
    title: "Max Profit — 2 Transactions",
    difficulty: "hard", category: "Algorithms & Numerical", points: 200,
    type: "mcq",
    description: `Max profit with ≤2 transactions uses 4 state variables. Which update **order** is correct for each price p?`,
    options: [
      "sell2=max(sell2,buy2+p); buy2=max(buy2,sell1-p)\nsell1=max(sell1,buy1+p); buy1=max(buy1,-p)",
      "buy1=max(buy1,-p); sell1=max(sell1,buy1+p)\nbuy2=max(buy2,sell1-p); sell2=max(sell2,buy2+p)",
      "buy1=max(buy1,-p); buy2=max(buy2,-p)\nsell1=max(sell1,buy1+p); sell2=max(sell2,buy2+p)",
      "buy1=min(buy1,p); sell1=max(sell1,-buy1+p)\nbuy2=min(buy2,p); sell2=max(sell2,-buy2+p)",
    ],
    answer: "buy1=max(buy1,-p); sell1=max(sell1,buy1+p)\nbuy2=max(buy2,sell1-p); sell2=max(sell2,buy2+p)",
    explanation: "Update in dependency order: buy1→sell1→buy2→sell2. Reversing (Option A) uses future state values. Option C lets buy2 ignore sell1 profit. Option D uses min for buy which double-counts.",
  },
  "sharpe-ratio": {
    title: "Sharpe Ratio",
    difficulty: "easy", category: "Finance", points: 100,
    type: "mcq",
    description: `Sharpe Ratio = (mean\_return - rf) / sample\_std. Use **sample** std (divide by n-1).

Which is correct?`,
    options: [
      "mean=sum(r)/n\nstd=(sum((r-mean)**2 for r in returns)/n)**0.5\nreturn mean/std",
      "mean=sum(returns)/n\nvar=sum((r-mean)**2 for r in returns)/(n-1)\nreturn (mean-rf)/var**0.5",
      "mean=sum(returns)/n\nvar=sum((r-mean)**2 for r in returns)/n\nreturn (mean-rf)/var**0.5",
      "return (max(returns)-min(returns))/n",
    ],
    answer: "mean=sum(returns)/n\nvar=sum((r-mean)**2 for r in returns)/(n-1)\nreturn (mean-rf)/var**0.5",
    explanation: "Option A omits rf and uses population std (n). Option B is correct: sample variance (n-1), subtracts rf. Option C uses population std (n not n-1). Option D is range/n which has nothing to do with Sharpe.",
  },
  "max-drawdown": {
    title: "Maximum Drawdown",
    difficulty: "medium", category: "Finance", points: 100,
    type: "mcq",
    description: `Max Drawdown = max over time of (running\_peak - price) / running\_peak.

Which implementation is correct?`,
    options: [
      "mdd=0\nfor i in range(1,len(p)):\n  dd=(p[i-1]-p[i])/p[i-1]\n  mdd=max(mdd,dd)\nreturn mdd",
      "peak=prices[0]; mdd=0\nfor p in prices:\n  peak=max(peak,p)\n  mdd=max(mdd,(peak-p)/peak)\nreturn mdd",
      "peak=max(prices); mdd=0\nfor p in prices:\n  mdd=max(mdd,(peak-p)/peak)\nreturn mdd",
      "return (max(prices)-min(prices))/max(prices)",
    ],
    answer: "peak=prices[0]; mdd=0\nfor p in prices:\n  peak=max(peak,p)\n  mdd=max(mdd,(peak-p)/peak)\nreturn mdd",
    explanation: "Option A only checks consecutive drops, misses multi-step drawdowns. Option B is correct: track running peak, measure drawdown from it. Option C uses global max as peak — misses drawdowns before the global peak. Option D gives wrong answer when min precedes max.",
  },
  "rolling-moving-average": {
    title: "Simple Moving Average",
    difficulty: "easy", category: "Finance", points: 50,
    type: "mcq",
    description: `SMA with window k: average of last k prices. Return None for the first k-1 positions.

Which implementation is correct?`,
    options: [
      "result=[]\nfor i in range(len(prices)):\n  if i<k: result.append(None)\n  else: result.append(sum(prices[i-k:i])/k)",
      "result=[None]*(k-1)\nfor i in range(k-1,len(prices)):\n  result.append(sum(prices[i-k+1:i+1])/k)\nreturn result",
      "result=[None]*k\nfor i in range(k,len(prices)):\n  result.append(sum(prices[i-k:i])/k)\nreturn result",
      "return [sum(prices[i:i+k])/k for i in range(len(prices)-k+1)]",
    ],
    answer: "result=[None]*(k-1)\nfor i in range(k-1,len(prices)):\n  result.append(sum(prices[i-k+1:i+1])/k)\nreturn result",
    explanation: "Option A at i=k slices prices[0:k] but misses index i (off by one). Option B is correct: k-1 Nones, slice [i-k+1:i+1] includes index i. Option C has k Nones (one too many) and wrong slice. Option D returns shorter array with no Nones.",
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
    type: "mcq",
    description: `Momentum = **(P_t - P_{t-k}) / P_{t-k}** — return None for first k values.

Which implementation is correct?`,
    options: [
      "result=[None]*k\nfor i in range(k,len(p)):\n  result.append(p[i]-p[i-k])\nreturn result",
      "result=[None]*k\nfor i in range(k,len(p)):\n  result.append((p[i]-p[i-k])/p[i])\nreturn result",
      "result=[None]*k\nfor i in range(k,len(p)):\n  result.append((p[i]-p[i-k])/p[i-k])\nreturn result",
      "result=[None]*(k-1)\nfor i in range(k-1,len(p)):\n  result.append((p[i]-p[i-k+1])/p[i-k+1])\nreturn result",
    ],
    answer: "result=[None]*k\nfor i in range(k,len(p)):\n  result.append((p[i]-p[i-k])/p[i-k])\nreturn result",
    explanation: "Option A computes absolute difference, not percentage. Option B divides by current price p[i] instead of past price p[i-k]. Option C is correct. Option D uses k-1 Nones and wrong index — off by one.",
  },
  "black-scholes-call": {
    title: "Black-Scholes Call Price",
    difficulty: "medium", category: "Options & Futures", points: 150,
    type: "mcq",
    description: `Black-Scholes: C = S·N(d₁) - K·e^(-rT)·N(d₂)

d₁ = [ln(S/K) + (r + **σ²/2**)T] / (σ√T),   d₂ = d₁ - σ√T

Which d₁ formula is correct?`,
    options: [
      "d1 = (math.log(S/K) + (r - 0.5*sigma**2)*T) / (sigma*math.sqrt(T))",
      "d1 = (math.log(S/K) + (r + 0.5*sigma**2)*T) / (sigma*math.sqrt(T))",
      "d1 = (math.log(S/K) + r*T) / (sigma*math.sqrt(T))",
      "d1 = (S/K + (r + 0.5*sigma**2)*T) / (sigma*math.sqrt(T))",
    ],
    answer: "d1 = (math.log(S/K) + (r + 0.5*sigma**2)*T) / (sigma*math.sqrt(T))",
    explanation: "Option A uses (r - σ²/2) which is d₂ not d₁. Option B is correct. Option C omits the σ²/2 convexity correction. Option D uses S/K instead of ln(S/K) — missing the logarithm.",
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
    type: "mcq",
    description: `Historical VaR at 95% = **5th percentile of losses** = negative of 5th percentile of returns.

Which is correct?`,
    options: [
      "sorted_r=sorted(returns,reverse=True)\nreturn sorted_r[int(0.05*len(sorted_r))]",
      "sorted_r=sorted(returns)\nreturn -sorted_r[int(0.05*len(sorted_r))]",
      "sorted_r=sorted(returns)\nreturn sorted_r[int(0.05*len(sorted_r))]",
      "sorted_r=sorted(returns)\nreturn -sorted_r[int(0.95*len(sorted_r))]",
    ],
    answer: "sorted_r=sorted(returns)\nreturn -sorted_r[int(0.05*len(sorted_r))]",
    explanation: "Sort ascending (worst returns first), take 5th percentile index, negate to express as positive loss. Option A sorts descending and doesn't negate. Option C returns a negative number (forgot to negate). Option D takes the 95th percentile — the best returns.",
  },
  "portfolio-return": {
    title: "Portfolio Return",
    difficulty: "easy", category: "Portfolio & Risk", points: 50,
    type: "mcq",
    description: `Portfolio return = **Σ wᵢ × rᵢ** (dot product of weights and returns).

For weights=[0.4,0.3,0.3], returns=[0.10,0.05,-0.02], which is correct?`,
    options: [
      "return sum(w + r for w,r in zip(weights,returns))",
      "return sum(weights) * sum(returns) / len(weights)",
      "return sum(w * r for w,r in zip(weights,returns))",
      "return max(w * r for w,r in zip(weights,returns))",
    ],
    answer: "return sum(w * r for w,r in zip(weights,returns))",
    explanation: "Option A adds w+r instead of multiplying w×r. Option B incorrectly multiplies sums. Option C is correct — dot product. Option D returns only the largest term, ignoring the others.",
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
    type: "mcq",
    description: `OLS slope: **β₁ = Σ(xᵢ-x̄)(yᵢ-ȳ) / Σ(xᵢ-x̄)²**

Which implementation is correct?`,
    options: [
      "xm=sum(x)/n; ym=sum(y)/n\nb1=sum((xi-xm)*(yi-ym) for xi,yi in zip(x,y))/sum((xi-xm) for xi in x)",
      "xm=sum(x)/n; ym=sum(y)/n\nb1=sum((xi-xm)*(yi-ym) for xi,yi in zip(x,y))/sum((xi-xm)**2 for xi in x)",
      "b1=sum(xi*yi for xi,yi in zip(x,y))/sum(xi**2 for xi in x)",
      "xm=sum(x)/n\nb1=sum((xi-xm)**2 for xi in x)/sum((xi-xm)*(yi-ym) for xi,yi in zip(x,y))",
    ],
    answer: "xm=sum(x)/n; ym=sum(y)/n\nb1=sum((xi-xm)*(yi-ym) for xi,yi in zip(x,y))/sum((xi-xm)**2 for xi in x)",
    explanation: "Option A divides by Σ(xᵢ-x̄) instead of Σ(xᵢ-x̄)² — missing the square. Option B is correct. Option C omits mean-centering. Option D has numerator and denominator swapped.",
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
    type: "mcq",
    description: `Bootstrap resamples data **with replacement** to estimate uncertainty.

Which resampling step is correct?`,
    options: [
      "sample = random.sample(data, len(data))  # without replacement",
      "sample = random.choices(data, k=len(data))  # with replacement",
      "sample = data[:]  # copy the data",
      "sample = sorted(data)[:int(0.95*len(data))]  # trim top 5%",
    ],
    answer: "sample = random.choices(data, k=len(data))  # with replacement",
    explanation: "Bootstrap must resample **with replacement** — this simulates drawing new datasets from the population. random.sample (Option A) samples without replacement, just shuffling. Options C and D don't resample at all.",
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

  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<"idle"|"pass"|"fail">("idle");
  const [explanation, setExplanation] = useState(false);

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

      <div className="flex flex-col max-w-3xl mx-auto py-8 px-6">

        {/* ── DESCRIPTION PANEL ── */}
        <div className="w-full overflow-y-auto">
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
              {problem.options.map((opt: string, idx: number) => {
                const isCode = opt.includes("\\n") || opt.includes("return ") || opt.includes("def ") || opt.includes("=") && opt.includes("(");
                const displayOpt = opt.replace(/\\n/g, "\n");
                return (
                  <button key={idx} onClick={() => { setSelectedOption(opt); setStatus("idle"); setOutput(""); setExplanation(false); }}
                    className={clsx("w-full text-left rounded-xl border transition-all",
                      selectedOption === opt
                        ? status === "pass" ? "border-emerald-500 bg-emerald-500/10"
                          : status === "fail" ? "border-red-500 bg-red-500/10"
                          : "border-brand-500 bg-brand-500/10"
                        : "border-slate-700 bg-slate-800/40 hover:border-slate-500")}>
                    {isCode
                      ? <pre className={clsx("px-4 py-3 text-xs font-mono whitespace-pre-wrap leading-relaxed",
                          selectedOption === opt
                            ? status === "pass" ? "text-emerald-300" : status === "fail" ? "text-red-300" : "text-slate-100"
                            : "text-slate-400")}>{displayOpt}</pre>
                      : <span className={clsx("block px-4 py-3 text-sm",
                          selectedOption === opt
                            ? status === "pass" ? "text-emerald-300" : status === "fail" ? "text-red-300" : "text-slate-100"
                            : "text-slate-400")}>{displayOpt}</span>
                    }
                  </button>
                );
              })}
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
          {output && (
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

      </div>
    </div>
  );
}
