from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db, require_roles
from app.models import (
    LoginRequest,
    TokenResponse,
    UserCreateRequest,
    UserListResponse,
    UserResponse,
    UserRole,
    UserRoleUpdateRequest,
    UserStatusUpdateRequest,
)
from app.security import create_access_token
from app.services.user_service import (
    authenticate_user,
    create_user,
    list_users,
    update_user_role,
    update_user_status,
)


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


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user_account(
    payload: UserCreateRequest,
    _: UserResponse = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
):
    try:
        return create_user(db, payload.email, payload.password, payload.role)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.patch("/users/{user_id}/role", response_model=UserResponse)
def change_user_role(
    user_id: int,
    payload: UserRoleUpdateRequest,
    current_user: UserResponse = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
):
    if current_user.id == user_id and payload.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin cannot remove their own admin role",
        )

    try:
        return update_user_role(db, user_id, payload.role)
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch("/users/{user_id}/status", response_model=UserResponse)
def change_user_status(
    user_id: int,
    payload: UserStatusUpdateRequest,
    current_user: UserResponse = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
):
    if current_user.id == user_id and not payload.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin cannot deactivate their own account",
        )

    try:
        return update_user_status(db, user_id, payload.is_active)
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
