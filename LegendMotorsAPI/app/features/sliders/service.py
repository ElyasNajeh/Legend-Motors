from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.features.sliders.model import Slider
from app.features.sliders.schema import SliderCreate, SliderUpdate
from app.shared import crud
from app.shared.images import (
    delete_uploaded_image,
    optimize_slider_upload,
)


def create_slider(db: Session, slider_data: SliderCreate):
    existing_slider = (
        db.query(Slider)
        .filter(
            (Slider.title_ar == slider_data.title_ar)
            | (Slider.title_en == slider_data.title_en)
        )
        .first()
    )

    if existing_slider:
        raise HTTPException(
            status_code=400,
            detail="Slider already exists",
        )

    existing_order = (
        db.query(Slider)
        .filter(Slider.display_order == slider_data.display_order)
        .first()
    )

    if existing_order:
        raise HTTPException(
            status_code=400,
            detail="Display order already exists",
        )

    slider = Slider(
        title_ar=slider_data.title_ar,
        title_en=slider_data.title_en,
        display_order=slider_data.display_order,
        image=slider_data.image,
    )

    return crud.create(db, slider)


def get_sliders(db: Session):
    return crud.get_all(db, Slider)


def get_active_sliders(db: Session):
    return (
        db.query(Slider)
        .filter(Slider.is_active.is_(True))
        .order_by(Slider.display_order)
        .all()
    )


def get_slider(db: Session, slider_id: int):
    slider = crud.get_by_id(db, Slider, slider_id)

    if not slider:
        raise HTTPException(
            status_code=404,
            detail="Slider not found",
        )

    return slider


def update_slider(
    db: Session,
    slider_id: int,
    slider_data: SliderUpdate,
):
    slider = crud.get_by_id(db, Slider, slider_id)

    if not slider:
        raise HTTPException(
            status_code=404,
            detail="Slider not found",
        )

    existing_slider = (
        db.query(Slider)
        .filter(
            Slider.id != slider_id,
            (
                (Slider.title_ar == slider_data.title_ar)
                | (Slider.title_en == slider_data.title_en)
            ),
        )
        .first()
    )

    if existing_slider:
        raise HTTPException(
            status_code=400,
            detail="Slider already exists",
        )

    existing_order = (
        db.query(Slider)
        .filter(
            Slider.id != slider_id,
            Slider.display_order == slider_data.display_order,
        )
        .first()
    )

    if existing_order:
        raise HTTPException(
            status_code=400,
            detail="Display order already exists",
        )

    old_image = slider.image
    updated_slider = crud.update_by_id(
        db,
        Slider,
        slider_id,
        slider_data.model_dump(),
    )
    if old_image != updated_slider.image:
        delete_uploaded_image(old_image, "sliders")
    return updated_slider


def delete_slider(db: Session, slider_id: int):
    slider = crud.get_by_id(db, Slider, slider_id)

    if not slider:
        raise HTTPException(
            status_code=404,
            detail="Slider not found",
        )

    image = slider.image
    deleted_slider = crud.delete_by_id(db, Slider, slider_id)
    delete_uploaded_image(image, "sliders")
    return deleted_slider


def toggle_slider_status(db: Session, slider_id: int):
    slider = crud.get_by_id(db, Slider, slider_id)

    if not slider:
        raise HTTPException(
            status_code=404,
            detail="Slider not found",
        )

    slider.is_active = not slider.is_active

    db.commit()
    db.refresh(slider)

    return slider


def upload_image(file: UploadFile):
    filename = optimize_slider_upload(file)
    return {
        "filename": filename,
        "path": f"/uploads/sliders/{filename}",
    }
