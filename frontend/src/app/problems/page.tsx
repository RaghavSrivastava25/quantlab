"use client";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Circle, ChevronRight } from "lucide-react";
import clsx from "clsx";

interface Problem { id: number; slug: string; title: string; difficulty: "easy"|"medium"|"hard"; category: string; points: number; tags: string[] }

const DIFF_COLOR = { easy: "text-brand-500", medium: "text-yellow-400", hard: "text-red-400" };
const DIFF_BG = { easy: "bg-brand-500/10 border-brand-500/20", medium: "bg-yellow-400/10 border-yellow-400/20", hard: "bg-red-400/10 border-red-400/20" };
const CATEGORIES = ["all","statistics","options","futures","risk","probability","strategies","portfolio"];
const CAT_COLORS: Record<string,string> = { statistics:"text-blue-400 bg-blue-400/10 border-blue-400/20", options:"text-purple-400 bg-purple-400/10 border-purple-400/20", futures:"text-yellow-400 bg-yellow-400/10 border-yellow-400/20", risk:"text-red-400 bg-red-400/10 border-red-400/20", probability:"text-green-400 bg-green-400/10 border-green-400/20", strategies:"text-orange-400 bg-orange-400/10 border-orange-400/20", portfolio:"text-cyan-400 bg-cyan-400/10 border-cyan-400/20" };

function ProblemsContent() {
  const searchParams = useSearchParams();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") || "all");

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (difficulty) p.set("difficulty", difficulty);
    if (category && category !== "all") p.set("category", category);
    api.get(`/problems?${p}`).then(r => { setProblems(r.data); setLoading(false); });
  }, [difficulty, category]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-1">Problems</h1>
        <p className="text-slate-400">25+ quant challenges across 7 categories</p>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          {["", "easy", "medium", "hard"].map(d => (
            <button key={d||"all"} onClick={() => setDifficulty(d)}
              className={clsx("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors capitalize",
                difficulty === d ? "bg-slate-700 text-slate-100 border-slate-600" : "bg-transparent text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-400")}>
              {d || "All Levels"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={clsx("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors capitalize",
                category === c
                  ? c === "all" ? "bg-slate-700 text-slate-100 border-slate-600" : `border ${CAT_COLORS[c] || ""}`
                  : "bg-transparent text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-400")}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="h-16 bg-slate-800/50 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {problems.map(p => (
            <Link key={p.id} href={`/problems/${p.slug}`}
              className="flex items-center gap-4 bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 rounded-xl px-5 py-4 transition-all group">
              <Circle size={16} className="text-slate-700 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-slate-100 font-medium group-hover:text-brand-400 transition-colors">{p.title}</span>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {p.tags?.slice(0,3).map(t => <span key={t} className="text-xs text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded">{t}</span>)}
                </div>
              </div>
              <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-full border capitalize shrink-0", CAT_COLORS[p.category] || "text-slate-400 bg-slate-800 border-slate-700")}>{p.category}</span>
              <span className={clsx("text-xs font-bold px-2.5 py-1 rounded-full border capitalize shrink-0", DIFF_BG[p.difficulty], DIFF_COLOR[p.difficulty])}>{p.difficulty}</span>
              <span className="text-xs font-mono text-brand-500 shrink-0">+{p.points}pts</span>
              <ChevronRight size={15} className="text-slate-700 group-hover:text-slate-500 shrink-0" />
            </Link>
          ))}
          {problems.length === 0 && <div className="text-center py-20 text-slate-500">No problems found.</div>}
        </div>
      )}
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
