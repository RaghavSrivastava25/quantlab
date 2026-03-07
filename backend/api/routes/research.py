from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from db.database import get_db
from models.models import ResearchModule

router = APIRouter(prefix="/research", tags=["research"])


class ModuleSummary(BaseModel):
    id: int; slug: str; title: str; description: str; category: str; order_index: int
    class Config: from_attributes = True


class ModuleDetail(ModuleSummary):
    content: str; starter_code: str | None; papers: list | None


@router.get("/", response_model=list[ModuleSummary])
async def list_modules(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ResearchModule).where(ResearchModule.is_active == True).order_by(ResearchModule.order_index))
    return result.scalars().all()


@router.get("/{slug}", response_model=ModuleDetail)
async def get_module(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ResearchModule).where(ResearchModule.slug == slug, ResearchModule.is_active == True))
    m = result.scalar_one_or_none()
    if not m:
        raise HTTPException(status_code=404, detail="Module not found")
    return m
