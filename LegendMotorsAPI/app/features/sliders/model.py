from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Integer, String

from app.db.base import Base


class Slider(Base):
    __tablename__ = "sliders"

    id = Column(Integer, primary_key=True, index=True)

    title_ar = Column(
        String(255),
        nullable=False,
    )

    title_en = Column(
        String(255),
        nullable=False,
    )

    display_order = Column(
        Integer,
        nullable=False,
    )

    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    image = Column(
        String(255),
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
