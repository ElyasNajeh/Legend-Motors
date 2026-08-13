from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core import security
from app.features.admins.model import Admin
from app.features.admins.schema import AdminCreate, AdminUpdate
from app.shared import crud


def create_admin(db: Session, admin_data: AdminCreate):
    existing_username = (
        db.query(Admin).filter(Admin.username == admin_data.username).first()
    )

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already exists",
        )

    existing_email = db.query(Admin).filter(Admin.email == admin_data.email).first()

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists",
        )

    hashed_password = security.hash_password(admin_data.password)

    admin = Admin(
        username=admin_data.username,
        email=admin_data.email,
        hashed_password=hashed_password,
    )

    return crud.create(db, admin)


def get_admins(db: Session):
    return crud.get_all(db, Admin)


def get_admin(db: Session, admin_id: int):
    admin = crud.get_by_id(db, Admin, admin_id)

    if not admin:
        raise HTTPException(
            status_code=404,
            detail="Admin not found",
        )

    return admin


def update_admin(
    db: Session,
    admin_id: int,
    admin_data: AdminUpdate,
):
    admin = crud.get_by_id(db, Admin, admin_id)

    if not admin:
        raise HTTPException(
            status_code=404,
            detail="Admin not found",
        )

    existing_username = (
        db.query(Admin)
        .filter(
            Admin.username == admin_data.username,
            Admin.id != admin_id,
        )
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already exists",
        )

    existing_email = (
        db.query(Admin)
        .filter(
            Admin.email == admin_data.email,
            Admin.id != admin_id,
        )
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists",
        )

    update_data = {
        "username": admin_data.username,
        "email": admin_data.email,
    }

    if admin_data.password is not None:
        update_data["hashed_password"] = security.hash_password(admin_data.password)

    return crud.update_by_id(
        db,
        Admin,
        admin_id,
        update_data,
    )


def delete_admin(db: Session, admin_id: int):
    admin = crud.delete_by_id(db, Admin, admin_id)

    if not admin:
        raise HTTPException(
            status_code=404,
            detail="Admin not found",
        )

    return admin
