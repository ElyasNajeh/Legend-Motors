from datetime import datetime

from pydantic import BaseModel, ConfigDict


class BrandCreate(BaseModel):
    name_ar: str
    name_en: str


class BrandUpdate(BaseModel):
    name_ar: str
    name_en: str


class BrandResponse(BaseModel):
    id: int
    name_ar: str
    name_en: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
