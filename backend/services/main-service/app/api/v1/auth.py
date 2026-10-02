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
from app.services.email_service import send_email, send_email_html
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
    sent = await send_email(
        payload.email,
        "Verification code",
        f"Your verification code is: {code}"
    )
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
    sent = await send_email(payload.email, "Verification code", f"Your verification code is: {code}. Please, don't reply to this message.")
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


def _reset_email_html(reset_url: str, lang: str | None) -> tuple[str, str, str]:
    """Return (subject, text_body, html_body) for the reset email."""
    if lang == "en":
        subject = "Reset your password"
        text = (
            "We received a request to reset your Unidoka password.\n\n"
            f"Open this link to set a new password (valid 30 minutes):\n{reset_url}\n\n"
            "If you did not request this, ignore this email."
        )
        html = f"""
        <html><body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;">
          <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:30px;">
            <h2 style="color:#333;margin-top:0;">Reset your password</h2>
            <p style="color:#555;font-size:16px;">We received a request to reset your Unidoka password.</p>
            <p style="margin:24px 0;">
              <a href="{reset_url}"
                 style="display:inline-block;background:#336DFF;color:#fff;text-decoration:none;
                        padding:14px 28px;border-radius:8px;font-weight:600;">
                Set new password
              </a>
            </p>
            <p style="color:#888;font-size:13px;">
              Link is valid for 30 minutes. If you did not request this, ignore this email.
            </p>
          </div>
        </body></html>
        """
    else:
        subject = "Сброс пароля"
        text = (
            "Мы получили запрос на сброс пароля от аккаунта Unidoka.\n\n"
            f"Перейдите по ссылке, чтобы задать новый пароль (действует 30 минут):\n{reset_url}\n\n"
            "Если вы не запрашивали сброс — проигнорируйте письмо."
        )
        html = f"""
        <html><body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;">
          <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:30px;">
            <h2 style="color:#333;margin-top:0;">Сброс пароля</h2>
            <p style="color:#555;font-size:16px;">Мы получили запрос на сброс пароля от аккаунта Unidoka.</p>
            <p style="margin:24px 0;">
              <a href="{reset_url}"
                 style="display:inline-block;background:#336DFF;color:#fff;text-decoration:none;
                        padding:14px 28px;border-radius:8px;font-weight:600;">
                Задать новый пароль
              </a>
            </p>
            <p style="color:#888;font-size:13px;">
              Ссылка действует 30 минут. Если вы не запрашивали сброс — проигнорируйте письмо.
            </p>
          </div>
        </body></html>
        """
    return subject, text, html


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
            subject, text, html = _reset_email_html(reset_url, payload.lang)
            await send_email_html(user.email, subject, text, html)
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
