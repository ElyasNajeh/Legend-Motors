"""Optimize database-backed car and slider images. Dry-run unless --apply is used."""

import argparse
from collections import defaultdict
from uuid import uuid4

from app.db.session import SessionLocal
from app.features.cars.model import CarImage
from app.features.sliders.model import Slider
from app.shared.images import (
    CAR_MAX_SIZE,
    CAR_WEBP_QUALITY,
    SLIDER_MAX_SIZE,
    SLIDER_WEBP_QUALITY,
    optimize_image_file,
    resolve_uploaded_image,
    upload_url,
)


def migrate_group(db, records, subdirectory, max_size, quality, apply):
    grouped_records = defaultdict(list)
    for record in records:
        grouped_records[record.image].append(record)

    optimized = 0
    skipped = 0
    failed = 0

    for value, matching_records in grouped_records.items():
        source = resolve_uploaded_image(value, subdirectory)
        if not source or not source.is_file():
            print(f"SKIP missing or external: {value}")
            skipped += 1
            continue

        destination = source.with_suffix(".webp")
        if destination == source or destination.exists():
            destination = source.with_name(f"{source.stem}-{uuid4()}.webp")

        if not apply:
            print(f"WOULD OPTIMIZE: {source} -> {destination}")
            optimized += 1
            continue

        try:
            optimize_image_file(source, destination, max_size, quality)
            new_value = upload_url(destination)
            for record in matching_records:
                record.image = new_value
            db.commit()
            if destination != source:
                source.unlink()
            print(f"OPTIMIZED: {source} -> {destination}")
            optimized += 1
        except Exception as exc:
            db.rollback()
            if destination != source and destination.exists():
                destination.unlink()
            print(f"FAILED: {source}: {exc}")
            failed += 1

    return optimized, skipped, failed


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Write optimized files and update database paths",
    )
    args = parser.parse_args()

    db = SessionLocal()
    try:
        totals = [0, 0, 0]
        groups = (
            (db.query(CarImage).all(), "cars", CAR_MAX_SIZE, CAR_WEBP_QUALITY),
            (db.query(Slider).all(), "sliders", SLIDER_MAX_SIZE, SLIDER_WEBP_QUALITY),
        )
        for group in groups:
            result = migrate_group(db, *group, apply=args.apply)
            totals = [left + right for left, right in zip(totals, result)]

        mode = "applied" if args.apply else "dry-run"
        print(
            f"Done ({mode}): {totals[0]} candidates, "
            f"{totals[1]} skipped, {totals[2]} failed"
        )
        return 1 if totals[2] else 0
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
