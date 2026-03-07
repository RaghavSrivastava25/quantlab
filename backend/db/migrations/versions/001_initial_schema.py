"""initial schema

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("username", sa.String(100), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=True),
        sa.Column("avatar_url", sa.String(500), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("total_points", sa.Integer(), nullable=False, server_default="0"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("username"),
    )
    op.create_index("ix_users_id", "users", ["id"])
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_username", "users", ["username"])

    op.create_table(
        "problems",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("slug", sa.String(200), nullable=False),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("difficulty", sa.Enum("easy", "medium", "hard", name="difficulty"), nullable=False),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("starter_code", sa.Text(), nullable=False),
        sa.Column("solution_code", sa.Text(), nullable=False),
        sa.Column("test_cases", postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column("dataset_key", sa.String(200), nullable=True),
        sa.Column("points", sa.Integer(), nullable=False, server_default="100"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("tags", postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_problems_id", "problems", ["id"])
    op.create_index("ix_problems_slug", "problems", ["slug"])

    op.create_table(
        "submissions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("problem_id", sa.Integer(), sa.ForeignKey("problems.id"), nullable=False),
        sa.Column("code", sa.Text(), nullable=False),
        sa.Column("status", sa.Enum("pending", "running", "accepted", "wrong_answer", "error", "timeout", name="submissionstatus"), nullable=False),
        sa.Column("score", sa.Float(), nullable=True),
        sa.Column("runtime_ms", sa.Integer(), nullable=True),
        sa.Column("test_results", postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_submissions_id", "submissions", ["id"])

    op.create_table(
        "strategies",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("name", sa.String(300), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("code", sa.Text(), nullable=False),
        sa.Column("dataset_key", sa.String(200), nullable=False),
        sa.Column("backtest_result", postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column("sharpe_ratio", sa.Float(), nullable=True),
        sa.Column("is_public", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_strategies_id", "strategies", ["id"])

    op.create_table(
        "user_progress",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("problem_id", sa.Integer(), sa.ForeignKey("problems.id"), nullable=False),
        sa.Column("solved", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("best_score", sa.Float(), nullable=True),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("solved_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_user_progress_id", "user_progress", ["id"])

    op.create_table(
        "research_modules",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("slug", sa.String(200), nullable=False),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("order_index", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("starter_code", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_research_modules_id", "research_modules", ["id"])
    op.create_index("ix_research_modules_slug", "research_modules", ["slug"])


def downgrade() -> None:
    op.drop_table("research_modules")
    op.drop_table("user_progress")
    op.drop_table("strategies")
    op.drop_table("submissions")
    op.drop_table("problems")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS difficulty")
    op.execute("DROP TYPE IF EXISTS submissionstatus")
