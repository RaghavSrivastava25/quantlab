"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "@/lib/api";
import { useAuthStore } from "@/hooks/useAuth";
import { usePyodide } from "@/components/editor/PyodideRunner";
import { Play, Send, CheckCircle2, XCircle, Clock, AlertCircle, RotateCcw, Flame, Award, Loader2 } from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";

const CodeEditor = dynamic(() => import("@/components/editor/CodeEditor"), { ssr: false });

interface Problem {
  id: number; slug: string; title: string; description: string;
  difficulty: string; category: string; starter_code: string; points: number;
  test_cases: { cases: any[]; function: string };
}

const DIFF_COLOR: Record<string, string> = { easy: "text-brand-500", medium: "text-yellow-400", hard: "text-red-400" };
const DIFF_BG: Record<string, string> = { easy: "bg-brand-500/10 border-brand-500/20", medium: "bg-yellow-400/10 border-yellow-400/20", hard: "bg-red-400/10 border-red-400/20" };

export default function ProblemPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { ready: pyReady, loading: pyLoading, runTests } = usePyodide();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("");
  const [running, setRunning] = useState(false);
  const [localResult, setLocalResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState<any>(null);
  const [tab, setTab] = useState<"description" | "submissions">("description");
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    api.get(`/problems/${slug}`).then(r => { setProblem(r.data); setCode(r.data.starter_code); }).catch(() => router.push("/problems"));
  }, [slug]);

  const handleRun = async () => {
    if (!problem) return;
    if (!pyReady) { toast.error("Python is loading, please wait..."); return; }
    setRunning(true);
    setLocalResult(null);
    try {
      const result = await runTests(code, problem.test_cases);
      setLocalResult(result);
    } catch (e: any) {
      setLocalResult({ error: String(e), passed: 0, total: 0, test_results: [] });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) { toast.error("Sign in to submit"); router.push("/auth/login"); return; }
    if (!problem) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/problems/${slug}/submit`, { code });
      setSubmission(res.data);
      if (res.data.status === "accepted") {
        toast.success(`✅ Accepted! +${problem.points}pts`);
        if (res.data.streak > 0) toast(`🔥 ${res.data.streak} day streak!`, { icon: "🔥" });
        if (res.data.new_badges?.length > 0) {
          res.data.new_badges.forEach((b: string) => toast(`🏆 Badge earned!`, { duration: 4000 }));
        }
      } else {
        toast.error(res.data.status.replace("_", " "));
      }
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const loadHistory = async () => {
    if (!user) return;
    try { const r = await api.get(`/problems/${slug}/submissions`); setHistory(r.data); } catch {}
  };

  const activeResult = localResult || submission;

  if (!problem) return <div className="flex items-center justify-center h-64 text-slate-500">Loading...</div>;

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Left panel */}
      <div className="w-[460px] shrink-0 flex flex-col border-r border-slate-800">
        <div className="flex border-b border-slate-800">
          {(["description", "submissions"] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); if (t === "submissions") loadHistory(); }}
              className={clsx("flex-1 py-3 text-sm font-medium capitalize transition-colors", tab === t ? "text-brand-500 border-b-2 border-brand-500" : "text-slate-500 hover:text-slate-300")}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === "description" ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-xl font-bold text-slate-100">{problem.title}</h1>
              </div>
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <span className={clsx("text-sm font-semibold capitalize px-2.5 py-1 rounded-full border", DIFF_BG[problem.difficulty], DIFF_COLOR[problem.difficulty])}>{problem.difficulty}</span>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded capitalize">{problem.category}</span>
                <span className="text-xs text-brand-500 font-mono font-bold">+{problem.points} pts</span>
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem.description}</ReactMarkdown>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              {history.length === 0 && <div className="text-slate-500 text-sm text-center py-10">No submissions yet</div>}
              {history.map((s: any) => (
                <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {s.status === "accepted" ? <CheckCircle2 size={14} className="text-brand-500" /> : <XCircle size={14} className="text-red-400" />}
                      <span className="text-sm capitalize text-slate-200">{s.status.replace("_", " ")}</span>
                    </div>
                    {s.score !== null && <span className="text-sm font-mono text-brand-400">{s.score}%</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono">Python 3.11</span>
            <div className={clsx("flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full", pyReady ? "text-brand-500 bg-brand-500/10" : "text-slate-500 bg-slate-800")}>
              {pyLoading ? <Loader2 size={10} className="animate-spin" /> : <div className={clsx("w-1.5 h-1.5 rounded-full", pyReady ? "bg-brand-500" : "bg-slate-500")} />}
              {pyLoading ? "Loading Python..." : pyReady ? "Python ready" : "Python offline"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCode(problem.starter_code)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 rounded transition-colors">
              <RotateCcw size={12} /> Reset
            </button>
            <button onClick={handleRun} disabled={running || !pyReady}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-100 rounded transition-colors disabled:opacity-40">
              {running ? <><Loader2 size={12} className="animate-spin" /> Running...</> : <><Play size={12} /> Run</>}
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-brand-500 hover:bg-brand-400 text-dark-900 rounded transition-colors disabled:opacity-50">
              {submitting ? <><Loader2 size={12} className="animate-spin" /> Submitting...</> : <><Send size={12} /> Submit</>}
            </button>
          </div>
        </div>

        <div className="flex-1 p-3 pb-0 min-h-0">
          <CodeEditor value={code} onChange={setCode} height="100%" />
        </div>

        {activeResult && (
          <div className="border-t border-slate-800 bg-slate-900/50 p-4 max-h-52 overflow-y-auto">
            {activeResult.error && !activeResult.test_results?.length ? (
              <pre className="text-xs text-red-400 bg-red-400/5 border border-red-400/20 rounded p-3 font-mono whitespace-pre-wrap">{activeResult.error}</pre>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-3">
                  {activeResult.passed === activeResult.total
                    ? <CheckCircle2 size={16} className="text-brand-500" />
                    : <XCircle size={16} className="text-red-400" />}
                  <span className="text-sm font-semibold text-slate-200">
                    {activeResult.passed}/{activeResult.total} test cases passed
                  </span>
                  {activeResult.runtime_ms && <span className="text-xs text-slate-500">{activeResult.runtime_ms}ms</span>}
                  {submission?.new_badges?.length > 0 && (
                    <div className="flex items-center gap-1 ml-2">
                      <Award size={14} className="text-yellow-400" />
                      <span className="text-xs text-yellow-400">{submission.new_badges.length} badge{submission.new_badges.length > 1 ? "s" : ""} earned!</span>
                    </div>
                  )}
                  {submission?.streak > 0 && (
                    <div className="flex items-center gap-1">
                      <Flame size={14} className="text-orange-400" />
                      <span className="text-xs text-orange-400">{submission.streak} day streak</span>
                    </div>
                  )}
                </div>
                <div className="grid gap-2">
                  {(activeResult.test_results || []).map((t: any, i: number) => (
                    <div key={i} className={clsx("rounded p-2.5 text-xs font-mono border", t.passed ? "bg-brand-500/5 border-brand-500/20" : "bg-red-500/5 border-red-500/20")}>
                      <div className="flex items-center gap-2">
                        {t.passed ? <CheckCircle2 size={12} className="text-brand-500" /> : <XCircle size={12} className="text-red-400" />}
                        <span className="text-slate-400">Case {i + 1}</span>
                      </div>
                      {!t.passed && (
                        <div className="pl-5 mt-1 space-y-0.5 text-slate-400">
                          <div>Expected: <span className="text-slate-200">{t.expected}</span></div>
                          <div>Got: <span className="text-red-300">{t.actual || t.error}</span></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
