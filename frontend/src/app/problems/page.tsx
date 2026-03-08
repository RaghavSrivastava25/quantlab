"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import clsx from "clsx";

const PROBLEMS = [
  // ── BRAIN TEASERS ──────────────────────────────────────────────────────
  { slug:"brain-monty-hall",       title:"Monty Hall Problem",             difficulty:"easy",   category:"brain",       points:75,  tags:["probability","classic"] },
  { slug:"brain-birthday-problem", title:"Birthday Problem",               difficulty:"easy",   category:"brain",       points:75,  tags:["probability","combinatorics"] },
  { slug:"brain-drunk-man-walk",   title:"Drunk Man's Walk",               difficulty:"easy",   category:"brain",       points:100, tags:["random-walk","probability"] },
  { slug:"brain-gambler-ruin",     title:"Gambler's Ruin",                 difficulty:"medium", category:"brain",       points:125, tags:["random-walk","probability"] },
  { slug:"brain-coupon-collector", title:"Coupon Collector Problem",       difficulty:"medium", category:"brain",       points:100, tags:["expected-value","combinatorics"] },
  { slug:"brain-secretary-problem",title:"Secretary Problem",              difficulty:"medium", category:"brain",       points:150, tags:["optimal-stopping","interview"] },
  { slug:"brain-russian-roulette", title:"Russian Roulette — Sequential vs Random", difficulty:"medium", category:"brain", points:125, tags:["probability","simulation"] },
  { slug:"brain-pirate-game",      title:"Pirate Game — Game Theory",      difficulty:"hard",   category:"brain",       points:200, tags:["game-theory","backward-induction"] },
  { slug:"brain-envelope-paradox", title:"Two Envelopes Paradox",          difficulty:"medium", category:"brain",       points:125, tags:["bayesian","paradox"] },
  { slug:"brain-card-probability", title:"Card Probability — At Least One Ace", difficulty:"easy", category:"brain",   points:75,  tags:["combinatorics","cards"] },
  { slug:"brain-kelly-sizing",     title:"Kelly Criterion — Optimal Bet Sizing", difficulty:"medium", category:"brain", points:150, tags:["kelly","optimal-sizing"] },
  { slug:"brain-price-sequence",   title:"Stock Price — Up/Down Sequences", difficulty:"hard",  category:"brain",       points:175, tags:["ballot-problem","reflection"] },

  // ── CALCULUS & LINEAR ALGEBRA ──────────────────────────────────────────
  { slug:"calc-gradient-descent",  title:"Gradient Descent Implementation", difficulty:"easy",  category:"calculus",    points:75,  tags:["optimization","calculus"] },
  { slug:"calc-newton-raphson",    title:"Newton-Raphson Root Finding",    difficulty:"easy",   category:"calculus",    points:75,  tags:["numerical","calculus"] },
  { slug:"calc-matrix-inverse",    title:"Matrix Inverse (Gauss-Jordan)",  difficulty:"medium", category:"calculus",    points:100, tags:["linear-algebra","matrix"] },
  { slug:"calc-eigenvalues",       title:"Power Iteration for Eigenvalues", difficulty:"medium", category:"calculus",   points:125, tags:["linear-algebra","eigenvalues"] },
  { slug:"calc-pca",               title:"PCA from Scratch",               difficulty:"hard",   category:"calculus",    points:175, tags:["pca","linear-algebra"] },
  { slug:"calc-cholesky",          title:"Cholesky Decomposition",         difficulty:"hard",   category:"calculus",    points:175, tags:["linear-algebra","decomposition"] },

  // ── PROBABILITY ────────────────────────────────────────────────────────
  { slug:"normal-distribution-pdf",title:"Normal Distribution PDF",        difficulty:"easy",   category:"probability", points:50,  tags:["probability","normal"] },
  { slug:"monte-carlo-pi",         title:"Monte Carlo — Estimate π",       difficulty:"easy",   category:"probability", points:75,  tags:["monte-carlo","simulation"] },
  { slug:"monte-carlo-option",     title:"Monte Carlo Option Pricing",     difficulty:"hard",   category:"probability", points:175, tags:["monte-carlo","options"] },
  { slug:"brain-dice-sum-expected",title:"Expected Sum Until You Roll a 6", difficulty:"easy",  category:"probability", points:75,  tags:["expected-value","dice"] },
  { slug:"brain-unfair-coin",      title:"Detecting an Unfair Coin",       difficulty:"medium", category:"probability", points:125, tags:["hypothesis-testing","binomial"] },
  { slug:"prob-bayes-disease",     title:"Bayes Theorem — Disease Testing", difficulty:"easy",  category:"probability", points:75,  tags:["bayes","conditional"] },
  { slug:"prob-geometric-dist",    title:"Geometric Distribution — First Success", difficulty:"easy", category:"probability", points:75, tags:["geometric","distribution"] },

  // ── STOCHASTIC PROCESSES ───────────────────────────────────────────────
  { slug:"stoch-gbm-simulation",   title:"Geometric Brownian Motion",      difficulty:"medium", category:"stochastic",  points:150, tags:["GBM","brownian-motion"] },
  { slug:"stoch-ornstein-uhlenbeck",title:"Ornstein-Uhlenbeck Process",    difficulty:"medium", category:"stochastic",  points:150, tags:["mean-reversion","OU"] },
  { slug:"stoch-ito-lemma",        title:"Itô's Lemma — Apply to GBM",     difficulty:"hard",   category:"stochastic",  points:200, tags:["ito","stochastic-calculus"] },
  { slug:"stoch-brownian-bridge",  title:"Brownian Bridge Simulation",     difficulty:"hard",   category:"stochastic",  points:175, tags:["brownian-bridge","simulation"] },
  { slug:"stoch-poisson-process",  title:"Poisson Process — Jump Times",   difficulty:"medium", category:"stochastic",  points:125, tags:["poisson","jump-process"] },
  { slug:"brain-price-sequence",   title:"Random Walk — Never Touch Zero", difficulty:"hard",   category:"stochastic",  points:175, tags:["random-walk","reflection"] },

  // ── ALGORITHMS & NUMERICAL METHODS ────────────────────────────────────
  { slug:"algo-bisection",         title:"Bisection Method",               difficulty:"easy",   category:"algorithms",  points:75,  tags:["numerical","root-finding"] },
  { slug:"algo-binary-search",     title:"Binary Search on Sorted Array",  difficulty:"easy",   category:"algorithms",  points:50,  tags:["algorithms","search"] },
  { slug:"algo-merge-sort",        title:"Merge Sort Implementation",      difficulty:"easy",   category:"algorithms",  points:75,  tags:["sorting","divide-conquer"] },
  { slug:"implied-volatility",     title:"Implied Volatility (Bisection)", difficulty:"hard",   category:"algorithms",  points:200, tags:["bisection","options"] },
  { slug:"algo-dynamic-prog",      title:"Max Profit — k Transactions",    difficulty:"hard",   category:"algorithms",  points:200, tags:["dynamic-programming","trading"] },
  { slug:"algo-kalman-filter",     title:"Kalman Filter — 1D",             difficulty:"hard",   category:"algorithms",  points:200, tags:["kalman","signal-processing"] },

  // ── FINANCE ────────────────────────────────────────────────────────────
  { slug:"sharpe-ratio",           title:"Sharpe Ratio",                   difficulty:"easy",   category:"finance",     points:100, tags:["sharpe","performance"] },
  { slug:"max-drawdown",           title:"Maximum Drawdown",               difficulty:"medium", category:"finance",     points:100, tags:["drawdown","risk"] },
  { slug:"rolling-beta",           title:"Rolling Beta",                   difficulty:"medium", category:"finance",     points:125, tags:["beta","regression"] },
  { slug:"sortino-ratio",          title:"Sortino Ratio",                  difficulty:"medium", category:"finance",     points:125, tags:["sortino","performance"] },
  { slug:"rolling-moving-average", title:"Simple Moving Average",          difficulty:"easy",   category:"finance",     points:50,  tags:["sma","technical"] },
  { slug:"exponential-moving-average",title:"Exponential Moving Average",  difficulty:"easy",   category:"finance",     points:75,  tags:["ema","technical"] },
  { slug:"rolling-zscore",         title:"Rolling Z-Score",                difficulty:"easy",   category:"finance",     points:75,  tags:["zscore","normalization"] },
  { slug:"macd-signal",            title:"MACD Signal Line",               difficulty:"hard",   category:"finance",     points:175, tags:["macd","technical"] },
  { slug:"momentum-signal",        title:"Momentum Signal",                difficulty:"medium", category:"finance",     points:125, tags:["momentum","signal"] },
  { slug:"pair-trading-zscore",    title:"Pair Trading Z-Score Signal",    difficulty:"medium", category:"finance",     points:150, tags:["pairs","stat-arb"] },

  // ── OPTIONS & FUTURES ──────────────────────────────────────────────────
  { slug:"black-scholes-call",     title:"Black-Scholes Call Price",       difficulty:"medium", category:"options",     points:150, tags:["black-scholes","pricing"] },
  { slug:"black-scholes-put",      title:"Black-Scholes Put Price",        difficulty:"medium", category:"options",     points:150, tags:["black-scholes","put"] },
  { slug:"option-delta",           title:"Option Greeks — Delta",          difficulty:"medium", category:"options",     points:150, tags:["greeks","delta"] },
  { slug:"futures-fair-value",     title:"Futures Fair Value",             difficulty:"easy",   category:"options",     points:75,  tags:["futures","cost-of-carry"] },
  { slug:"basis-and-calendar-spread",title:"Basis and Calendar Spread",    difficulty:"easy",   category:"options",     points:75,  tags:["futures","spread"] },
  { slug:"roll-yield",             title:"Roll Yield",                     difficulty:"medium", category:"options",     points:100, tags:["futures","commodities"] },

  // ── PORTFOLIO & RISK ───────────────────────────────────────────────────
  { slug:"portfolio-return",       title:"Portfolio Return",               difficulty:"easy",   category:"portfolio",   points:50,  tags:["portfolio","returns"] },
  { slug:"portfolio-variance",     title:"Portfolio Variance",             difficulty:"medium", category:"portfolio",   points:125, tags:["portfolio","variance"] },
  { slug:"equal-weight-rebalance", title:"Equal Weight Rebalancing",       difficulty:"medium", category:"portfolio",   points:100, tags:["rebalancing","weights"] },
  { slug:"value-at-risk",          title:"Value at Risk (Historical)",     difficulty:"easy",   category:"portfolio",   points:100, tags:["var","risk"] },
  { slug:"expected-shortfall",     title:"Expected Shortfall (CVaR)",      difficulty:"medium", category:"portfolio",   points:125, tags:["cvar","risk"] },

  // ── STATISTICS ─────────────────────────────────────────────────────────
  { slug:"stats-ols-regression",   title:"OLS Linear Regression",         difficulty:"easy",   category:"statistics",  points:100, tags:["regression","ols"] },
  { slug:"stats-correlation",      title:"Pearson Correlation",            difficulty:"easy",   category:"statistics",  points:75,  tags:["correlation","statistics"] },
  { slug:"stats-hypothesis-ttest", title:"Two-Sample t-Test",             difficulty:"medium", category:"statistics",  points:125, tags:["hypothesis-testing","t-test"] },
  { slug:"stats-bootstrap",        title:"Bootstrap Confidence Interval",  difficulty:"medium", category:"statistics",  points:125, tags:["bootstrap","confidence"] },
  { slug:"stats-autocorrelation",  title:"Autocorrelation Function (ACF)", difficulty:"medium", category:"statistics",  points:125, tags:["acf","time-series"] },
  { slug:"stats-hurst-exponent",   title:"Hurst Exponent",                 difficulty:"hard",   category:"statistics",  points:175, tags:["hurst","mean-reversion"] },
];

// Deduplicate by slug
const UNIQUE_PROBLEMS = Array.from(new Map(PROBLEMS.map(p => [p.slug, p])).values());

const CATEGORIES = [
  { key: "all",         label: "All" },
  { key: "brain",       label: "Brain Teasers" },
  { key: "calculus",    label: "Calculus & Linear Algebra" },
  { key: "probability", label: "Probability" },
  { key: "stochastic",  label: "Stochastic Processes" },
  { key: "algorithms",  label: "Algorithms & Numerical" },
  { key: "finance",     label: "Finance" },
  { key: "options",     label: "Options & Futures" },
  { key: "portfolio",   label: "Portfolio & Risk" },
  { key: "statistics",  label: "Statistics" },
];

const DIFF_STYLE: Record<string,string> = {
  easy:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  hard:   "bg-red-500/10 text-red-400 border-red-500/20",
};

const CAT_DOT: Record<string,string> = {
  brain:"#ec4899", calculus:"#3b82f6", probability:"#10b981",
  stochastic:"#8b5cf6", algorithms:"#f97316", finance:"#06b6d4",
  options:"#f59e0b", portfolio:"#ef4444", statistics:"#64748b",
};

function ProblemsContent() {
  const searchParams = useSearchParams();
  const [difficulty, setDifficulty] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [search, setSearch] = useState("");

  const filtered = UNIQUE_PROBLEMS.filter(p => {
    if (difficulty && p.difficulty !== difficulty) return false;
    if (category !== "all" && p.category !== category) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) &&
        !p.tags.some(t => t.includes(search.toLowerCase()))) return false;
    return true;
  });

  const grouped = category === "all"
    ? CATEGORIES.slice(1).map(c => ({ ...c, problems: filtered.filter(p => p.category === c.key) })).filter(c => c.problems.length > 0)
    : [{ key: category, label: CATEGORIES.find(c => c.key === category)?.label || category, problems: filtered }];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-1">Problems</h1>
        <p className="text-slate-400">{UNIQUE_PROBLEMS.length} quant challenges — run Python in your browser</p>
      </div>

      {/* Search */}
      <input
        type="text" placeholder="Search problems..." value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm mb-4 focus:outline-none focus:border-brand-500 transition-colors placeholder:text-slate-600"
      />

      {/* Difficulty filter */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        {["", "easy", "medium", "hard"].map(d => (
          <button key={d||"all"} onClick={() => setDifficulty(d)}
            className={clsx("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors capitalize",
              difficulty === d ? "bg-slate-700 text-slate-100 border-slate-500" : "text-slate-500 border-slate-800 hover:border-slate-600 hover:text-slate-300")}>
            {d || "All Levels"}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 flex-wrap mb-8">
        {CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setCategory(c.key)}
            className={clsx("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
              category === c.key
                ? "bg-slate-700 text-slate-100 border-slate-500"
                : "text-slate-500 border-slate-800 hover:border-slate-600 hover:text-slate-300")}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Problems grouped by category */}
      <div className="space-y-10">
        {grouped.map(group => (
          <div key={group.key}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: CAT_DOT[group.key] || "#64748b", boxShadow: `0 0 6px ${CAT_DOT[group.key] || "#64748b"}80` }} />
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">{group.label}</h2>
              <span className="text-xs text-slate-600">{group.problems.length} problems</span>
            </div>
            <div className="space-y-2">
              {group.problems.map((p, i) => (
                <Link key={p.slug + i} href={`/problems/${p.slug}`}
                  className="group flex items-center justify-between bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-600 rounded-xl px-5 py-3.5 transition-all">
                  <div className="flex items-center gap-4 min-w-0">
                    <span className={clsx("text-xs font-bold px-2.5 py-1 rounded-full border capitalize shrink-0", DIFF_STYLE[p.difficulty])}>
                      {p.difficulty}
                    </span>
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-200 group-hover:text-white text-sm">{p.title}</span>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {p.tags.slice(0,3).map(t => (
                          <span key={t} className="text-xs text-slate-600">#{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="text-xs text-slate-600 font-mono">{p.points}pts</span>
                    <ChevronRight size={15} className="text-slate-700 group-hover:text-brand-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-600">No problems match your filter.</div>
        )}
      </div>
    </div>
  );
}

export default function ProblemsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-slate-500">Loading...</div>}>
      <ProblemsContent />
    </Suspense>
  );
}
