"""streaks and badges

Revision ID: 002
Revises: 001
Create Date: 2024-01-02
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("current_streak", sa.Integer(), server_default="0", nullable=False))
    op.add_column("users", sa.Column("max_streak", sa.Integer(), server_default="0", nullable=False))
    op.add_column("users", sa.Column("last_solved_date", sa.Date(), nullable=True))
    op.add_column("users", sa.Column("badges", postgresql.JSON(astext_type=sa.Text()), server_default="[]", nullable=True))

    op.create_table(
        "user_badges",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("badge_key", sa.String(100), nullable=False),
        sa.Column("badge_name", sa.String(200), nullable=False),
        sa.Column("badge_icon", sa.String(10), nullable=False),
        sa.Column("awarded_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_user_badges_user_id", "user_badges", ["user_id"])


def downgrade() -> None:
    op.drop_table("user_badges")
    op.drop_column("users", "current_streak")
    op.drop_column("users", "max_streak")
    op.drop_column("users", "last_solved_date")
    op.drop_column("users", "badges")
