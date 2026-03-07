"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "@/lib/api";
import { useAuthStore } from "@/hooks/useAuth";
import { Play, Save, Activity, BarChart2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";

const CodeEditor = dynamic(() => import("@/components/editor/CodeEditor"), { ssr: false });

const STARTER = `def strategy(data):
    """
    data: pandas DataFrame (columns: open, high, low, close, volume)
    Return: pandas Series of signals (-1, 0, 1) with same index as data
    """
    import pandas as pd
    
    # SMA Crossover
    short = data['close'].rolling(20).mean()
    long_ = data['close'].rolling(50).mean()
    
    signals = pd.Series(0, index=data.index)
    signals[short > long_] = 1
    signals[short <= long_] = -1
    return signals
`;

const DATASET_GROUPS = [
  { group: "Equity Indices", items: [
    { key: "spy_daily", label: "S&P 500 (SPY)" },
    { key: "nifty_daily", label: "NIFTY 50" },
    { key: "banknifty_daily", label: "Bank Nifty" },
  ]},
  { group: "FX", items: [
    { key: "eurusd_daily", label: "EUR/USD" },
    { key: "inrusd_daily", label: "INR/USD" },
    { key: "jpyusd_daily", label: "JPY/USD" },
  ]},
  { group: "Commodities", items: [
    { key: "crude_daily", label: "Crude Oil" },
    { key: "natgas_daily", label: "Natural Gas" },
    { key: "gold_daily", label: "Gold" },
    { key: "silver_daily", label: "Silver" },
  ]},
  { group: "Synthetic", items: [
    { key: "synthetic_mean_revert", label: "Mean-Reverting" },
    { key: "synthetic_trend", label: "Trending" },
  ]},
];

function MetricCard({ label, value, good }: { label: string; value: string; good?: boolean | null }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className={clsx("text-lg font-bold font-mono", good === true ? "text-brand-400" : good === false ? "text-red-400" : "text-slate-200")}>{value}</div>
    </div>
  );
}

export default function StrategyLab() {
  const { user } = useAuthStore();
  const [code, setCode] = useState(STARTER);
  const [dataset, setDataset] = useState("spy_daily");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [name, setName] = useState("My Strategy");
  const [saving, setSaving] = useState(false);

  const runBacktest = async () => {
    if (!user) { toast.error("Sign in to run backtest"); return; }
    setRunning(true); setResult(null);
    try {
      const r = await api.post("/strategies/backtest", { code, dataset_key: dataset });
      setResult(r.data);
      if (!r.data.error) toast.success(`Sharpe: ${r.data.sharpe_ratio?.toFixed(3)}`);
      else toast.error("Backtest error — check output");
    } catch { toast.error("Backtest failed"); }
    finally { setRunning(false); }
  };

  const saveStrategy = async () => {
    if (!user || !result) { toast.error(user ? "Run backtest first" : "Sign in first"); return; }
    setSaving(true);
    try {
      await api.post("/strategies", { name, code, dataset_key: dataset, is_public: true });
      toast.success("Strategy saved!");
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  const chartData = result?.equity_curve
    ? result.equity_curve.dates.map((d: string, i: number) => ({ date: d, value: result.equity_curve.values[i] }))
    : [];

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <div className="flex-1 flex flex-col border-r border-slate-800">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <input value={name} onChange={e => setName(e.target.value)} className="bg-transparent text-slate-200 text-sm font-medium focus:outline-none border-b border-transparent focus:border-slate-600 w-40" />
            <select value={dataset} onChange={e => setDataset(e.target.value)} className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1.5">
              {DATASET_GROUPS.map(g => (
                <optgroup key={g.group} label={g.group}>
                  {g.items.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={saveStrategy} disabled={saving || !result} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-700 text-slate-400 hover:text-slate-200 rounded transition-colors disabled:opacity-40">
              <Save size={12} /> Save
            </button>
            <button onClick={runBacktest} disabled={running} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-brand-500 hover:bg-brand-400 text-dark-900 rounded transition-colors disabled:opacity-50">
              {running ? <><Loader2 size={12} className="animate-spin" /> Running...</> : <><Play size={12} /> Run Backtest</>}
            </button>
          </div>
        </div>
        <div className="flex-1 p-3">
          <CodeEditor value={code} onChange={setCode} height="100%" />
        </div>
      </div>

      <div className="w-[420px] shrink-0 flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2"><Activity size={14} /> Backtest Results</h2>
        </div>

        {!result && !running && (
          <div className="flex-1 flex items-center justify-center text-slate-600 flex-col gap-3 p-8 text-center">
            <BarChart2 size={40} />
            <p className="text-sm">Select a dataset and run a backtest to see performance metrics</p>
          </div>
        )}
        {running && (
          <div className="flex-1 flex items-center justify-center flex-col gap-2 text-slate-500">
            <Loader2 size={28} className="animate-spin" />
            <p className="text-sm">Running backtest...</p>
          </div>
        )}
        {result && !result.error && (
          <div className="p-4 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-500 mb-2">Equity Curve</div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#64748b" }} tickFormatter={v => v.slice(2, 7)} interval={Math.floor(chartData.length / 5)} />
                  <YAxis tick={{ fontSize: 9, fill: "#64748b" }} tickFormatter={v => v.toFixed(2)} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", fontSize: 11 }} />
                  <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="Sharpe Ratio" value={result.sharpe_ratio?.toFixed(3)} good={result.sharpe_ratio > 1} />
              <MetricCard label="Sortino" value={result.sortino_ratio?.toFixed(3)} good={result.sortino_ratio > 1} />
              <MetricCard label="Total Return" value={`${(result.total_return * 100).toFixed(2)}%`} good={result.total_return > 0} />
              <MetricCard label="Ann. Return" value={`${(result.annualized_return * 100).toFixed(2)}%`} good={result.annualized_return > 0} />
              <MetricCard label="Max Drawdown" value={`${(result.max_drawdown * 100).toFixed(2)}%`} good={result.max_drawdown > -0.2} />
              <MetricCard label="Volatility" value={`${(result.volatility * 100).toFixed(2)}%`} />
              <MetricCard label="Alpha" value={result.alpha?.toFixed(4)} good={result.alpha > 0} />
              <MetricCard label="Beta" value={result.beta?.toFixed(3)} />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-500 font-mono">
              {result.num_days} days · turnover {(result.turnover * 100).toFixed(2)}%/day
            </div>
          </div>
        )}
        {result?.error && (
          <div className="p-4">
            <pre className="text-xs text-red-400 bg-red-400/5 border border-red-400/20 rounded p-3 font-mono whitespace-pre-wrap overflow-auto">{result.error}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
