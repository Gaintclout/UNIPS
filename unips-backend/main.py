from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from alerts.router import router as alerts_router
from aqi.router import router as aqi_router
from auth.router import router as auth_router
from config import get_settings
from database import Base, engine
from forecast.router import router as forecast_router
from gis.router import router as gis_router
from notifications.router import router as notifications_router
from powerbi.router import router as powerbi_router
from realtime.router import router as websocket_router
from reports.router import router as reports_router
from stations.router import router as stations_router
from users.router import router as users_router

settings = get_settings()

app = FastAPI(title=settings.app_name, version="0.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def create_database_tables() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/api/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}


app.include_router(auth_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(stations_router, prefix="/api")
app.include_router(aqi_router, prefix="/api")
app.include_router(forecast_router, prefix="/api")
app.include_router(gis_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")
app.include_router(alerts_router, prefix="/api")
app.include_router(powerbi_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(websocket_router)
