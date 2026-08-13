from datetime import timedelta

from fastapi import HTTPException, Request, Response
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_token, verify_password, verify_token
from app.features.admins.model import Admin
from app.features.auth.schema import LoginRequest


def login(
    db: Session,
    login_data: LoginRequest,
    response: Response,
):
    admin = db.query(Admin).filter(Admin.email == login_data.email).first()

    if not admin:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not verify_password(
        login_data.password,
        admin.hashed_password,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    access_token = create_token(
        {"sub": admin.email},
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    refresh_token = create_token(
        {"sub": admin.email},
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="strict",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="strict",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )

    return {
        "message": "Login successful",
        "username": admin.username,
    }


def refresh_access_token(
    request: Request,
    response: Response,
):
    refresh_token = request.cookies.get("refresh_token")

    if refresh_token is None:
        raise HTTPException(
            status_code=401,
            detail="Refresh token missing",
        )

    email = verify_token(refresh_token)

    if email is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token",
        )

    new_access_token = create_token(
        {"sub": email},
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=False,
        samesite="strict",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    return {
        "message": "Access token refreshed",
    }


def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        samesite="strict",
        secure=False,
    )

    response.delete_cookie(
        key="refresh_token",
        samesite="strict",
        secure=False,
    )

    return {
        "message": "Logged out successfully",
    }


def get_current_admin(db: Session, email: str):
    admin = db.query(Admin).filter(Admin.email == email).first()

    if not admin:
        raise HTTPException(
            status_code=404,
            detail="Admin not found",
        )

    return {
        "id": admin.id,
        "username": admin.username,
        "email": admin.email,
    }
