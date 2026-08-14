from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    message: str
    username: str
    access_token: str
    token_type: str
    expires_in: int


class RefreshResponse(BaseModel):
    message: str
    access_token: str
    token_type: str
    expires_in: int
