from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.features.auth import service
from app.features.auth.schema import LoginRequest, LoginResponse, RefreshResponse

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post("/login", response_model=LoginResponse)
def login(
    login_data: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    return service.login(db, login_data, response)


@router.post("/refresh", response_model=RefreshResponse)
def refresh_access_token(
    request: Request,
):
    return service.refresh_access_token(request)


@router.post("/logout")
def logout(response: Response):
    return service.logout(response)


@router.get("/me")
def get_me(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.get_current_admin(db, current_user)
