from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from pydantic import BaseModel
from db.database import get_db
from models.models import User, UserProgress, Strategy

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    username: str
    avatar_url: str | None
    total_points: int
    problems_solved: int


class StrategyLeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    username: str
    strategy_name: str
    sharpe_ratio: float
    dataset_key: str


@router.get("/", response_model=list[LeaderboardEntry])
async def get_leaderboard(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(
            User.id,
            User.username,
            User.avatar_url,
            User.total_points,
            func.count(UserProgress.id).filter(UserProgress.solved == True).label("problems_solved"),
        )
        .outerjoin(UserProgress, UserProgress.user_id == User.id)
        .where(User.is_active == True)
        .group_by(User.id)
        .order_by(desc("total_points"))
        .limit(100)
    )
    rows = result.all()
    return [
        LeaderboardEntry(rank=i + 1, user_id=r.id, username=r.username, avatar_url=r.avatar_url, total_points=r.total_points, problems_solved=r.problems_solved or 0)
        for i, r in enumerate(rows)
    ]


@router.get("/strategies", response_model=list[StrategyLeaderboardEntry])
async def get_strategy_leaderboard(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User.id, User.username, Strategy.name, Strategy.sharpe_ratio, Strategy.dataset_key)
        .join(User, Strategy.user_id == User.id)
        .where(Strategy.is_public == True, Strategy.sharpe_ratio.isnot(None))
        .order_by(desc(Strategy.sharpe_ratio))
        .limit(100)
    )
    rows = result.all()
    return [
        StrategyLeaderboardEntry(rank=i + 1, user_id=r.id, username=r.username, strategy_name=r.name, sharpe_ratio=r.sharpe_ratio, dataset_key=r.dataset_key)
        for i, r in enumerate(rows)
    ]
