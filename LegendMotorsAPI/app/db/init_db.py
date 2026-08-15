from sqlalchemy import create_engine, text

from app.core import security
from app.core.config import settings
from app.db.base import Base
from app.db.migrations import migrate_car_common_fields, migrate_car_transmission
from app.db.session import SessionLocal, engine

# Import all models so SQLAlchemy registers them in Base.metadata
from app.features.admins.model import Admin
from app.features.sliders.model import Slider
from app.features.brands.model import Brand
from app.features.cars.model import Car, NormalCar, HybridCar, CarImage


def create_database_if_not_exists():
    server_url = (
        f"postgresql+psycopg2://{settings.DATABASE_USER}:"
        f"{settings.DATABASE_PASSWORD}@"
        f"{settings.DATABASE_HOST}:"
        f"{settings.DATABASE_PORT}/postgres"
    )

    server_engine = create_engine(
        server_url,
        isolation_level="AUTOCOMMIT",
    )

    with server_engine.connect() as connection:
        result = connection.execute(
            text("SELECT 1 FROM pg_database " "WHERE datname = :db_name"),
            {
                "db_name": settings.DATABASE_NAME,
            },
        )

        database_exists = result.scalar() is not None

        if not database_exists:
            connection.execute(text(f'CREATE DATABASE "{settings.DATABASE_NAME}"'))

    server_engine.dispose()


def create_tables():
    Base.metadata.create_all(bind=engine)


def seed_development_admin():
    db = SessionLocal()

    try:
        admin = db.query(Admin).filter(Admin.email == "a@gmail.com").first()

        if admin is None:
            db.add(
                Admin(
                    username="admin",
                    email="a@gmail.com",
                    hashed_password=security.hash_password("1234"),
                )
            )
            db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def init_db():
    create_database_if_not_exists()
    migrate_car_common_fields(engine)
    migrate_car_transmission(engine)
    create_tables()
    seed_development_admin()
