"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import dynamic from "next/dynamic";
import api from "@/lib/api";
import { usePyodide } from "@/components/editor/PyodideRunner";
import { BookOpen, Play, Loader2, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";

const CodeEditor = dynamic(() => import("@/components/editor/CodeEditor"), { ssr: false });

const CAT_COLOR: Record<string, string> = { statistics:"text-blue-400 bg-blue-400/10 border-blue-400/20", options:"text-purple-400 bg-purple-400/10 border-purple-400/20", futures:"text-yellow-400 bg-yellow-400/10 border-yellow-400/20", risk:"text-red-400 bg-red-400/10 border-red-400/20", probability:"text-green-400 bg-green-400/10 border-green-400/20", strategies:"text-orange-400 bg-orange-400/10 border-orange-400/20", portfolio:"text-cyan-400 bg-cyan-400/10 border-cyan-400/20" };

export default function ResearchModulePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { ready: pyReady, loading: pyLoading, runTests } = usePyodide();
  const [module, setModule] = useState<any>(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [expandedPaper, setExpandedPaper] = useState<number | null>(null);

  useEffect(() => {
    api.get(`/research/${slug}`).then(r => { setModule(r.data); setCode(r.data.starter_code || "# Write your code here\n"); }).catch(() => router.push("/research"));
  }, [slug]);

  const runCode = async () => {
    if (!pyReady) { toast.error("Python loading..."); return; }
    setRunning(true); setOutput("");
    try {
      const py = (window as any).pyodide;
      if (!py) throw new Error("Pyodide not ready");
      const result = await py.runPythonAsync(code);
      setOutput(result !== undefined ? String(result) : "Code ran successfully (no return value)");
      toast.success("Ran successfully");
    } catch (e: any) {
      setOutput(String(e));
      toast.error("Error in code");
    } finally {
      setRunning(false);
    }
  };

  if (!module) return <div className="flex items-center justify-center h-64 text-slate-500">Loading...</div>;

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Left panel — content + papers */}
      <div className="w-[500px] shrink-0 border-r border-slate-800 overflow-y-auto">
        <div className="p-8">
          <div className={clsx("inline-flex items-center gap-2 text-xs rounded-full px-3 py-1 border mb-5 capitalize", CAT_COLOR[module.category] || "text-slate-400 border-slate-700")}>
            <BookOpen size={11} /> {module.category}
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-6">{module.title}</h1>
          <div className="prose prose-invert prose-sm max-w-none mb-8">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{module.content}</ReactMarkdown>
          </div>

          {module.papers?.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <BookOpen size={14} /> Key Research Papers ({module.papers.length})
              </h2>
              <div className="space-y-2">
                {module.papers.map((paper: any, i: number) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <button onClick={() => setExpandedPaper(expandedPaper === i ? null : i)}
                      className="w-full flex items-start gap-3 p-4 text-left hover:bg-slate-800/50 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-500 shrink-0 mt-0.5">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-200 leading-snug">{paper.title}</p>
                      </div>
                      {expandedPaper === i ? <ChevronDown size={14} className="text-slate-500 shrink-0 mt-1" /> : <ChevronRight size={14} className="text-slate-500 shrink-0 mt-1" />}
                    </button>
                    {expandedPaper === i && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-800">
                        <p className="text-xs text-slate-400 mb-3">{paper.key_idea}</p>
                        {paper.math && (
                          <div className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 font-mono text-xs text-brand-300">{paper.math}</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right panel — code playground */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">Python Playground</span>
            <div className={clsx("flex items-center gap-1 text-xs px-2 py-0.5 rounded-full", pyReady ? "text-brand-500 bg-brand-500/10" : "text-slate-500 bg-slate-800")}>
              {pyLoading ? <Loader2 size={9} className="animate-spin" /> : <div className={clsx("w-1.5 h-1.5 rounded-full", pyReady ? "bg-brand-500" : "bg-slate-500")} />}
              {pyLoading ? "Loading..." : pyReady ? "Ready" : "Offline"}
            </div>
          </div>
          <button onClick={runCode} disabled={running || !pyReady}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-purple-500 hover:bg-purple-400 text-white rounded transition-colors disabled:opacity-40">
            {running ? <><Loader2 size={12} className="animate-spin" /> Running...</> : <><Play size={12} /> Run Code</>}
          </button>
        </div>

        <div className={clsx("flex-1 p-3", output ? "pb-0" : "")}>
          <CodeEditor value={code} onChange={setCode} height={output ? "60%" : "100%"} />
        </div>

        {output && (
          <div className="p-3 pt-2">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-52 overflow-auto">
              <div className="text-xs text-slate-600 font-mono mb-2">Output</div>
              <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">{output}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
