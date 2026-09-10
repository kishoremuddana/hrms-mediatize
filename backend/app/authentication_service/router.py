from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.authentication_service.dependencies import (
    get_current_user,
)
from app.authentication_service.models import User
from app.authentication_service.schemas import (
    SendOTPRequest,
    TokenResponse,
    UserResponse,
    VerifyOTPRequest,
)
from app.authentication_service.service import (
    send_login_otp,
    verify_login_otp,
)
from app.core.database import get_db
from app.employee_service.models import Employee


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

@router.post("/send-otp")
def send_otp(
    payload: SendOTPRequest,
    db: Session = Depends(get_db),
):
    send_login_otp(
        db=db,
        email=payload.email,
    )

    return {
        "message": "If the email is registered, an OTP has been sent."
    }
    
@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(
    payload: VerifyOTPRequest,
    db: Session = Depends(get_db),
):
    access_token = verify_login_otp(
        db=db,
        email=payload.email,
        otp=payload.otp,
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
    )

# ============================================================
# Current User API
# ============================================================

@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    """
    Return the currently authenticated user's information
    including employee name and profile photo.
    """

    employee = db.scalar(
        select(Employee).where(
            Employee.user_id == current_user.id
        )
    )

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        employee_id=current_user.employee_id,
        first_name=employee.first_name if employee else None,
        last_name=employee.last_name if employee else None,
        profile_photo_url=(
            employee.profile_photo_url
            if employee
            else None
        ),
        role=current_user.role.value,
        is_active=current_user.is_active,
    )
