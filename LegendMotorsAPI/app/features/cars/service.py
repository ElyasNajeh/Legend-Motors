from pathlib import Path
import shutil
from uuid import uuid4

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.features.brands.model import Brand
from app.features.cars.model import (
    Car,
    CarImage,
    HybridCar,
    NormalCar,
)
from app.features.cars.schema import (
    CarCreate,
    CarImageCreate,
    CarUpdate,
)
from app.shared import crud

UPLOAD_DIR = Path("/app/uploads/cars")


def validate_car_type(car_data):
    if car_data.car_type == "normal":
        if car_data.hybrid_details is not None:
            raise HTTPException(
                status_code=400,
                detail="Hybrid details are not allowed for normal cars",
            )

    elif car_data.car_type == "hybrid":
        if car_data.hybrid_details is None:
            raise HTTPException(
                status_code=400,
                detail="Hybrid car details are required",
            )

    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid car type",
        )


def create_car(db: Session, car_data: CarCreate):
    brand = crud.get_by_id(db, Brand, car_data.brand_id)

    if not brand:
        raise HTTPException(
            status_code=400,
            detail="Brand not found",
        )

    validate_car_type(car_data)

    try:
        car = Car(
            brand_id=car_data.brand_id,
            model=car_data.model,
            year=car_data.year,
            mileage=car_data.mileage,
            horsepower=car_data.horsepower,
            fuel_type=car_data.fuel_type,
            engine_cc=car_data.engine_cc,
            is_turbo=car_data.is_turbo,
            car_type=car_data.car_type,
            description_ar=car_data.description_ar,
            description_en=car_data.description_en,
            is_featured=car_data.is_featured,
        )

        db.add(car)
        db.flush()

        if car_data.car_type == "normal":
            normal_car = NormalCar(
                car_id=car.id,
            )

            db.add(normal_car)

        elif car_data.car_type == "hybrid":
            details = car_data.hybrid_details

            hybrid_car = HybridCar(
                car_id=car.id,
                battery_capacity=details.battery_capacity,
            )

            db.add(hybrid_car)

        db.commit()
        db.refresh(car)

        return car

    except Exception:
        db.rollback()
        raise


def get_cars(db: Session):
    return crud.get_all(db, Car)


def get_active_cars(db: Session):
    return db.query(Car).filter(Car.is_active.is_(True)).all()


def get_featured_cars(db: Session):
    return (
        db.query(Car)
        .filter(
            Car.is_active.is_(True),
            Car.is_featured.is_(True),
        )
        .all()
    )


def get_cars_by_brand(db: Session, brand_id: int):
    brand = crud.get_by_id(db, Brand, brand_id)

    if not brand:
        raise HTTPException(
            status_code=404,
            detail="Brand not found",
        )

    return (
        db.query(Car)
        .filter(
            Car.brand_id == brand_id,
            Car.is_active.is_(True),
        )
        .all()
    )


def get_car(db: Session, car_id: int):
    car = crud.get_by_id(db, Car, car_id)

    if not car:
        raise HTTPException(
            status_code=404,
            detail="Car not found",
        )

    return car


def update_car(
    db: Session,
    car_id: int,
    car_data: CarUpdate,
):
    car = crud.get_by_id(db, Car, car_id)

    if not car:
        raise HTTPException(
            status_code=404,
            detail="Car not found",
        )

    brand = crud.get_by_id(db, Brand, car_data.brand_id)

    if not brand:
        raise HTTPException(
            status_code=400,
            detail="Brand not found",
        )

    validate_car_type(car_data)

    try:
        car.brand_id = car_data.brand_id
        car.model = car_data.model
        car.year = car_data.year
        car.mileage = car_data.mileage
        car.horsepower = car_data.horsepower
        car.fuel_type = car_data.fuel_type
        car.engine_cc = car_data.engine_cc
        car.is_turbo = car_data.is_turbo
        car.description_ar = car_data.description_ar
        car.description_en = car_data.description_en
        car.is_featured = car_data.is_featured

        # If the car type changed, remove the old subtype.
        if car.car_type != car_data.car_type:
            if car.normal_car:
                db.delete(car.normal_car)

            if car.hybrid_car:
                db.delete(car.hybrid_car)

            db.flush()

        car.car_type = car_data.car_type

        if car_data.car_type == "normal":
            if not car.normal_car:
                db.add(
                    NormalCar(
                        car_id=car.id,
                    )
                )

        elif car_data.car_type == "hybrid":
            details = car_data.hybrid_details

            if car.hybrid_car:
                car.hybrid_car.battery_capacity = details.battery_capacity

            else:
                db.add(
                    HybridCar(
                        car_id=car.id,
                        battery_capacity=details.battery_capacity,
                    )
                )

        db.commit()
        db.refresh(car)

        return car

    except Exception:
        db.rollback()
        raise


def delete_car(db: Session, car_id: int):
    car = crud.delete_by_id(db, Car, car_id)

    if not car:
        raise HTTPException(
            status_code=404,
            detail="Car not found",
        )

    return car


def toggle_car_status(db: Session, car_id: int):
    car = crud.get_by_id(db, Car, car_id)

    if not car:
        raise HTTPException(
            status_code=404,
            detail="Car not found",
        )

    car.is_active = not car.is_active

    db.commit()
    db.refresh(car)

    return car


def toggle_car_featured(db: Session, car_id: int):
    car = crud.get_by_id(db, Car, car_id)

    if not car:
        raise HTTPException(
            status_code=404,
            detail="Car not found",
        )

    car.is_featured = not car.is_featured

    db.commit()
    db.refresh(car)

    return car


def create_car_image(
    db: Session,
    car_id: int,
    image_data: CarImageCreate,
):
    car = crud.get_by_id(db, Car, car_id)

    if not car:
        raise HTTPException(
            status_code=404,
            detail="Car not found",
        )

    car_image = CarImage(
        car_id=car_id,
        image=image_data.image,
    )

    return crud.create(db, car_image)


def get_car_images(db: Session, car_id: int):
    car = crud.get_by_id(db, Car, car_id)

    if not car:
        raise HTTPException(
            status_code=404,
            detail="Car not found",
        )

    return db.query(CarImage).filter(CarImage.car_id == car_id).all()


def get_car_image(db: Session, image_id: int):
    image = crud.get_by_id(db, CarImage, image_id)

    if not image:
        raise HTTPException(
            status_code=404,
            detail="Car image not found",
        )

    return image


def update_car_image(
    db: Session,
    image_id: int,
    image_data: CarImageCreate,
):
    image = crud.get_by_id(db, CarImage, image_id)

    if not image:
        raise HTTPException(
            status_code=404,
            detail="Car image not found",
        )

    return crud.update_by_id(
        db,
        CarImage,
        image_id,
        image_data.model_dump(),
    )


def delete_car_image(db: Session, image_id: int):
    image = crud.delete_by_id(db, CarImage, image_id)

    if not image:
        raise HTTPException(
            status_code=404,
            detail="Car image not found",
        )

    return image


def upload_image(file: UploadFile):
    UPLOAD_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    extension = Path(file.filename).suffix.lower()

    filename = f"{uuid4()}{extension}"

    file_path = UPLOAD_DIR / filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "filename": filename,
    }
