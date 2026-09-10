from pydantic import BaseModel, EmailStr, Field


class SendOTPRequest(BaseModel):
    """
    Data required to request a login OTP.
    """
    email: EmailStr
    
class VerifyOTPRequest(BaseModel):
    """
    Data required to verify a login OTP.
    """
    email: EmailStr
    otp: str = Field(
        min_length=6,
        max_length=6,
    )

class TokenResponse(BaseModel):
    """
    Response returned after successful authentication.
    """

    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """
    Public user information.
    """

    id: int
    email: EmailStr
    employee_id: str | None

    # Employee display information
    first_name: str | None = None
    last_name: str | None = None
    profile_photo_url: str | None = None

    role: str
    is_active: bool
