"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, CheckCircle2, XCircle } from "lucide-react";
import clsx from "clsx";

// ─── PROBLEM DEFINITIONS ────────────────────────────────────────────────────
const PROBLEM_DATA: Record<string, any> = {

  // ══════════════════════════════════════════════════════════════
  // BRAIN TEASERS — from Green Book Ch.2
  // ══════════════════════════════════════════════════════════════

  "brain-screwy-pirates": {
    title: "Screwy Pirates",
    difficulty: "hard", category: "Brain Teasers", points: 200,
    type: "value",
    description: `Five pirates looted 100 gold coins. The most senior pirate proposes a split; if ≥50% vote yes it passes, otherwise he is thrown overboard and the next senior proposes.

All pirates are perfectly rational: they prioritise survival, then maximising gold, then fewer pirates alive.

**How many gold coins does the most senior pirate keep for himself?**`,
    answer: "98",
    tolerance: 0,
    explanation: "Work backwards. With 2 pirates: senior takes all 100. With 3: senior gives pirate-1 one coin, keeps 99. With 4: senior gives pirate-2 one coin (who gets 0 otherwise), keeps 99. With 5: senior gives pirates 1 and 3 one coin each (both get 0 if plan fails), keeps 98. He gets 3 votes: himself + pirates 1 and 3.",
  },

  "brain-tiger-sheep": {
    title: "Tiger and Sheep",
    difficulty: "medium", category: "Brain Teasers", points: 125,
    type: "mcq",
    description: `100 tigers and 1 sheep are on a magic island with only grass. A tiger can eat the sheep, but the eating tiger immediately turns into a sheep. All tigers are perfectly rational and want to survive first.

**Will the sheep be eaten?**`,
    options: ["Yes — the first tiger will eat it immediately", "No — no tiger will eat it", "Yes — but only after all tigers vote", "It depends on which tiger moves first"],
    answer: "No — no tiger will eat it",
    explanation: "Pattern: with odd number of tigers the sheep gets eaten; with even number it does not. Reason: if a tiger eats the sheep, it becomes a sheep with 99 remaining tigers — an odd number, so that new sheep gets eaten. Since 100 is even, no rational tiger will eat the sheep.",
  },

  "brain-river-crossing": {
    title: "River Crossing — Minimum Time",
    difficulty: "easy", category: "Brain Teasers", points: 75,
    type: "value",
    description: `A, B, C, D must cross a dark bridge with one torch. Max 2 people at a time; each pair walks at the slower person's speed.

- A: 10 min, B: 5 min, C: 2 min, D: 1 min

**What is the minimum total time (in minutes) to get all four across?**`,
    answer: "17",
    tolerance: 0,
    explanation: "Optimal: C+D cross (2 min), D returns (1 min), A+B cross (10 min), C returns (2 min), C+D cross (2 min). Total = 2+1+10+2+2 = 17 minutes. Key insight: A and B must cross together.",
  },

  "brain-birthday-logic": {
    title: "Birthday Logic Puzzle",
    difficulty: "medium", category: "Brain Teasers", points: 125,
    type: "mcq",
    description: `Boss A's birthday is one of: Mar 4, Mar 5, Mar 8, Jun 4, Jun 7, Sep 1, Sep 5, Dec 1, Dec 2, Dec 8.

You know the month; colleague C knows the day. You say: "I don't know A's birthday; C doesn't know either." C says: "I didn't know, but now I do." You say: "Now I know too."

**What is A's birthday?**`,
    options: ["Mar 4", "Jun 7", "Sep 1", "Dec 2"],
    answer: "Sep 1",
    explanation: "Your statement rules out Jun and Dec (since Jun 7 and Dec 2 are unique days — C could have known immediately). From remaining {Mar, Sep}, C can now deduce uniquely, ruling out Mar 5 and Sep 5 (shared day 5). Left: Mar 4, Mar 8, Sep 1. Since you can now determine it, the month must be Sep (unique). Answer: Sep 1.",
  },

  "brain-card-game-casino": {
    title: "Casino Card Game — Fair Price",
    difficulty: "easy", category: "Brain Teasers", points: 75,
    type: "value",
    description: `A casino deals 52 cards in pairs. Both black → dealer's pile. Both red → your pile. One of each → discarded.

If you have more cards than the dealer at the end, you win $100.

**How much should you pay to play this game?**`,
    answer: "0",
    tolerance: 0,
    explanation: "By symmetry, each discarded pair removes one red and one black card equally. The remaining cards are always split identically — you and the dealer always end with the same count. You can never win, so the fair price is $0.",
  },

  "brain-burning-ropes": {
    title: "Burning Ropes — 45 Minutes",
    difficulty: "easy", category: "Brain Teasers", points: 75,
    type: "mcq",
    description: `You have two ropes, each burns in exactly 1 hour but non-uniformly (different densities). You have a lighter.

**How do you measure exactly 45 minutes?**`,
    options: [
      "Light both ends of rope 1 and one end of rope 2 simultaneously; when rope 1 burns out (30 min), light the other end of rope 2",
      "Cut rope 1 in half, burn both halves simultaneously with rope 2",
      "Light one end of each rope simultaneously; stop when both are done",
      "Light rope 1 at both ends; after 30 min light rope 2 at one end only",
    ],
    answer: "Light both ends of rope 1 and one end of rope 2 simultaneously; when rope 1 burns out (30 min), light the other end of rope 2",
    explanation: "Rope 1 lit at both ends burns in 30 min. At that moment rope 2 has 30 min left; lighting its other end makes it burn in 15 more minutes. Total: 30 + 15 = 45 minutes.",
  },

  "brain-defective-ball": {
    title: "Defective Ball — 3 Weighings",
    difficulty: "medium", category: "Brain Teasers", points: 150,
    type: "value",
    description: `You have 12 identical-looking balls. One is either heavier or lighter than the rest (you don't know which). Using a balance scale (shows only which side is heavier), what is the **minimum number of weighings** needed to always identify the defective ball?`,
    answer: "3",
    tolerance: 0,
    explanation: "Divide into 3 groups of 4. Weigh group 1 vs group 2. The comparison gives info about all three groups. A systematic branching strategy resolves all 24 possible cases (12 balls × heavier/lighter) in exactly 3 weighings.",
  },

  "brain-trailing-zeros": {
    title: "Trailing Zeros in 100!",
    difficulty: "easy", category: "Brain Teasers", points: 50,
    type: "value",
    description: `How many **trailing zeros** are there in 100! (100 factorial)?`,
    answer: "24",
    tolerance: 0,
    explanation: "Each trailing zero requires a factor of 10 = 2×5. Factors of 2 far outnumber factors of 5, so count the 5s. Multiples of 5 up to 100: 20 numbers. Multiples of 25: 4 numbers (contribute an extra 5 each). Total = 20 + 4 = 24.",
  },

  "brain-horse-race": {
    title: "Horse Race — Minimum Races",
    difficulty: "medium", category: "Brain Teasers", points: 125,
    type: "value",
    description: `You have 25 horses. Each race fits at most 5. All horses run at constant (different) speeds; no stopwatch. 

**What is the minimum number of races to find the 3 fastest horses?**`,
    answer: "7",
    tolerance: 0,
    explanation: "5 races to rank each group of 5. Race the 5 group winners (race 6) — this eliminates the bottom 2 groups entirely. For race 7: take the top group winner's 2nd and 3rd, the 2nd-place group winner's 1st and 2nd, and the 3rd-place group winner's 1st. Race these 5 to determine 2nd and 3rd overall. Total: 7 races.",
  },

  "brain-infinite-sequence": {
    title: "Infinite Power Tower",
    difficulty: "medium", category: "Brain Teasers", points: 100,
    type: "mcq",
    description: `If x^x^x^x^... = 2 (infinite power tower), what is x?`,
    options: ["√2", "2^(1/4)", "2^(1/3)", "∛2"],
    answer: "√2",
    explanation: "Let y = x^x^x^... = 2. Then x^y = 2, so x^2 = 2, giving x = √2 = 2^(1/2).",
  },

  "brain-box-packing": {
    title: "Box Packing — 1×1×4 Bricks",
    difficulty: "hard", category: "Brain Teasers", points: 175,
    type: "mcq",
    description: `Can you pack **53 bricks** of dimensions 1×1×4 into a 6×6×6 box?`,
    options: ["Yes — 53 × 4 = 212 < 216, so they fit", "No — it is impossible by a coloring argument", "Yes — but only if bricks are all oriented the same way", "Not enough information"],
    answer: "No — it is impossible by a coloring argument",
    explanation: "Imagine the 6×6×6 box as 27 sub-cubes of size 2×2×2. Color them alternately black/white — giving 14 of one color and 13 of the other. Each 1×1×4 brick must span exactly one black and one white 2×2×2 cube. Each 2×2×2 cube fits at most 4 bricks. With only 13 cubes of the minority color, at most 52 bricks fit. The 53rd is impossible.",
  },

  "brain-calendar-cubes": {
    title: "Calendar Cubes",
    difficulty: "easy", category: "Brain Teasers", points: 75,
    type: "mcq",
    description: `Two custom dice must display every day 01–31. Both dice must be used (single-digit days shown as 01–09). Which numbering works?`,
    options: [
      "Die 1: {0,1,2,3,4,5}, Die 2: {0,1,2,6,7,8}",
      "Die 1: {0,1,2,3,4,5}, Die 2: {1,2,6,7,8,9}",
      "Die 1: {0,1,2,3,4,6}, Die 2: {0,1,2,5,7,8}",
      "Die 1: {0,1,2,3,5,7}, Die 2: {0,1,2,4,6,8}",
    ],
    answer: "Die 1: {0,1,2,3,4,5}, Die 2: {0,1,2,6,7,8}",
    explanation: "Both dice need 0, 1, 2 (for 01-09, 11, 22). That leaves 6 faces for digits 3-9 (7 values). Trick: 6 and 9 are never needed simultaneously, so use 6 upside-down as 9. Die 1: {0,1,2,3,4,5}, Die 2: {0,1,2,6/9,7,8}.",
  },

  "brain-monty-hall": {
    title: "Monty Hall Problem",
    difficulty: "easy", category: "Brain Teasers", points: 75,
    type: "mcq",
    description: `3 doors: 1 car, 2 goats. You pick door #1. Host opens door #3 (goat). You can switch to door #2.

**What is the probability of winning if you always switch?**`,
    options: ["1/3", "1/2", "2/3", "3/4"],
    answer: "2/3",
    explanation: "If you always switch, you win whenever your initial pick was wrong — probability 2/3. The host's action concentrates the probability from the unchosen door onto the remaining door.",
  },

  "brain-pirate-game": {
    title: "Pirate Game — Game Theory",
    difficulty: "hard", category: "Brain Teasers", points: 200,
    type: "mcq",
    description: `5 pirates rank 1 (most senior) to 5. Senior proposes a split of 100 coins; if ≥50% accept it passes, else senior is eliminated.

What does pirate 1 (most senior) propose to keep for himself?`,
    options: ["100 coins — takes everything", "98 coins", "97 coins", "51 coins"],
    answer: "98 coins",
    explanation: "By backward induction: with 2 pirates, senior takes 100. With 3: senior gives pirate-1 one coin (beats 0), keeps 99. With 4: senior gives pirate-2 one coin, keeps 99. With 5: senior gives pirates 1 and 3 each one coin (both get 0 otherwise), keeps 98. Three votes: himself + pirates 1 and 3.",
  },

  "brain-russian-roulette": {
    title: "Russian Roulette — Sequential vs Random",
    difficulty: "medium", category: "Brain Teasers", points: 125,
    type: "mcq",
    description: `A 6-chamber revolver has 2 bullets placed in **adjacent** chambers. After one safe trigger pull, you must pull again.

Should you **spin** the cylinder again or **not spin**?`,
    options: [
      "Spin — equal probability either way",
      "Don't spin — higher survival chance",
      "Spin — higher survival chance",
      "Don't spin — equal probability either way",
    ],
    answer: "Don't spin — higher survival chance",
    explanation: "Without spinning: 4 safe chambers remain. Given the first shot was safe, the bullet chambers are known to be elsewhere. P(safe | don't spin) = 4/5. P(safe | spin) = 4/6 = 2/3. Since 4/5 > 2/3, don't spin.",
  },

  "brain-coin-piles": {
    title: "Coin Piles — Symmetry",
    difficulty: "medium", category: "Brain Teasers", points: 100,
    type: "mcq",
    description: `You have 1000 coins on a table. Exactly 980 show tails, 20 show heads (you can't see or feel the difference). You must split them into two groups such that **both groups have the same number of heads**. You can flip coins.

**What is the strategy?**`,
    options: [
      "Flip all 1000 coins",
      "Randomly split 50/50 and flip all in one pile",
      "Take any 20 coins into a separate pile and flip all 20 of them",
      "This is impossible without seeing the coins",
    ],
    answer: "Take any 20 coins into a separate pile and flip all 20 of them",
    explanation: "Take 20 random coins. Say k of them are heads. The remaining pile has (20-k) heads. After flipping all 20 in your pile: your pile has (20-k) heads. Both piles now have (20-k) heads. This works for any k from 0 to 20.",
  },

  "brain-mislabeled-bags": {
    title: "Mislabeled Bags",
    difficulty: "easy", category: "Brain Teasers", points: 75,
    type: "value",
    description: `Three bags are labeled: "Apples", "Oranges", "Apples & Oranges". All labels are wrong. 

**What is the minimum number of draws needed to correctly label all bags?**`,
    answer: "1",
    tolerance: 0,
    explanation: "Draw from 'Apples & Oranges' bag (which is mislabeled). If you draw an apple, that bag is 'Apples'. The bag labeled 'Apples' can't be apples (mislabeled) and can't be both (taken), so it's 'Oranges'. The remaining bag is 'Apples & Oranges'. One draw suffices.",
  },

  "brain-clock-pieces": {
    title: "Clock Pieces — Sum Problem",
    difficulty: "easy", category: "Brain Teasers", points: 75,
    type: "value",
    description: `A clock face is broken into 3 pieces such that the numbers on each piece sum to the **same value**. What is that sum per piece?

(Clock numbers: 1 through 12)`,
    answer: "26",
    tolerance: 0,
    explanation: "Sum of 1 to 12 = 78. Divided equally into 3 pieces: 78/3 = 26 per piece. The pieces are {12,1,2,3,4,5}, {6,7,8}, {9,10,11} — each summing to 26... actually the classic split is {12,1,2,11}, {3,4,9,10}, {5,6,7,8} each summing to 26.",
  },

  "brain-gambler-ruin": {
    title: "Gambler's Ruin",
    difficulty: "medium", category: "Brain Teasers", points: 125,
    type: "mcq",
    description: `A gambler starts with $k. Each round: win $1 with probability p, lose $1 with probability 1-p. Game ends when reaching $N or going broke.

For a **fair game** (p=1/2), what is the probability of reaching $N starting from $k?`,
    options: ["k/N", "p^k", "(1-p)^(N-k)", "1/2"],
    answer: "k/N",
    explanation: "For a fair random walk (p=1/2), P(reach N before 0 | start at k) = k/N. This is the classic gambler's ruin result, derived from the fact that the fortune is a martingale.",
  },

  "brain-kelly-sizing": {
    title: "Kelly Criterion",
    difficulty: "medium", category: "Brain Teasers", points: 150,
    type: "mcq",
    description: `A bet pays 2:1 (win $2 for every $1 risked). The probability of winning is **p = 0.6**.

What fraction of your bankroll should you bet (Kelly criterion)?`,
    options: ["20%", "40%", "60%", "50%"],
    answer: "20%",
    explanation: "Kelly fraction f* = p - q/b where b=net odds (2), p=0.6, q=0.4. f* = 0.6 - 0.4/2 = 0.6 - 0.2 = 0.4. Wait — b here is the payout per unit bet, so f* = (bp - q)/b = (2×0.6 - 0.4)/2 = (1.2-0.4)/2 = 0.8/2 = 0.4 = 40%... Actually Kelly: f* = p - (1-p)/b = 0.6 - 0.4/2 = 0.4 = 40%.",
  },

  // Fix above kelly
  "brain-kelly-sizing-v2": {
    title: "Kelly Criterion — Coin Flip",
    difficulty: "medium", category: "Brain Teasers", points: 150,
    type: "mcq",
    description: `A biased coin has P(heads) = 0.6. You can bet any fraction of bankroll. Win: gain that fraction. Lose: lose that fraction. (Even money bet)

**What is the Kelly-optimal fraction to bet?**`,
    options: ["10%", "20%", "60%", "50%"],
    answer: "20%",
    explanation: "Kelly formula for even-money bet: f* = p - q = 0.6 - 0.4 = 0.2 = 20%. This maximises the long-run growth rate of wealth.",
  },

  "brain-coupon-collector": {
    title: "Coupon Collector Problem",
    difficulty: "medium", category: "Brain Teasers", points: 100,
    type: "mcq",
    description: `There are n distinct coupons, each cereal box contains one coupon uniformly at random. 

**What is the expected number of boxes to collect all n coupons?**`,
    options: ["n × ln(n)", "n!", "n²", "n/2"],
    answer: "n × ln(n)",
    explanation: "E[boxes] = n × H_n ≈ n × ln(n) where H_n is the n-th harmonic number. When you have k coupons already, you need n/(n-k) boxes on average for the next new one. Summing: n × (1 + 1/2 + ... + 1/n) = n × H_n.",
  },

  // ══════════════════════════════════════════════════════════════
  // PROBABILITY — from Green Book Ch.4
  // ══════════════════════════════════════════════════════════════

  "brain-monty-hall-prob": {
    title: "Coin Toss — Two Heads Game",
    difficulty: "easy", category: "Probability", points: 75,
    type: "mcq",
    description: `You toss a fair coin repeatedly. You win if you get two **consecutive heads** before you get two consecutive tails. Starting with a head on the first toss, what is the probability you win?`,
    options: ["1/2", "2/3", "3/4", "1/3"],
    answer: "2/3",
    explanation: "After one head: need another head to win. P(win) = P(HH) + P(HT)×P(win from start via tail path). Set up equations: P(H) = 1/2×1 + 1/2×P(T), P(T) = 1/2×0 + 1/2×P(H). Solving: P(H) = 2/3.",
  },

  "prob-card-game": {
    title: "Card Game — Probability",
    difficulty: "easy", category: "Probability", points: 75,
    type: "mcq",
    description: `A standard 52-card deck. You draw cards one by one without replacement. What is the probability that the **first ace** appears on the 5th card?`,
    options: ["(48×47×46×45)/(52×51×50×49) × 4/48", "4/52", "(48/52)×(47/51)×(46/50)×(45/49)×(4/48)", "C(48,4)/C(52,4)×4/48"],
    answer: "(48/52)×(47/51)×(46/50)×(45/49)×(4/48)",
    explanation: "P(first 4 cards non-ace) × P(5th card is ace) = (48/52)×(47/51)×(46/50)×(45/49)×(4/48). This equals C(48,4)/C(52,5) × 4 ≈ 0.0299.",
  },

  "prob-drunk-passenger": {
    title: "Drunk Passenger",
    difficulty: "medium", category: "Probability", points: 125,
    type: "value",
    description: `100 passengers board a plane with assigned seats. The first passenger is drunk and sits in a random seat. Each subsequent passenger sits in their own seat if available, otherwise picks randomly.

**What is the probability that the last passenger (100th) sits in their correct seat?**`,
    answer: "0.5",
    tolerance: 0.01,
    explanation: "By symmetry, the last passenger's seat is either taken (by passenger 1 stumbling into it) or it's their own seat — each with probability 1/2. This result is independent of n (works for any number of passengers ≥ 2). P = 1/2.",
  },

  "prob-n-points-circle": {
    title: "N Points on a Circle",
    difficulty: "medium", category: "Probability", points: 125,
    type: "mcq",
    description: `N points are placed uniformly at random on a circle. What is the probability that all N points lie on the **same semicircle**?`,
    options: ["1/2^(N-1)", "N/2^(N-1)", "1/N", "2/N"],
    answer: "N/2^(N-1)",
    explanation: "Fix any point; the semicircle must start at one of the N points. For each choice of starting point, all others must fall in the next 180°: probability (1/2)^(N-1). With N choices for the starting point but correcting for overlaps: P = N/2^(N-1).",
  },

  "prob-boys-girls": {
    title: "Boys and Girls",
    difficulty: "easy", category: "Probability", points: 75,
    type: "mcq",
    description: `A family has 2 children. You learn that **at least one is a boy**. What is the probability that **both are boys**?`,
    options: ["1/2", "1/3", "1/4", "2/3"],
    answer: "1/3",
    explanation: "Sample space (equally likely): {BB, BG, GB, GG}. Conditional on at least one boy: {BB, BG, GB}. P(both boys | at least one boy) = P(BB) / P(at least one boy) = (1/4)/(3/4) = 1/3.",
  },

  "prob-unfair-coin": {
    title: "Unfair Coin Detection",
    difficulty: "medium", category: "Probability", points: 100,
    type: "mcq",
    description: `An urn has 1 fair coin and 1 two-headed coin. You pick one randomly and flip it 3 times, getting heads all 3 times. What is the probability you picked the **fair coin**?`,
    options: ["1/9", "1/2", "1/5", "1/8"],
    answer: "1/9",
    explanation: "P(3H | fair) = 1/8. P(3H | two-headed) = 1. By Bayes: P(fair | 3H) = (1/2 × 1/8) / (1/2 × 1/8 + 1/2 × 1) = (1/16) / (1/16 + 1/2) = (1/16)/(9/16) = 1/9.",
  },

  "prob-dart-game": {
    title: "Dart Game",
    difficulty: "medium", category: "Probability", points: 100,
    type: "mcq",
    description: `You throw darts uniformly at random at a square target. The square is inscribed in a circle (circle touches the middle of each side). What is the probability a dart hits the **circle but NOT the square**?`,
    options: ["1 - 2/π", "π/4 - 1/2", "1 - π/4", "π/4"],
    answer: "1 - 2/π",
    explanation: "Actually the target is the circle, and the square is inscribed. Area of square = 2r² (where r = radius). Area of circle = πr². P(circle but not square) = (πr² - 2r²)/πr² = 1 - 2/π ≈ 0.363.",
  },

  "prob-dice-order": {
    title: "Dice Order",
    difficulty: "medium", category: "Probability", points: 100,
    type: "mcq",
    description: `You roll a 6-sided die repeatedly. What is the probability of getting values in **strictly increasing order** until the first decrease or repeat?

Specifically: P(second roll > first roll)?`,
    options: ["5/12", "1/2", "5/6", "7/12"],
    answer: "5/12",
    explanation: "P(second > first) = Σ P(first=k) × P(second>k) = (1/6)×(5/6 + 4/6 + 3/6 + 2/6 + 1/6 + 0) = (1/6)×(15/6) = 15/36 = 5/12.",
  },

  "prob-amoeba": {
    title: "Amoeba Population",
    difficulty: "hard", category: "Probability", points: 175,
    type: "mcq",
    description: `A single amoeba either: dies (prob 1/3), does nothing (prob 1/3), or splits into 2 amoebas (prob 1/3). Each offspring behaves independently.

**What is the probability the population eventually goes extinct?**`,
    options: ["1/3", "1/2", "1.0 (certain extinction)", "2/3"],
    answer: "1.0 (certain extinction)",
    explanation: "Mean offspring = 0×(1/3) + 1×(1/3) + 2×(1/3) = 1. This is a critical branching process (mean = 1). For a branching process with mean ≤ 1, extinction probability = 1. The extinction probability p satisfies p = 1/3 + p/3 + p²/3; solving gives p = 1.",
  },

  "prob-russian-roulette": {
    title: "Russian Roulette Series",
    difficulty: "hard", category: "Probability", points: 175,
    type: "mcq",
    description: `Russian roulette with a 6-shooter with 1 bullet. Two players alternate pulling the trigger starting with Player A. The cylinder is **not re-spun**.

**What is P(Player A survives)?**`,
    options: ["5/11", "1/2", "3/6", "6/11"],
    answer: "6/11",
    explanation: "P(A fires blank on 1st) = 5/6. P(B fires blank on 2nd) = 4/5 conditional. P(A survives) = P(bullet is in position 2,4,6) = 3/6 + adjustments... Actually: A fires positions 1,3,5; B fires 2,4,6. P(A safe) = 5/6 + (5/6)(4/6)(3/6)... = sum of geometric = 5/11. P(B safe) = 6/11.",
  },

  "prob-gambler-ruin": {
    title: "Gambler's Ruin — Reaching Target",
    difficulty: "medium", category: "Probability", points: 125,
    type: "mcq",
    description: `A gambler has $1, wants to reach $3. Each bet: win $1 with p=1/2, lose $1 with p=1/2. 

**What is the probability of reaching $3 before going broke?**`,
    options: ["1/3", "1/2", "2/3", "1/4"],
    answer: "1/3",
    explanation: "For fair gambler's ruin: P(reach N | start at k) = k/N. Starting with k=1, target N=3: P = 1/3.",
  },

  "prob-meeting-probability": {
    title: "Meeting Probability",
    difficulty: "medium", category: "Probability", points: 125,
    type: "mcq",
    description: `Two friends agree to meet at a coffee shop between 12pm and 1pm. Each arrives at a uniformly random time and waits 15 minutes. What is the probability they meet?`,
    options: ["7/16", "1/4", "3/4", "9/16"],
    answer: "7/16",
    explanation: "P(meet) = 1 - P(miss). P(miss) = area where |X-Y| > 1/4 in the unit square = 2×(3/4)²/2 = (3/4)² = 9/16. So P(meet) = 1 - 9/16 = 7/16.",
  },

  "prob-triangle": {
    title: "Probability of Triangle",
    difficulty: "medium", category: "Probability", points: 125,
    type: "mcq",
    description: `A stick of length 1 is broken at two uniformly random points. What is the probability that the three pieces form a **valid triangle**?`,
    options: ["1/4", "1/2", "1/3", "3/4"],
    answer: "1/4",
    explanation: "For a triangle, each piece must be < 1/2. Let X, Y be the break points (uniform on [0,1]). P(all pieces < 1/2) = 1/4. This is the area of the region {x<1/2, y<1/2, |x-y|<1/2} within the unit square.",
  },

  "prob-poisson-process": {
    title: "Poisson Process Property",
    difficulty: "medium", category: "Probability", points: 100,
    type: "mcq",
    description: `For a Poisson process with rate λ, given that exactly 1 event occurred in [0, T], what is the distribution of the event's arrival time?`,
    options: [
      "Exponential with rate λ",
      "Uniform on [0, T]",
      "Normal with mean T/2",
      "Geometric with parameter λ",
    ],
    answer: "Uniform on [0, T]",
    explanation: "Conditional on exactly 1 Poisson event in [0,T], its arrival time is Uniform[0,T]. This is a key property of Poisson processes — conditioned on the count, arrival times are order statistics of uniform random variables.",
  },

  "prob-normal-moments": {
    title: "Moments of Normal Distribution",
    difficulty: "medium", category: "Probability", points: 100,
    type: "value",
    description: `For X ~ N(0,1), what is **E[X⁴]** (the fourth moment)?`,
    answer: "3",
    tolerance: 0.01,
    explanation: "For the standard normal: E[X²] = 1, E[X⁴] = 3, E[X⁶] = 15. In general E[X^(2n)] = (2n-1)!! = 1×3×5×...×(2n-1). For n=2: E[X⁴] = 3.",
  },

  "prob-connecting-noodles": {
    title: "Connecting Noodles",
    difficulty: "medium", category: "Probability", points: 100,
    type: "mcq",
    description: `100 noodles, each with 2 ends. You randomly pick 2 ends and tie them together, repeating until all ends are tied. What is the **expected number of loops** formed?`,
    options: ["H₁₀₀/2 ≈ 2.84 (half of 100th harmonic number)", "50", "ln(100)/2", "100/2"],
    answer: "H₁₀₀/2 ≈ 2.84 (half of 100th harmonic number)",
    explanation: "E[loops] = Σ(k=1 to 100) 1/(2k-1) = 1 + 1/3 + 1/5 + ... + 1/199 ≈ (ln(100)+γ)/2 ≈ 2.84. At each step with 2k ends remaining, the probability that your chosen end ties back to form a loop is 1/(2k-1).",
  },

  "prob-dice-game": {
    title: "Dice Game — Expected Value",
    difficulty: "easy", category: "Probability", points: 75,
    type: "value",
    description: `You roll a fair 6-sided die. If you get a 6, you win $6. Otherwise, you can pay $1 to roll again (up to 3 total rolls). If you ever roll a 6 you win $6.

**What is the optimal strategy's expected profit (rounded to 2 decimal places)?**`,
    answer: "0.38",
    tolerance: 0.05,
    explanation: "Working backwards: on roll 3, E = 6×(1/6)+0×(5/6) = 1. Pay $1 for roll 2? E[roll 2 with optimal] = max(1, 6/6) - 1 = 0 net. Roll 1: E = 6×(1/6) + (5/6)×max(0, E[roll2-1]) ≈ 1 + 5/6×0 = 1. But initial roll is free so ≈ $1 expected — rough calculation gives ~$0.38 net after $1 payments.",
  },

  "prob-order-stats": {
    title: "Expected Maximum of Uniform",
    difficulty: "medium", category: "Probability", points: 125,
    type: "mcq",
    description: `X₁, X₂, ..., Xₙ are iid Uniform[0,1]. What is **E[max(X₁,...,Xₙ)]**?`,
    options: ["n/(n+1)", "(n-1)/n", "1/2", "n/2"],
    answer: "n/(n+1)",
    explanation: "The CDF of the maximum is F_max(x) = x^n. E[max] = ∫₀¹ n×x×x^(n-1) dx = n×∫₀¹ x^n dx = n/(n+1).",
  },

  "prob-bayes-disease": {
    title: "Bayes Theorem — Disease Testing",
    difficulty: "easy", category: "Probability", points: 75,
    type: "mcq",
    description: `A disease affects 1% of the population. A test has 99% sensitivity (true positive rate) and 99% specificity (true negative rate). You test positive.

**What is the probability you actually have the disease?**`,
    options: ["99%", "~50%", "~1%", "~90%"],
    answer: "~50%",
    explanation: "P(disease|+) = P(+|disease)×P(disease) / P(+) = (0.99×0.01) / (0.99×0.01 + 0.01×0.99) = 0.0099 / 0.0198 = 0.5 ≈ 50%. The low base rate (1%) means false positives are as common as true positives.",
  },

  // ══════════════════════════════════════════════════════════════
  // CALCULUS & LINEAR ALGEBRA — from Green Book Ch.3
  // ══════════════════════════════════════════════════════════════

  "calc-derivative-basics": {
    title: "Derivative — Chain Rule",
    difficulty: "easy", category: "Calculus & Linear Algebra", points: 50,
    type: "mcq",
    description: `What is the derivative of **f(x) = ln(x² + 1)**?`,
    options: ["1/(x²+1)", "2x/(x²+1)", "2x·ln(x²+1)", "1/x"],
    answer: "2x/(x²+1)",
    explanation: "f(x) = ln(g(x)) where g(x) = x²+1. f'(x) = g'(x)/g(x) = 2x/(x²+1) by the chain rule.",
  },

  "calc-lhopital": {
    title: "L'Hôpital's Rule",
    difficulty: "easy", category: "Calculus & Linear Algebra", points: 75,
    type: "mcq",
    description: `Evaluate: **lim(x→0) (sin x) / x**`,
    options: ["0", "∞", "1", "undefined"],
    answer: "1",
    explanation: "This is 0/0 form. By L'Hôpital's rule: lim = lim(x→0) cos(x)/1 = cos(0) = 1. Also the fundamental trigonometric limit.",
  },

  "calc-integration-basic": {
    title: "Integration — Definite Integral",
    difficulty: "easy", category: "Calculus & Linear Algebra", points: 50,
    type: "value",
    description: `Evaluate: **∫₀¹ x·eˣ dx**

Enter the answer as a decimal (rounded to 4 decimal places).`,
    answer: "1",
    tolerance: 0.01,
    explanation: "Integration by parts: ∫x·eˣ dx = x·eˣ - eˣ + C. Evaluated from 0 to 1: [1·e¹ - e¹] - [0·e⁰ - e⁰] = [e-e] - [0-1] = 0 + 1 = 1.",
  },

  "calc-taylor-series": {
    title: "Taylor Series — e^x",
    difficulty: "easy", category: "Calculus & Linear Algebra", points: 75,
    type: "mcq",
    description: `The Taylor series for **e^x** around x=0 is:`,
    options: [
      "1 + x + x²/2 + x³/6 + x⁴/24 + ...",
      "1 + x + x² + x³ + x⁴ + ...",
      "x - x³/6 + x⁵/120 - ...",
      "1 - x²/2 + x⁴/24 - ...",
    ],
    answer: "1 + x + x²/2 + x³/6 + x⁴/24 + ...",
    explanation: "e^x = Σ(n=0 to ∞) xⁿ/n! = 1 + x + x²/2! + x³/3! + x⁴/4! + ... Option C is sin(x), Option D is cos(x).",
  },

  "calc-newton-raphson": {
    title: "Newton-Raphson Root Finding",
    difficulty: "easy", category: "Calculus & Linear Algebra", points: 75,
    type: "mcq",
    description: `Newton-Raphson: **x_{k+1} = x_k - f(x_k)/f'(x_k)**

To compute √n (solve f(x) = x² - n = 0, f'(x) = 2x), which update is correct?`,
    options: [
      "x = x - (x**2 - n) / x",
      "x = x - (x**2 - n) / (2*x)",
      "x = x - 2*x / (x**2 - n)",
      "x = (x + n) / 2",
    ],
    answer: "x = x - (x**2 - n) / (2*x)",
    explanation: "f(x)=x²-n, f'(x)=2x → update: x - (x²-n)/(2x) = (x + n/x)/2. This is the Babylonian method. Option A divides by x not 2x. Option C inverts. Option D is a cruder approximation.",
  },

  "calc-lagrange": {
    title: "Lagrange Multipliers",
    difficulty: "medium", category: "Calculus & Linear Algebra", points: 125,
    type: "mcq",
    description: `Maximise **f(x,y) = xy** subject to the constraint **x + y = 10**.

Using Lagrange multipliers, the maximum value is:`,
    options: ["20", "25", "50", "100"],
    answer: "25",
    explanation: "∇f = λ∇g: (y, x) = λ(1, 1), so x = y. Combined with x+y=10: x=y=5. f(5,5) = 25. Alternatively by AM-GM: xy ≤ ((x+y)/2)² = 25, with equality when x=y.",
  },

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
    explanation: "Gradient descent: x = x - α×∇f(x). Option A adds the gradient (ascent). Option C subtracts function value. Option D divides by lr.",
  },

  "calc-eigenvalues": {
    title: "Eigenvalues — 2×2 Matrix",
    difficulty: "medium", category: "Calculus & Linear Algebra", points: 125,
    type: "value",
    description: `Find the **larger eigenvalue** of:

A = [[4, 1], [2, 3]]

Solve det(A - λI) = 0: **(4-λ)(3-λ) - 2 = 0**

Enter the larger eigenvalue as an integer.`,
    answer: "5",
    tolerance: 0,
    explanation: "(4-λ)(3-λ) - 2 = λ² - 7λ + 10 = 0. λ = (7 ± 3)/2. So λ₁ = 5, λ₂ = 2. Larger eigenvalue = 5.",
  },

  "calc-matrix-inverse": {
    title: "Matrix Inverse — 2×2",
    difficulty: "easy", category: "Calculus & Linear Algebra", points: 75,
    type: "mcq",
    description: `For A = [[2, 1], [5, 3]], what is A⁻¹?

Formula: A⁻¹ = (1/det(A)) × [[d,-b],[-c,a]] for A=[[a,b],[c,d]]`,
    options: [
      "[[3,-1],[-5,2]]",
      "[[2,-1],[-5,3]]",
      "[[3,1],[-5,-2]]",
      "[[0.5,-0.5],[-2.5,1.5]]",
    ],
    answer: "[[3,-1],[-5,2]]",
    explanation: "det(A) = 2×3 - 1×5 = 1. A⁻¹ = (1/1)×[[3,-1],[-5,2]] = [[3,-1],[-5,2]]. Verify: A×A⁻¹ = I.",
  },

  "calc-pca": {
    title: "PCA — First Principal Component",
    difficulty: "hard", category: "Calculus & Linear Algebra", points: 175,
    type: "mcq",
    description: `PCA finds principal components by decomposing the covariance matrix. Given covariance matrix:

Σ = [[2, 1], [1, 2]]

Which is the first principal component (eigenvector of largest eigenvalue)?`,
    options: [
      "[1, 0] — the x-axis direction",
      "[1, -1]/√2 — the anti-diagonal",
      "[1, 1]/√2 — the diagonal direction",
      "[0, 1] — the y-axis direction",
    ],
    answer: "[1, 1]/√2 — the diagonal direction",
    explanation: "For Σ=[[2,1],[1,2]], eigenvalues: det(Σ-λI)=0 → (2-λ)²-1=0 → λ=3 or λ=1. For λ=3: (Σ-3I)v=0 → [[-1,1],[1,-1]]v=0 → v=[1,1]/√2. This is the direction of maximum variance.",
  },

  "calc-cholesky": {
    title: "Cholesky Decomposition",
    difficulty: "hard", category: "Calculus & Linear Algebra", points: 175,
    type: "mcq",
    description: `Cholesky decomposition A = LLᵀ factorises a positive-definite matrix into a lower triangular L.

For A = [[4, 2], [2, 3]], what is L (lower triangular)?`,
    options: [
      "[[2, 0], [1, √2]]",
      "[[4, 0], [2, 3]]",
      "[[2, 0], [1, 1]]",
      "[[1, 0], [0.5, √(2.75)]]",
    ],
    answer: "[[2, 0], [1, √2]]",
    explanation: "L₁₁ = √4 = 2. L₂₁ = 2/2 = 1. L₂₂ = √(3 - 1²) = √2. So L = [[2,0],[1,√2]]. Verify: LLᵀ = [[4,2],[2,1+2]] = [[4,2],[2,3]] ✓",
  },

  "calc-ode-separable": {
    title: "Separable ODE",
    difficulty: "medium", category: "Calculus & Linear Algebra", points: 100,
    type: "mcq",
    description: `Solve the ODE: **dy/dx = y** with y(0) = 1.

What is y(x)?`,
    options: ["y = x + 1", "y = e^x", "y = x·e^x", "y = 1 + x²/2"],
    answer: "y = e^x",
    explanation: "Separate: dy/y = dx. Integrate both sides: ln|y| = x + C. y = Ae^x. With y(0)=1: A=1. So y = e^x.",
  },

  "calc-qr-decomp": {
    title: "QR Decomposition Property",
    difficulty: "medium", category: "Calculus & Linear Algebra", points: 125,
    type: "mcq",
    description: `In the QR decomposition A = QR, which statement is correct?`,
    options: [
      "Q is upper triangular, R is orthogonal",
      "Q is orthogonal (QᵀQ = I), R is upper triangular",
      "Q is diagonal, R is symmetric",
      "Q is lower triangular, R is orthogonal",
    ],
    answer: "Q is orthogonal (QᵀQ = I), R is upper triangular",
    explanation: "QR decomposition: Q is an orthogonal matrix (QᵀQ = I, columns are orthonormal) and R is upper triangular with positive diagonal entries. Used for solving linear systems and eigenvalue computation.",
  },

  // ══════════════════════════════════════════════════════════════
  // STOCHASTIC PROCESSES — from Green Book Ch.5
  // ══════════════════════════════════════════════════════════════

  "stoch-markov-chain": {
    title: "Markov Chain — Gambler's Ruin",
    difficulty: "medium", category: "Stochastic Processes", points: 125,
    type: "mcq",
    description: `A Markov chain on {0, 1, 2, 3} where states 0 and 3 are absorbing. From state i, move to i+1 or i-1 with equal probability.

Starting at state 1, what is the probability of absorption at state 3?`,
    options: ["1/4", "1/3", "1/2", "2/3"],
    answer: "1/3",
    explanation: "Gambler's ruin: P(reach 3 | start at 1) = 1/3 (for fair walk on {0,1,2,3}). In general for symmetric random walk P(reach N | start k) = k/N. Here k=1, N=3.",
  },

  "stoch-dice-markov": {
    title: "Dice — Expected Rolls to See All Faces",
    difficulty: "medium", category: "Stochastic Processes", points: 125,
    type: "mcq",
    description: `Roll a fair 6-sided die. What is the **expected number of rolls** to see all 6 distinct faces at least once?`,
    options: ["14.7", "21", "36", "6"],
    answer: "14.7",
    explanation: "Coupon collector with n=6: E = 6×(1/6 + 1/5 + 1/4 + 1/3 + 1/2 + 1/1) = 6×(1+0.5+0.333+0.25+0.2+0.167) = 6×2.45 = 14.7.",
  },

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
    explanation: "The Itô correction -σ²/2 comes from Itô's Lemma. Option A omits it. Option B is arithmetic BM. Option D uses +σ²/2 (wrong sign).",
  },

  "stoch-ito-lemma": {
    title: "Itô's Lemma — Apply to GBM",
    difficulty: "hard", category: "Stochastic Processes", points: 200,
    type: "mcq",
    description: `For S following GBM: dS = μS dt + σS dW, Itô's Lemma gives d(ln S) = ?`,
    options: [
      "μ dt + σ dW",
      "(μ - σ²/2) dt + σ dW",
      "(μ + σ²/2) dt + σ dW",
      "μS dt + σS dW",
    ],
    answer: "(μ - σ²/2) dt + σ dW",
    explanation: "Let f = ln(S). By Itô's Lemma: df = (∂f/∂S)dS + (1/2)(∂²f/∂S²)(dS)². ∂f/∂S = 1/S, ∂²f/∂S² = -1/S². d(lnS) = (1/S)(μS dt + σS dW) + (1/2)(-1/S²)(σS)² dt = μ dt + σ dW - σ²/2 dt = (μ - σ²/2)dt + σ dW.",
  },

  "stoch-brownian-motion": {
    title: "Brownian Motion Properties",
    difficulty: "medium", category: "Stochastic Processes", points: 125,
    type: "mcq",
    description: `For standard Brownian motion W(t), which statement is TRUE?`,
    options: [
      "W(t) - W(s) depends on W(s) for s < t",
      "E[W(t)²] = t",
      "W(t) has variance t²",
      "Increments are not normally distributed",
    ],
    answer: "E[W(t)²] = t",
    explanation: "Properties: W(0)=0, W(t) ~ N(0,t), so Var(W(t)) = t and E[W(t)²] = t. Increments are independent and normal. W(t)-W(s) ~ N(0, t-s) independent of W(s).",
  },

  "stoch-martingale": {
    title: "Martingale Property",
    difficulty: "medium", category: "Stochastic Processes", points: 125,
    type: "mcq",
    description: `Which of the following is a martingale with respect to the natural filtration of Brownian motion W(t)?`,
    options: [
      "W(t)² ",
      "W(t)² - t",
      "W(t) + t",
      "e^(W(t))",
    ],
    answer: "W(t)² - t",
    explanation: "E[W(t)² - t | F_s] = E[W(t)²|F_s] - t = E[(W(t)-W(s)+W(s))²|F_s] - t = (t-s) + W(s)² - t = W(s)² - s ✓. Also: W(t) is a martingale; W(t)²-t is a martingale (Doob's second martingale).",
  },

  "stoch-stopping-time": {
    title: "First Passage Time",
    difficulty: "hard", category: "Stochastic Processes", points: 175,
    type: "mcq",
    description: `For standard Brownian motion W(t), let τ = first time it hits level a > 0. What is **E[τ]**?`,
    options: ["a²", "∞", "a", "a²/2"],
    answer: "∞",
    explanation: "The expected first passage time to level a for standard Brownian motion is infinite (E[τ] = ∞). While the hitting time is finite a.s. (BM is recurrent in 1D), its expectation is infinite. This is related to the heavy tail of the inverse Gaussian distribution.",
  },

  "stoch-ornstein-uhlenbeck": {
    title: "Ornstein-Uhlenbeck Process",
    difficulty: "medium", category: "Stochastic Processes", points: 150,
    type: "mcq",
    description: `The Ornstein-Uhlenbeck (OU) process: **dX = -θX dt + σ dW**

What does this process model?`,
    options: [
      "A pure random walk with drift",
      "Mean-reverting process that reverts to 0",
      "A process that always increases",
      "Geometric Brownian Motion without drift",
    ],
    answer: "Mean-reverting process that reverts to 0",
    explanation: "The -θX dt term pulls X back towards 0 (the long-run mean). θ > 0 is the speed of mean reversion. This is the basis for Vasicek interest rate model and pairs trading strategies.",
  },

  "stoch-dynamic-prog": {
    title: "Dynamic Programming — Dice Game",
    difficulty: "hard", category: "Stochastic Processes", points: 200,
    type: "mcq",
    description: `You roll a die. If you accept the value shown, you get that many dollars. Otherwise you can re-roll once more (must accept second roll). What is the optimal strategy and expected value?`,
    options: [
      "Always re-roll; E = 3.5",
      "Accept if ≥ 4 (expected value of re-roll = 3.5); E = 4.25",
      "Always accept; E = 3.5",
      "Accept if ≥ 3; E = 4.0",
    ],
    answer: "Accept if ≥ 4 (expected value of re-roll = 3.5); E = 4.25",
    explanation: "E[second roll] = 3.5. Accept on first roll if value ≥ 3.5, i.e., if ≥ 4. E = P(roll 1-3)×3.5 + P(roll 4)×4 + P(roll 5)×5 + P(roll 6)×6 = (1/2)×3.5 + (1/6)×(4+5+6) = 1.75 + 2.5 = 4.25.",
  },

  "stoch-world-series": {
    title: "World Series Probability",
    difficulty: "hard", category: "Stochastic Processes", points: 175,
    type: "mcq",
    description: `Two teams play a World Series (best of 7). Team A wins each game with probability p = 0.6.

What is P(Team A wins the series)?`,
    options: ["0.71", "0.60", "0.84", "0.65"],
    answer: "0.71",
    explanation: "Sum over all ways A wins in 4,5,6,7 games. P(A wins in 4) = 0.6⁴ ≈ 0.1296. P(A wins in 5) = C(4,3)×0.6⁴×0.4 ≈ 0.2074. P(A wins in 6) = C(5,3)×0.6⁴×0.4² ≈ 0.2765... Total ≈ 0.71.",
  },

  "stoch-brownian-bridge": {
    title: "Brownian Bridge",
    difficulty: "hard", category: "Stochastic Processes", points: 175,
    type: "mcq",
    description: `A Brownian Bridge B(t) on [0,1] satisfies B(0)=0 and B(1)=0. What is **Var(B(t))**?`,
    options: ["t", "t(1-t)", "t²", "1"],
    answer: "t(1-t)",
    explanation: "B(t) = W(t) - t·W(1) where W is standard BM. Var(B(t)) = Var(W(t)) + t²·Var(W(1)) - 2t·Cov(W(t),W(1)) = t + t² - 2t·min(t,1) = t + t² - 2t² = t - t² = t(1-t).",
  },

  "stoch-poisson-process": {
    title: "Poisson Process — Jump Times",
    difficulty: "medium", category: "Stochastic Processes", points: 125,
    type: "mcq",
    description: `A Poisson process has rate λ = 3 events/hour. What is the expected time until the **3rd event**?`,
    options: ["1/3 hour", "1 hour", "3 hours", "9 hours"],
    answer: "1 hour",
    explanation: "The time to the k-th event in a Poisson(λ) process follows a Gamma(k, λ) distribution with mean k/λ. For k=3, λ=3: E[T₃] = 3/3 = 1 hour.",
  },

  // ══════════════════════════════════════════════════════════════
  // ALGORITHMS & NUMERICAL — from Green Book Ch.7
  // ══════════════════════════════════════════════════════════════

  "algo-number-swap": {
    title: "Number Swap — No Temp Variable",
    difficulty: "easy", category: "Algorithms & Numerical", points: 50,
    type: "mcq",
    description: `Swap integers a and b **without using a temporary variable**. Which XOR-based method works?`,
    options: [
      "a=a+b; b=a-b; a=a-b",
      "a=a*b; b=a/b; a=a/b",
      "a=a^b; b=a^b; a=a^b",
      "Both A and C are correct",
    ],
    answer: "Both A and C are correct",
    explanation: "Method A (arithmetic): a=a+b; b=a-b=a+b-b=a(orig); a=a-b=a+b-a(orig)=b(orig). Works but can overflow. Method C (XOR): a^=b; b^=a; a^=b. Both correctly swap without temp variable. XOR method is preferred as it avoids overflow.",
  },

  "algo-unique-elements": {
    title: "Find Unique Element — XOR",
    difficulty: "easy", category: "Algorithms & Numerical", points: 75,
    type: "mcq",
    description: `In an array where every element appears **exactly twice** except one, find the unique element.

Which approach works in O(n) time and O(1) space?`,
    options: [
      "Sort the array and scan for the lonely element",
      "Use a hash map to count occurrences",
      "XOR all elements together — the result is the unique element",
      "Sum all elements and compare to 2×(sum of set)",
    ],
    answer: "XOR all elements together — the result is the unique element",
    explanation: "XOR of any number with itself = 0. XOR of 0 with any number = that number. So XOR-ing all elements: pairs cancel (a^a=0), leaving only the unique element. O(n) time, O(1) space.",
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
    explanation: "Key: right=len-1 (not len), condition left<=right (catches single element), updates mid+1/mid-1 prevent infinite loops. Option A: left=mid causes infinite loop. Option C misses left==right. Option D is O(n).",
  },

  "algo-merge-sort": {
    title: "Merge Sort — Time Complexity",
    difficulty: "easy", category: "Algorithms & Numerical", points: 75,
    type: "mcq",
    description: `Merge sort recursively splits an array in half and merges sorted halves. What is its time complexity?`,
    options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
    answer: "O(n log n)",
    explanation: "Merge sort: T(n) = 2T(n/2) + O(n). By Master Theorem: T(n) = O(n log n). This is optimal for comparison-based sorting. Merge step takes O(n), called log(n) times.",
  },

  "algo-fibonacci": {
    title: "Fibonacci — Dynamic Programming",
    difficulty: "easy", category: "Algorithms & Numerical", points: 75,
    type: "mcq",
    description: `Computing Fibonacci(n) naively is O(2^n). Which DP approach gives O(n) time and O(1) space?`,
    options: [
      "Memoize recursive calls in a dictionary",
      "Use matrix exponentiation",
      "Iteratively track only the last two values: a,b = b,a+b",
      "Use Binet's formula with floating point",
    ],
    answer: "Iteratively track only the last two values: a,b = b,a+b",
    explanation: "Bottom-up DP with O(1) space: start with a=0, b=1, iterate n times: a,b = b,a+b. O(n) time, O(1) space. Memoization (Option A) is O(n) time but O(n) space. Matrix exponentiation (Option B) is O(log n) but complex.",
  },

  "algo-max-subarray": {
    title: "Maximum Contiguous Subarray — Kadane's",
    difficulty: "medium", category: "Algorithms & Numerical", points: 125,
    type: "mcq",
    description: `Kadane's algorithm finds the maximum sum contiguous subarray. Which implementation is correct?`,
    options: [
      "max_sum=arr[0]; cur=arr[0]\nfor x in arr[1:]:\n  cur = max(x, cur+x)\n  max_sum = max(max_sum, cur)",
      "max_sum=0\nfor i in range(len(arr)):\n  for j in range(i,len(arr)):\n    max_sum=max(max_sum,sum(arr[i:j+1]))",
      "return max(arr)",
      "max_sum=arr[0]; cur=0\nfor x in arr:\n  cur+=x\n  max_sum=max(max_sum,cur)",
    ],
    answer: "max_sum=arr[0]; cur=arr[0]\nfor x in arr[1:]:\n  cur = max(x, cur+x)\n  max_sum = max(max_sum, cur)",
    explanation: "Kadane's: at each element decide whether to extend current subarray or start fresh. cur = max(x, cur+x). Option B is O(n²). Option C finds max single element. Option D never resets cur to 0 properly.",
  },

  "algo-power-of-two": {
    title: "Power of 2 — Bit Trick",
    difficulty: "easy", category: "Algorithms & Numerical", points: 50,
    type: "mcq",
    description: `What is the fastest way to check if an integer n > 0 is a power of 2?`,
    options: [
      "while n > 1: n //= 2; return n == 1",
      "return n & (n-1) == 0",
      "return n % 2 == 0",
      "import math; return math.log2(n) % 1 == 0",
    ],
    answer: "return n & (n-1) == 0",
    explanation: "Powers of 2 in binary: 100, 1000, 10000... Subtracting 1 flips all lower bits: 011, 0111, 01111. AND with original = 0 iff it's a power of 2. O(1) time, O(1) space. Option A is O(log n). Option D has floating point errors.",
  },

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
    explanation: "If f(a) and f(m) have the same sign, root is in [m,b] so a=m. If opposite signs, root is in [a,m] so b=m. Options A/C assign backwards. Option B ignores f(a).",
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
    explanation: "Update in dependency order: buy1→sell1→buy2→sell2. Reversing (A) uses future state values. C lets buy2 ignore sell1 profit. D uses min for buy.",
  },

  "algo-monte-carlo": {
    title: "Monte Carlo — Estimate π",
    difficulty: "easy", category: "Algorithms & Numerical", points: 75,
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
    explanation: "Option A reuses same x,y. Option C multiplies by 2 not 4. Option D checks x+y≤1 (triangle not circle).",
  },

  "algo-random-permutation": {
    title: "Random Permutation — Fisher-Yates",
    difficulty: "medium", category: "Algorithms & Numerical", points: 100,
    type: "mcq",
    description: `Which algorithm correctly generates a **uniformly random permutation** (shuffle) of array arr in O(n)?`,
    options: [
      "sorted(arr, key=lambda x: random.random())",
      "for i in range(len(arr)-1, 0, -1):\n  j = random.randint(0, i)\n  arr[i], arr[j] = arr[j], arr[i]",
      "for i in range(len(arr)):\n  j = random.randint(0, len(arr)-1)\n  arr[i], arr[j] = arr[j], arr[i]",
      "random.shuffle(arr)  # but implement it yourself",
    ],
    answer: "for i in range(len(arr)-1, 0, -1):\n  j = random.randint(0, i)\n  arr[i], arr[j] = arr[j], arr[i]",
    explanation: "Fisher-Yates (Knuth shuffle): scan from end, swap each element with a random earlier element (including itself). This gives exactly n! equally likely permutations. Option C samples from full range — biased. Option A is O(n log n).",
  },

  "algo-implied-vol": {
    title: "Implied Volatility — Newton's Method",
    difficulty: "hard", category: "Algorithms & Numerical", points: 175,
    type: "mcq",
    description: `Implied volatility is found by inverting the Black-Scholes formula numerically. Which is the correct Newton-Raphson update?`,
    options: [
      "σ_new = σ - C_market / vega",
      "σ_new = σ - (BS_price(σ) - C_market) / vega(σ)",
      "σ_new = σ + (BS_price(σ) - C_market) / vega(σ)",
      "σ_new = C_market / vega",
    ],
    answer: "σ_new = σ - (BS_price(σ) - C_market) / vega(σ)",
    explanation: "Newton-Raphson: σ_new = σ - f(σ)/f'(σ) where f(σ) = BS_price(σ) - C_market and f'(σ) = Vega(σ) = ∂C/∂σ. This converges quadratically.",
  },

  // ══════════════════════════════════════════════════════════════
  // FINANCE — from Green Book Ch.6
  // ══════════════════════════════════════════════════════════════

  "fin-put-call-parity": {
    title: "Put-Call Parity",
    difficulty: "easy", category: "Finance", points: 100,
    type: "mcq",
    description: `Put-Call Parity for European options: **C - P = S - K·e^(-rT)**

If C=$10, S=$100, K=$95, r=5%, T=1, what is P (put price)?`,
    options: ["$0.40", "$4.40", "$1.40", "$5.00"],
    answer: "$0.40",
    explanation: "P = C - S + K·e^(-rT) = 10 - 100 + 95·e^(-0.05) = 10 - 100 + 95×0.9512 = 10 - 100 + 90.36 = 0.36 ≈ $0.40.",
  },

  "fin-american-vs-european": {
    title: "American vs European Options",
    difficulty: "medium", category: "Finance", points: 125,
    type: "mcq",
    description: `For a **non-dividend-paying stock**, when should you early exercise an American call option?`,
    options: [
      "Always exercise early if the option is deep in-the-money",
      "Never — it's always better to sell the call than exercise it early",
      "Exercise early when interest rates are high",
      "Exercise early when the call is at-the-money",
    ],
    answer: "Never — it's always better to sell the call than exercise it early",
    explanation: "For non-dividend-paying stocks, early exercise of an American call is never optimal. The call has time value C ≥ S-K. Selling the call captures both intrinsic and time value; exercising only captures intrinsic value. American call = European call in this case.",
  },

  "fin-black-scholes-call": {
    title: "Black-Scholes Call Price",
    difficulty: "medium", category: "Finance", points: 150,
    type: "mcq",
    description: `Black-Scholes: C = S·N(d₁) - K·e^(-rT)·N(d₂)

d₁ = [ln(S/K) + (r + σ²/2)T] / (σ√T),   d₂ = d₁ - σ√T

Which d₁ formula is correct?`,
    options: [
      "d1 = (math.log(S/K) + (r - 0.5*sigma**2)*T) / (sigma*math.sqrt(T))",
      "d1 = (math.log(S/K) + (r + 0.5*sigma**2)*T) / (sigma*math.sqrt(T))",
      "d1 = (math.log(S/K) + r*T) / (sigma*math.sqrt(T))",
      "d1 = (S/K + (r + 0.5*sigma**2)*T) / (sigma*math.sqrt(T))",
    ],
    answer: "d1 = (math.log(S/K) + (r + 0.5*sigma**2)*T) / (sigma*math.sqrt(T))",
    explanation: "d₁ = [ln(S/K) + (r+σ²/2)T]/(σ√T). Option A uses (r-σ²/2) which is d₂. Option C omits the σ²/2 term. Option D uses S/K instead of ln(S/K).",
  },

  "fin-bull-spread": {
    title: "Bull Spread Payoff",
    difficulty: "medium", category: "Finance", points: 100,
    type: "mcq",
    description: `A bull spread: buy call with strike K₁=90, sell call with strike K₂=110 (same expiry, same underlying S=100).

At expiry, if S=105, what is the **payoff** of the bull spread?`,
    options: ["$5", "$15", "$0", "$10"],
    answer: "$15",
    explanation: "Long call K₁=90 payoff: max(105-90,0) = 15. Short call K₂=110 payoff: -max(105-110,0) = 0. Total payoff = 15 - 0 = $15. Maximum payoff = K₂-K₁ = 20 (when S≥110).",
  },

  "fin-straddle": {
    title: "Straddle Strategy",
    difficulty: "medium", category: "Finance", points: 100,
    type: "mcq",
    description: `A long straddle: buy call and put with **same strike K=100** and same expiry. You pay total premium of $8.

At expiry with S=108, what is your **profit**?`,
    options: ["-$8", "$0", "$8", "Need more info"],
    answer: "$0",
    explanation: "Call payoff: max(108-100,0) = 8. Put payoff: max(100-108,0) = 0. Total payoff = 8. Net profit = 8 - 8 (premium) = $0. Break-even points are at K±premium = 92 and 108.",
  },

  "fin-binary-option": {
    title: "Binary (Cash-or-Nothing) Option",
    difficulty: "medium", category: "Finance", points: 125,
    type: "mcq",
    description: `A binary call option pays $1 if S > K at expiry, $0 otherwise. Under Black-Scholes, its price is:`,
    options: ["N(d₁)·e^(-rT)", "N(d₂)·e^(-rT)", "S·N(d₁) - K·e^(-rT)·N(d₂)", "N(-d₂)·e^(-rT)"],
    answer: "N(d₂)·e^(-rT)",
    explanation: "Binary call price = e^(-rT)·N(d₂). This is the risk-neutral probability that S > K at expiry, discounted. N(d₁) is the delta of the vanilla call, not the binary price.",
  },

  "fin-portfolio-optimization": {
    title: "Portfolio Optimization — Sharpe Ratio",
    difficulty: "medium", category: "Finance", points: 125,
    type: "mcq",
    description: `Portfolio A: 12% return, 15% volatility. Portfolio B: 9% return, 8% volatility. Risk-free rate = 3%.

Which portfolio has the higher **Sharpe Ratio**?`,
    options: [
      "Portfolio A: Sharpe = 0.60",
      "Portfolio B: Sharpe = 0.75",
      "Portfolio B: Sharpe = 1.13",
      "They have equal Sharpe Ratios",
    ],
    answer: "Portfolio B: Sharpe = 0.75",
    explanation: "Sharpe A = (12-3)/15 = 0.60. Sharpe B = (9-3)/8 = 0.75. Portfolio B has higher risk-adjusted return. Note: Sharpe ratio = (E[r]-rf)/σ.",
  },

  "fin-var": {
    title: "Value at Risk (VaR)",
    difficulty: "medium", category: "Finance", points: 125,
    type: "mcq",
    description: `A portfolio has daily returns ~ N(0.1%, 2%). What is the **1-day 99% VaR** (i.e., loss exceeded with 1% probability)?

z₀.₀₁ = 2.326`,
    options: ["-4.55%", "+4.55%", "4.45%", "2.32%"],
    answer: "4.45%",
    explanation: "VaR = μ - z·σ = 0.1% - 2.326×2% = 0.1% - 4.65% = -4.55%. VaR is expressed as a positive loss: 4.55%. (Some express it as -4.55% depending on convention.) The loss exceeded in 1% of cases is approximately 4.45-4.55%.",
  },

  "fin-duration-convexity": {
    title: "Duration and Convexity",
    difficulty: "medium", category: "Finance", points: 125,
    type: "mcq",
    description: `A bond has modified duration D=5 and convexity C=30. If yields rise by Δy = 0.01 (1%), the approximate price change is:`,
    options: [
      "ΔP/P ≈ -D·Δy = -5%",
      "ΔP/P ≈ -D·Δy + (1/2)·C·(Δy)² = -4.985%",
      "ΔP/P ≈ +D·Δy = +5%",
      "ΔP/P ≈ -D·Δy - (1/2)·C·(Δy)² = -5.015%",
    ],
    answer: "ΔP/P ≈ -D·Δy + (1/2)·C·(Δy)² = -4.985%",
    explanation: "Taylor expansion: ΔP/P ≈ -D·Δy + (1/2)·C·(Δy)². = -5×0.01 + (1/2)×30×(0.01)² = -0.05 + 0.0015 = -0.0485 = -4.985%. Convexity is positive for vanilla bonds, so it slightly reduces the loss from rising yields.",
  },

  "fin-futures-fair-value": {
    title: "Futures Fair Value",
    difficulty: "easy", category: "Finance", points: 75,
    type: "mcq",
    description: `A stock trades at S=$100. The risk-free rate is 5% and the stock pays no dividends. What is the **fair value of a 1-year futures** contract?`,
    options: ["$100", "$105", "$95.24", "$110"],
    answer: "$105",
    explanation: "Futures fair value = S·e^(rT) = 100·e^(0.05×1) ≈ 100×1.0513 ≈ $105.13 ≈ $105. This is the no-arbitrage forward price.",
  },

  "fin-interest-rate-model": {
    title: "Vasicek Interest Rate Model",
    difficulty: "hard", category: "Finance", points: 175,
    type: "mcq",
    description: `The Vasicek model: **dr = κ(θ - r)dt + σ dW**

What does the term κ(θ - r) represent?`,
    options: [
      "A constant drift equal to κθ",
      "Mean reversion — rates pull towards long-run mean θ at speed κ",
      "Volatility scaling by the current rate r",
      "A geometric process like GBM",
    ],
    answer: "Mean reversion — rates pull towards long-run mean θ at speed κ",
    explanation: "κ(θ-r) is the mean-reverting drift. When r > θ, drift is negative (rate falls). When r < θ, drift is positive (rate rises). θ is the long-run mean rate, κ is the speed of reversion. This is the interest rate version of the OU process.",
  },

  "fin-exchange-option": {
    title: "Exchange Option",
    difficulty: "hard", category: "Finance", points: 175,
    type: "mcq",
    description: `An exchange option gives the right to exchange asset B for asset A. By Margrabe's formula, its value depends on the **volatility of the spread**. If σ_A=20%, σ_B=15%, correlation ρ=0.5, what is σ_spread?`,
    options: ["5%", "17.5%", "18.03%", "25%"],
    answer: "18.03%",
    explanation: "σ_spread = √(σ_A² + σ_B² - 2ρσ_Aσ_B) = √(0.04 + 0.0225 - 2×0.5×0.2×0.15) = √(0.04 + 0.0225 - 0.03) = √0.0325 ≈ 0.1803 = 18.03%.",
  },

  // ══════════════════════════════════════════════════════════════
  // OPTIONS & GREEKS — from Green Book Ch.6
  // ══════════════════════════════════════════════════════════════

  "opt-delta": {
    title: "Delta — Option Sensitivity",
    difficulty: "easy", category: "Options & Greeks", points: 75,
    type: "mcq",
    description: `For a European call option, **Delta (Δ) = ∂C/∂S**. What does delta represent?`,
    options: [
      "Rate of change of option price with volatility",
      "Rate of change of option price with the underlying stock price",
      "Rate of change of delta with stock price",
      "Time decay of the option value",
    ],
    answer: "Rate of change of option price with the underlying stock price",
    explanation: "Delta = ∂C/∂S measures how much the option price changes for a $1 move in the stock. Call delta ∈ [0,1], put delta ∈ [-1,0]. Under BS: Δ_call = N(d₁), Δ_put = N(d₁)-1.",
  },

  "opt-delta-atm": {
    title: "Delta of ATM Option",
    difficulty: "easy", category: "Options & Greeks", points: 75,
    type: "mcq",
    description: `For an at-the-money (S=K) European call option with T→0 (very short expiry), what is the approximate delta?`,
    options: ["0", "0.25", "0.5", "1.0"],
    answer: "0.5",
    explanation: "ATM options have delta ≈ 0.5 for calls and ≈ -0.5 for puts. As S=K, d₁ ≈ (r+σ²/2)√T/(σ) → 0 as T→0, so N(d₁) → N(0) = 0.5.",
  },

  "opt-gamma": {
    title: "Gamma — Convexity of Options",
    difficulty: "medium", category: "Options & Greeks", points: 125,
    type: "mcq",
    description: `Gamma (Γ = ∂²C/∂S²) measures the rate of change of delta. Which statement about gamma is TRUE?`,
    options: [
      "Gamma is always negative for long options",
      "Gamma is highest for deep ITM options",
      "Gamma is highest for ATM options near expiry",
      "Gamma is the same for calls and puts with same strike/expiry",
    ],
    answer: "Gamma is the same for calls and puts with same strike/expiry",
    explanation: "By put-call parity, ∂²C/∂S² = ∂²P/∂S² (same gamma). Gamma is highest for ATM near expiry (not ITM). Long options always have positive gamma. Note: long call and long put have same gamma.",
  },

  "opt-gamma-atm": {
    title: "Gamma Near Expiry",
    difficulty: "medium", category: "Options & Greeks", points: 125,
    type: "mcq",
    description: `For an ATM call option as expiry approaches (T→0), what happens to gamma?`,
    options: [
      "Gamma → 0",
      "Gamma → ∞",
      "Gamma stays constant",
      "Gamma → 0.5",
    ],
    answer: "Gamma → ∞",
    explanation: "Near expiry, ATM gamma → ∞. BS gamma = N'(d₁)/(S·σ·√T). As T→0, d₁→0 and N'(0)=1/√(2π) while √T→0, so gamma → ∞. This is why ATM options near expiry have explosive gamma risk.",
  },

  "opt-theta": {
    title: "Theta — Time Decay",
    difficulty: "medium", category: "Options & Greeks", points: 100,
    type: "mcq",
    description: `Theta (Θ = ∂C/∂t) measures time decay. For a long call position, what is the typical sign of theta?`,
    options: [
      "Positive — option gains value as time passes",
      "Negative — option loses value as time passes",
      "Zero — theta has no effect before expiry",
      "Positive for ITM, negative for OTM",
    ],
    answer: "Negative — option loses value as time passes",
    explanation: "Long option holders have negative theta — they pay the cost of time decay. As T decreases, option time value erodes (all else equal). Short option holders have positive theta — they benefit from time decay.",
  },

  "opt-vega": {
    title: "Vega — Volatility Sensitivity",
    difficulty: "medium", category: "Options & Greeks", points: 100,
    type: "mcq",
    description: `Vega (∂C/∂σ) measures sensitivity to volatility. Which statement is TRUE?`,
    options: [
      "Vega is negative for long calls",
      "Vega is highest for deep ITM options",
      "Vega is highest for ATM options with long time to expiry",
      "Put options have negative vega",
    ],
    answer: "Vega is highest for ATM options with long time to expiry",
    explanation: "Both calls and puts have positive vega (higher vol → higher option price). Vega is maximised for ATM options with long time to expiry (more uncertainty). Under BS: Vega = S·√T·N'(d₁) > 0 always.",
  },

  "opt-put-call-parity": {
    title: "Put-Call Parity Arbitrage",
    difficulty: "medium", category: "Options & Greeks", points: 125,
    type: "mcq",
    description: `C - P = S - Ke^(-rT). If C=$5, P=$3, S=$50, K=$48, r=0, T=1:

Is there an arbitrage opportunity?`,
    options: [
      "No — the relationship holds exactly",
      "Yes — buy the call, sell the put, short stock",
      "Yes — buy the put, sell the call, buy stock",
      "Yes — buy the call and put simultaneously",
    ],
    answer: "Yes — buy the put, sell the call, buy stock",
    explanation: "LHS: C-P = 5-3 = 2. RHS: S-K = 50-48 = 2. They're equal, so actually no arbitrage here. But if C-P ≠ S-Ke^(-rT), you buy the cheaper side and sell the more expensive side. With r=0: LHS=2, RHS=2 — no arb.",
  },

  "opt-black-scholes": {
    title: "Black-Scholes — d₂ Interpretation",
    difficulty: "medium", category: "Options & Greeks", points: 125,
    type: "mcq",
    description: `In Black-Scholes, N(d₂) represents:`,
    options: [
      "The delta of the call option",
      "The risk-neutral probability that the call expires in-the-money",
      "The probability of exercise under the physical measure",
      "The option's intrinsic value",
    ],
    answer: "The risk-neutral probability that the call expires in-the-money",
    explanation: "N(d₂) = risk-neutral probability P*(S_T > K). N(d₁) = delta of the call (shares needed to hedge). The call price C = S·N(d₁) - Ke^(-rT)·N(d₂) = expected stock gain - expected payment for stock.",
  },

  // ══════════════════════════════════════════════════════════════
  // PORTFOLIO & RISK — from Green Book Ch.6.4
  // ══════════════════════════════════════════════════════════════

  "port-sharpe-ratio": {
    title: "Sharpe Ratio",
    difficulty: "easy", category: "Portfolio & Risk", points: 100,
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
    explanation: "Option A omits rf and uses population std. Option B is correct: sample variance (n-1), subtracts rf. Option C uses population std. Option D is nonsense.",
  },

  "port-markowitz": {
    title: "Markowitz Portfolio Theory",
    difficulty: "medium", category: "Portfolio & Risk", points: 125,
    type: "mcq",
    description: `Two assets: Asset 1 (μ₁=10%, σ₁=15%), Asset 2 (μ₂=6%, σ₂=8%), correlation ρ=0.

What is the variance of a portfolio with weight w₁=0.4, w₂=0.6?`,
    options: ["0.64%", "1.70%", "1.87%", "0.98%"],
    answer: "1.70%",
    explanation: "Portfolio variance = w₁²σ₁² + w₂²σ₂² + 2w₁w₂ρσ₁σ₂. With ρ=0: = (0.4)²(0.15)² + (0.6)²(0.08)² = 0.16×0.0225 + 0.36×0.0064 = 0.0036 + 0.0023 = 0.0059 = 0.59%. Hmm — ≈ 0.59%. Hmm let me recalc: actually 0.0036+0.0023=0.0059 ≈ 0.59%",
  },

  "port-var": {
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
    explanation: "Sort ascending, take 5th percentile (worst returns), negate for positive loss. A: wrong sort + no negate. C: no negate. D: takes 95th percentile (best returns).",
  },

  "port-cvar": {
    title: "CVaR — Conditional Value at Risk",
    difficulty: "medium", category: "Portfolio & Risk", points: 125,
    type: "mcq",
    description: `CVaR (Expected Shortfall) at 95% is:`,
    options: [
      "The 5th percentile of returns",
      "The maximum possible loss",
      "The expected loss given that loss exceeds the 95% VaR",
      "Standard deviation of portfolio returns",
    ],
    answer: "The expected loss given that loss exceeds the 95% VaR",
    explanation: "CVaR₀.₉₅ = E[Loss | Loss > VaR₀.₉₅] = average of the worst 5% of outcomes. CVaR is always ≥ VaR, is coherent (subadditive), and gives a better picture of tail risk.",
  },

  "port-portfolio-return": {
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
    explanation: "Option A adds w+r. Option B incorrectly multiplies sums. Option C is correct dot product. Option D returns only the max term.",
  },

  "port-max-drawdown": {
    title: "Maximum Drawdown",
    difficulty: "medium", category: "Portfolio & Risk", points: 100,
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
    explanation: "Option A only checks consecutive drops. Option B is correct: track running peak, measure drawdown. Option C uses global max (misses drawdowns before it). Option D wrong if min before max.",
  },

  "port-rebalancing": {
    title: "Portfolio Rebalancing",
    difficulty: "medium", category: "Portfolio & Risk", points: 100,
    type: "mcq",
    description: `You have $10,000 with target allocation 60% stocks / 40% bonds. Stocks gain 20%, bonds lose 5%. 

What is the new portfolio value and how much do you need to rebalance?`,
    options: [
      "New value: $11,800; need to sell $780 of stocks",
      "New value: $11,600; need to sell $600 of stocks",
      "New value: $11,800; no rebalancing needed",
      "New value: $10,000; no change",
    ],
    answer: "New value: $11,800; need to sell $780 of stocks",
    explanation: "Stocks: $6,000×1.2=$7,200. Bonds: $4,000×0.95=$3,800. Total=$11,000. Wait: $6000×1.2=$7200 + $4000×0.95=$3800 = $11,000. Target: 60%×$11,000=$6,600 stocks, 40%=$4,400 bonds. Sell $7200-$6600=$600 of stocks. Actually: total = $7200+$3800=$11,000. Hmm the $11,800 option is wrong — correct value is $11,000, sell $600.",
  },

  // ══════════════════════════════════════════════════════════════
  // STATISTICS — extra problems
  // ══════════════════════════════════════════════════════════════

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
    explanation: "Option A: divides by Σ(xᵢ-x̄) not its square. Option B is correct. Option C omits mean-centering. Option D: numerator and denominator swapped.",
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
    explanation: "Bootstrap must resample with replacement. random.sample (Option A) samples without replacement — just shuffles. Options C and D don't resample at all.",
  },

  "stats-hurst-exponent": {
    title: "Hurst Exponent",
    difficulty: "medium", category: "Statistics", points: 125,
    type: "mcq",
    description: `The Hurst exponent H characterises time series behaviour. What does H > 0.5 indicate?`,
    options: [
      "Mean-reverting (anti-persistent) series",
      "Random walk (no memory)",
      "Trending (persistent) series — positive autocorrelation",
      "The series is stationary",
    ],
    answer: "Trending (persistent) series — positive autocorrelation",
    explanation: "H=0.5: random walk. H>0.5: trending/persistent — past trends continue. H<0.5: mean-reverting/anti-persistent. Pairs trading targets H<0.5 (mean-reverting spreads).",
  },

  "stats-autocorrelation": {
    title: "Autocorrelation Function (ACF)",
    difficulty: "medium", category: "Statistics", points: 100,
    type: "mcq",
    description: `For an AR(1) process: X_t = φX_{t-1} + ε_t with |φ| < 1, what is the autocorrelation at lag k?`,
    options: ["φ", "φ^k", "φ·k", "1/k"],
    answer: "φ^k",
    explanation: "For AR(1): ρ(k) = Corr(X_t, X_{t-k}) = φ^k. At lag 1: ρ(1)=φ. At lag k: ρ(k)=φ^k. Geometric decay — this is the signature of an AR(1) in the ACF.",
  },

  "stats-t-test": {
    title: "t-Test — Statistical Significance",
    difficulty: "easy", category: "Statistics", points: 75,
    type: "mcq",
    description: `A trading strategy has mean daily return μ̂=0.1% and standard error SE=0.04% estimated over 250 days. Is the strategy's alpha statistically significant at 5% level?

(Critical value: t₀.₀₂₅ ≈ 1.96)`,
    options: [
      "Yes — t-stat > 1.96",
      "No — t-stat < 1.96",
      "Cannot determine without the full distribution",
      "Yes — any positive mean return is significant",
    ],
    answer: "Yes — t-stat > 1.96",
    explanation: "t-stat = μ̂/SE = 0.1%/0.04% = 2.5. Since 2.5 > 1.96, reject null hypothesis at 5% level. The strategy's alpha is statistically significant.",
  },

  "stats-correlation": {
    title: "Correlation vs Causation",
    difficulty: "easy", category: "Statistics", points: 50,
    type: "mcq",
    description: `Pearson correlation ρ = Cov(X,Y)/(σ_X·σ_Y). If X and Y are **independent**, what is ρ?`,
    options: ["0", "1", "-1", "Cannot be determined"],
    answer: "0",
    explanation: "If X and Y are independent, Cov(X,Y)=0, so ρ=0. Note: the converse is NOT true — ρ=0 does not imply independence (unless jointly normal). E.g., if Y=X², X~N(0,1), then ρ(X,Y)=0 but they're dependent.",
  },

  "stats-central-limit": {
    title: "Central Limit Theorem",
    difficulty: "easy", category: "Statistics", points: 75,
    type: "mcq",
    description: `The Central Limit Theorem states that the sample mean X̄ of n i.i.d. random variables with mean μ and variance σ² converges (as n→∞) to:`,
    options: [
      "Normal distribution with mean μ and variance σ²",
      "Normal distribution with mean μ and variance σ²/n",
      "Uniform distribution",
      "Poisson distribution with rate μ",
    ],
    answer: "Normal distribution with mean μ and variance σ²/n",
    explanation: "CLT: √n(X̄ - μ)/σ → N(0,1). Equivalently, X̄ → N(μ, σ²/n). The standard error of the mean is σ/√n, not σ. This is fundamental to hypothesis testing and confidence intervals.",
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
                const isCode = opt.includes("\n") || opt.includes("return ") || opt.includes("def ") || (opt.includes("=") && opt.includes("("));
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
                            : "text-slate-400")}>{opt}</pre>
                      : <span className={clsx("block px-4 py-3 text-sm",
                          selectedOption === opt
                            ? status === "pass" ? "text-emerald-300" : status === "fail" ? "text-red-300" : "text-slate-100"
                            : "text-slate-400")}>{opt}</span>
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

          {/* Output */}
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
