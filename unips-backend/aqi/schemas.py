from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NoiseReadingCreate(BaseModel):
    station_id: int
    noise_db: float
    aqi: int | None = None
    source: str = "sensor"


class NoiseReadingRead(NoiseReadingCreate):
    id: int
    recorded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DashboardSummary(BaseModel):
    noise: str
    hotspots: int
    stations: int
    risk: str
