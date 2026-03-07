"use client";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false, loading: () => <div className="h-full bg-slate-900 animate-pulse rounded" /> });

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
  readOnly?: boolean;
}

export default function CodeEditor({ value, onChange, language = "python", height = "400px", readOnly = false }: CodeEditorProps) {
  return (
    <div className="rounded-lg overflow-hidden border border-slate-700" style={{ height }}>
      <MonacoEditor
        height={height}
        language={language}
        value={value}
        onChange={(v) => onChange(v || "")}
        theme="vs-dark"
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          readOnly,
          lineNumbers: "on",
          renderLineHighlight: "all",
          bracketPairColorization: { enabled: true },
          suggest: { showKeywords: true },
          padding: { top: 12, bottom: 12 },
          smoothScrolling: true,
        }}
      />
    </div>
  );
}
