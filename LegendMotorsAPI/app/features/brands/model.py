from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class Brand(Base):
    __tablename__ = "brands"

    id = Column(Integer, primary_key=True, index=True)

    name_ar = Column(
        String(255),
        nullable=False,
        unique=True,
    )

    name_en = Column(
        String(255),
        nullable=False,
        unique=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    cars = relationship(
        "Car",
        back_populates="brand",
    )
