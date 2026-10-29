import os
import json
from typing import Optional
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
from app.services.two_factor_service import verify_totp
from app.models.session import UserSession
import hashlib
import uuid
from pydantic import BaseModel
from app.shared.auth import (
    hash_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
    get_current_user,
)
from config.rate_limiter import limit_otp_send
from database.database import get_db
from database.cache import cache_client
from uuid import UUID

logger = logging.getLogger(__name__)
router = APIRouter()

class LoginChallengeRequest(BaseModel):
    challenge_token: str
    code: str

class EmailLoginRequest(BaseModel):
    email: str
    password: str
    device_id: str
    user_agent: Optional[str] = None

def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

def issue_tokens(db: Session, user: User, device_id: str, user_agent: str, ip: str):
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    
    # Save Session
    session = UserSession(
        user_id=user.id,
        device_id=device_id,
        user_agent=user_agent,
        ip_address=ip,
        refresh_token_hash=hash_token(refresh_token)
    )
    db.add(session)
    db.commit()
    
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


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
    payload: EmailLoginRequest,
    db: Session = Depends(get_db),
):
    user = get_user_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.password):
        return JSONResponse(status_code=401, content={"message": "Invalid email or password"})
    if user.blocked:
        return JSONResponse(status_code=403, content={"message": "User is blocked"})
    if not user.verified:
        return JSONResponse(status_code=403, content={"message": "User not verified"})

    # Check if device is known
    known_session = db.query(UserSession).filter(
        UserSession.user_id == user.id,
        UserSession.device_id == payload.device_id,
        UserSession.is_revoked == False
    ).first()

    needs_challenge = False
    
    # 2FA enabled or Unknown device
    if user.two_factor_enabled:
        needs_challenge = True
        challenge_type = "totp"
    elif not known_session:
        needs_challenge = True
        challenge_type = "email_otp"
        # Send OTP to email
        code = generate_otp()
        save_otp(f"login:{user.id}", code)
        subject, text, html = render_verification_email(code=code, email=user.email, lang="ru")
        await send_email_html(user.email, subject, text, html)

    if needs_challenge:
        # Generate temporary challenge token
        challenge_token = str(uuid.uuid4())
        cache_client.setex(f"challenge:{challenge_token}", 300, json.dumps({
            "user_id": str(user.id),
            "device_id": payload.device_id,
            "type": challenge_type
        }))
        return JSONResponse(status_code=200, content={
            "status": "requires_2fa",
            "challenge_type": challenge_type,
            "challenge_token": challenge_token
        })

    # Known device, no 2FA -> direct login
    ip = request.client.host if request.client else "unknown"
    return issue_tokens(db, user, payload.device_id, payload.user_agent or "", ip)

@router.post("/login/verify-challenge")
async def verify_login_challenge(
    request: Request,
    payload: LoginChallengeRequest,
    db: Session = Depends(get_db),
):
    raw_challenge = cache_client.get(f"challenge:{payload.challenge_token}")
    if not raw_challenge:
        raise HTTPException(400, "Challenge expired or invalid")
    
    data = json.loads(raw_challenge)
    user = db.get(User, uuid.UUID(data["user_id"]))
    if not user:
        raise HTTPException(400, "User not found")

    is_valid = False
    if data["type"] == "totp":
        is_valid = verify_totp(user.two_factor_secret, payload.code)
    elif data["type"] == "email_otp":
        is_valid = verify_otp(f"login:{user.id}", payload.code)

    if not is_valid:
        raise HTTPException(400, "Invalid code")

    # Consume challenge
    cache_client.delete(f"challenge:{payload.challenge_token}")
    
    ip = request.client.host if request.client else "unknown"
    return issue_tokens(db, user, data["device_id"], request.headers.get("user-agent", ""), ip)


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


# ── 2FA Setup & Sessions ──────────────────────────────────────────────────
from app.services.two_factor_service import generate_2fa_secret, get_totp_uri, generate_qr_base64
from app.shared.auth import get_current_user

class Verify2FARequest(BaseModel):
    code: str

@router.post("/me/2fa/setup")
async def setup_2fa(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.two_factor_enabled:
        raise HTTPException(400, "2FA is already enabled")
    
    secret = generate_2fa_secret()
    current_user.two_factor_secret = secret
    db.commit()
    
    uri = get_totp_uri(secret, current_user.email)
    qr_base64 = generate_qr_base64(uri)
    
    return {"secret": secret, "qr_base64": qr_base64}

@router.post("/me/2fa/enable")
async def enable_2fa(payload: Verify2FARequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.two_factor_secret:
        raise HTTPException(400, "Run setup first")
    if not verify_totp(current_user.two_factor_secret, payload.code):
        raise HTTPException(400, "Invalid code")
    
    current_user.two_factor_enabled = True
    db.commit()
    return {"status": "enabled"}

@router.post("/me/2fa/disable")
async def disable_2fa(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.two_factor_enabled = False
    current_user.two_factor_secret = None
    db.commit()
    return {"status": "disabled"}

@router.get("/me/sessions")
async def list_sessions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sessions = db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.is_revoked == False
    ).order_by(UserSession.last_used_at.desc()).all()
    return [{
        "id": str(s.id),
        "device_id": s.device_id,
        "user_agent": s.user_agent,
        "ip_address": s.ip_address,
        "last_used_at": s.last_used_at,
        "created_at": s.created_at
    } for s in sessions]

@router.delete("/me/sessions/{session_id}")
async def revoke_session(session_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(UserSession).filter(UserSession.id == session_id, UserSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(404, "Session not found")
    session.is_revoked = True
    db.commit()
    return {"status": "revoked"}

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
        "permissions": list(getattr(current_user, "permissions", None) or []),
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
