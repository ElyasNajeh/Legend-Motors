from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.init_db import init_db

from app.features.admins.router import router as admins_router
from app.features.auth.router import router as auth_router
from app.features.brands.router import router as brands_router
from app.features.cars.router import router as cars_router
from app.features.dashboard.router import router as dashboard_router
from app.features.sliders.router import router as sliders_router

app = FastAPI(title=settings.APP_NAME)


@app.middleware("http")
async def disable_caching(request: Request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store, no-cache, max-age=0, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


# Uploads
UPLOAD_DIR = Path("/app/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_DIR),
    name="uploads",
)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=0,
)


# Database
@app.on_event("startup")
def start_up():
    init_db()


# Routers
app.include_router(auth_router)
app.include_router(admins_router)
app.include_router(brands_router)
app.include_router(cars_router)
app.include_router(sliders_router)
app.include_router(dashboard_router)
