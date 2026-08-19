import logging
import os
from pathlib import Path
from tempfile import NamedTemporaryFile, SpooledTemporaryFile
from threading import Lock
from typing import Callable
import warnings
from uuid import uuid4

from fastapi import HTTPException, UploadFile
from PIL import Image, ImageOps, UnidentifiedImageError
import pillow_heif


logger = logging.getLogger(__name__)
UPLOAD_ROOT = Path("/app/uploads")
READ_CHUNK_SIZE = 1024 * 1024

# Phone cameras commonly produce HEIC/HEIF (and increasingly AVIF) files.
# Register those formats with Pillow and allow Pillow to decode images of any
# dimensions; uploads are resized before they are written to permanent storage.
pillow_heif.register_heif_opener()
register_avif_opener = getattr(pillow_heif, "register_avif_opener", None)
if register_avif_opener:
    register_avif_opener()
Image.MAX_IMAGE_PIXELS = None

CAR_MAX_SIZE = (1920, 1080)
CAR_WEBP_QUALITY = 82
SLIDER_MAX_SIZE = (2560, 1440)
SLIDER_WEBP_QUALITY = 82
SLIDER_SUBJECT_TARGET_HEIGHT = 1200
SLIDER_SUBJECT_MAX_WIDTH = 2304

ImageProcessor = Callable[[Image.Image], Image.Image]


class SubjectNotFoundError(ValueError):
    pass


def optimize_upload(
    upload: UploadFile,
    subdirectory: str,
    max_size: tuple[int, int],
    quality: int,
    processor: ImageProcessor | None = None,
) -> str:
    """Validate and atomically save an uploaded image as an optimized WebP."""
    destination_dir = UPLOAD_ROOT / subdirectory
    destination_dir.mkdir(parents=True, exist_ok=True)
    destination = destination_dir / f"{uuid4()}.webp"

    with SpooledTemporaryFile(max_size=5 * 1024 * 1024) as source:
        total = 0
        while chunk := upload.file.read(READ_CHUNK_SIZE):
            total += len(chunk)
            source.write(chunk)

        if total == 0:
            raise HTTPException(status_code=400, detail="Uploaded image is empty")

        source.seek(0)
        try:
            _write_optimized_webp(
                source,
                destination,
                max_size,
                quality,
                processor,
            )
        except SubjectNotFoundError:
            raise HTTPException(
                status_code=400,
                detail="No visible subject was detected in the image",
            )
        except (
            UnidentifiedImageError,
            OSError,
            ValueError,
            Image.DecompressionBombError,
            Image.DecompressionBombWarning,
        ):
            raise HTTPException(status_code=400, detail="Invalid or corrupted image")

    return destination.name


def optimize_slider_upload(upload: UploadFile) -> str:
    """Remove a slider background and normalize its visible subject height."""
    return optimize_upload(
        upload,
        "sliders",
        SLIDER_MAX_SIZE,
        SLIDER_WEBP_QUALITY,
        prepare_slider_image,
    )


def optimize_car_upload(upload: UploadFile) -> str:
    """Resize and save a car upload using the standard WebP preset."""
    return optimize_upload(
        upload,
        "cars",
        CAR_MAX_SIZE,
        CAR_WEBP_QUALITY,
    )


def prepare_slider_image(image: Image.Image) -> Image.Image:
    """Return a tightly cropped subject at the standard slider height."""
    rgba_image = image.convert("RGBA")
    alpha = rgba_image.getchannel("A")
    alpha_minimum, _ = alpha.getextrema()

    # Preserve a cutout supplied by the admin. Opaque images need segmentation.
    if alpha_minimum >= 16:
        rgba_image = _remove_background(rgba_image)

    subject_bounds = _visible_bounds(rgba_image)
    if subject_bounds is None:
        raise SubjectNotFoundError

    subject = rgba_image.crop(subject_bounds)
    scale = min(
        SLIDER_SUBJECT_TARGET_HEIGHT / subject.height,
        SLIDER_SUBJECT_MAX_WIDTH / subject.width,
    )
    subject_size = (
        max(1, round(subject.width * scale)),
        max(1, round(subject.height * scale)),
    )
    return subject.resize(subject_size, Image.Resampling.LANCZOS)


def _remove_background(image: Image.Image) -> Image.Image:
    # Import lazily so the inference stack is initialized only for slider uploads.
    from rembg import new_session, remove

    session = getattr(_remove_background, "session", None)
    if session is None:
        with _BACKGROUND_SESSION_LOCK:
            session = getattr(_remove_background, "session", None)
            if session is None:
                session = new_session("u2net")
                _remove_background.session = session

    result = remove(
        image,
        session=session,
        post_process_mask=True,
    )
    return result.convert("RGBA")


_BACKGROUND_SESSION_LOCK = Lock()


def _visible_bounds(image: Image.Image) -> tuple[int, int, int, int] | None:
    # Ignore faint segmentation noise so isolated pixels do not shrink the subject.
    visible_mask = image.getchannel("A").point(
        lambda alpha: 255 if alpha >= 16 else 0,
    )
    return visible_mask.getbbox()


def optimize_image_file(
    source: Path,
    destination: Path,
    max_size: tuple[int, int],
    quality: int,
) -> None:
    """Optimize an existing image using the same atomic path as uploads."""
    destination.parent.mkdir(parents=True, exist_ok=True)
    try:
        with source.open("rb") as source_file:
            _write_optimized_webp(source_file, destination, max_size, quality)
    except (
        UnidentifiedImageError,
        OSError,
        ValueError,
        Image.DecompressionBombError,
        Image.DecompressionBombWarning,
    ) as exc:
        raise ValueError(f"Invalid or corrupted image: {source}") from exc


def delete_uploaded_image(value: str | None, subdirectory: str) -> None:
    path = resolve_uploaded_image(value, subdirectory)
    if path and path.is_file():
        try:
            path.unlink()
        except OSError:
            logger.warning("Could not delete replaced image %s", path, exc_info=True)


def resolve_uploaded_image(value: str | None, subdirectory: str) -> Path | None:
    if not value or "://" in value:
        return None

    normalized = value.replace("\\", "/").lstrip("/")
    if normalized.startswith("uploads/"):
        normalized = normalized[len("uploads/") :]
    if "/" not in normalized:
        normalized = f"{subdirectory}/{normalized}"

    root = (UPLOAD_ROOT / subdirectory).resolve()
    candidate = (UPLOAD_ROOT / normalized).resolve()
    if not candidate.is_relative_to(root):
        return None
    return candidate


def upload_url(path: Path) -> str:
    relative = path.resolve().relative_to(UPLOAD_ROOT.resolve())
    return f"/uploads/{relative.as_posix()}"


def _write_optimized_webp(
    source,
    destination: Path,
    max_size,
    quality: int,
    processor: ImageProcessor | None = None,
) -> None:
    temporary_path: Path | None = None
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(source) as opened:
                opened.seek(0)
                image = ImageOps.exif_transpose(opened)
                has_alpha = image.mode in {"RGBA", "LA"} or (
                    image.mode == "P" and "transparency" in image.info
                )
                image = image.convert("RGBA" if has_alpha else "RGB")
                image.thumbnail(max_size, Image.Resampling.LANCZOS)
                if processor:
                    image = processor(image)
                    has_alpha = image.mode in {"RGBA", "LA"}

                with NamedTemporaryFile(
                    mode="wb",
                    suffix=".webp.tmp",
                    prefix=f".{destination.stem}-",
                    dir=destination.parent,
                    delete=False,
                ) as temporary:
                    temporary_path = Path(temporary.name)

                image.save(
                    temporary_path,
                    format="WEBP",
                    quality=quality,
                    method=6,
                    exact=has_alpha,
                )
                os.replace(temporary_path, destination)
                temporary_path = None
    finally:
        if temporary_path and temporary_path.exists():
            temporary_path.unlink()
