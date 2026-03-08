"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/hooks/useAuth";
import { Trophy, Flame, Code2, TrendingUp, Award, CheckCircle2, BookOpen } from "lucide-react";
import clsx from "clsx";

const CAT_COLORS: Record<string, string> = {
  statistics: "bg-blue-400/20 text-blue-300 border-blue-400/30",
  options: "bg-purple-400/20 text-purple-300 border-purple-400/30",
  futures: "bg-yellow-400/20 text-yellow-300 border-yellow-400/30",
  risk: "bg-red-400/20 text-red-300 border-red-400/30",
  probability: "bg-green-400/20 text-green-300 border-green-400/30",
  strategies: "bg-orange-400/20 text-orange-300 border-orange-400/30",
  portfolio: "bg-cyan-400/20 text-cyan-300 border-cyan-400/30",
  brain: "bg-pink-400/20 text-pink-300 border-pink-400/30",
};

export default function ProfilePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    api.get("/dashboard").then(r => setData(r.data)).catch(() => router.push("/auth/login"));
  }, [user]);

  if (!data) return <div className="flex items-center justify-center h-64 text-slate-500">Loading profile...</div>;

  const initials = data.username.slice(0, 2).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Profile header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-6 flex items-start gap-6">
        <div className="w-20 h-20 rounded-2xl bg-brand-500/20 border-2 border-brand-500/40 flex items-center justify-center text-3xl font-black text-brand-400 shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-black text-slate-100">{data.username}</h1>
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-yellow-400">
              <Trophy size={15} />
              <span className="font-bold">{data.total_points.toLocaleString()}</span>
              <span className="text-xs text-slate-500">pts</span>
            </div>
            <div className="flex items-center gap-1.5 text-orange-400">
              <Flame size={15} />
              <span className="font-bold">{data.current_streak}</span>
              <span className="text-xs text-slate-500">day streak</span>
            </div>
            <div className="flex items-center gap-1.5 text-brand-400">
              <CheckCircle2 size={15} />
              <span className="font-bold">{data.problems_solved}</span>
              <span className="text-xs text-slate-500">solved</span>
            </div>
            <div className="flex items-center gap-1.5 text-purple-400">
              <TrendingUp size={15} />
              <span className="font-bold">{data.strategies_count}</span>
              <span className="text-xs text-slate-500">strategies</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Badges */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
            <Award size={15} className="text-yellow-400" /> Badges ({data.badges?.length || 0})
          </h2>
          {data.badges?.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-6">Solve problems to earn badges!</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {data.badges?.map((b: any) => (
                <div key={b.key} className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5">
                  <span className="text-xl">{b.icon}</span>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{b.name}</div>
                    <div className="text-xs text-slate-600">{b.awarded_at?.slice(0,10)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progress by category */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
            <Code2 size={15} className="text-brand-400" /> Progress by Category
          </h2>
          {Object.entries(data.progress_by_category || {}).length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-6">Start solving to track progress!</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(data.progress_by_category || {}).map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between">
                  <span className={clsx("text-xs px-2 py-0.5 rounded-full border capitalize", CAT_COLORS[cat] || "bg-slate-800 text-slate-400 border-slate-700")}>{cat}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${Math.min(100, (count as number) * 15)}%` }} />
                    </div>
                    <span className="text-xs font-mono text-slate-400 w-8 text-right">{count as number}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Streak info */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
            <Flame size={15} className="text-orange-400" /> Streak Stats
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center bg-slate-800 rounded-xl p-4">
              <div className="text-3xl font-black text-orange-400">{data.current_streak}</div>
              <div className="text-xs text-slate-500 mt-1">Current Streak</div>
            </div>
            <div className="text-center bg-slate-800 rounded-xl p-4">
              <div className="text-3xl font-black text-yellow-400">{data.max_streak}</div>
              <div className="text-xs text-slate-500 mt-1">Best Streak</div>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
            <BookOpen size={15} className="text-purple-400" /> Recent Activity
          </h2>
          <div className="space-y-2">
            {data.recent_submissions?.slice(0, 5).map((s: any, i: number) => (
              <div key={i} className="flex items-center gap-3 py-1">
                <div className={clsx("w-1.5 h-1.5 rounded-full shrink-0", s.status === "accepted" ? "bg-brand-500" : "bg-red-400")} />
                <span className="text-xs text-slate-400 truncate flex-1">{s.problem_title}</span>
                <span className="text-xs text-slate-600 shrink-0">{s.created_at?.slice(0,10)}</span>
              </div>
            ))}
            {(!data.recent_submissions || data.recent_submissions.length === 0) && (
              <p className="text-slate-600 text-sm text-center py-4">No activity yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
