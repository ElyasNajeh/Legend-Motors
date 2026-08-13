from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.features.admins import service
from app.features.admins.schema import (
    AdminCreate,
    AdminResponse,
    AdminUpdate,
)

router = APIRouter(
    prefix="/admins",
    tags=["Admins"],
)


@router.post("/", response_model=AdminResponse)
def create_admin(
    admin_data: AdminCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.create_admin(db, admin_data)


@router.get("/", response_model=list[AdminResponse])
def get_admins(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.get_admins(db)


@router.get("/{admin_id}", response_model=AdminResponse)
def get_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.get_admin(db, admin_id)


@router.put("/{admin_id}", response_model=AdminResponse)
def update_admin(
    admin_id: int,
    admin_data: AdminUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.update_admin(db, admin_id, admin_data)


@router.delete("/{admin_id}", response_model=AdminResponse)
def delete_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.delete_admin(db, admin_id)
