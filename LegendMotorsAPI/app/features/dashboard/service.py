from sqlalchemy.orm import Session

from app.features.brands.model import Brand
from app.features.cars.model import Car, NormalCar, HybridCar
from app.features.sliders.model import Slider


def get_dashboard_stats(db: Session):
    cars_count = db.query(Car).count()

    normal_cars_count = db.query(NormalCar).count()

    hybrid_cars_count = db.query(HybridCar).count()

    brands_count = db.query(Brand).count()

    sliders_count = db.query(Slider).count()

    return {
        "cars": cars_count,
        "normal_cars": normal_cars_count,
        "hybrid_cars": hybrid_cars_count,
        "brands": brands_count,
        "sliders": sliders_count,
    }
