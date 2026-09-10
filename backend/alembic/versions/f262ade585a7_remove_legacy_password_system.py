"""remove legacy password system

Revision ID: f262ade585a7
Revises: eedafca9463e
Create Date: 2026-09-09 11:59:30.655859

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f262ade585a7'
down_revision: Union[str, Sequence[str], None] = 'eedafca9463e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Remove legacy password authentication and reset system."""

    # Remove password reset requests table first because
    # it depends on the users table.
    op.drop_index(
        op.f("ix_password_reset_requests_user_id"),
        table_name="password_reset_requests",
    )
    op.drop_table("password_reset_requests")

    # Remove the PostgreSQL enum used only by password reset requests.
    op.execute("DROP TYPE IF EXISTS password_reset_status")

    # Remove obsolete password authentication columns.
    op.drop_column("users", "password_hash")
    op.drop_column("users", "must_change_password")

def downgrade() -> None:
    """Restore the legacy password authentication and reset system."""

    # Restore legacy password columns.
    op.add_column(
        "users",
        sa.Column(
            "password_hash",
            sa.String(length=255),
            nullable=True,
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "must_change_password",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    # Recreate password reset status enum.
    password_reset_status = sa.Enum(
        "PENDING",
        "APPROVED",
        "REJECTED",
        "EXPIRED",
        name="password_reset_status",
    )
    password_reset_status.create(op.get_bind(), checkfirst=True)

    # Recreate password reset requests table.
    op.create_table(
        "password_reset_requests",
        sa.Column(
            "id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "status",
            password_reset_status,
            nullable=False,
        ),
        sa.Column(
            "requested_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.Column(
            "reviewed_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_password_reset_requests_user_id"),
        "password_reset_requests",
        ["user_id"],
        unique=False,
    )