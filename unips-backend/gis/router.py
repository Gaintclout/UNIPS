from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.deps import get_current_user
from common import Message
from database import get_db
from gis.schemas import GeoJsonFeatureCollection, GisZoneCreate, GisZoneRead, GisZoneUpdate
from gis.service import station_feature
from models import GisZone, NoiseReading, Station

router = APIRouter(prefix="/gis", tags=["gis"])


@router.get("/stations.geojson", response_model=GeoJsonFeatureCollection)
def stations_geojson(db: Session = Depends(get_db)) -> GeoJsonFeatureCollection:
    stations = db.query(Station).all()
    features = []
    for station in stations:
        latest_reading = (
            db.query(NoiseReading)
            .filter(NoiseReading.station_id == station.id)
            .order_by(NoiseReading.recorded_at.desc())
            .first()
        )
        features.append(station_feature(station, latest_reading))
    return GeoJsonFeatureCollection(features=features)


@router.get("/zones", response_model=list[GisZoneRead])
def list_zones(db: Session = Depends(get_db)) -> list[GisZone]:
    return db.query(GisZone).order_by(GisZone.id).all()


@router.post(
    "/zones",
    response_model=GisZoneRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_user)],
)
def create_zone(payload: GisZoneCreate, db: Session = Depends(get_db)) -> GisZone:
    zone = GisZone(**payload.model_dump())
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone


@router.patch(
    "/zones/{zone_id}",
    response_model=GisZoneRead,
    dependencies=[Depends(get_current_user)],
)
def update_zone(zone_id: int, payload: GisZoneUpdate, db: Session = Depends(get_db)) -> GisZone:
    zone = db.get(GisZone, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="GIS zone not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(zone, field, value)
    db.commit()
    db.refresh(zone)
    return zone


@router.delete(
    "/zones/{zone_id}",
    response_model=Message,
    dependencies=[Depends(get_current_user)],
)
def delete_zone(zone_id: int, db: Session = Depends(get_db)) -> Message:
    zone = db.get(GisZone, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="GIS zone not found")
    db.delete(zone)
    db.commit()
    return Message(message="GIS zone deleted")


@router.get("/heatmap")
def heatmap_points(db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    stations = db.query(Station).all()
    points = []
    for station in stations:
        latest_reading = (
            db.query(NoiseReading)
            .filter(NoiseReading.station_id == station.id)
            .order_by(NoiseReading.recorded_at.desc())
            .first()
        )
        latest_noise = latest_reading.noise_db if latest_reading else None
        points.append(
            {
                "station_id": station.id,
                "lat": station.latitude,
                "lng": station.longitude,
                "latest_noise_db": latest_noise,
                "weight": min(1.0, max(0.1, (latest_noise or 45) / 100)),
            }
        )
    return points
