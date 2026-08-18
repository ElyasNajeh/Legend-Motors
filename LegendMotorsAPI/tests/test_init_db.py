import unittest
from contextlib import ExitStack
from unittest.mock import patch

import app.db.init_db as init_db_module


class DatabaseInitializationTests(unittest.TestCase):
    def run_init_db(self, application_schema_exists: bool):
        with ExitStack() as stack:
            stack.enter_context(
                patch.object(init_db_module, "create_database_if_not_exists")
            )
            stack.enter_context(
                patch.object(
                    init_db_module,
                    "application_schema_exists",
                    return_value=application_schema_exists,
                )
            )
            stack.enter_context(
                patch.object(init_db_module, "migrate_car_common_fields")
            )
            stack.enter_context(
                patch.object(init_db_module, "migrate_car_transmission")
            )
            stack.enter_context(
                patch.object(init_db_module, "migrate_car_image_primary")
            )
            stack.enter_context(patch.object(init_db_module, "create_tables"))
            seed_mock = stack.enter_context(
                patch.object(init_db_module, "seed_initial_data")
            )

            init_db_module.init_db()

        return seed_mock

    def test_fresh_database_is_seeded(self):
        seed_mock = self.run_init_db(application_schema_exists=False)

        seed_mock.assert_called_once_with()

    def test_existing_database_is_not_seeded(self):
        seed_mock = self.run_init_db(application_schema_exists=True)

        seed_mock.assert_not_called()


if __name__ == "__main__":
    unittest.main()
