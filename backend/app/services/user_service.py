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


def get_user_by_email(db: Session, email: str) -> UserDB | None:
    normalized_email = normalize_email(email)
    return db.query(UserDB).filter(UserDB.email == normalized_email).one_or_none()


def list_users(db: Session) -> list[UserResponse]:
    users = db.query(UserDB).order_by(UserDB.email.asc()).all()
    return [serialize_user(user) for user in users]


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
