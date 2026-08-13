from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, String

from app.db.base import Base


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(
        String(50),
        unique=True,
        nullable=False,
    )

    email = Column(
        String(100),
        unique=True,
        nullable=False,
    )

    hashed_password = Column(
        String(255),
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
