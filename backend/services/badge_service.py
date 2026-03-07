from datetime import date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from models.models import User, UserBadge, UserProgress, Submission, SubmissionStatus

BADGE_DEFINITIONS = {
    "first_blood":      ("🩸", "First Blood",        "Solved your first problem"),
    "streak_3":         ("🔥", "On Fire",             "3-day solving streak"),
    "streak_7":         ("⚡", "Week Warrior",         "7-day solving streak"),
    "streak_30":        ("🌟", "Monthly Master",       "30-day solving streak"),
    "solver_10":        ("🎯", "Problem Solver",       "Solved 10 problems"),
    "solver_50":        ("💎", "Elite Quant",          "Solved 50 problems"),
    "easy_sweep":       ("✅", "Easy Does It",         "Solved all easy problems"),
    "hard_crusher":     ("💪", "Hard Crusher",         "Solved 5 hard problems"),
    "sharpe_1":         ("📈", "Sharpe Mind",          "Strategy Sharpe ratio > 1"),
    "sharpe_2":         ("🚀", "Alpha Generator",      "Strategy Sharpe ratio > 2"),
    "options_wizard":   ("🧙", "Options Wizard",       "Solved 3 options problems"),
    "risk_manager":     ("🛡️", "Risk Manager",         "Solved 3 risk problems"),
    "stat_master":      ("📊", "Stat Master",          "Solved 5 stats problems"),
    "portfolio_pro":    ("💼", "Portfolio Pro",        "Solved 3 portfolio problems"),
    "speed_demon":      ("⚡", "Speed Demon",          "Submitted in under 2 minutes"),
    "perfectionist":    ("💯", "Perfectionist",        "Got 100% score on a hard problem"),
}


async def award_badge(db: AsyncSession, user: User, badge_key: str) -> bool:
    existing = await db.execute(
        select(UserBadge).where(UserBadge.user_id == user.id, UserBadge.badge_key == badge_key)
    )
    if existing.scalar_one_or_none():
        return False
    icon, name, _ = BADGE_DEFINITIONS[badge_key]
    badge = UserBadge(user_id=user.id, badge_key=badge_key, badge_name=name, badge_icon=icon)
    db.add(badge)
    return True


async def update_streak(db: AsyncSession, user: User) -> dict:
    today = date.today()
    awarded = []

    if user.last_solved_date is None:
        user.current_streak = 1
    elif user.last_solved_date == today:
        pass
    elif user.last_solved_date == today - timedelta(days=1):
        user.current_streak += 1
    else:
        user.current_streak = 1

    user.last_solved_date = today
    if user.current_streak > user.max_streak:
        user.max_streak = user.current_streak

    if user.current_streak >= 3 and await award_badge(db, user, "streak_3"):
        awarded.append("streak_3")
    if user.current_streak >= 7 and await award_badge(db, user, "streak_7"):
        awarded.append("streak_7")
    if user.current_streak >= 30 and await award_badge(db, user, "streak_30"):
        awarded.append("streak_30")

    return {"streak": user.current_streak, "new_badges": awarded}


async def check_and_award_badges(db: AsyncSession, user: User, problem=None, submission=None) -> list[str]:
    awarded = []

    solved_count = await db.execute(
        select(func.count(UserProgress.id)).where(UserProgress.user_id == user.id, UserProgress.solved == True)
    )
    n_solved = solved_count.scalar() or 0

    if n_solved == 1 and await award_badge(db, user, "first_blood"):
        awarded.append("first_blood")
    if n_solved >= 10 and await award_badge(db, user, "solver_10"):
        awarded.append("solver_10")
    if n_solved >= 50 and await award_badge(db, user, "solver_50"):
        awarded.append("solver_50")

    if problem:
        cat_count = await db.execute(
            select(func.count(UserProgress.id))
            .join(UserProgress.problem)
            .where(UserProgress.user_id == user.id, UserProgress.solved == True)
        )
        from models.models import Problem
        options_q = await db.execute(
            select(func.count(UserProgress.id))
            .join(Problem, UserProgress.problem_id == Problem.id)
            .where(UserProgress.user_id == user.id, UserProgress.solved == True, Problem.category == "options")
        )
        risk_q = await db.execute(
            select(func.count(UserProgress.id))
            .join(Problem, UserProgress.problem_id == Problem.id)
            .where(UserProgress.user_id == user.id, UserProgress.solved == True, Problem.category == "risk")
        )
        stats_q = await db.execute(
            select(func.count(UserProgress.id))
            .join(Problem, UserProgress.problem_id == Problem.id)
            .where(UserProgress.user_id == user.id, UserProgress.solved == True, Problem.category == "statistics")
        )
        hard_q = await db.execute(
            select(func.count(UserProgress.id))
            .join(Problem, UserProgress.problem_id == Problem.id)
            .where(UserProgress.user_id == user.id, UserProgress.solved == True, Problem.difficulty == "hard")
        )
        portfolio_q = await db.execute(
            select(func.count(UserProgress.id))
            .join(Problem, UserProgress.problem_id == Problem.id)
            .where(UserProgress.user_id == user.id, UserProgress.solved == True, Problem.category == "portfolio")
        )

        if (options_q.scalar() or 0) >= 3 and await award_badge(db, user, "options_wizard"):
            awarded.append("options_wizard")
        if (risk_q.scalar() or 0) >= 3 and await award_badge(db, user, "risk_manager"):
            awarded.append("risk_manager")
        if (stats_q.scalar() or 0) >= 5 and await award_badge(db, user, "stat_master"):
            awarded.append("stat_master")
        if (hard_q.scalar() or 0) >= 5 and await award_badge(db, user, "hard_crusher"):
            awarded.append("hard_crusher")
        if (portfolio_q.scalar() or 0) >= 3 and await award_badge(db, user, "portfolio_pro"):
            awarded.append("portfolio_pro")

        if submission and submission.score == 100.0 and problem.difficulty == "hard":
            if await award_badge(db, user, "perfectionist"):
                awarded.append("perfectionist")

    return awarded


async def get_user_badges(db: AsyncSession, user_id: int) -> list[dict]:
    result = await db.execute(
        select(UserBadge).where(UserBadge.user_id == user_id).order_by(UserBadge.awarded_at)
    )
    return [{"key": b.badge_key, "name": b.badge_name, "icon": b.badge_icon, "awarded_at": b.awarded_at.isoformat()}
            for b in result.scalars().all()]
