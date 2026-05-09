from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db, require_roles
from app.models import LoginRequest, TokenResponse, UserListResponse, UserResponse, UserRole
from app.security import create_access_token
from app.services.user_service import authenticate_user, list_users


router = APIRouter()


@router.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload.email, payload.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user_response = UserResponse(
        id=user.id,
        email=user.email,
        role=UserRole(user.role),
        is_active=user.is_active,
        created_at=user.created_at,
    )
    access_token = create_access_token(subject=user.email, role=user.role)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response,
    }


@router.get("/auth/me", response_model=UserResponse)
def get_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user


@router.get("/users", response_model=UserListResponse)
def get_users(
    _: UserResponse = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
):
    items = list_users(db)
    return {"count": len(items), "items": items}
