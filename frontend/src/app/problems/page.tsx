"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import clsx from "clsx";

const PROBLEMS = [
  // ── BRAIN TEASERS ──────────────────────────────────────────────────────────
  { slug:"brain-screwy-pirates",    title:"Screwy Pirates",                  difficulty:"hard",   category:"brain",       points:200 },
  { slug:"brain-tiger-sheep",       title:"Tiger and Sheep",                 difficulty:"medium", category:"brain",       points:125 },
  { slug:"brain-river-crossing",    title:"River Crossing",                  difficulty:"easy",   category:"brain",       points:75  },
  { slug:"brain-birthday-logic",    title:"Birthday Logic Puzzle",           difficulty:"medium", category:"brain",       points:125 },
  { slug:"brain-card-game-casino",  title:"Casino Card Game",                difficulty:"easy",   category:"brain",       points:75  },
  { slug:"brain-burning-ropes",     title:"Burning Ropes — 45 Minutes",      difficulty:"easy",   category:"brain",       points:75  },
  { slug:"brain-defective-ball",    title:"Defective Ball — 3 Weighings",    difficulty:"medium", category:"brain",       points:150 },
  { slug:"brain-trailing-zeros",    title:"Trailing Zeros in 100!",          difficulty:"easy",   category:"brain",       points:50  },
  { slug:"brain-horse-race",        title:"Horse Race — Minimum Races",      difficulty:"medium", category:"brain",       points:125 },
  { slug:"brain-infinite-sequence", title:"Infinite Power Tower",            difficulty:"medium", category:"brain",       points:100 },
  { slug:"brain-box-packing",       title:"Box Packing — 1×1×4 Bricks",     difficulty:"hard",   category:"brain",       points:175 },
  { slug:"brain-calendar-cubes",    title:"Calendar Cubes",                  difficulty:"easy",   category:"brain",       points:75  },
  { slug:"brain-monty-hall",        title:"Monty Hall Problem",              difficulty:"easy",   category:"brain",       points:75  },
  { slug:"brain-pirate-game",       title:"Pirate Game — Game Theory",       difficulty:"hard",   category:"brain",       points:200 },
  { slug:"brain-russian-roulette",  title:"Russian Roulette",                difficulty:"medium", category:"brain",       points:125 },
  { slug:"brain-coin-piles",        title:"Coin Piles — Symmetry",           difficulty:"medium", category:"brain",       points:100 },
  { slug:"brain-mislabeled-bags",   title:"Mislabeled Bags",                 difficulty:"easy",   category:"brain",       points:75  },
  { slug:"brain-clock-pieces",      title:"Clock Pieces — Sum",              difficulty:"easy",   category:"brain",       points:75  },
  { slug:"brain-gambler-ruin",      title:"Gambler's Ruin",                  difficulty:"medium", category:"brain",       points:125 },
  { slug:"brain-kelly-sizing-v2",   title:"Kelly Criterion",                 difficulty:"medium", category:"brain",       points:150 },
  { slug:"brain-coupon-collector",  title:"Coupon Collector Problem",        difficulty:"medium", category:"brain",       points:100 },

  // ── PROBABILITY ────────────────────────────────────────────────────────────
  { slug:"brain-monty-hall-prob",   title:"Coin Toss — Two Heads Game",      difficulty:"easy",   category:"probability", points:75  },
  { slug:"prob-card-game",          title:"Card Game — First Ace",           difficulty:"easy",   category:"probability", points:75  },
  { slug:"prob-drunk-passenger",    title:"Drunk Passenger",                 difficulty:"medium", category:"probability", points:125 },
  { slug:"prob-n-points-circle",    title:"N Points on a Circle",            difficulty:"medium", category:"probability", points:125 },
  { slug:"prob-boys-girls",         title:"Boys and Girls",                  difficulty:"easy",   category:"probability", points:75  },
  { slug:"prob-unfair-coin",        title:"Unfair Coin Detection",           difficulty:"medium", category:"probability", points:100 },
  { slug:"prob-dart-game",          title:"Dart Game",                       difficulty:"medium", category:"probability", points:100 },
  { slug:"prob-dice-order",         title:"Dice Order",                      difficulty:"medium", category:"probability", points:100 },
  { slug:"prob-amoeba",             title:"Amoeba Population",               difficulty:"hard",   category:"probability", points:175 },
  { slug:"prob-russian-roulette",   title:"Russian Roulette Series",         difficulty:"hard",   category:"probability", points:175 },
  { slug:"prob-gambler-ruin",       title:"Gambler's Ruin — Reaching Target",difficulty:"medium", category:"probability", points:125 },
  { slug:"prob-meeting-probability",title:"Meeting Probability",             difficulty:"medium", category:"probability", points:125 },
  { slug:"prob-triangle",           title:"Probability of Triangle",         difficulty:"medium", category:"probability", points:125 },
  { slug:"prob-poisson-process",    title:"Poisson Process Property",        difficulty:"medium", category:"probability", points:100 },
  { slug:"prob-normal-moments",     title:"Normal Distribution Moments",     difficulty:"medium", category:"probability", points:100 },
  { slug:"prob-connecting-noodles", title:"Connecting Noodles",              difficulty:"medium", category:"probability", points:100 },
  { slug:"prob-dice-game",          title:"Dice Game — Expected Value",      difficulty:"easy",   category:"probability", points:75  },
  { slug:"prob-order-stats",        title:"Expected Maximum of Uniform",     difficulty:"medium", category:"probability", points:125 },
  { slug:"prob-bayes-disease",      title:"Bayes Theorem — Disease Testing", difficulty:"easy",   category:"probability", points:75  },

  // ── CALCULUS & LINEAR ALGEBRA ──────────────────────────────────────────────
  { slug:"calc-derivative-basics",  title:"Derivative — Chain Rule",         difficulty:"easy",   category:"calculus",    points:50  },
  { slug:"calc-lhopital",           title:"L'Hôpital's Rule",                difficulty:"easy",   category:"calculus",    points:75  },
  { slug:"calc-integration-basic",  title:"Definite Integral",               difficulty:"easy",   category:"calculus",    points:50  },
  { slug:"calc-taylor-series",      title:"Taylor Series — e^x",             difficulty:"easy",   category:"calculus",    points:75  },
  { slug:"calc-newton-raphson",     title:"Newton-Raphson Root Finding",     difficulty:"easy",   category:"calculus",    points:75  },
  { slug:"calc-lagrange",           title:"Lagrange Multipliers",            difficulty:"medium", category:"calculus",    points:125 },
  { slug:"calc-gradient-descent",   title:"Gradient Descent",                difficulty:"easy",   category:"calculus",    points:75  },
  { slug:"calc-eigenvalues",        title:"Eigenvalues — 2×2 Matrix",        difficulty:"medium", category:"calculus",    points:125 },
  { slug:"calc-matrix-inverse",     title:"Matrix Inverse",                  difficulty:"easy",   category:"calculus",    points:75  },
  { slug:"calc-pca",                title:"PCA — First Principal Component", difficulty:"hard",   category:"calculus",    points:175 },
  { slug:"calc-cholesky",           title:"Cholesky Decomposition",          difficulty:"hard",   category:"calculus",    points:175 },
  { slug:"calc-ode-separable",      title:"Separable ODE",                   difficulty:"medium", category:"calculus",    points:100 },
  { slug:"calc-qr-decomp",          title:"QR Decomposition Property",       difficulty:"medium", category:"calculus",    points:125 },

  // ── STOCHASTIC PROCESSES ───────────────────────────────────────────────────
  { slug:"stoch-markov-chain",      title:"Markov Chain — Gambler's Ruin",   difficulty:"medium", category:"stochastic",  points:125 },
  { slug:"stoch-dice-markov",       title:"Dice — All Faces Expected Rolls", difficulty:"medium", category:"stochastic",  points:125 },
  { slug:"stoch-gbm-simulation",    title:"Geometric Brownian Motion",       difficulty:"medium", category:"stochastic",  points:150 },
  { slug:"stoch-ito-lemma",         title:"Itô's Lemma — Apply to GBM",      difficulty:"hard",   category:"stochastic",  points:200 },
  { slug:"stoch-brownian-motion",   title:"Brownian Motion Properties",      difficulty:"medium", category:"stochastic",  points:125 },
  { slug:"stoch-martingale",        title:"Martingale Property",             difficulty:"medium", category:"stochastic",  points:125 },
  { slug:"stoch-stopping-time",     title:"First Passage Time",              difficulty:"hard",   category:"stochastic",  points:175 },
  { slug:"stoch-ornstein-uhlenbeck",title:"Ornstein-Uhlenbeck Process",      difficulty:"medium", category:"stochastic",  points:150 },
  { slug:"stoch-dynamic-prog",      title:"Dynamic Programming — Dice",      difficulty:"hard",   category:"stochastic",  points:200 },
  { slug:"stoch-world-series",      title:"World Series Probability",        difficulty:"hard",   category:"stochastic",  points:175 },
  { slug:"stoch-brownian-bridge",   title:"Brownian Bridge",                 difficulty:"hard",   category:"stochastic",  points:175 },
  { slug:"stoch-poisson-process",   title:"Poisson Process — Jump Times",    difficulty:"medium", category:"stochastic",  points:125 },

  // ── ALGORITHMS & NUMERICAL ─────────────────────────────────────────────────
  { slug:"algo-number-swap",        title:"Number Swap — No Temp Variable",  difficulty:"easy",   category:"algorithms",  points:50  },
  { slug:"algo-unique-elements",    title:"Find Unique Element — XOR",       difficulty:"easy",   category:"algorithms",  points:75  },
  { slug:"algo-binary-search",      title:"Binary Search",                   difficulty:"easy",   category:"algorithms",  points:50  },
  { slug:"algo-merge-sort",         title:"Merge Sort Complexity",           difficulty:"easy",   category:"algorithms",  points:75  },
  { slug:"algo-fibonacci",          title:"Fibonacci — Dynamic Programming", difficulty:"easy",   category:"algorithms",  points:75  },
  { slug:"algo-max-subarray",       title:"Maximum Contiguous Subarray",     difficulty:"medium", category:"algorithms",  points:125 },
  { slug:"algo-power-of-two",       title:"Power of 2 — Bit Trick",          difficulty:"easy",   category:"algorithms",  points:50  },
  { slug:"algo-bisection",          title:"Bisection Method",                difficulty:"easy",   category:"algorithms",  points:75  },
  { slug:"algo-dynamic-prog",       title:"Max Profit — 2 Transactions",     difficulty:"hard",   category:"algorithms",  points:200 },
  { slug:"algo-monte-carlo",        title:"Monte Carlo — Estimate π",        difficulty:"easy",   category:"algorithms",  points:75  },
  { slug:"algo-random-permutation", title:"Random Permutation — Fisher-Yates",difficulty:"medium",category:"algorithms",  points:100 },
  { slug:"algo-implied-vol",        title:"Implied Volatility Newton's Method",difficulty:"hard", category:"algorithms",  points:175 },

  // ── FINANCE ────────────────────────────────────────────────────────────────
  { slug:"fin-put-call-parity",     title:"Put-Call Parity",                 difficulty:"easy",   category:"finance",     points:100 },
  { slug:"fin-american-vs-european",title:"American vs European Options",    difficulty:"medium", category:"finance",     points:125 },
  { slug:"fin-black-scholes-call",  title:"Black-Scholes Call Price",        difficulty:"medium", category:"finance",     points:150 },
  { slug:"fin-bull-spread",         title:"Bull Spread Payoff",              difficulty:"medium", category:"finance",     points:100 },
  { slug:"fin-straddle",            title:"Straddle Strategy",               difficulty:"medium", category:"finance",     points:100 },
  { slug:"fin-binary-option",       title:"Binary Option Pricing",           difficulty:"medium", category:"finance",     points:125 },
  { slug:"fin-portfolio-optimization",title:"Portfolio Optimization",        difficulty:"medium", category:"finance",     points:125 },
  { slug:"fin-var",                 title:"Value at Risk (VaR)",             difficulty:"medium", category:"finance",     points:125 },
  { slug:"fin-duration-convexity",  title:"Duration and Convexity",          difficulty:"medium", category:"finance",     points:125 },
  { slug:"fin-futures-fair-value",  title:"Futures Fair Value",              difficulty:"easy",   category:"finance",     points:75  },
  { slug:"fin-interest-rate-model", title:"Vasicek Interest Rate Model",     difficulty:"hard",   category:"finance",     points:175 },
  { slug:"fin-exchange-option",     title:"Exchange Option — Margrabe",      difficulty:"hard",   category:"finance",     points:175 },

  // ── OPTIONS & GREEKS ───────────────────────────────────────────────────────
  { slug:"opt-delta",               title:"Delta — Option Sensitivity",      difficulty:"easy",   category:"options",     points:75  },
  { slug:"opt-delta-atm",           title:"Delta of ATM Option",             difficulty:"easy",   category:"options",     points:75  },
  { slug:"opt-gamma",               title:"Gamma — Convexity of Options",    difficulty:"medium", category:"options",     points:125 },
  { slug:"opt-gamma-atm",           title:"Gamma Near Expiry",               difficulty:"medium", category:"options",     points:125 },
  { slug:"opt-theta",               title:"Theta — Time Decay",              difficulty:"medium", category:"options",     points:100 },
  { slug:"opt-vega",                title:"Vega — Volatility Sensitivity",   difficulty:"medium", category:"options",     points:100 },
  { slug:"opt-put-call-parity",     title:"Put-Call Parity Arbitrage",       difficulty:"medium", category:"options",     points:125 },
  { slug:"opt-black-scholes",       title:"Black-Scholes d₂ Interpretation", difficulty:"medium", category:"options",     points:125 },

  // ── PORTFOLIO & RISK ───────────────────────────────────────────────────────
  { slug:"port-sharpe-ratio",       title:"Sharpe Ratio",                    difficulty:"easy",   category:"portfolio",   points:100 },
  { slug:"port-markowitz",          title:"Markowitz Portfolio Theory",      difficulty:"medium", category:"portfolio",   points:125 },
  { slug:"port-var",                title:"Value at Risk (Historical)",      difficulty:"easy",   category:"portfolio",   points:100 },
  { slug:"port-cvar",               title:"CVaR — Expected Shortfall",       difficulty:"medium", category:"portfolio",   points:125 },
  { slug:"port-portfolio-return",   title:"Portfolio Return",                difficulty:"easy",   category:"portfolio",   points:50  },
  { slug:"port-max-drawdown",       title:"Maximum Drawdown",                difficulty:"medium", category:"portfolio",   points:100 },
  { slug:"port-rebalancing",        title:"Portfolio Rebalancing",           difficulty:"medium", category:"portfolio",   points:100 },

  // ── STATISTICS ─────────────────────────────────────────────────────────────
  { slug:"stats-ols-regression",    title:"OLS Linear Regression",           difficulty:"easy",   category:"statistics",  points:100 },
  { slug:"stats-bootstrap",         title:"Bootstrap Confidence Interval",   difficulty:"medium", category:"statistics",  points:125 },
  { slug:"stats-hurst-exponent",    title:"Hurst Exponent",                  difficulty:"medium", category:"statistics",  points:125 },
  { slug:"stats-autocorrelation",   title:"Autocorrelation Function (ACF)",  difficulty:"medium", category:"statistics",  points:100 },
  { slug:"stats-t-test",            title:"t-Test — Statistical Significance",difficulty:"easy",  category:"statistics",  points:75  },
  { slug:"stats-correlation",       title:"Correlation vs Causation",        difficulty:"easy",   category:"statistics",  points:50  },
  { slug:"stats-central-limit",     title:"Central Limit Theorem",           difficulty:"easy",   category:"statistics",  points:75  },
];

const CATEGORIES: Record<string, string> = {
  brain: "Brain Teasers", probability: "Probability", stochastic: "Stochastic Processes",
  calculus: "Calculus & Linear Algebra", algorithms: "Algorithms & Numerical",
  finance: "Finance", options: "Options & Greeks", portfolio: "Portfolio & Risk", statistics: "Statistics",
};

const DIFF_COLORS: Record<string, string> = {
  easy:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  medium: "bg-yellow-500/10  text-yellow-400  border-yellow-500/20",
  hard:   "bg-red-500/10     text-red-400     border-red-500/20",
};

function ProblemsInner() {
  const params = useSearchParams();
  const [search, setSearch] = useState("");
  const [diff, setDiff] = useState("all");
  const categoryParam = params.get("category") || "all";
  const [category, setCategory] = useState(categoryParam);

  const filtered = PROBLEMS.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchDiff = diff === "all" || p.difficulty === diff;
    const matchCat = category === "all" || p.category === category;
    return matchSearch && matchDiff && matchCat;
  });

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Problems</h1>
            <p className="text-sm text-slate-500 mt-1">Green Book — A Practical Guide to Quantitative Finance Interviews</p>
          </div>
          <span className="text-xs text-slate-600">{filtered.length} problems</span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search problems..."
            className="flex-1 min-w-48 bg-slate-800/60 border border-slate-700 focus:border-brand-500 rounded-xl px-4 py-2 text-slate-200 text-sm outline-none" />
          <select value={diff} onChange={e => setDiff(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 text-sm outline-none">
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 text-sm outline-none">
            <option value="all">All Categories</option>
            {Object.entries(CATEGORIES).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {["all", ...Object.keys(CATEGORIES)].map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={clsx("px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                category === cat
                  ? "bg-brand-500/20 border-brand-500/40 text-brand-300"
                  : "bg-slate-800/40 border-slate-700 text-slate-500 hover:text-slate-300")}>
              {cat === "all" ? "All" : CATEGORIES[cat]}
            </button>
          ))}
        </div>

        {/* Problem list */}
        <div className="space-y-2">
          {filtered.map((p, i) => (
            <Link key={p.slug} href={`/problems/${p.slug}`}
              className="group flex items-center gap-4 bg-slate-900/60 border border-slate-800 hover:border-slate-600 rounded-xl px-5 py-4 transition-all">
              <span className="text-xs text-slate-600 w-6 text-right font-mono">{i+1}</span>
              <div className="flex-1 min-w-0">
                <span className="text-slate-200 group-hover:text-slate-100 font-medium transition-colors">{p.title}</span>
                <span className="ml-3 text-xs text-slate-600">{CATEGORIES[p.category]}</span>
              </div>
              <span className={clsx("text-xs font-bold px-2 py-0.5 rounded-full border capitalize", DIFF_COLORS[p.difficulty])}>
                {p.difficulty}
              </span>
              <span className="text-xs text-slate-600 font-mono w-14 text-right">{p.points} pts</span>
              <ChevronRight size={14} className="text-slate-700 group-hover:text-slate-500 transition-colors" />
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-600">No problems match your filters.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProblemsPage() {
  return <Suspense fallback={<div className="min-h-screen bg-dark-950" />}><ProblemsInner /></Suspense>;
}
