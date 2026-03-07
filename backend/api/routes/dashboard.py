from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from db.database import get_db
from models.models import User, UserProgress, Submission, Strategy, Problem
from api.middleware.auth import get_current_user
from services.badge_service import get_user_badges, BADGE_DEFINITIONS

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/")
async def get_dashboard(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    solved_count = (await db.execute(select(func.count(UserProgress.id)).where(UserProgress.user_id == current_user.id, UserProgress.solved == True))).scalar() or 0
    submission_count = (await db.execute(select(func.count(Submission.id)).where(Submission.user_id == current_user.id))).scalar() or 0
    strategy_count = (await db.execute(select(func.count(Strategy.id)).where(Strategy.user_id == current_user.id))).scalar() or 0

    recent_subs = await db.execute(
        select(Submission, Problem.title, Problem.slug)
        .join(Problem, Submission.problem_id == Problem.id)
        .where(Submission.user_id == current_user.id)
        .order_by(Submission.created_at.desc()).limit(5)
    )
    recent = [{"id": s.id, "problem_title": t, "problem_slug": slug, "status": s.status, "score": s.score, "created_at": s.created_at.isoformat()} for s, t, slug in recent_subs.all()]

    prog_result = await db.execute(
        select(Problem.difficulty, func.count(UserProgress.id))
        .join(Problem, UserProgress.problem_id == Problem.id)
        .where(UserProgress.user_id == current_user.id, UserProgress.solved == True)
        .group_by(Problem.difficulty)
    )
    by_diff = {str(d): c for d, c in prog_result.all()}

    cat_result = await db.execute(
        select(Problem.category, func.count(UserProgress.id))
        .join(Problem, UserProgress.problem_id == Problem.id)
        .where(UserProgress.user_id == current_user.id, UserProgress.solved == True)
        .group_by(Problem.category)
    )
    by_cat = {str(c): n for c, n in cat_result.all()}

    badges = await get_user_badges(db, current_user.id)

    return {
        "username": current_user.username,
        "total_points": current_user.total_points,
        "problems_solved": solved_count,
        "total_submissions": submission_count,
        "strategies_count": strategy_count,
        "current_streak": current_user.current_streak,
        "max_streak": current_user.max_streak,
        "badges": badges,
        "recent_submissions": recent,
        "progress_by_difficulty": by_diff,
        "progress_by_category": by_cat,
    }


@router.get("/badges/all")
async def all_badge_definitions():
    return [{"key": k, "icon": v[0], "name": v[1], "description": v[2]} for k, v in BADGE_DEFINITIONS.items()]
