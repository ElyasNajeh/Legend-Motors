from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class NormalCarDetails(BaseModel):
    fuel_type: str
    engine_cc: int
    is_turbo: bool = False

    model_config = ConfigDict(from_attributes=True)


class HybridCarDetails(BaseModel):
    fuel_type: str
    engine_cc: int
    is_turbo: bool = False
    battery_capacity: str | None = None

    model_config = ConfigDict(from_attributes=True)


class CarCreate(BaseModel):
    brand_id: int

    model: str
    year: int
    mileage: int
    horsepower: int

    description_ar: str | None = None
    description_en: str | None = None

    is_featured: bool = False

    car_type: str

    normal_details: NormalCarDetails | None = None
    hybrid_details: HybridCarDetails | None = None


class CarUpdate(BaseModel):
    brand_id: int

    model: str
    year: int
    mileage: int
    horsepower: int

    description_ar: str | None = None
    description_en: str | None = None

    is_featured: bool

    car_type: str

    normal_details: NormalCarDetails | None = None
    hybrid_details: HybridCarDetails | None = None


class CarImageCreate(BaseModel):
    image: str


class CarImageResponse(BaseModel):
    id: int
    image: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CarResponse(BaseModel):
    id: int
    brand_id: int

    model: str
    year: int
    mileage: int
    horsepower: int
    car_type: str

    description_ar: str | None
    description_en: str | None

    is_featured: bool
    is_active: bool

    created_at: datetime

    normal_car: NormalCarDetails | None = None
    hybrid_car: HybridCarDetails | None = None

    images: list[CarImageResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
