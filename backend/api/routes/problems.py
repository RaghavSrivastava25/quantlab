from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from db.database import get_db
from models.models import Problem, Submission, UserProgress, SubmissionStatus
from api.middleware.auth import get_current_user
from models.models import User

router = APIRouter(prefix="/problems", tags=["problems"])


class ProblemSummary(BaseModel):
    id: int
    slug: str
    title: str
    difficulty: str
    category: str
    points: int
    tags: list | None
    class Config:
        from_attributes = True


class ProblemDetail(ProblemSummary):
    description: str
    starter_code: str
    dataset_key: str | None


class SubmitRequest(BaseModel):
    code: str


class SubmissionResponse(BaseModel):
    id: int
    status: str
    score: float | None
    runtime_ms: int | None
    test_results: dict | None
    error_message: str | None
    new_badges: list[str] = []
    streak: int = 0
    class Config:
        from_attributes = True


@router.get("/", response_model=list[ProblemSummary])
async def list_problems(
    difficulty: str | None = Query(None),
    category: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(Problem).where(Problem.is_active == True)
    if difficulty:
        query = query.where(Problem.difficulty == difficulty)
    if category:
        query = query.where(Problem.category == category)
    result = await db.execute(query.order_by(Problem.id))
    return result.scalars().all()


@router.get("/{slug}", response_model=ProblemDetail)
async def get_problem(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Problem).where(Problem.slug == slug, Problem.is_active == True))
    problem = result.scalar_one_or_none()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem


@router.post("/{slug}/submit", response_model=SubmissionResponse)
async def submit_solution(
    slug: str,
    body: SubmitRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Problem).where(Problem.slug == slug))
    problem = result.scalar_one_or_none()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    submission = Submission(user_id=current_user.id, problem_id=problem.id, code=body.code, status=SubmissionStatus.running)
    db.add(submission)
    await db.flush()

    from services.sandbox_service import run_submission
    result_data = await run_submission(body.code, problem)

    submission.status = result_data["status"]
    submission.score = result_data.get("score")
    submission.runtime_ms = result_data.get("runtime_ms")
    submission.test_results = result_data.get("test_results")
    submission.error_message = result_data.get("error_message")

    new_badges = []
    streak = current_user.current_streak

    if submission.status == SubmissionStatus.accepted:
        prog_result = await db.execute(
            select(UserProgress).where(UserProgress.user_id == current_user.id, UserProgress.problem_id == problem.id)
        )
        progress = prog_result.scalar_one_or_none()
        if not progress:
            progress = UserProgress(user_id=current_user.id, problem_id=problem.id)
            db.add(progress)
        progress.attempts = (progress.attempts or 0) + 1
        if not progress.solved:
            progress.solved = True
            from datetime import datetime
            progress.solved_at = datetime.utcnow()
            current_user.total_points += problem.points

            from services.badge_service import update_streak, check_and_award_badges
            streak_data = await update_streak(db, current_user)
            streak = streak_data["streak"]
            new_badges.extend(streak_data["new_badges"])
            new_badges.extend(await check_and_award_badges(db, current_user, problem, submission))

        if not progress.best_score or (submission.score and submission.score > progress.best_score):
            progress.best_score = submission.score

    resp = SubmissionResponse(
        id=submission.id,
        status=submission.status,
        score=submission.score,
        runtime_ms=submission.runtime_ms,
        test_results=submission.test_results,
        error_message=submission.error_message,
        new_badges=new_badges,
        streak=streak,
    )
    return resp


@router.get("/{slug}/submissions", response_model=list[SubmissionResponse])
async def get_my_submissions(slug: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Problem).where(Problem.slug == slug))
    problem = result.scalar_one_or_none()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    subs = await db.execute(
        select(Submission).where(Submission.user_id == current_user.id, Submission.problem_id == problem.id)
        .order_by(Submission.created_at.desc()).limit(20)
    )
    return [SubmissionResponse(id=s.id, status=s.status, score=s.score, runtime_ms=s.runtime_ms,
                                test_results=s.test_results, error_message=s.error_message)
            for s in subs.scalars().all()]
