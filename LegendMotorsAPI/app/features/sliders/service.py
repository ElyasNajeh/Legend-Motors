from pathlib import Path
import shutil
from uuid import uuid4

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.features.sliders.model import Slider
from app.features.sliders.schema import SliderCreate, SliderUpdate
from app.shared import crud

UPLOAD_DIR = Path("/app/uploads/sliders")


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

    return crud.update_by_id(
        db,
        Slider,
        slider_id,
        slider_data.model_dump(),
    )


def delete_slider(db: Session, slider_id: int):
    slider = crud.delete_by_id(db, Slider, slider_id)

    if not slider:
        raise HTTPException(
            status_code=404,
            detail="Slider not found",
        )

    return slider


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
