"use client";
import { useEffect, useRef, useState, useCallback } from "react";

declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<any>;
    pyodide: any;
  }
}

interface TestCase {
  input: Record<string, any>;
  expected: any;
}

interface TestResult {
  passed: boolean;
  actual: string;
  expected: string;
  error: string | null;
  case_index: number;
}

interface RunResult {
  passed: number;
  total: number;
  test_results: TestResult[];
  runtime_ms: number;
  error: string | null;
}

export function usePyodide() {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const pyRef = useRef<any>(null);

  const load = useCallback(async () => {
    if (pyRef.current || loading) return;
    setLoading(true);
    try {
      if (!window.loadPyodide) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js";
          s.onload = () => resolve();
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }
      const py = await window.loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/" });
      await py.loadPackagesFromImports("import numpy; import pandas");
      pyRef.current = py;
      window.pyodide = py;
      setReady(true);
    } catch (e) {
      console.error("Pyodide load failed:", e);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => { load(); }, []);

  const runTests = useCallback(async (code: string, testCases: { cases: TestCase[]; function: string }): Promise<RunResult> => {
    if (!pyRef.current) return { passed: 0, total: testCases.cases.length, test_results: [], runtime_ms: 0, error: "Pyodide not loaded" };
    const py = pyRef.current;
    const start = performance.now();
    const results: TestResult[] = [];
    let passed = 0;

    const runnerCode = `
import json, math, traceback

def _compare(actual, expected, tol=1e-4):
    if expected is None:
        return actual is None
    if actual is None:
        return False
    if isinstance(expected, float):
        if math.isnan(expected): return isinstance(actual, float) and math.isnan(actual)
        return isinstance(actual, (int, float)) and abs(float(actual) - expected) < tol
    if isinstance(expected, list):
        if not isinstance(actual, (list, tuple)) or len(actual) != len(expected): return False
        return all(_compare(a, e, tol) for a, e in zip(actual, expected))
    if isinstance(expected, tuple):
        if not isinstance(actual, (list, tuple)) or len(actual) != len(expected): return False
        return all(_compare(a, e, tol) for a, e in zip(actual, expected))
    return actual == expected

${code}
`;

    try {
      await py.runPythonAsync(runnerCode);
    } catch (e: any) {
      return { passed: 0, total: testCases.cases.length, test_results: [], runtime_ms: Math.round(performance.now() - start), error: String(e) };
    }

    for (let i = 0; i < testCases.cases.length; i++) {
      const tc = testCases.cases[i];
      const fnName = testCases.function;
      const argsJson = JSON.stringify(tc.input);
      const expectedJson = JSON.stringify(tc.expected);
      const specialCheck = tc.expected === "__len_check__";

      try {
        const callCode = `
_inputs = ${argsJson}
_expected = ${expectedJson}
_fn = ${fnName}
try:
    _actual = _fn(**_inputs)
    if ${specialCheck ? "True" : "False"}:
        _result = {"passed": _actual is not None and len(_actual) == 3, "actual": str(type(_actual)), "expected": "3-tuple", "error": None}
    else:
        _p = _compare(_actual, _expected)
        _result = {"passed": _p, "actual": str(_actual)[:200], "expected": str(_expected)[:200], "error": None}
except Exception as _e:
    _result = {"passed": False, "actual": None, "expected": str(_expected)[:200], "error": traceback.format_exc()[-300:]}
import json as _json
_json.dumps(_result)
`;
        const raw = await py.runPythonAsync(callCode);
        const res = JSON.parse(raw);
        if (res.passed) passed++;
        results.push({ ...res, case_index: i });
      } catch (e: any) {
        results.push({ passed: false, actual: null as any, expected: String(tc.expected), error: String(e), case_index: i });
      }
    }

    return { passed, total: testCases.cases.length, test_results: results, runtime_ms: Math.round(performance.now() - start), error: null };
  }, []);

  return { ready, loading, runTests };
}
