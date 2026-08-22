from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class NormalCarDetails(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class HybridCarDetails(BaseModel):
    battery_capacity: str | None = None

    model_config = ConfigDict(from_attributes=True)


class CarCreate(BaseModel):
    brand_id: int

    model: str
    year: int
    mileage: int
    transmission: Literal["automatic", "manual", "cvt"] = "automatic"
    horsepower: int
    fuel_type: str
    engine_cc: int
    is_turbo: bool = False

    description_ar: str | None = None
    description_en: str | None = None

    is_featured: bool = False
    is_bought: bool = False
    is_active: bool = True

    car_type: str

    hybrid_details: HybridCarDetails | None = None


class CarUpdate(BaseModel):
    brand_id: int

    model: str
    year: int
    mileage: int
    transmission: Literal["automatic", "manual", "cvt"]
    horsepower: int
    fuel_type: str
    engine_cc: int
    is_turbo: bool

    description_ar: str | None = None
    description_en: str | None = None

    is_featured: bool
    is_bought: bool
    is_active: bool

    car_type: str

    hybrid_details: HybridCarDetails | None = None


class CarImageCreate(BaseModel):
    image: str
    is_primary: bool = False


class CarImageUpdate(BaseModel):
    image: str


class CarImageResponse(BaseModel):
    id: int
    image: str
    is_primary: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CarBrandResponse(BaseModel):
    id: int
    name_ar: str
    name_en: str

    model_config = ConfigDict(from_attributes=True)


class CarResponse(BaseModel):
    id: int
    brand_id: int

    model: str
    year: int
    mileage: int
    transmission: Literal["automatic", "manual", "cvt"]
    horsepower: int
    fuel_type: str
    engine_cc: int
    is_turbo: bool
    car_type: str

    description_ar: str | None
    description_en: str | None

    is_featured: bool
    is_bought: bool
    is_active: bool

    created_at: datetime

    normal_car: NormalCarDetails | None = None
    hybrid_car: HybridCarDetails | None = None

    images: list[CarImageResponse] = Field(default_factory=list)
    brand: CarBrandResponse

    model_config = ConfigDict(from_attributes=True)


class CarBoughtUpdate(BaseModel):
    is_bought: bool


class CarActiveUpdate(BaseModel):
    is_active: bool
