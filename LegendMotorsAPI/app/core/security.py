from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, Request
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"])


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)


def create_token(data: dict, expires_delta: timedelta) -> str:
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + expires_delta

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )

    return encoded_jwt


def verify_token(token: str):
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        email = payload.get("sub")

        if email is None:
            return None

        return email

    except JWTError:
        return None


def get_current_user(request: Request):
    access_token = request.cookies.get("access_token")

    if access_token is None:
        raise HTTPException(
            status_code=401,
            detail="Token missing",
        )

    email = verify_token(access_token)

    if email is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )

    return email
