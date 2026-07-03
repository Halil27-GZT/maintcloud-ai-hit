from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.db_models import UserDB
from app.models import UserResponse, UserRole
from app.security import hash_password, verify_password


DEMO_USERS = [
    {
        "email": "admin@maintcloud.local",
        "password": "MaintCloudAdmin!2026",
        "role": UserRole.admin,
    },
    {
        "email": "tech@maintcloud.local",
        "password": "MaintCloudTech!2026",
        "role": UserRole.technician,
    },
    {
        "email": "viewer@maintcloud.local",
        "password": "MaintCloudViewer!2026",
        "role": UserRole.viewer,
    },
]


def normalize_email(email: str) -> str:
    return email.strip().lower()


def serialize_user(user: UserDB) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        role=UserRole(user.role),
        is_active=user.is_active,
        created_at=user.created_at,
    )


def get_user_by_id(db: Session, user_id: int) -> UserDB | None:
    return db.query(UserDB).filter(UserDB.id == user_id).one_or_none()


def get_user_by_email(db: Session, email: str) -> UserDB | None:
    normalized_email = normalize_email(email)
    return db.query(UserDB).filter(UserDB.email == normalized_email).one_or_none()


def list_users(db: Session) -> list[UserResponse]:
    users = db.query(UserDB).order_by(UserDB.email.asc()).all()
    return [serialize_user(user) for user in users]


def create_user(db: Session, email: str, password: str, role: UserRole) -> UserResponse:
    normalized_email = normalize_email(email)
    if not normalized_email:
        raise ValueError("Email is required")
    if len(password) < 8:
        raise ValueError("Password must contain at least 8 characters")
    if get_user_by_email(db, normalized_email) is not None:
        raise ValueError("User with this email already exists")

    user = UserDB(
        email=normalized_email,
        password_hash=hash_password(password),
        role=role.value,
        is_active=True,
        created_at=datetime.now(timezone.utc),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return serialize_user(user)


def update_user_role(db: Session, user_id: int, role: UserRole) -> UserResponse:
    user = get_user_by_id(db, user_id)
    if user is None:
        raise LookupError("User not found")

    user.role = role.value
    db.commit()
    db.refresh(user)
    return serialize_user(user)


def update_user_status(db: Session, user_id: int, is_active: bool) -> UserResponse:
    user = get_user_by_id(db, user_id)
    if user is None:
        raise LookupError("User not found")

    user.is_active = is_active
    db.commit()
    db.refresh(user)
    return serialize_user(user)


def authenticate_user(db: Session, email: str, password: str) -> UserDB | None:
    user = get_user_by_email(db, email)
    if user is None or not user.is_active:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def seed_demo_users(db: Session) -> None:
    changed = False

    for entry in DEMO_USERS:
        email = normalize_email(entry["email"])
        role = entry["role"].value
        user = get_user_by_email(db, email)
        if user is None:
            db.add(
                UserDB(
                    email=email,
                    password_hash=hash_password(entry["password"]),
                    role=role,
                    is_active=True,
                    created_at=datetime.now(timezone.utc),
                )
            )
            changed = True
            continue

        if user.role != role:
            user.role = role
            changed = True
        if not user.is_active:
            user.is_active = True
            changed = True

    if changed:
        db.commit()
