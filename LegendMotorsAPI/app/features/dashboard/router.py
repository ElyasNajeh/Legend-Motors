from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.features.dashboard import service

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.get_dashboard_stats(db)
