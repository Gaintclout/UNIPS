from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.deps import get_current_user
from common import Message
from database import get_db
from models import NoiseReading, Station
from stations.schemas import StationCreate, StationRead, StationUpdate

router = APIRouter(prefix="/stations", tags=["stations"], dependencies=[Depends(get_current_user)])


def station_with_latest_reading(db: Session, station: Station) -> dict:
    latest_reading = (
        db.query(NoiseReading)
        .filter(NoiseReading.station_id == station.id)
        .order_by(NoiseReading.recorded_at.desc())
        .first()
    )
    return {
        "id": station.id,
        "code": station.code,
        "name": station.name,
        "location_name": station.location_name,
        "latitude": station.latitude,
        "longitude": station.longitude,
        "status": station.status,
        "zone": station.zone,
        "created_at": station.created_at,
        "latest_noise_db": latest_reading.noise_db if latest_reading else None,
        "latest_aqi": latest_reading.aqi if latest_reading else None,
        "latest_recorded_at": latest_reading.recorded_at if latest_reading else None,
    }


@router.get("", response_model=list[StationRead])
def list_stations(db: Session = Depends(get_db)) -> list[dict]:
    stations = db.query(Station).order_by(Station.name).all()
    return [station_with_latest_reading(db, station) for station in stations]


@router.post("", response_model=StationRead, status_code=status.HTTP_201_CREATED)
def create_station(payload: StationCreate, db: Session = Depends(get_db)) -> Station:
    if db.query(Station).filter(Station.code == payload.code).first():
        raise HTTPException(status_code=409, detail="Station code already exists")
    station = Station(**payload.model_dump())
    db.add(station)
    db.commit()
    db.refresh(station)
    return station


@router.get("/{station_id}", response_model=StationRead)
def get_station(station_id: int, db: Session = Depends(get_db)) -> dict:
    station = db.get(Station, station_id)
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    return station_with_latest_reading(db, station)


@router.patch("/{station_id}", response_model=StationRead)
def update_station(station_id: int, payload: StationUpdate, db: Session = Depends(get_db)) -> Station:
    station = db.get(Station, station_id)
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(station, field, value)
    db.commit()
    db.refresh(station)
    return station


@router.delete("/{station_id}", response_model=Message)
def delete_station(station_id: int, db: Session = Depends(get_db)) -> Message:
    station = db.get(Station, station_id)
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    db.delete(station)
    db.commit()
    return Message(message="Station deleted")
