from pathlib import Path
import shutil

from sqlalchemy.orm import Session

from app.core import security
from app.features.admins.model import Admin
from app.features.brands.model import Brand
from app.features.cars.model import Car, CarImage, NormalCar
from app.features.sliders.model import Slider


class DatabaseSeeder:
    """Seed a new installation without changing databases that already have data."""

    UPLOAD_ROOT = Path("/app/uploads")
    DOCKER_ASSET_ROOT = Path("/app/seed_assets")
    LOCAL_ASSET_ROOT = (
        Path(__file__).resolve().parents[3]
        / "LegendMotorsUI"
        / "src"
        / "assets"
        / "site_assets"
    )

    BRANDS = (
        ("BMW", "بي ام دبليو"),
        ("Mercedes", "مرسيدس"),
        ("Jaguar", "جاغوار"),
        ("KIA", "كيا"),
        ("Toyota", "تويوتا"),
        ("Nissan", "نيسان"),
    )

    CARS = (
        {
            "folder": "car1",
            "brand": "BMW",
            "model": "530i",
            "year": 2022,
            "mileage": 32000,
            "horsepower": 252,
            "engine_cc": 2000,
            "is_turbo": True,
            "description_en": "A refined sports sedan with premium comfort and responsive performance.",
            "description_ar": "سيدان رياضية راقية تجمع بين الراحة الفخمة والأداء السريع.",
        },
        {
            "folder": "car2",
            "brand": "Mercedes",
            "model": "C 200",
            "year": 2021,
            "mileage": 41000,
            "horsepower": 204,
            "engine_cc": 1500,
            "is_turbo": True,
            "description_en": "An elegant luxury sedan with modern technology and a smooth drive.",
            "description_ar": "سيدان فخمة وأنيقة بتكنولوجيا حديثة وقيادة مريحة.",
        },
        {
            "folder": "car3",
            "brand": "Jaguar",
            "model": "F-PACE",
            "year": 2020,
            "mileage": 58000,
            "horsepower": 250,
            "engine_cc": 2000,
            "is_turbo": True,
            "description_en": "A distinctive premium SUV with confident handling and a spacious cabin.",
            "description_ar": "سيارة SUV فخمة بتصميم مميز، تحكم واثق ومقصورة واسعة.",
        },
        {
            "folder": "car4",
            "brand": "KIA",
            "model": "Sportage",
            "year": 2023,
            "mileage": 18000,
            "horsepower": 180,
            "engine_cc": 1600,
            "is_turbo": True,
            "description_en": "A practical modern SUV with excellent comfort and everyday versatility.",
            "description_ar": "سيارة SUV عصرية وعملية، مريحة ومناسبة للاستخدام اليومي.",
        },
        {
            "folder": "car5",
            "brand": "Toyota",
            "model": "Camry",
            "year": 2022,
            "mileage": 27000,
            "horsepower": 203,
            "engine_cc": 2500,
            "is_turbo": False,
            "description_en": "A dependable and comfortable sedan known for efficiency and reliability.",
            "description_ar": "سيدان مريحة واقتصادية، معروفة باعتماديتها العالية.",
        },
        {
            "folder": "car6",
            "brand": "Nissan",
            "model": "Qashqai",
            "year": 2023,
            "mileage": 22000,
            "horsepower": 158,
            "engine_cc": 1300,
            "is_turbo": True,
            "description_en": "A versatile crossover with a comfortable cabin and modern safety features.",
            "description_ar": "كروس أوفر عملية بمقصورة مريحة وأنظمة أمان حديثة.",
        },
    )

    def __init__(self, db: Session):
        self.db = db
        self.asset_root = (
            self.DOCKER_ASSET_ROOT
            if self.DOCKER_ASSET_ROOT.exists()
            else self.LOCAL_ASSET_ROOT
        )

    def seed_admin(self) -> bool:
        if self.db.query(Admin.id).first() is not None:
            return False

        self.db.add(
            Admin(
                username="admin",
                email="a@gmail.com",
                hashed_password=security.hash_password("1234"),
            )
        )
        self.db.commit()
        return True

    def seed_showroom_data(self) -> bool:
        catalog_has_data = any(
            (
                self.db.query(Brand.id).first() is not None,
                self.db.query(Car.id).first() is not None,
                self.db.query(Slider.id).first() is not None,
            )
        )
        if catalog_has_data:
            return False

        if not self.asset_root.exists():
            raise FileNotFoundError(f"Seed assets not found: {self.asset_root}")

        try:
            brands = {
                name_en: Brand(name_en=name_en, name_ar=name_ar)
                for name_en, name_ar in self.BRANDS
            }
            self.db.add_all(brands.values())
            self.db.flush()

            for car_data in self.CARS:
                folder = car_data["folder"]
                car = Car(
                    brand_id=brands[car_data["brand"]].id,
                    model=car_data["model"],
                    year=car_data["year"],
                    mileage=car_data["mileage"],
                    transmission="automatic",
                    horsepower=car_data["horsepower"],
                    fuel_type="gasoline",
                    engine_cc=car_data["engine_cc"],
                    is_turbo=car_data["is_turbo"],
                    car_type="normal",
                    description_ar=car_data["description_ar"],
                    description_en=car_data["description_en"],
                    is_featured=True,
                    is_active=True,
                )
                self.db.add(car)
                self.db.flush()
                self.db.add(NormalCar(car_id=car.id))

                source_dir = self.asset_root / "cars" / folder
                image_files = sorted(path for path in source_dir.iterdir() if path.is_file())
                for index, source in enumerate(image_files):
                    relative_path = Path("cars") / folder / source.name
                    self._copy_asset(source, relative_path)
                    self.db.add(
                        CarImage(
                            car_id=car.id,
                            image=f"uploads/{relative_path.as_posix()}",
                            is_primary=index == 0,
                        )
                    )

            slider_files = sorted((self.asset_root / "sliders").glob("*.png"))
            for order, source in enumerate(slider_files, start=1):
                relative_path = Path("sliders") / source.name
                self._copy_asset(source, relative_path)
                self.db.add(
                    Slider(
                        title_ar=f"سيارة نار {order}",
                        title_en=f"Fire Car {order}",
                        display_order=order,
                        is_active=True,
                        image=f"uploads/{relative_path.as_posix()}",
                    )
                )

            self.db.commit()
            return True
        except Exception:
            self.db.rollback()
            raise

    def _copy_asset(self, source: Path, relative_path: Path) -> None:
        destination = self.UPLOAD_ROOT / relative_path
        destination.parent.mkdir(parents=True, exist_ok=True)
        if not destination.exists():
            shutil.copy2(source, destination)
