import httpx
import time
from models.models import Problem, SubmissionStatus
from core.config import get_settings
from data.loaders.dataset_loader import load_dataset

settings = get_settings()


async def run_submission(code: str, problem: Problem) -> dict:
    dataset = None
    if problem.dataset_key:
        dataset = load_dataset(problem.dataset_key)

    payload = {
        "code": code,
        "test_cases": problem.test_cases,
        "dataset": dataset,
        "timeout": settings.sandbox_timeout,
    }

    start = time.time()
    try:
        async with httpx.AsyncClient(timeout=settings.sandbox_timeout + 5) as client:
            resp = await client.post(f"{settings.sandbox_url}/execute", json=payload)
            resp.raise_for_status()
            data = resp.json()
    except httpx.TimeoutException:
        return {"status": SubmissionStatus.timeout, "error_message": "Execution timed out", "runtime_ms": int((time.time() - start) * 1000)}
    except Exception as e:
        return {"status": SubmissionStatus.error, "error_message": str(e), "runtime_ms": int((time.time() - start) * 1000)}

    runtime_ms = int((time.time() - start) * 1000)
    passed = data.get("passed", 0)
    total = data.get("total", 1)
    score = round(passed / total * 100, 2) if total > 0 else 0

    return {
        "status": SubmissionStatus.accepted if passed == total else SubmissionStatus.wrong_answer,
        "score": score,
        "runtime_ms": runtime_ms,
        "test_results": data.get("test_results"),
        "error_message": data.get("error"),
    }
