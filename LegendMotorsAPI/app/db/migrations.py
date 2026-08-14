from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine


COMMON_CAR_COLUMNS = {"fuel_type", "engine_cc", "is_turbo"}


def migrate_car_common_fields(engine: Engine) -> None:
    """Move duplicated subtype fields to cars for databases created before this change."""
    with engine.begin() as connection:
        inspector = inspect(connection)
        table_names = set(inspector.get_table_names())

        # A fresh database will be created directly from the current models.
        if "cars" not in table_names:
            return

        required_tables = {"normal_cars", "hybrid_cars"}
        if not required_tables.issubset(table_names):
            raise RuntimeError(
                "Cannot migrate car fields: subtype tables are missing"
            )

        car_columns = {
            column["name"] for column in inspector.get_columns("cars")
        }
        normal_columns = {
            column["name"] for column in inspector.get_columns("normal_cars")
        }
        hybrid_columns = {
            column["name"] for column in inspector.get_columns("hybrid_cars")
        }

        target_is_complete = COMMON_CAR_COLUMNS.issubset(car_columns)
        source_is_complete = (
            COMMON_CAR_COLUMNS.issubset(normal_columns)
            and COMMON_CAR_COLUMNS.issubset(hybrid_columns)
        )

        if target_is_complete and not source_is_complete:
            return

        if target_is_complete or not source_is_complete:
            raise RuntimeError(
                "Cannot migrate car fields: database has a partial or unsupported schema"
            )

        connection.execute(text("ALTER TABLE cars ADD COLUMN fuel_type VARCHAR(20)"))
        connection.execute(text("ALTER TABLE cars ADD COLUMN engine_cc INTEGER"))
        connection.execute(text("ALTER TABLE cars ADD COLUMN is_turbo BOOLEAN"))

        connection.execute(
            text(
                """
                UPDATE cars
                SET fuel_type = normal_cars.fuel_type,
                    engine_cc = normal_cars.engine_cc,
                    is_turbo = normal_cars.is_turbo
                FROM normal_cars
                WHERE normal_cars.car_id = cars.id
                """
            )
        )
        connection.execute(
            text(
                """
                UPDATE cars
                SET fuel_type = hybrid_cars.fuel_type,
                    engine_cc = hybrid_cars.engine_cc,
                    is_turbo = hybrid_cars.is_turbo
                FROM hybrid_cars
                WHERE hybrid_cars.car_id = cars.id
                """
            )
        )

        unmigrated_count = connection.execute(
            text(
                """
                SELECT COUNT(*)
                FROM cars
                WHERE fuel_type IS NULL
                   OR engine_cc IS NULL
                   OR is_turbo IS NULL
                """
            )
        ).scalar_one()

        if unmigrated_count:
            raise RuntimeError(
                f"Cannot migrate car fields: {unmigrated_count} cars have no subtype data"
            )

        connection.execute(
            text("ALTER TABLE cars ALTER COLUMN fuel_type SET NOT NULL")
        )
        connection.execute(
            text("ALTER TABLE cars ALTER COLUMN engine_cc SET NOT NULL")
        )
        connection.execute(
            text("ALTER TABLE cars ALTER COLUMN is_turbo SET NOT NULL")
        )

        for table_name in ("normal_cars", "hybrid_cars"):
            connection.execute(
                text(
                    f"""
                    ALTER TABLE {table_name}
                    DROP COLUMN fuel_type,
                    DROP COLUMN engine_cc,
                    DROP COLUMN is_turbo
                    """
                )
            )
