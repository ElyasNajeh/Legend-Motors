from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SliderCreate(BaseModel):
    title_ar: str
    title_en: str
    display_order: int = 0
    image: str


class SliderUpdate(BaseModel):
    title_ar: str
    title_en: str
    display_order: int
    image: str


class SliderResponse(BaseModel):
    id: int
    title_ar: str
    title_en: str
    display_order: int
    is_active: bool
    image: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
