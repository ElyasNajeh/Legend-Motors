from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class AdminCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class AdminUpdate(BaseModel):
    username: str
    email: EmailStr
    password: str | None = None


class AdminResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
