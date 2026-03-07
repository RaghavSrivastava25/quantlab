from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from db.database import get_db
from models.models import Strategy
from api.middleware.auth import get_current_user
from models.models import User

router = APIRouter(prefix="/strategies", tags=["strategies"])


class StrategyCreate(BaseModel):
    name: str
    description: str | None = None
    code: str
    dataset_key: str = "sp500_daily"
    is_public: bool = False


class StrategyResponse(BaseModel):
    id: int
    name: str
    description: str | None
    code: str
    dataset_key: str
    backtest_result: dict | None
    sharpe_ratio: float | None
    is_public: bool

    class Config:
        from_attributes = True


class BacktestRequest(BaseModel):
    code: str
    dataset_key: str = "sp500_daily"


@router.get("/", response_model=list[StrategyResponse])
async def list_my_strategies(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Strategy).where(Strategy.user_id == current_user.id).order_by(Strategy.updated_at.desc()))
    return result.scalars().all()


@router.post("/", response_model=StrategyResponse)
async def create_strategy(
    body: StrategyCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    strategy = Strategy(user_id=current_user.id, name=body.name, description=body.description, code=body.code, dataset_key=body.dataset_key, is_public=body.is_public)
    db.add(strategy)
    await db.flush()
    return strategy


@router.post("/backtest", response_model=dict)
async def run_backtest(
    body: BacktestRequest,
    current_user: User = Depends(get_current_user),
):
    from services.backtest_service import run_backtest
    result = await run_backtest(body.code, body.dataset_key)
    return result


@router.put("/{strategy_id}", response_model=StrategyResponse)
async def update_strategy(
    strategy_id: int,
    body: StrategyCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Strategy).where(Strategy.id == strategy_id, Strategy.user_id == current_user.id))
    strategy = result.scalar_one_or_none()
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    strategy.name = body.name
    strategy.description = body.description
    strategy.code = body.code
    strategy.dataset_key = body.dataset_key
    strategy.is_public = body.is_public
    return strategy


@router.post("/{strategy_id}/backtest", response_model=StrategyResponse)
async def backtest_and_save(
    strategy_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Strategy).where(Strategy.id == strategy_id, Strategy.user_id == current_user.id))
    strategy = result.scalar_one_or_none()
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")

    from services.backtest_service import run_backtest
    backtest = await run_backtest(strategy.code, strategy.dataset_key)
    strategy.backtest_result = backtest
    strategy.sharpe_ratio = backtest.get("sharpe_ratio")
    return strategy


@router.get("/public", response_model=list[StrategyResponse])
async def list_public_strategies(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Strategy).where(Strategy.is_public == True).order_by(Strategy.sharpe_ratio.desc().nullslast()).limit(50)
    )
    return result.scalars().all()
