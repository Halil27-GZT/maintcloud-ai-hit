from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.database import SessionLocal
from app.models import UserResponse, UserRole
from app.security import decode_access_token
from app.services.user_service import get_user_by_email, serialize_user


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db=Depends(get_db),
) -> UserResponse:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    payload = decode_access_token(credentials.credentials)
    email = payload.get("sub")
    if not isinstance(email, str) or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )

    user = get_user_by_email(db, email)
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is not authorized",
        )

    return serialize_user(user)


def require_roles(*allowed_roles: UserRole) -> Callable[[UserResponse], UserResponse]:
    def dependency(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return dependency
