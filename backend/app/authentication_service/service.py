from datetime import datetime, timezone, timedelta
import secrets
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
import time
from app.authentication_service.models import (
    User,
    UserRole,
)
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.email_service.service import (
    send_login_otp_email,
)


# ============================================================
# Login
# ============================================================


def send_login_otp(db: Session, email: str) -> None:
    statement = select(User).where(User.email == email)
    user = db.scalar(statement)

    # Do not reveal whether an account exists
    if user is None or not user.is_active:
        return

    # Generate a secure 6-digit OTP
    otp = f"{secrets.randbelow(1_000_000):06d}"

    # Store hashed OTP
    user.otp_hash = hash_password(otp)

    # OTP valid for 5 minutes
    user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)

    # Reset attempts for the new OTP
    user.otp_attempts = 0
    start_time = time.time()
    try:
        send_login_otp_email(
            recipient_email=user.email,
            otp=otp,
        )
        print("OTP EMAIL TIME:", time.time() - start_time, "seconds")
        db.commit()

    except Exception as error:
        db.rollback()
        print("OTP EMAIL ERROR:", error)

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to send OTP email. Please try again.",
        )

def verify_login_otp(
    db: Session,
    email: str,
    otp: str,
) -> str:
    statement = select(User).where(User.email == email)
    user = db.scalar(statement)

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or OTP.",
        )

    # Check whether an OTP was generated
    if not user.otp_hash or not user.otp_expires_at:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="OTP not found. Please request a new OTP.",
        )

    # Maximum 5 attempts
    if user.otp_attempts >= 5:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many incorrect attempts. Please request a new OTP.",
        )

    # Check OTP expiry
    now = datetime.now(timezone.utc)

    if user.otp_expires_at < now:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="OTP has expired. Please request a new OTP.",
        )

    # Verify OTP
    if not verify_password(otp, user.otp_hash):
        user.otp_attempts += 1
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or OTP.",
        )

    # Successful verification
    user.last_login_at = now

    # OTP can be used only once
    user.otp_hash = None
    user.otp_expires_at = None
    user.otp_attempts = 0

    db.commit()
    db.refresh(user)

    # Role comes directly from the users table
    access_token = create_access_token(
        user_id=user.id,
        role=user.role.value,
    )

    return access_token