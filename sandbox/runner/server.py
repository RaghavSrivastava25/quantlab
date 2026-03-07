import json
import math
import time
import traceback
import signal
from flask import Flask, request, jsonify

app = Flask(__name__)


class TimeoutError(Exception):
    pass


def timeout_handler(signum, frame):
    raise TimeoutError("Execution timed out")


def compare_values(actual, expected, tol=1e-6):
    if expected is None:
        return actual is None
    if actual is None:
        return False
    if isinstance(expected, float):
        if math.isnan(expected):
            return isinstance(actual, float) and math.isnan(actual)
        return isinstance(actual, (int, float)) and abs(float(actual) - expected) < tol
    if isinstance(expected, list):
        if not isinstance(actual, list) or len(actual) != len(expected):
            return False
        return all(compare_values(a, e, tol) for a, e in zip(actual, expected))
    return actual == expected


def run_test_case(code: str, test_case: dict, namespace: dict) -> dict:
    fn_name = test_case.get("function", "solution")
    inputs = test_case.get("input", {})
    expected = test_case.get("expected")

    fn = namespace.get(fn_name)
    if not fn:
        return {"passed": False, "error": f"Function '{fn_name}' not found"}

    try:
        actual = fn(**inputs)
        passed = compare_values(actual, expected)
        return {
            "passed": passed,
            "actual": str(actual)[:200],
            "expected": str(expected)[:200],
            "error": None if passed else "Output mismatch",
        }
    except Exception:
        return {"passed": False, "actual": None, "expected": str(expected)[:200], "error": traceback.format_exc()[-300:]}


@app.route("/execute", methods=["POST"])
def execute():
    data = request.get_json()
    code = data.get("code", "")
    test_cases_config = data.get("test_cases", {})
    timeout = min(int(data.get("timeout", 10)), 15)

    cases = test_cases_config.get("cases", [])

    allowed_modules = {
        "math": __import__("math"),
        "statistics": __import__("statistics"),
        "numpy": __import__("numpy"),
        "pandas": __import__("pandas"),
        "scipy": __import__("scipy"),
    }

    namespace = {
        "__builtins__": {
            "abs": abs, "all": all, "any": any, "bool": bool, "dict": dict,
            "enumerate": enumerate, "filter": filter, "float": float, "int": int,
            "isinstance": isinstance, "len": len, "list": list, "map": map,
            "max": max, "min": min, "print": print, "range": range, "round": round,
            "set": set, "sorted": sorted, "str": str, "sum": sum, "tuple": tuple,
            "type": type, "zip": zip, "None": None, "True": True, "False": False,
        },
        **allowed_modules,
    }

    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(timeout)

    try:
        compile_start = time.time()
        compiled = compile(code, "<submission>", "exec")
        exec(compiled, namespace)
    except TimeoutError:
        signal.alarm(0)
        return jsonify({"error": "Compilation timed out", "passed": 0, "total": len(cases), "test_results": []})
    except SyntaxError as e:
        signal.alarm(0)
        return jsonify({"error": f"SyntaxError: {e}", "passed": 0, "total": len(cases), "test_results": []})
    except Exception:
        signal.alarm(0)
        return jsonify({"error": traceback.format_exc()[-500:], "passed": 0, "total": len(cases), "test_results": []})

    signal.alarm(0)

    test_results = []
    passed_count = 0

    for i, case in enumerate(cases):
        signal.signal(signal.SIGALRM, timeout_handler)
        signal.alarm(timeout)
        try:
            result = run_test_case(code, case, namespace)
            if result["passed"]:
                passed_count += 1
            test_results.append({**result, "case_index": i})
        except TimeoutError:
            test_results.append({"passed": False, "error": "Test case timed out", "case_index": i})
        finally:
            signal.alarm(0)

    return jsonify({
        "passed": passed_count,
        "total": len(cases),
        "test_results": test_results,
        "error": None,
    })


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9000, debug=False)
