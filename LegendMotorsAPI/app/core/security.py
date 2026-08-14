from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import settings

bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt(),
    ).decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except ValueError:
        return False


def create_token(
    data: dict,
    expires_delta: timedelta,
    token_type: str,
) -> str:
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + expires_delta

    to_encode.update(
        {
            "exp": expire,
            "token_type": token_type,
        }
    )

    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )

    return encoded_jwt


def verify_token(token: str, expected_token_type: str):
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        email = payload.get("sub")
        token_type = payload.get("token_type")

        if email is None or token_type != expected_token_type:
            return None

        return email

    except JWTError:
        return None


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Security(bearer_scheme),
):
    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Access token missing",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email = verify_token(
        credentials.credentials,
        expected_token_type="access",
    )

    if email is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid access token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return email
