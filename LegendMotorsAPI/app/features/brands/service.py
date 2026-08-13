from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.features.brands.model import Brand
from app.features.brands.schema import BrandCreate, BrandUpdate
from app.shared import crud


def create_brand(db: Session, brand_data: BrandCreate):
    existing_brand = (
        db.query(Brand)
        .filter(
            (Brand.name_ar == brand_data.name_ar)
            | (Brand.name_en == brand_data.name_en)
        )
        .first()
    )

    if existing_brand:
        raise HTTPException(
            status_code=400,
            detail="Brand already exists",
        )

    brand = Brand(
        name_ar=brand_data.name_ar,
        name_en=brand_data.name_en,
    )

    return crud.create(db, brand)


def get_brands(db: Session):
    return crud.get_all(db, Brand)


def get_brand(db: Session, brand_id: int):
    brand = crud.get_by_id(db, Brand, brand_id)

    if not brand:
        raise HTTPException(
            status_code=404,
            detail="Brand not found",
        )

    return brand


def update_brand(
    db: Session,
    brand_id: int,
    brand_data: BrandUpdate,
):
    brand = crud.get_by_id(db, Brand, brand_id)

    if not brand:
        raise HTTPException(
            status_code=404,
            detail="Brand not found",
        )

    existing_brand = (
        db.query(Brand)
        .filter(
            Brand.id != brand_id,
            (
                (Brand.name_ar == brand_data.name_ar)
                | (Brand.name_en == brand_data.name_en)
            ),
        )
        .first()
    )

    if existing_brand:
        raise HTTPException(
            status_code=400,
            detail="Brand already exists",
        )

    return crud.update_by_id(
        db,
        Brand,
        brand_id,
        brand_data.model_dump(),
    )


def delete_brand(db: Session, brand_id: int):
    brand = crud.delete_by_id(
        db,
        Brand,
        brand_id,
    )

    if not brand:
        raise HTTPException(
            status_code=404,
            detail="Brand not found",
        )

    return brand
