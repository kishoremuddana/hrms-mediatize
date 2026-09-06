"""add missing notification types

Revision ID: eedafca9463e
Revises: 9ff3g21da35c
Create Date: 2026-09-06 16:19:10.629202

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'eedafca9463e'
down_revision: Union[str, Sequence[str], None] = '9ff3g21da35c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
