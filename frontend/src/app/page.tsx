"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, Zap, BarChart2, BookOpen } from "lucide-react";

const SpacetimeGrid = dynamic(() => import("@/components/ui/SpacetimeGrid"), { ssr: false });

const CATEGORIES = [
  { key: "brain",       label: "Brain Teasers",            color: "#ec4899", desc: "Screwy Pirates, Tiger & Sheep, River Crossing, Burning Ropes" },
  { key: "probability", label: "Probability",              color: "#10b981", desc: "Bayes, Monty Hall, Coin Tosses, Dice, Distributions" },
  { key: "stochastic",  label: "Stochastic Processes",     color: "#8b5cf6", desc: "GBM, Itô's Lemma, Markov Chains, Random Walks, Martingales" },
  { key: "calculus",    label: "Calculus & Linear Algebra", color: "#3b82f6", desc: "Derivatives, Taylor Series, Eigenvalues, ODEs, Lagrange" },
  { key: "algorithms",  label: "Algorithms & Numerical",   color: "#f97316", desc: "Sorting, Dynamic Programming, Monte Carlo, Finite Difference" },
  { key: "finance",     label: "Finance",                  color: "#06b6d4", desc: "Options, Futures, Duration, VaR, Portfolio Optimization" },
  { key: "options",     label: "Options & Greeks",         color: "#f59e0b", desc: "Black-Scholes, Delta, Gamma, Vega, Theta, Put-Call Parity" },
  { key: "portfolio",   label: "Portfolio & Risk",         color: "#ef4444", desc: "Sharpe Ratio, Drawdown, Markowitz, CVaR, Rebalancing" },
  { key: "statistics",  label: "Statistics",               color: "#64748b", desc: "OLS Regression, Bootstrap, ACF, Hurst Exponent, t-Tests" },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative min-h-screen bg-dark-900">
      <SpacetimeGrid />
      <div className="fixed inset-0 z-0 bg-dark-900/60 pointer-events-none" />
      <div className="relative z-10">
        <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className={`transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm rounded-full px-4 py-1.5 mb-8">
              <Zap size={14} /> LeetCode for Quant Finance
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-slate-100 leading-[1.05] mb-6">
              Master Quant Finance<br />
              <span className="bg-gradient-to-r from-brand-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
                by doing, not watching
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              Real quant interview questions. No login required.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/problems" className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-dark-900 font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/20">
                Start Solving <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-800/60 bg-slate-900/40 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-6 py-6 grid grid-cols-3 gap-6">
            {[["200+","Problems"],["9","Categories"],["2","Problem Types"]].map(([v,l]) => (
              <div key={l} className="text-center">
                <div className="text-2xl font-black text-brand-400 font-mono">{v}</div>
                <div className="text-xs text-slate-500 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-slate-100 mb-3 text-center">9 Problem Categories</h2>
          <p className="text-slate-400 text-center mb-12">From quant basics to brain teasers from top trading firms</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map(({ key, label, color, desc }) => (
              <Link key={key} href={`/problems?category=${key}`}
                className="group relative bg-slate-900/70 backdrop-blur border border-slate-800 hover:border-slate-600 rounded-2xl p-5 transition-all hover:-translate-y-1 overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${color}15, transparent 70%)` }} />
                <div className="relative">
                  <div className="w-3 h-3 rounded-full mb-4" style={{ background: color, boxShadow: `0 0 8px ${color}80` }} />
                  <h3 className="font-bold text-slate-100 mb-1">{label}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-2 gap-6">
          {[
            { icon: BarChart2, title: "Real Interview Problems", desc: "Problems sourced from quant interviews at top HFTs, hedge funds and banks worldwide.", color: "text-green-400", bg: "bg-green-400/10 border-green-400/20" },
            { icon: BookOpen,  title: "MCQ + Numerical Answers",  desc: "Pick the right option or type the exact number. Instant feedback with detailed explanations for every question.", color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20" },
          ].map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} border mb-4`}>
                <Icon size={20} className={color} />
              </div>
              <h3 className="font-bold text-slate-100 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
