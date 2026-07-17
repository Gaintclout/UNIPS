from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.deps import get_current_user
from common import Message
from database import get_db
from models import Station
from stations.schemas import StationCreate, StationRead, StationUpdate

router = APIRouter(prefix="/stations", tags=["stations"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=list[StationRead])
def list_stations(db: Session = Depends(get_db)) -> list[Station]:
    return db.query(Station).order_by(Station.name).all()


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
def get_station(station_id: int, db: Session = Depends(get_db)) -> Station:
    station = db.get(Station, station_id)
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    return station


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
