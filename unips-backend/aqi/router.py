from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from alerts.service import evaluate_reading_for_alerts
from aqi.schemas import DashboardSummary, NoiseReadingCreate, NoiseReadingRead
from auth.deps import get_current_user
from database import get_db
from models import NoiseReading, Station
from websocket_manager import station_ws_manager

router = APIRouter(prefix="/aqi", tags=["aqi"])


@router.get("/dashboard", response_model=DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db)) -> DashboardSummary:
    latest_noise = db.query(func.avg(NoiseReading.noise_db)).scalar()
    station_count = db.query(func.count(Station.id)).scalar() or 0
    hotspot_count = db.query(func.count(NoiseReading.id)).filter(NoiseReading.noise_db >= 75).scalar() or 0
    average = round(float(latest_noise or 0), 1)
    risk = "High" if average >= 75 else "Medium" if average >= 60 else "Low"
    return DashboardSummary(
        noise=f"{average} dB",
        hotspots=int(hotspot_count),
        stations=int(station_count),
        risk=risk,
    )


@router.get("/readings", response_model=list[NoiseReadingRead])
def list_readings(db: Session = Depends(get_db), limit: int = 100) -> list[NoiseReading]:
    return db.query(NoiseReading).order_by(NoiseReading.recorded_at.desc()).limit(limit).all()


@router.post(
    "/readings",
    response_model=NoiseReadingRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_user)],
)
async def create_reading(payload: NoiseReadingCreate, db: Session = Depends(get_db)) -> NoiseReading:
    if not db.get(Station, payload.station_id):
        raise HTTPException(status_code=404, detail="Station not found")
    reading = NoiseReading(**payload.model_dump())
    db.add(reading)
    db.commit()
    db.refresh(reading)
    await station_ws_manager.broadcast(
        {
            "event": "reading.created",
            "data": NoiseReadingRead.model_validate(reading).model_dump(mode="json"),
        }
    )
    await evaluate_reading_for_alerts(db, reading)
    return reading


@router.get("/stations/{station_id}/readings", response_model=list[NoiseReadingRead])
def station_readings(station_id: int, db: Session = Depends(get_db), limit: int = 50) -> list[NoiseReading]:
    if not db.get(Station, station_id):
        raise HTTPException(status_code=404, detail="Station not found")
    return (
        db.query(NoiseReading)
        .filter(NoiseReading.station_id == station_id)
        .order_by(NoiseReading.recorded_at.desc())
        .limit(limit)
        .all()
    )
