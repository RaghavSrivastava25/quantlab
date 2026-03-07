"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/hooks/useAuth";
import { CheckCircle2, XCircle, AlertCircle, Clock, TrendingUp, Code2, Trophy, Target, Flame, Award } from "lucide-react";
import clsx from "clsx";

const STATUS_ICON: Record<string, React.ReactNode> = {
  accepted: <CheckCircle2 size={14} className="text-brand-500" />,
  wrong_answer: <XCircle size={14} className="text-red-400" />,
  error: <AlertCircle size={14} className="text-orange-400" />,
  timeout: <Clock size={14} className="text-yellow-400" />,
};

const CAT_COLORS: Record<string, string> = { statistics:"bg-blue-400/20 text-blue-300", options:"bg-purple-400/20 text-purple-300", futures:"bg-yellow-400/20 text-yellow-300", risk:"bg-red-400/20 text-red-300", probability:"bg-green-400/20 text-green-300", strategies:"bg-orange-400/20 text-orange-300", portfolio:"bg-cyan-400/20 text-cyan-300" };

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    api.get("/dashboard").then(r => setData(r.data)).catch(() => router.push("/auth/login"));
  }, [user]);

  if (!data) return <div className="flex items-center justify-center h-64 text-slate-500">Loading...</div>;

  const STATS = [
    { label: "Total Points", value: data.total_points.toLocaleString(), icon: <Trophy size={16} className="text-yellow-400" />, color: "text-yellow-400" },
    { label: "Problems Solved", value: data.problems_solved, icon: <CheckCircle2 size={16} className="text-brand-500" />, color: "text-brand-400" },
    { label: "Current Streak", value: `${data.current_streak} 🔥`, icon: <Flame size={16} className="text-orange-400" />, color: "text-orange-400" },
    { label: "Strategies", value: data.strategies_count, icon: <TrendingUp size={16} className="text-purple-400" />, color: "text-purple-400" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Welcome back, <span className="text-brand-500">{data.username}</span></h1>
          <p className="text-slate-400 mt-1">Best streak: <span className="text-orange-400 font-bold">{data.max_streak} days</span></p>
        </div>
        <div className="flex items-center gap-2 bg-orange-400/10 border border-orange-400/20 rounded-xl px-4 py-3">
          <Flame size={20} className="text-orange-400" />
          <div>
            <div className="text-lg font-black text-orange-400">{data.current_streak}</div>
            <div className="text-xs text-slate-500">day streak</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {STATS.map(({ label, value, icon, color }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500">{label}</span>
              {icon}
            </div>
            <div className={clsx("text-2xl font-black font-mono", color)}>{value}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      {data.badges?.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><Award size={15} /> Badges Earned ({data.badges.length})</h2>
          <div className="flex flex-wrap gap-3">
            {data.badges.map((b: any) => (
              <div key={b.key} title={b.awarded_at?.slice(0,10)} className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
                <span className="text-lg">{b.icon}</span>
                <span className="text-xs font-semibold text-slate-300">{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Progress by category */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><Target size={15} /> Progress by Category</h2>
          <div className="space-y-2">
            {Object.entries(data.progress_by_category || {}).length === 0
              ? <p className="text-slate-600 text-sm">Start solving to see progress!</p>
              : Object.entries(data.progress_by_category || {}).map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between">
                  <span className={clsx("text-xs px-2 py-0.5 rounded capitalize", CAT_COLORS[cat] || "bg-slate-800 text-slate-400")}>{cat}</span>
                  <span className="text-xs font-mono text-slate-400">{count as number} solved</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* Recent submissions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><Code2 size={15} /> Recent Submissions</h2>
          <div className="space-y-1">
            {data.recent_submissions.length === 0
              ? <p className="text-slate-600 text-sm text-center py-4">No submissions yet. <Link href="/problems" className="text-brand-500 hover:underline">Start solving!</Link></p>
              : data.recent_submissions.map((s: any) => (
                <Link key={s.id} href={`/problems/${s.problem_slug}`} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-slate-800 transition-colors">
                  {STATUS_ICON[s.status] || <AlertCircle size={14} className="text-slate-500" />}
                  <span className="flex-1 text-sm text-slate-300 truncate">{s.problem_title}</span>
                  {s.score !== null && <span className="text-xs font-mono text-brand-400">{s.score}%</span>}
                  <span className="text-xs text-slate-600">{s.created_at?.slice(0,10)}</span>
                </Link>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
