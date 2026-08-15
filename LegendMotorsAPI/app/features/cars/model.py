from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.db.base import Base


class Car(Base):
    __tablename__ = "cars"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    brand_id = Column(
        Integer,
        ForeignKey("brands.id", ondelete="RESTRICT"),
        nullable=False,
    )

    model = Column(
        String(255),
        nullable=False,
    )

    year = Column(
        Integer,
        nullable=False,
    )

    mileage = Column(
        Integer,
        nullable=False,
    )

    transmission = Column(
        String(20),
        default="automatic",
        nullable=False,
    )

    horsepower = Column(
        Integer,
        nullable=False,
    )

    fuel_type = Column(
        String(20),
        nullable=False,
    )

    engine_cc = Column(
        Integer,
        nullable=False,
    )

    is_turbo = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    car_type = Column(
        String(20),
        nullable=False,
    )

    description_ar = Column(
        Text,
        nullable=True,
    )

    description_en = Column(
        Text,
        nullable=True,
    )

    is_featured = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    brand = relationship(
        "Brand",
        back_populates="cars",
    )

    normal_car = relationship(
        "NormalCar",
        back_populates="car",
        uselist=False,
        cascade="all, delete-orphan",
    )

    hybrid_car = relationship(
        "HybridCar",
        back_populates="car",
        uselist=False,
        cascade="all, delete-orphan",
    )

    images = relationship(
        "CarImage",
        back_populates="car",
        cascade="all, delete-orphan",
        order_by=lambda: (CarImage.is_primary.desc(), CarImage.id),
    )


class NormalCar(Base):
    __tablename__ = "normal_cars"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    car_id = Column(
        Integer,
        ForeignKey("cars.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    car = relationship(
        "Car",
        back_populates="normal_car",
    )


class HybridCar(Base):
    __tablename__ = "hybrid_cars"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    car_id = Column(
        Integer,
        ForeignKey("cars.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    battery_capacity = Column(
        String(50),
        nullable=True,
    )

    car = relationship(
        "Car",
        back_populates="hybrid_car",
    )


class CarImage(Base):
    __tablename__ = "car_images"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    car_id = Column(
        Integer,
        ForeignKey("cars.id", ondelete="CASCADE"),
        nullable=False,
    )

    image = Column(
        String(255),
        nullable=False,
    )

    is_primary = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    car = relationship(
        "Car",
        back_populates="images",
    )


Index(
    "uq_car_images_primary_per_car",
    CarImage.car_id,
    unique=True,
    postgresql_where=CarImage.is_primary.is_(True),
)
