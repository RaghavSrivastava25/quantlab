"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TrendingUp, Code2, BookOpen, Trophy, ArrowRight, Zap, Flame, BarChart2, Shield, Sigma, LineChart, Briefcase } from "lucide-react";

const CATEGORIES = [
  { key: "statistics", label: "Statistics", icon: Sigma, color: "#3b82f6", desc: "SMA, EMA, Z-Score, Sharpe, Beta" },
  { key: "options", label: "Options", icon: TrendingUp, color: "#8b5cf6", desc: "Black-Scholes, Greeks, Implied Vol" },
  { key: "futures", label: "Futures", icon: BarChart2, color: "#f59e0b", desc: "Fair Value, Basis, Roll Yield" },
  { key: "risk", label: "Risk", icon: Shield, color: "#ef4444", desc: "VaR, CVaR, Sortino, Drawdown" },
  { key: "probability", label: "Probability", icon: Sigma, color: "#10b981", desc: "Monte Carlo, GBM, Kelly Criterion" },
  { key: "strategies", label: "Strategies", icon: LineChart, color: "#f97316", desc: "Pairs Trading, Momentum, MACD" },
  { key: "portfolio", label: "Portfolio", icon: Briefcase, color: "#06b6d4", desc: "Markowitz, CAPM, Risk Parity" },
];

const STATS = [
  { value: "7", label: "Categories" },
  { value: "25+", label: "Problems" },
  { value: "6", label: "Research Areas" },
  { value: "10+", label: "Datasets" },
];

function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;
    let t = 0;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, size: Math.random() * 2 + 0.5, alpha: Math.random() * 0.5 + 0.1 });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.003;

      const grad1 = ctx.createRadialGradient(canvas.width * 0.3 + Math.sin(t) * 100, canvas.height * 0.4 + Math.cos(t * 0.7) * 80, 0, canvas.width * 0.3, canvas.height * 0.4, canvas.width * 0.6);
      grad1.addColorStop(0, "rgba(34,197,94,0.07)");
      grad1.addColorStop(1, "transparent");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const grad2 = ctx.createRadialGradient(canvas.width * 0.7 + Math.cos(t * 0.8) * 120, canvas.height * 0.6 + Math.sin(t * 1.1) * 100, 0, canvas.width * 0.7, canvas.height * 0.6, canvas.width * 0.5);
      grad2.addColorStop(0, "rgba(139,92,246,0.06)");
      grad2.addColorStop(1, "transparent");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100,200,150,${p.alpha})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(34,197,94,${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className={`transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm rounded-full px-4 py-1.5 mb-8">
              <Zap size={14} /> LeetCode for Quant Finance
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-slate-100 leading-[1.05] mb-6">
              Master Quant Finance<br />
              <span className="bg-gradient-to-r from-brand-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">by doing, not watching</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              Solve quant coding challenges, backtest strategies on real market data, explore research papers — compete and level up.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/problems" className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-dark-900 font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40">
                Start Solving <ArrowRight size={18} />
              </Link>
              <Link href="/strategy-lab" className="flex items-center gap-2 bg-slate-800/80 backdrop-blur border border-slate-700 hover:border-slate-500 text-slate-200 font-semibold px-7 py-3.5 rounded-xl transition-all">
                Build a Strategy
              </Link>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-y border-slate-800/50 bg-slate-900/30 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-6 py-6 grid grid-cols-4 gap-6">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-black text-brand-400 font-mono">{value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories grid */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 mb-3">7 Problem Categories</h2>
            <p className="text-slate-400">From basic statistics to advanced trading strategies</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {CATEGORIES.map(({ key, label, icon: Icon, color, desc }) => (
              <Link key={key} href={`/problems?category=${key}`}
                className="group relative bg-slate-900/60 backdrop-blur border border-slate-800 hover:border-slate-600 rounded-2xl p-5 transition-all hover:-translate-y-1 overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(circle at 50% 0%, ${color}10, transparent 60%)` }} />
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                    <Icon size={20} style={{ color }} />
                  </div>
                  <h3 className="font-bold text-slate-100 mb-1 group-hover:text-white transition-colors">{label}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </Link>
            ))}
            <Link href="/problems" className="group bg-gradient-to-br from-brand-500/10 to-brand-600/5 border border-brand-500/20 rounded-2xl p-5 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-all">
              <ArrowRight size={24} className="text-brand-500 mb-2" />
              <span className="text-sm font-semibold text-brand-400">View All Problems</span>
            </Link>
          </div>
        </section>

        {/* Features row */}
        <section className="max-w-6xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-6">
          {[
            { icon: Code2, title: "In-Browser Execution", desc: "Code runs in your browser via Pyodide — instant results, no server wait.", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
            { icon: Flame, title: "Daily Streaks", desc: "Build momentum. Solve one problem a day to grow your streak and earn badges.", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20" },
            { icon: BookOpen, title: "Research Library", desc: "Top quant papers — Black-Scholes, Fama-French, Kelly Criterion — with implementations.", color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20" },
          ].map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
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
