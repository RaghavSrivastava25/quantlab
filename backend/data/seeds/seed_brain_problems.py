"""
Brain teaser problems sourced from:
- PuzzledQuant (puzzledquant.com)
- Brainstellar (brainstellar.com)
- Quant Greenbook (quantitative finance interview problems)

Categorised by topic with correct answers stored.
"""
import asyncio, sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db.database import AsyncSessionLocal
from models.models import Problem

BRAIN_PROBLEMS = [
  # ─── PROBABILITY: Bayes Theorem ──────────────────────────────────────────
  {
    "slug": "brain-monty-hall",
    "title": "Monty Hall Problem",
    "description": """## Monty Hall Problem *(Brainstellar Classic)*

You're on a game show. There are **3 doors**:
- Behind one door: a car 🚗
- Behind the other two: goats 🐐

You pick door #1. The host (who **knows** what's behind each door) opens door #3, revealing a goat.

**Should you switch to door #2, or stick with door #1?**

Write a function that simulates N trials and returns the empirical win probability when always switching.

```python
simulate_monty_hall(n=100000, seed=42) → ~0.6667
```

**Why does switching win 2/3 of the time?**
When you first pick, P(car) = 1/3. The host always reveals a goat. If you had picked a goat (prob 2/3), the other remaining door MUST have the car. So switching wins 2/3 of the time.
""",
    "difficulty": "easy",
    "category": "brain",
    "starter_code": """import random

def simulate_monty_hall(n: int = 100000, seed: int = 42) -> float:
    \"\"\"
    Simulate Monty Hall with always-switch strategy.
    Return fraction of wins.
    \"\"\"
    pass
""",
    "solution_code": """import random

def simulate_monty_hall(n: int = 100000, seed: int = 42) -> float:
    random.seed(seed)
    wins = 0
    for _ in range(n):
        car = random.randint(0, 2)
        pick = random.randint(0, 2)
        # Host opens a goat door (not car, not pick)
        goat_doors = [d for d in range(3) if d != car and d != pick]
        opened = random.choice(goat_doors)
        # Switch to the remaining door
        switch = [d for d in range(3) if d != pick and d != opened][0]
        if switch == car:
            wins += 1
    return wins / n
""",
    "test_cases": {
      "cases": [{"input": {"n": 100000, "seed": 42}, "expected": 0.6667}],
      "function": "simulate_monty_hall"
    },
    "tags": ["bayes", "probability", "simulation", "classic"],
    "points": 75,
  },

  {
    "slug": "brain-birthday-problem",
    "title": "Birthday Problem",
    "description": """## Birthday Problem *(Classic Probability)*

What is the minimum number of people needed in a room such that the probability of **at least two people sharing a birthday** exceeds 50%?

Write a function that computes the **exact probability** that at least 2 people in a group of n share a birthday (ignoring leap years, 365 days).

$$P(\\text{at least one match}) = 1 - \\frac{365!/(365-n)!}{365^n}$$

```python
birthday_prob(23) → 0.5073   # ~50.7% with 23 people
birthday_prob(50) → 0.9704
```
""",
    "difficulty": "easy",
    "category": "brain",
    "starter_code": """def birthday_prob(n: int) -> float:
    \"\"\"
    Return probability that at least 2 of n people share a birthday.
    Round to 4 decimal places.
    \"\"\"
    pass
""",
    "solution_code": """def birthday_prob(n: int) -> float:
    p_none = 1.0
    for i in range(n):
        p_none *= (365 - i) / 365
    return round(1 - p_none, 4)
""",
    "test_cases": {
      "cases": [
        {"input": {"n": 23}, "expected": 0.5073},
        {"input": {"n": 1},  "expected": 0.0},
        {"input": {"n": 50}, "expected": 0.9704},
      ],
      "function": "birthday_prob"
    },
    "tags": ["probability", "combinatorics", "classic"],
    "points": 75,
  },

  {
    "slug": "brain-drunk-man-walk",
    "title": "Drunk Man's Walk — Return Probability",
    "description": """## Drunk Man's Random Walk *(Brainstellar)*

A drunk man stands at position 0 on an infinite number line. Each step he moves **+1** (right) with probability p, or **-1** (left) with probability (1-p).

Write a function that returns the probability he **ever returns to 0**, given starting at 0 after one step (i.e. starting at +1).

For a **fair walk** (p=0.5): the return probability is **1** (certain return).
For p > 0.5: return probability = **(1-p)/p**
For p < 0.5: return probability = **1**

```python
return_probability(0.5)  → 1.0
return_probability(0.6)  → 0.6667   # (1-0.6)/0.6
return_probability(0.4)  → 1.0
```
""",
    "difficulty": "easy",
    "category": "brain",
    "starter_code": """def return_probability(p: float) -> float:
    \"\"\"
    Probability of returning to origin in a biased random walk.
    p = probability of moving right.
    \"\"\"
    pass
""",
    "solution_code": """def return_probability(p: float) -> float:
    if p <= 0.5:
        return 1.0
    return round((1 - p) / p, 6)
""",
    "test_cases": {
      "cases": [
        {"input": {"p": 0.5}, "expected": 1.0},
        {"input": {"p": 0.6}, "expected": round(0.4/0.6, 6)},
        {"input": {"p": 0.4}, "expected": 1.0},
        {"input": {"p": 0.75}, "expected": round(0.25/0.75, 6)},
      ],
      "function": "return_probability"
    },
    "tags": ["random-walk", "probability", "stochastic"],
    "points": 100,
  },

  # ─── PROBABILITY: Expected Value ─────────────────────────────────────────
  {
    "slug": "brain-dice-sum-expected",
    "title": "Expected Sum of Dice Until 6",
    "description": """## Expected Sum Until You Roll a 6 *(PuzzledQuant)*

You roll a fair 6-sided die repeatedly. You **stop** when you roll a 6. 

What is the **expected total sum** of all your rolls (including the final 6)?

**Answer:** Let E = expected sum. 
- With prob 1/6 you roll 6 immediately: contributes 6/6
- With prob 5/6 you roll k ∈ {1,2,3,4,5} (mean 3), then continue:
  E = (1/6)(6) + (5/6)(3 + E) → E = 1 + 2.5 + 5E/6 → E/6 = 3.5 → **E = 21**

Write a simulation to verify this.
""",
    "difficulty": "easy",
    "category": "brain",
    "starter_code": """import random

def expected_sum_until_six(n_simulations: int = 100000, seed: int = 42) -> float:
    \"\"\"
    Simulate rolling a die until 6. Return expected total sum.
    \"\"\"
    pass
""",
    "solution_code": """import random

def expected_sum_until_six(n_simulations: int = 100000, seed: int = 42) -> float:
    random.seed(seed)
    total = 0
    for _ in range(n_simulations):
        s = 0
        while True:
            r = random.randint(1, 6)
            s += r
            if r == 6:
                break
        total += s
    return total / n_simulations
""",
    "test_cases": {
      "cases": [{"input": {"n_simulations": 200000, "seed": 42}, "expected": 21.0}],
      "function": "expected_sum_until_six"
    },
    "tags": ["expected-value", "probability", "simulation"],
    "points": 75,
  },

  {
    "slug": "brain-envelope-paradox",
    "title": "Two Envelopes Paradox",
    "description": """## Two Envelopes *(Classic Paradox)*

Two envelopes each contain money. One has **twice** as much as the other. You pick one envelope and see it contains **$100**.

Should you switch? The naive argument says:
- The other envelope has either $50 or $200 with equal probability
- Expected value of switching = 0.5×$50 + 0.5×$200 = **$125 > $100**

But this "always switch" logic applies equally after switching — a paradox.

The resolution: **you cannot assume equal probability without knowing the prior distribution**.

Write a function that, given a prior distribution over the smaller amount, computes the **correct** probability that the other envelope is larger.

For a uniform prior over [min_val, max_val], given you see `observed`:
- If `observed` < min_val or `observed` > 2*max_val: probability is 0 or 1
- Otherwise: compute properly

For this problem, assume the smaller amount is uniform on [1, 100].
""",
    "difficulty": "medium",
    "category": "brain",
    "starter_code": """def prob_other_is_larger(observed: float, min_val: float = 1, max_val: float = 100) -> float:
    \"\"\"
    Given uniform prior on smaller amount in [min_val, max_val],
    and you observed `observed`, return P(other envelope > observed).
    \"\"\"
    pass
""",
    "solution_code": """def prob_other_is_larger(observed: float, min_val: float = 1, max_val: float = 100) -> float:
    # observed is either the small envelope (other = 2*observed)
    # or the large envelope (other = observed/2)
    # P(observed is small) * P(valid) vs P(observed is large) * P(valid)
    half = observed / 2
    double = observed * 2
    p_small = 1.0 if (min_val <= observed <= max_val) else 0.0
    p_large = 1.0 if (min_val <= half <= max_val) else 0.0
    if p_small + p_large == 0:
        return 0.5
    return p_small / (p_small + p_large)
""",
    "test_cases": {
      "cases": [
        {"input": {"observed": 50.0, "min_val": 1, "max_val": 100}, "expected": 0.5},
        {"input": {"observed": 150.0, "min_val": 1, "max_val": 100}, "expected": 1.0},
        {"input": {"observed": 0.5, "min_val": 1, "max_val": 100}, "expected": 0.0},
      ],
      "function": "prob_other_is_larger"
    },
    "tags": ["paradox", "bayesian", "probability"],
    "points": 125,
  },

  # ─── PROBABILITY: Random Variables ───────────────────────────────────────
  {
    "slug": "brain-coupon-collector",
    "title": "Coupon Collector Problem",
    "description": """## Coupon Collector *(Classic — PuzzledQuant)*

There are **n** different coupons. Each time you buy a box of cereal you get one coupon uniformly at random. 

**How many boxes do you expect to buy to collect all n coupons?**

$$E[T] = n \\cdot H_n = n \\cdot \\sum_{k=1}^{n} \\frac{1}{k}$$

where H_n is the n-th harmonic number.

```python
expected_coupons(6)  → 14.7    # classic dice problem
expected_coupons(50) → 224.46
```

Write both the **exact formula** and a **simulation** to verify.
""",
    "difficulty": "medium",
    "category": "brain",
    "starter_code": """def expected_coupons(n: int) -> float:
    \"\"\"
    Return exact expected number of trials to collect all n coupons.
    Round to 2 decimal places.
    \"\"\"
    pass
""",
    "solution_code": """def expected_coupons(n: int) -> float:
    harmonic = sum(1/k for k in range(1, n+1))
    return round(n * harmonic, 2)
""",
    "test_cases": {
      "cases": [
        {"input": {"n": 1},  "expected": 1.0},
        {"input": {"n": 6},  "expected": 14.7},
        {"input": {"n": 50}, "expected": 224.46},
      ],
      "function": "expected_coupons"
    },
    "tags": ["expected-value", "harmonic", "combinatorics"],
    "points": 100,
  },

  {
    "slug": "brain-gambler-ruin",
    "title": "Gambler's Ruin",
    "description": """## Gambler's Ruin *(Quant Greenbook)*

A gambler starts with **$k** and plays a fair coin-flip game (+$1 or -$1 each round, p=0.5). 
The game ends when they reach **$N** (win) or **$0** (ruin).

**Probability of winning (reaching N before 0):**
$$P(\\text{win} | \\text{start at } k) = \\frac{k}{N}$$

For a biased coin (prob p of winning each round):
$$P(\\text{win}) = \\frac{1 - (q/p)^k}{1 - (q/p)^N}, \\quad q = 1-p$$

Write a function that returns the **exact probability** of reaching N before 0, starting at k.
""",
    "difficulty": "medium",
    "category": "brain",
    "starter_code": """def gamblers_ruin(k: int, N: int, p: float = 0.5) -> float:
    \"\"\"
    Probability of reaching N (before 0) starting at k.
    p = probability of winning each bet.
    \"\"\"
    pass
""",
    "solution_code": """def gamblers_ruin(k: int, N: int, p: float = 0.5) -> float:
    if k == 0: return 0.0
    if k == N: return 1.0
    q = 1 - p
    if abs(p - 0.5) < 1e-10:
        return k / N
    r = q / p
    return (1 - r**k) / (1 - r**N)
""",
    "test_cases": {
      "cases": [
        {"input": {"k": 5, "N": 10, "p": 0.5}, "expected": 0.5},
        {"input": {"k": 1, "N": 10, "p": 0.5}, "expected": 0.1},
        {"input": {"k": 5, "N": 10, "p": 0.6}, "expected": round((1-(0.4/0.6)**5)/(1-(0.4/0.6)**10), 6)},
        {"input": {"k": 0, "N": 10, "p": 0.5}, "expected": 0.0},
      ],
      "function": "gamblers_ruin"
    },
    "tags": ["gambler-ruin", "random-walk", "probability"],
    "points": 125,
  },

  # ─── MENTAL MATH ─────────────────────────────────────────────────────────
  {
    "slug": "brain-card-probability",
    "title": "Card Probability — At Least One Ace",
    "description": """## Card Probability *(Brainstellar)*

You draw **5 cards** from a standard 52-card deck (without replacement).

What is the probability of getting **at least one Ace**?

$$P(\\geq 1 \\text{ Ace}) = 1 - P(\\text{no Ace}) = 1 - \\frac{\\binom{48}{5}}{\\binom{52}{5}}$$

Write a function using exact combinatorics (no simulation).

```python
prob_at_least_one_ace(5)  → 0.3412
prob_at_least_one_ace(13) → 0.6962
```
""",
    "difficulty": "easy",
    "category": "brain",
    "starter_code": """def prob_at_least_one_ace(n_cards: int) -> float:
    \"\"\"
    Probability of drawing at least 1 ace when drawing n_cards from 52.
    Round to 4 decimal places.
    \"\"\"
    pass
""",
    "solution_code": """def prob_at_least_one_ace(n_cards: int) -> float:
    from math import comb
    p_no_ace = comb(48, n_cards) / comb(52, n_cards)
    return round(1 - p_no_ace, 4)
""",
    "test_cases": {
      "cases": [
        {"input": {"n_cards": 5},  "expected": 0.3412},
        {"input": {"n_cards": 1},  "expected": round(1 - 48/52, 4)},
        {"input": {"n_cards": 13}, "expected": 0.6962},
      ],
      "function": "prob_at_least_one_ace"
    },
    "tags": ["combinatorics", "probability", "cards"],
    "points": 75,
  },

  # ─── MENTAL MATH: Sequences ───────────────────────────────────────────────
  {
    "slug": "brain-secretary-problem",
    "title": "Secretary Problem (Optimal Stopping)",
    "description": """## Secretary Problem *(Quant Greenbook — Optimal Stopping)*

You interview **N** candidates one by one. After each interview you must **immediately** decide to hire or pass (no going back). 

**Optimal strategy:** Reject the first r-1 candidates (observation phase), then hire the first candidate who is better than all previously seen.

Optimal r = **N/e** ≈ 0.368·N

The probability of hiring the best candidate with this strategy approaches **1/e ≈ 0.368** as N → ∞.

Write a function that:
1. Computes the **exact** optimal cutoff r for n candidates
2. Returns the **exact** probability of success with that cutoff
""",
    "difficulty": "medium",
    "category": "brain",
    "starter_code": """def secretary_problem(n: int) -> dict:
    \"\"\"
    Returns {'optimal_r': int, 'success_prob': float}
    optimal_r: reject first r-1, then hire first better
    success_prob: probability of hiring best candidate
    Round success_prob to 4 decimal places.
    \"\"\"
    pass
""",
    "solution_code": """def secretary_problem(n: int) -> dict:
    import math
    best_prob = 0.0
    best_r = 1
    for r in range(1, n + 1):
        # P(success) = (r-1)/n * sum_{k=r}^{n} 1/(k-1)
        prob = sum((r - 1) / n * 1 / (k - 1) for k in range(r, n + 1)) if r > 1 else 1/n
        if prob > best_prob:
            best_prob = prob
            best_r = r
    return {"optimal_r": best_r, "success_prob": round(best_prob, 4)}
""",
    "test_cases": {
      "cases": [
        {"input": {"n": 10}, "expected": {"optimal_r": 4, "success_prob": 0.3987}},
        {"input": {"n": 1},  "expected": {"optimal_r": 1, "success_prob": 1.0}},
      ],
      "function": "secretary_problem"
    },
    "tags": ["optimal-stopping", "probability", "interview"],
    "points": 150,
  },

  {
    "slug": "brain-russian-roulette",
    "title": "Russian Roulette — Sequential vs Random",
    "description": """## Russian Roulette *(Brainstellar — Classic Interview)*

A revolver has 6 chambers. **2 bullets** are placed in **consecutive chambers**. The cylinder is spun once, then you pull the trigger — click (empty). 

Now you must pull again. Should you:
- **A) Spin again** (random chamber), or  
- **B) Just pull** (advance to next chamber)?

Calculate P(survive) for each option.

**After a click**, you know the current chamber was empty.
- 4 empty chambers. If you spin randomly: P(survive) = 4/6 = **2/3**
- If you just pull (advance): of the 4 empty chambers, only 1 is followed by a bullet (the one just before the first bullet). So P(survive) = **3/4**

**Answer: Don't spin — just pull.**

Write a simulation to verify both probabilities.
""",
    "difficulty": "medium",
    "category": "brain",
    "starter_code": """import random

def russian_roulette_probs(n_sim: int = 100000, seed: int = 42) -> dict:
    \"\"\"
    Returns {'spin_again': float, 'just_pull': float}
    Probabilities of surviving the second pull.
    Bullets in chambers 0 and 1 (consecutive).
    \"\"\"
    pass
""",
    "solution_code": """import random

def russian_roulette_probs(n_sim: int = 100000, seed: int = 42) -> dict:
    random.seed(seed)
    # Bullets in positions 0 and 1
    bullets = {0, 1}
    spin_survive = 0
    pull_survive = 0
    trials = 0
    for _ in range(n_sim * 2):
        start = random.randint(0, 5)
        if start in bullets:
            continue  # first pull was a shot, skip
        trials += 1
        # Spin again
        spin_survive += 1 if random.randint(0, 5) not in bullets else 0
        # Just pull (advance)
        next_chamber = (start + 1) % 6
        pull_survive += 1 if next_chamber not in bullets else 0
        if trials >= n_sim:
            break
    return {
        "spin_again": round(spin_survive / trials, 4),
        "just_pull":  round(pull_survive / trials, 4),
    }
""",
    "test_cases": {
      "cases": [{"input": {"n_sim": 100000, "seed": 42}, "expected": {"spin_again": 0.6667, "just_pull": 0.75}}],
      "function": "russian_roulette_probs"
    },
    "tags": ["probability", "simulation", "interview", "classic"],
    "points": 125,
  },

  # ─── STATISTICS: Mental Math ─────────────────────────────────────────────
  {
    "slug": "brain-unfair-coin-detection",
    "title": "Detecting an Unfair Coin",
    "description": """## Detecting an Unfair Coin *(PuzzledQuant)*

You have a coin. You want to test if it's fair (p=0.5) or biased (p=0.6). You flip it **n** times and get **k** heads.

Using a one-sided binomial test, compute the **p-value**: probability of getting k or more heads if the coin were fair.

$$p\\text{-value} = P(X \\geq k \\mid p=0.5, n) = \\sum_{i=k}^{n} \\binom{n}{i} 0.5^n$$

Return the p-value. If p-value < 0.05, the coin is likely biased.

```python
coin_pvalue(n=100, k=60) → 0.0284  # significant, coin is biased
coin_pvalue(n=100, k=55) → 0.1841  # not significant
```
""",
    "difficulty": "medium",
    "category": "brain",
    "starter_code": """def coin_pvalue(n: int, k: int) -> float:
    \"\"\"
    P-value for one-sided test: P(X >= k | X~Binomial(n, 0.5))
    Round to 4 decimal places.
    \"\"\"
    pass
""",
    "solution_code": """def coin_pvalue(n: int, k: int) -> float:
    from math import comb
    p = sum(comb(n, i) * (0.5 ** n) for i in range(k, n + 1))
    return round(p, 4)
""",
    "test_cases": {
      "cases": [
        {"input": {"n": 100, "k": 60}, "expected": 0.0284},
        {"input": {"n": 100, "k": 50}, "expected": 0.5398},
        {"input": {"n": 10,  "k": 9},  "expected": round(sum(__import__('math').comb(10,i)*0.5**10 for i in range(9,11)),4)},
      ],
      "function": "coin_pvalue"
    },
    "tags": ["hypothesis-testing", "statistics", "binomial"],
    "points": 125,
  },

  # ─── QUANT GREENBOOK ─────────────────────────────────────────────────────
  {
    "slug": "brain-price-sequence",
    "title": "Stock Price — Up/Down Sequences",
    "description": """## Stock Price Paths *(Quant Greenbook)*

A stock moves up by 1 or down by 1 each day with equal probability. Starting at price S₀:

**Question:** In n steps, what is the probability the stock **never touches 0** (given S₀ = k)?

This is the **ballot problem** / reflection principle:

$$P(\\text{never hits 0}) = \\frac{k - 0}{n + k} \\text{ (approx for large n)}$$

For exact computation, use the **reflection principle**:
$$P(S_t > 0 \\text{ for all } t=1..n \\mid S_0 = k) = \\frac{k}{n}$$ (for large n, p=0.5)

More precisely, use simulation.
""",
    "difficulty": "hard",
    "category": "brain",
    "starter_code": """import random

def prob_never_zero(k: int, n: int, n_sim: int = 50000, seed: int = 42) -> float:
    \"\"\"
    Simulate probability that a symmetric random walk starting at k
    never touches 0 in n steps.
    \"\"\"
    pass
""",
    "solution_code": """import random

def prob_never_zero(k: int, n: int, n_sim: int = 50000, seed: int = 42) -> float:
    random.seed(seed)
    success = 0
    for _ in range(n_sim):
        pos = k
        survived = True
        for _ in range(n):
            pos += 1 if random.random() < 0.5 else -1
            if pos <= 0:
                survived = False
                break
        if survived:
            success += 1
    return round(success / n_sim, 4)
""",
    "test_cases": {
      "cases": [
        {"input": {"k": 5, "n": 4, "n_sim": 50000, "seed": 42}, "expected": 0.5},
      ],
      "function": "prob_never_zero"
    },
    "tags": ["ballot-problem", "random-walk", "reflection"],
    "points": 175,
  },

  {
    "slug": "brain-pirate-game",
    "title": "Pirate Game — Game Theory",
    "description": """## Pirate Game *(Quant Greenbook — Game Theory)*

5 pirates (ranked 1=most senior to 5=junior) must split **100 gold coins**.

Rules:
- Most senior pirate proposes a split
- All pirates vote (including proposer)
- If ≥50% approve, split is implemented
- Otherwise, proposer is thrown overboard and next senior proposes
- Pirates are: rational, greedy (want max gold), and bloodthirsty (prefer throwing overboard if indifferent)

**What does pirate 1 propose?**

Work backwards (backward induction):
- 1 pirate: keeps all 100
- 2 pirates: P2 keeps 100, P1 gets 0 (P2 votes yes alone = 50%)
- 3 pirates: P3 needs P1's vote — offer P1 1 coin (P1 prefers 1 to 0) → P3:99, P2:0, P1:1
- 4 pirates: P4 needs P2's vote — offer P2 1 coin → P4:99, P3:0, P2:1, P1:0
- 5 pirates: P5 needs P1 and P3 — offer 1 each → **P5:98, P4:0, P3:1, P2:0, P1:1**

Write a function that returns the optimal proposal for n pirates splitting m coins.
""",
    "difficulty": "hard",
    "category": "brain",
    "starter_code": """def pirate_proposal(n_pirates: int = 5, total_coins: int = 100) -> list:
    \"\"\"
    Returns list of coins for each pirate [p1, p2, ..., pn]
    where p1 is the most senior (proposer).
    Optimal proposal using backward induction.
    \"\"\"
    pass
""",
    "solution_code": """def pirate_proposal(n_pirates: int = 5, total_coins: int = 100) -> list:
    # Build up from base cases using backward induction
    # alive[i] = coins pirate i gets if there are i+1 pirates remaining
    # Index 0 = most junior remaining pirate
    
    # With k pirates, the proposer (most senior = index k-1 in reversed list)
    # offers 1 coin to pirates who would get 0 in k-1 scenario
    
    results = {}  # results[k] = list of length k: coins each pirate gets
    results[1] = [total_coins]  # one pirate keeps all
    
    for k in range(2, n_pirates + 1):
        prev = results[k - 1]  # what each pirate gets with k-1 pirates
        # prev[0] is most junior of the k-1 (= pirate index 1 in k-pirate game)
        # Proposer needs floor(k/2) additional votes (excluding self)
        need = (k - 1) // 2  # votes needed from others (excluding proposer)
        
        allocation = [0] * k  # allocation for k pirates
        # Pirates who get 0 in k-1 scenario (willing to take 1 coin)
        # In k-1 scenario, pirate at position i gets prev[i-1] (shifted by 1, since proposer removed)
        # If proposer is thrown: pirates 1..k-1 (0-indexed) survive, getting prev[0..k-2]
        cheap_votes = [i for i in range(k - 1) if prev[i] == 0]  # 0-indexed, these are non-proposer pirates
        
        # Give 1 coin to the cheapest `need` pirates
        for idx in cheap_votes[:need]:
            allocation[idx] = 1
        
        allocation[k - 1] = total_coins - sum(allocation)  # proposer gets the rest
        results[k] = allocation
    
    result = results[n_pirates]
    # result[0] = most junior, result[-1] = proposer (most senior = pirate 1)
    return list(reversed(result))  # return [p1, p2, ..., pn]
""",
    "test_cases": {
      "cases": [
        {"input": {"n_pirates": 5, "total_coins": 100}, "expected": [98, 0, 1, 0, 1]},
        {"input": {"n_pirates": 2, "total_coins": 100}, "expected": [100, 0]},
        {"input": {"n_pirates": 1, "total_coins": 100}, "expected": [100]},
      ],
      "function": "pirate_proposal"
    },
    "tags": ["game-theory", "backward-induction", "interview"],
    "points": 200,
  },

  {
    "slug": "brain-kelly-sizing",
    "title": "Kelly Criterion — Optimal Bet Sizing",
    "description": """## Kelly Criterion *(Quant Greenbook)*

The Kelly Criterion gives the **optimal fraction of capital** to bet to maximise long-run growth:

$$f^* = \\frac{bp - q}{b}$$

where:
- p = probability of winning
- q = 1 - p = probability of losing
- b = net odds (win b for every 1 risked)

For multiple outcomes, the generalised Kelly:
$$f^* = \\frac{E[R]}{E[R^2]}$$ (approximately, for small bets)

Write a function that:
1. Computes exact Kelly fraction
2. Simulates wealth growth over n rounds comparing Kelly vs fixed 25% vs fixed 50%

```python
kelly_fraction(p=0.6, b=1.0) → 0.2  # bet 20% of bankroll
```
""",
    "difficulty": "medium",
    "category": "brain",
    "starter_code": """def kelly_fraction(p: float, b: float) -> float:
    \"\"\"
    Optimal Kelly fraction.
    p = win probability, b = net odds (win b per 1 bet).
    Return as decimal, round to 4 places.
    \"\"\"
    pass

def simulate_kelly(p: float, b: float, n_rounds: int = 1000, seed: int = 42) -> dict:
    \"\"\"
    Simulate 3 strategies: Kelly, 25% fixed, 50% fixed.
    Start with $1000. Return final wealth for each.
    \"\"\"
    pass
""",
    "solution_code": """import random

def kelly_fraction(p: float, b: float) -> float:
    q = 1 - p
    return round((b * p - q) / b, 4)

def simulate_kelly(p: float, b: float, n_rounds: int = 1000, seed: int = 42) -> dict:
    random.seed(seed)
    outcomes = [random.random() < p for _ in range(n_rounds)]
    
    def run(f):
        w = 1000.0
        for win in outcomes:
            w *= (1 + f * b) if win else (1 - f)
            if w < 0.01: return 0.0
        return round(w, 2)
    
    f_k = kelly_fraction(p, b)
    return {"kelly": run(f_k), "fixed_25pct": run(0.25), "fixed_50pct": run(0.50)}
""",
    "test_cases": {
      "cases": [
        {"input": {"p": 0.6, "b": 1.0}, "expected": 0.2},
        {"input": {"p": 0.5, "b": 1.0}, "expected": 0.0},
        {"input": {"p": 0.4, "b": 2.0}, "expected": round((2*0.4-0.6)/2, 4)},
      ],
      "function": "kelly_fraction"
    },
    "tags": ["kelly-criterion", "optimal-sizing", "probability"],
    "points": 150,
  },
]


async def seed():
    async with AsyncSessionLocal() as db:
        from sqlalchemy import select
        added = 0
        for p in BRAIN_PROBLEMS:
            ex = await db.execute(select(Problem).where(Problem.slug == p["slug"]))
            if ex.scalar_one_or_none():
                print(f"  skip: {p['slug']}")
                continue
            db.add(Problem(**p))
            print(f"  added: {p['slug']}")
            added += 1
        await db.commit()
        print(f"\nDone — {added}/{len(BRAIN_PROBLEMS)} brain problems added.")

if __name__ == "__main__":
    asyncio.run(seed())
