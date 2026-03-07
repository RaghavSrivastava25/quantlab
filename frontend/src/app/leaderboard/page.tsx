"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Trophy, Medal, Flame } from "lucide-react";
import clsx from "clsx";

const MEDAL = ["text-yellow-400", "text-slate-300", "text-amber-600"];

function Avatar({ username }: { username: string }) {
  return <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-sm font-bold text-brand-400">{username[0].toUpperCase()}</div>;
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<"points"|"strategy">("points");
  const [leaders, setLeaders] = useState<any[]>([]);
  const [strats, setStrats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/leaderboard"), api.get("/leaderboard/strategies")]).then(([l, s]) => {
      setLeaders(l.data); setStrats(s.data); setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Trophy size={28} className="text-yellow-400" />
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Leaderboard</h1>
          <p className="text-slate-400 text-sm">Global rankings</p>
        </div>
      </div>

      <div className="flex border-b border-slate-800 mb-6">
        {(["points","strategy"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={clsx("px-5 py-3 text-sm font-semibold transition-colors", tab === t ? "text-brand-500 border-b-2 border-brand-500" : "text-slate-500 hover:text-slate-300")}>
            {t === "points" ? "Challenge Rankings" : "Strategy Rankings"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(10)].map((_, i) => <div key={i} className="h-16 bg-slate-800/50 rounded-xl animate-pulse" />)}</div>
      ) : tab === "points" ? (
        <div className="space-y-2">
          {leaders.map((u: any) => (
            <div key={u.user_id} className={clsx("flex items-center gap-4 px-5 py-4 rounded-xl border", u.rank <= 3 ? "bg-slate-900 border-slate-700" : "bg-slate-900/40 border-slate-800")}>
              <div className="w-8 text-center shrink-0">
                {u.rank <= 3 ? <Medal size={18} className={MEDAL[u.rank - 1]} /> : <span className="text-sm text-slate-600 font-mono">#{u.rank}</span>}
              </div>
              <Avatar username={u.username} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-100">{u.username}</div>
                <div className="text-xs text-slate-500">{u.problems_solved} problems solved</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-brand-400 font-black font-mono text-lg">{u.total_points.toLocaleString()}</div>
                <div className="text-xs text-slate-600">pts</div>
              </div>
            </div>
          ))}
          {leaders.length === 0 && <div className="text-center py-20 text-slate-600">No users yet. Be first!</div>}
        </div>
      ) : (
        <div className="space-y-2">
          {strats.map((s: any) => (
            <div key={`${s.user_id}-${s.strategy_name}`} className={clsx("flex items-center gap-4 px-5 py-4 rounded-xl border", s.rank <= 3 ? "bg-slate-900 border-slate-700" : "bg-slate-900/40 border-slate-800")}>
              <div className="w-8 text-center shrink-0">
                {s.rank <= 3 ? <Medal size={18} className={MEDAL[s.rank - 1]} /> : <span className="text-sm text-slate-600 font-mono">#{s.rank}</span>}
              </div>
              <Avatar username={s.username} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-100 truncate">{s.strategy_name}</div>
                <div className="text-xs text-slate-500">by {s.username} · {s.dataset_key.replace("_daily","").replace("_"," ")}</div>
              </div>
              <div className="text-right shrink-0">
                <div className={clsx("font-black font-mono text-lg", s.sharpe_ratio >= 1 ? "text-brand-400" : s.sharpe_ratio >= 0 ? "text-yellow-400" : "text-red-400")}>{s.sharpe_ratio.toFixed(3)}</div>
                <div className="text-xs text-slate-600">Sharpe</div>
              </div>
            </div>
          ))}
          {strats.length === 0 && <div className="text-center py-20 text-slate-600">No public strategies yet.</div>}
        </div>
      )}
    </div>
  );
}
