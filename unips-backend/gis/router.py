from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.deps import get_current_user
from common import Message
from database import get_db
from gis.schemas import GeoJsonFeatureCollection, GisZoneCreate, GisZoneRead, GisZoneUpdate
from gis.service import station_feature
from models import GisZone, Station

router = APIRouter(prefix="/gis", tags=["gis"])


@router.get("/stations.geojson", response_model=GeoJsonFeatureCollection)
def stations_geojson(db: Session = Depends(get_db)) -> GeoJsonFeatureCollection:
    stations = db.query(Station).all()
    return GeoJsonFeatureCollection(features=[station_feature(station) for station in stations])


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
    return [
        {
            "station_id": station.id,
            "lat": station.latitude,
            "lng": station.longitude,
            "weight": 0.7 if station.status == "active" else 0.25,
        }
        for station in stations
    ]
