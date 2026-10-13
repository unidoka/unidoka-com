import os
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse
import logging
from app.models.user import User
from app.schemas.auth.requests import (
    RegisterEmailRequest,
    VerifyEmailRequest,
    EmailPasswordLoginRequest,
    RefreshTokenRequest,
    ResendVerificationRequest,
)
from app.schemas.auth.responses import TokenResponse, AccessTokenResponse, EmailSendCodeResponse
from app.services.email_service import send_email_html
from app.services.email_templates import (
    render_verification_email,
    render_password_reset_email,
)
from app.services.otp_service import generate_otp, save_otp, verify_otp
from app.services.user_service import create_user, get_user_by_email, set_user_verified
from app.shared.auth import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
    get_current_user,
)
from config.rate_limiter import limit_otp_send
from database.database import get_db
from uuid import UUID

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/register/email")
async def register_email(
    request: Request,
    payload: RegisterEmailRequest,
    db: Session = Depends(get_db),
    _: None = Depends(limit_otp_send),
) -> EmailSendCodeResponse:
    existing = get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=422, detail="Email already registered")
    user = create_user(db, payload.email, payload.password, verified=False)
    logger.info(f"User created: {user.id} with email {user.email}")
    code = generate_otp()
    if not save_otp(payload.email, code):
        raise HTTPException(status_code=503, detail="OTP storage unavailable")
    subject, text_body, html_body = render_verification_email(
        code=code,
        email=payload.email,
        lang=payload.lang,
    )
    sent = await send_email_html(payload.email, subject, text_body, html_body)
    return EmailSendCodeResponse(sent=sent)

@router.post("/verify-email")
async def verify_email(
    payload: VerifyEmailRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    user = get_user_by_email(db, payload.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.verified:
        raise HTTPException(status_code=400, detail="User already verified")
    if not verify_otp(payload.email, payload.code):
        raise HTTPException(status_code=401, detail="Invalid or expired code")
    user = set_user_verified(db, user)
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)

@router.post("/login/email")
async def login_email_password(
    request: Request,
    payload: EmailPasswordLoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    user = get_user_by_email(db, payload.email)
    if not user:
        logger.warning(f"Login attempt with non-existent email: {payload.email}")
        return JSONResponse(
            status_code=401,
            content={"message": "Invalid email or password"}
        )
    if not verify_password(payload.password, user.password):
        logger.warning(f"Password mismatch for email: {payload.email}")
        return JSONResponse(
            status_code=401,
            content={"message": "Invalid email or password"}
        )
    if user.blocked:
        logger.warning(f"Login attempt for blocked user: {payload.email}")
        return JSONResponse(
            status_code=403,
            content={"message": "User is blocked"}
        )
    if not user.verified:
        logger.info(f"Login attempt for unverified user: {payload.email} – returning 403")
        return JSONResponse(
            status_code=403,
            content={"message": "User not verified"}
        )
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    logger.info(f"Successful login for user: {payload.email}")
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)

@router.post("/refresh", response_model=AccessTokenResponse)
async def refresh_access_token(
    payload: RefreshTokenRequest,
    db: Session = Depends(get_db),
) -> AccessTokenResponse:
    token_data = decode_token(payload.refresh_token)
    if not token_data or token_data.get("type") != "refresh":
        return JSONResponse(status_code=401, content={"message": "Invalid or expired refresh token"})
    try:
        user_id = UUID(token_data["sub"])
    except (KeyError, ValueError):
        return JSONResponse(status_code=401, content={"message": "Invalid refresh token"})
    user = db.get(User, user_id)
    if user is None or user.blocked:
        return JSONResponse(status_code=401, content={"message": "User not found or blocked"})
    new_access = create_access_token({"sub": str(user.id)})
    return AccessTokenResponse(access_token=new_access)

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "name": current_user.name,
        "surname": current_user.surname,
        "username": current_user.username,
        "phone": current_user.phone,
        "description": current_user.description,
        "avatar_url": current_user.avatar_url,
        "telegram_username": current_user.telegram_username,
        "github_url": current_user.github_url,
        "role": current_user.user_role.value,
        "verified": current_user.verified,
        "blocked": current_user.blocked,
    }

@router.post("/logout")
async def logout(
    payload: RefreshTokenRequest,
    current_user: User = Depends(get_current_user),
):
    token_data = decode_token(payload.refresh_token)
    if not token_data or token_data.get("type") != "refresh" or token_data.get("sub") != str(current_user.id):
        return JSONResponse(status_code=400, content={"message": "Invalid refresh token"})
    return JSONResponse(status_code=200, content={"message": "Logged out"})

@router.post("/resend-verification")
async def resend_verification(
    request: Request,
    payload: ResendVerificationRequest,
    db: Session = Depends(get_db),
    _: None = Depends(limit_otp_send),
) -> EmailSendCodeResponse:
    user = get_user_by_email(db, payload.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.verified:
        raise HTTPException(status_code=400, detail="User already verified")
    code = generate_otp()
    if not save_otp(payload.email, code):
        raise HTTPException(status_code=503, detail="OTP storage unavailable")
    subject, text_body, html_body = render_verification_email(
        code=code,
        email=payload.email,
        lang=payload.lang,
    )
    sent = await send_email_html(payload.email, subject, text_body, html_body)
    return EmailSendCodeResponse(sent=sent)


# ── Password reset ──────────────────────────────────────────────────────
from app.schemas.auth.requests import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from app.schemas.auth.responses import MessageResponse
from app.services.password_reset_service import (
    generate_reset_token,
    save_reset_token,
    consume_reset_token,
)

FRONTEND_URL = os.getenv("FRONTEND_URL") or os.getenv("NEXT_PUBLIC_ROOT_DOMAIN")
if FRONTEND_URL and not FRONTEND_URL.startswith("http"):
    FRONTEND_URL = f"https://{FRONTEND_URL}"
if not FRONTEND_URL:
    FRONTEND_URL = "http://localhost:3000"


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
    _: None = Depends(limit_otp_send),
) -> MessageResponse:
    """
    Sends a reset link. Always returns 200 so an attacker can't probe
    which emails are registered — the response is identical whether the
    user exists or not.
    """
    user = get_user_by_email(db, payload.email)
    if user and not user.blocked:
        token = generate_reset_token()
        if save_reset_token(token, str(user.id)):
            reset_url = f"{FRONTEND_URL}/reset-password?token={token}"
            subject, text_body, html_body = render_password_reset_email(
                reset_url=reset_url,
                lang=payload.lang,
            )
            await send_email_html(user.email, subject, text_body, html_body)
        else:
            logger.error(f"Failed to store reset token for {payload.email}")
    else:
        logger.info(f"Forgot-password requested for unknown/blocked email: {payload.email}")
    return MessageResponse(message="If the email exists, a reset link has been sent")


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
) -> MessageResponse:
    """Consume the token and set a new password."""
    user_id = consume_reset_token(payload.token)
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid reset token")
    user = db.get(User, user_uuid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.password = hash_password(payload.new_password)
    db.commit()
    logger.info(f"Password reset successful for user {user.id}")
    return MessageResponse(message="Password updated successfully")
