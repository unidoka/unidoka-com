from sqlalchemy.orm import Session
from app.models.user import User
from app.shared.auth import hash_password
import logging

logger = logging.getLogger(__name__)

def create_user(db: Session, email: str, password: str, verified: bool = False) -> User:
    hashed = hash_password(password)
    local_part = email.split('@')[0]
    user = User(
        email=email.lower(),
        password=hashed,
        verified=verified,
        name=local_part,
        surname=""
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info(f"Created user: {user.id} with email {user.email}")
    return user

def get_user_by_email(db: Session, email: str) -> User | None:
    lower_email = email.lower()
    logger.info(f"Looking for user with email: {lower_email}")
    user = db.query(User).filter(User.email == lower_email).first()
    if user:
        logger.info(f"Found user: {user.id} with email {user.email}")
    else:
        logger.warning(f"No user found for email {lower_email}")
    return user

def set_user_verified(db: Session, user: User) -> User:
    user.verified = True
    db.commit()
    db.refresh(user)
    return user
