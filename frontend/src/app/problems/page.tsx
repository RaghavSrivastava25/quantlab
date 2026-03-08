"use client";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { ChevronRight } from "lucide-react";
import clsx from "clsx";

interface Problem { id: number; slug: string; title: string; difficulty: "easy"|"medium"|"hard"; category: string; points: number; tags: string[] }

const DIFF_BG: Record<string,string> = {
  easy: "bg-brand-500/10 text-brand-400 border-brand-500/20",
  medium: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  hard: "bg-red-400/10 text-red-400 border-red-400/20",
};
const CATEGORIES = ["all","statistics","options","futures","risk","probability","strategies","portfolio","brain"];
const CAT_COLORS: Record<string,string> = {
  statistics:"text-blue-400 bg-blue-400/10 border-blue-400/20",
  options:"text-purple-400 bg-purple-400/10 border-purple-400/20",
  futures:"text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  risk:"text-red-400 bg-red-400/10 border-red-400/20",
  probability:"text-green-400 bg-green-400/10 border-green-400/20",
  strategies:"text-orange-400 bg-orange-400/10 border-orange-400/20",
  portfolio:"text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  brain:"text-pink-400 bg-pink-400/10 border-pink-400/20",
};

function ProblemsContent() {
  const searchParams = useSearchParams();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") || "all");

  useEffect(() => {
    setLoading(true);
    setError("");
    const p = new URLSearchParams();
    if (difficulty) p.set("difficulty", difficulty);
    if (category && category !== "all") p.set("category", category);
    api.get(`/problems?${p}`)
      .then(r => { setProblems(r.data); setLoading(false); })
      .catch(e => { setError("Could not load problems — backend may be starting up (free tier). Retry in 30s."); setLoading(false); });
  }, [difficulty, category]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-1">Problems</h1>
        <p className="text-slate-400">Quant challenges across 8 categories — run code in your browser</p>
      </div>

      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-2 flex-wrap">
          {["", "easy", "medium", "hard"].map(d => (
            <button key={d||"all"} onClick={() => setDifficulty(d)}
              className={clsx("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors capitalize",
                difficulty === d ? "bg-slate-700 text-slate-100 border-slate-600" : "bg-transparent text-slate-500 border-slate-800 hover:border-slate-600 hover:text-slate-300")}>
              {d || "All Levels"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={clsx("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors capitalize",
                category === c
                  ? c === "all" ? "bg-slate-700 text-slate-100 border-slate-600" : CAT_COLORS[c]
                  : "bg-transparent text-slate-500 border-slate-800 hover:border-slate-600 hover:text-slate-300")}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-xl px-4 py-3 mb-6 text-sm flex items-center justify-between">
          {error}
          <button onClick={() => { setError(""); setLoading(true); api.get("/problems").then(r => { setProblems(r.data); setLoading(false); }).catch(() => setLoading(false)); }}
            className="ml-4 underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-16 bg-slate-800/40 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {problems.map((p) => (
            <Link key={p.id} href={`/problems/${p.slug}`}
              className="group flex items-center justify-between bg-slate-900/70 hover:bg-slate-800/70 border border-slate-800 hover:border-slate-700 rounded-xl px-5 py-4 transition-all">
              <div className="flex items-center gap-4 min-w-0">
                <span className={clsx("text-xs font-bold px-2.5 py-1 rounded-full border capitalize shrink-0", DIFF_BG[p.difficulty])}>
                  {p.difficulty}
                </span>
                <div className="min-w-0">
                  <span className="font-semibold text-slate-200 group-hover:text-white">{p.title}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={clsx("text-xs px-2 py-0.5 rounded-full border capitalize", CAT_COLORS[p.category] || "text-slate-500 border-slate-700")}>
                      {p.category}
                    </span>
                    {p.tags?.slice(0,2).map(t => (
                      <span key={t} className="text-xs text-slate-600">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-slate-500 font-mono">{p.points}pts</span>
                <ChevronRight size={16} className="text-slate-600 group-hover:text-brand-500 transition-colors" />
              </div>
            </Link>
          ))}
          {problems.length === 0 && !loading && (
            <div className="text-center py-16 text-slate-500">No problems found for this filter.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProblemsPage() {
  return <Suspense fallback={<div className="flex items-center justify-center h-64 text-slate-500">Loading...</div>}><ProblemsContent /></Suspense>;
}
