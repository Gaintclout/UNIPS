from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class GisZoneCreate(BaseModel):
    name: str
    zone_type: str = "monitoring"
    risk_level: str = "low"
    geojson: dict[str, Any]
    notes: str | None = None


class GisZoneUpdate(BaseModel):
    name: str | None = None
    zone_type: str | None = None
    risk_level: str | None = None
    geojson: dict[str, Any] | None = None
    notes: str | None = None


class GisZoneRead(GisZoneCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GeoJsonFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: list[dict[str, Any]]
