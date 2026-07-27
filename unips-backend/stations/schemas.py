from datetime import datetime

from pydantic import BaseModel, ConfigDict


class StationCreate(BaseModel):
    code: str
    name: str
    location_name: str
    latitude: float
    longitude: float
    status: str = "active"
    zone: str | None = None


class StationUpdate(BaseModel):
    name: str | None = None
    location_name: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    status: str | None = None
    zone: str | None = None


class StationRead(StationCreate):
    id: int
    created_at: datetime
    latest_noise_db: float | None = None
    latest_aqi: int | None = None
    latest_recorded_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
