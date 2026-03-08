"""add papers column to research_modules

Revision ID: 003
Revises: 002
Create Date: 2026-03-08
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("""
        ALTER TABLE research_modules 
        ADD COLUMN IF NOT EXISTS papers JSONB DEFAULT '[]'
    """)


def downgrade():
    op.drop_column('research_modules', 'papers')
