from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.features.sliders import service
from app.features.sliders.schema import (
    SliderCreate,
    SliderResponse,
    SliderUpdate,
)

router = APIRouter(
    prefix="/sliders",
    tags=["Sliders"],
)


@router.post("/", response_model=SliderResponse)
def create_slider(
    slider_data: SliderCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.create_slider(db, slider_data)


@router.get("/", response_model=list[SliderResponse])
def get_sliders(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.get_sliders(db)


@router.get("/active", response_model=list[SliderResponse])
def get_active_sliders(
    db: Session = Depends(get_db),
):
    return service.get_active_sliders(db)


@router.post("/upload-image")
def upload_image(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user),
):
    return service.upload_image(file)


@router.get("/{slider_id}", response_model=SliderResponse)
def get_slider(
    slider_id: int,
    db: Session = Depends(get_db),
):
    return service.get_slider(db, slider_id)


@router.put("/{slider_id}", response_model=SliderResponse)
def update_slider(
    slider_id: int,
    slider_data: SliderUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.update_slider(db, slider_id, slider_data)


@router.delete("/{slider_id}", response_model=SliderResponse)
def delete_slider(
    slider_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.delete_slider(db, slider_id)


@router.patch("/{slider_id}/toggle-status", response_model=SliderResponse)
def toggle_slider_status(
    slider_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.toggle_slider_status(db, slider_id)
