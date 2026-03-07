from datetime import datetime, date
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Date, Text, ForeignKey, JSON, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.database import Base
import enum


class Difficulty(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class SubmissionStatus(str, enum.Enum):
    pending = "pending"
    running = "running"
    accepted = "accepted"
    wrong_answer = "wrong_answer"
    error = "error"
    timeout = "timeout"


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str | None] = mapped_column(String(255))
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    total_points: Mapped[int] = mapped_column(Integer, default=0)
    current_streak: Mapped[int] = mapped_column(Integer, default=0)
    max_streak: Mapped[int] = mapped_column(Integer, default=0)
    last_solved_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    badges: Mapped[list | None] = mapped_column(JSON, default=list)

    submissions: Mapped[list["Submission"]] = relationship(back_populates="user")
    strategies: Mapped[list["Strategy"]] = relationship(back_populates="user")
    progress: Mapped[list["UserProgress"]] = relationship(back_populates="user")
    user_badges: Mapped[list["UserBadge"]] = relationship(back_populates="user")


class UserBadge(Base):
    __tablename__ = "user_badges"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    badge_key: Mapped[str] = mapped_column(String(100))
    badge_name: Mapped[str] = mapped_column(String(200))
    badge_icon: Mapped[str] = mapped_column(String(10))
    awarded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    user: Mapped["User"] = relationship(back_populates="user_badges")


class Problem(Base):
    __tablename__ = "problems"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(300))
    description: Mapped[str] = mapped_column(Text)
    difficulty: Mapped[Difficulty] = mapped_column(Enum(Difficulty))
    category: Mapped[str] = mapped_column(String(100))
    starter_code: Mapped[str] = mapped_column(Text)
    solution_code: Mapped[str] = mapped_column(Text)
    test_cases: Mapped[dict] = mapped_column(JSON)
    dataset_key: Mapped[str | None] = mapped_column(String(200))
    points: Mapped[int] = mapped_column(Integer, default=100)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    tags: Mapped[list | None] = mapped_column(JSON, default=list)

    submissions: Mapped[list["Submission"]] = relationship(back_populates="problem")
    progress: Mapped[list["UserProgress"]] = relationship(back_populates="problem")


class Submission(Base):
    __tablename__ = "submissions"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    problem_id: Mapped[int] = mapped_column(ForeignKey("problems.id"))
    code: Mapped[str] = mapped_column(Text)
    status: Mapped[SubmissionStatus] = mapped_column(Enum(SubmissionStatus), default=SubmissionStatus.pending)
    score: Mapped[float | None] = mapped_column(Float)
    runtime_ms: Mapped[int | None] = mapped_column(Integer)
    test_results: Mapped[dict | None] = mapped_column(JSON)
    error_message: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    user: Mapped["User"] = relationship(back_populates="submissions")
    problem: Mapped["Problem"] = relationship(back_populates="submissions")


class Strategy(Base):
    __tablename__ = "strategies"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(String(300))
    description: Mapped[str | None] = mapped_column(Text)
    code: Mapped[str] = mapped_column(Text)
    dataset_key: Mapped[str] = mapped_column(String(200))
    backtest_result: Mapped[dict | None] = mapped_column(JSON)
    sharpe_ratio: Mapped[float | None] = mapped_column(Float)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user: Mapped["User"] = relationship(back_populates="strategies")


class UserProgress(Base):
    __tablename__ = "user_progress"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    problem_id: Mapped[int] = mapped_column(ForeignKey("problems.id"))
    solved: Mapped[bool] = mapped_column(Boolean, default=False)
    best_score: Mapped[float | None] = mapped_column(Float)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    solved_at: Mapped[datetime | None] = mapped_column(DateTime)
    user: Mapped["User"] = relationship(back_populates="progress")
    problem: Mapped["Problem"] = relationship(back_populates="progress")


class ResearchModule(Base):
    __tablename__ = "research_modules"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(300))
    description: Mapped[str] = mapped_column(Text)
    content: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(100))
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    starter_code: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    papers: Mapped[list | None] = mapped_column(JSON, default=list)
