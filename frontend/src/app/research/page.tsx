"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { BookOpen, ArrowRight } from "lucide-react";
import clsx from "clsx";

interface Module { id: number; slug: string; title: string; description: string; category: string }

const CAT_COLOR: Record<string,string> = {
  options:   "text-blue-400 bg-blue-400/10 border-blue-400/20",
  portfolio: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  risk:      "text-red-400 bg-red-400/10 border-red-400/20",
  factor:    "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  statistics:"text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  probability:"text-green-400 bg-green-400/10 border-green-400/20",
  strategies:"text-orange-400 bg-orange-400/10 border-orange-400/20",
  futures:   "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

export default function ResearchPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/research")
      .then(r => { setModules(r.data); setLoading(false); })
      .catch(() => { setError("Could not load — backend may be starting up (free tier). Retry in 30s."); setLoading(false); });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <BookOpen size={28} className="text-purple-400" />
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Research Library</h1>
          <p className="text-slate-400 text-sm">Landmark papers with interactive code implementations</p>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-xl px-4 py-3 mb-6 text-sm flex items-center justify-between">
          {error}
          <button onClick={() => { setError(""); setLoading(true); api.get("/research").then(r => { setModules(r.data); setLoading(false); }).catch(() => setLoading(false)); }}
            className="ml-4 underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">{[...Array(6)].map((_,i) => <div key={i} className="h-36 bg-slate-800/40 rounded-xl animate-pulse" />)}</div>
      ) : modules.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <BookOpen size={40} className="mx-auto mb-4 opacity-30" />
          <p>No modules loaded yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {modules.map(m => (
            <Link key={m.id} href={`/research/${m.slug}`}
              className="group bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-6 transition-all hover:-translate-y-0.5">
              <div className="flex items-start justify-between mb-3">
                <span className={clsx("text-xs font-semibold px-2.5 py-1 rounded-full border capitalize", CAT_COLOR[m.category] || "text-slate-400 bg-slate-800 border-slate-700")}>
                  {m.category}
                </span>
                <ArrowRight size={16} className="text-slate-600 group-hover:text-brand-400 transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-brand-400 transition-colors">{m.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{m.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
