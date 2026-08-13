from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.features.brands import service
from app.features.brands.schema import (
    BrandCreate,
    BrandResponse,
    BrandUpdate,
)

router = APIRouter(
    prefix="/brands",
    tags=["Brands"],
)


@router.post("/", response_model=BrandResponse)
def create_brand(
    brand_data: BrandCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.create_brand(db, brand_data)


@router.get("/", response_model=list[BrandResponse])
def get_brands(
    db: Session = Depends(get_db),
):
    return service.get_brands(db)


@router.get("/{brand_id}", response_model=BrandResponse)
def get_brand(
    brand_id: int,
    db: Session = Depends(get_db),
):
    return service.get_brand(db, brand_id)


@router.put("/{brand_id}", response_model=BrandResponse)
def update_brand(
    brand_id: int,
    brand_data: BrandUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.update_brand(db, brand_id, brand_data)


@router.delete("/{brand_id}", response_model=BrandResponse)
def delete_brand(
    brand_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.delete_brand(db, brand_id)
