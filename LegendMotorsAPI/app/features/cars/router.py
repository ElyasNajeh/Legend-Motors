from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.features.cars import service
from app.features.cars.schema import (
    CarCreate,
    CarImageCreate,
    CarImageResponse,
    CarResponse,
    CarUpdate,
)

router = APIRouter(
    prefix="/cars",
    tags=["Cars"],
)


# =========================
# Cars
# =========================


@router.post("/", response_model=CarResponse)
def create_car(
    car_data: CarCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.create_car(db, car_data)


@router.get("/", response_model=list[CarResponse])
def get_cars(
    db: Session = Depends(get_db),
):
    return service.get_cars(db)


@router.get("/active", response_model=list[CarResponse])
def get_active_cars(
    db: Session = Depends(get_db),
):
    return service.get_active_cars(db)


@router.get("/featured", response_model=list[CarResponse])
def get_featured_cars(
    db: Session = Depends(get_db),
):
    return service.get_featured_cars(db)


@router.get("/brand/{brand_id}", response_model=list[CarResponse])
def get_cars_by_brand(
    brand_id: int,
    db: Session = Depends(get_db),
):
    return service.get_cars_by_brand(db, brand_id)


# =========================
# Car Images
# =========================


@router.post("/upload-image")
def upload_image(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user),
):
    return service.upload_image(file)


@router.get("/images/{image_id}", response_model=CarImageResponse)
def get_car_image(
    image_id: int,
    db: Session = Depends(get_db),
):
    return service.get_car_image(db, image_id)


@router.put("/images/{image_id}", response_model=CarImageResponse)
def update_car_image(
    image_id: int,
    image_data: CarImageCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.update_car_image(
        db,
        image_id,
        image_data,
    )


@router.delete("/images/{image_id}", response_model=CarImageResponse)
def delete_car_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.delete_car_image(db, image_id)


# =========================
# Single Car
# =========================


@router.get("/{car_id}", response_model=CarResponse)
def get_car(
    car_id: int,
    db: Session = Depends(get_db),
):
    return service.get_car(db, car_id)


@router.put("/{car_id}", response_model=CarResponse)
def update_car(
    car_id: int,
    car_data: CarUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.update_car(
        db,
        car_id,
        car_data,
    )


@router.delete("/{car_id}", response_model=CarResponse)
def delete_car(
    car_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.delete_car(db, car_id)


@router.patch("/{car_id}/toggle-status", response_model=CarResponse)
def toggle_car_status(
    car_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.toggle_car_status(db, car_id)


@router.patch("/{car_id}/toggle-featured", response_model=CarResponse)
def toggle_car_featured(
    car_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.toggle_car_featured(db, car_id)


# =========================
# Images For Specific Car
# =========================


@router.post("/{car_id}/images", response_model=CarImageResponse)
def create_car_image(
    car_id: int,
    image_data: CarImageCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.create_car_image(
        db,
        car_id,
        image_data,
    )


@router.get("/{car_id}/images", response_model=list[CarImageResponse])
def get_car_images(
    car_id: int,
    db: Session = Depends(get_db),
):
    return service.get_car_images(db, car_id)
