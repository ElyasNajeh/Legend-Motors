from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine


COMMON_CAR_COLUMNS = {"fuel_type", "engine_cc", "is_turbo"}
CAR_IMAGE_PRIMARY_INDEX = "uq_car_images_primary_per_car"


def migrate_car_state(engine: Engine) -> None:
    """Use independent is_bought and is_active boolean state fields."""
    with engine.begin() as connection:
        inspector = inspect(connection)
        if "cars" not in inspector.get_table_names():
            return

        car_columns = {
            column["name"] for column in inspector.get_columns("cars")
        }
        if "is_bought" not in car_columns:
            connection.execute(
                text(
                    "ALTER TABLE cars ADD COLUMN is_bought BOOLEAN "
                    "NOT NULL DEFAULT FALSE"
                )
            )

        if "is_active" not in car_columns:
            connection.execute(
                text(
                    "ALTER TABLE cars ADD COLUMN is_active BOOLEAN "
                    "NOT NULL DEFAULT TRUE"
                )
            )

            if "is_hidden" in car_columns:
                connection.execute(
                    text("UPDATE cars SET is_active = NOT is_hidden")
                )

        if "status" in car_columns:
            connection.execute(
                text("UPDATE cars SET is_bought = (status = 'bought')")
            )
            connection.execute(text("UPDATE cars SET is_active = FALSE WHERE status = 'hidden'"))
            connection.execute(text("ALTER TABLE cars DROP COLUMN status"))

        if "is_hidden" in car_columns:
            connection.execute(text("UPDATE cars SET is_active = NOT is_hidden"))
            connection.execute(text("ALTER TABLE cars DROP COLUMN is_hidden"))


def migrate_car_common_fields(engine: Engine) -> None:
    """Move duplicated subtype fields to cars for databases created before this change."""
    with engine.begin() as connection:
        inspector = inspect(connection)
        table_names = set(inspector.get_table_names())

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


def migrate_car_transmission(engine: Engine) -> None:
    """Add a controlled transmission value to databases created before this field."""
    with engine.begin() as connection:
        inspector = inspect(connection)
        if "cars" not in inspector.get_table_names():
            return

        car_columns = {
            column["name"] for column in inspector.get_columns("cars")
        }
        if "transmission" in car_columns:
            return

        connection.execute(
            text(
                "ALTER TABLE cars "
                "ADD COLUMN transmission VARCHAR(20) "
                "NOT NULL DEFAULT 'automatic'"
            )
        )


def migrate_car_image_primary(engine: Engine) -> None:
    """Persist one primary image per car for databases created before this field."""
    with engine.begin() as connection:
        inspector = inspect(connection)
        if "car_images" not in inspector.get_table_names():
            return

        image_columns = {
            column["name"] for column in inspector.get_columns("car_images")
        }
        image_indexes = {
            index["name"] for index in inspector.get_indexes("car_images")
        }

        if "is_primary" not in image_columns:
            connection.execute(
                text(
                    "ALTER TABLE car_images "
                    "ADD COLUMN is_primary BOOLEAN NOT NULL DEFAULT FALSE"
                )
            )

        if CAR_IMAGE_PRIMARY_INDEX in image_indexes:
            return

        # Keep an existing primary when possible; otherwise promote the oldest image.
        connection.execute(
            text(
                """
                WITH ranked_images AS (
                    SELECT id,
                           ROW_NUMBER() OVER (
                               PARTITION BY car_id
                               ORDER BY is_primary DESC, id ASC
                           ) AS image_rank
                    FROM car_images
                )
                UPDATE car_images AS image
                SET is_primary = (ranked.image_rank = 1)
                FROM ranked_images AS ranked
                WHERE image.id = ranked.id
                """
            )
        )
        connection.execute(
            text(
                f"CREATE UNIQUE INDEX {CAR_IMAGE_PRIMARY_INDEX} "
                "ON car_images (car_id) WHERE is_primary"
            )
        )
