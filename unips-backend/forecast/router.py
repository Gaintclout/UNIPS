from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from auth.deps import get_current_user
from common import Message
from database import get_db
from forecast.schemas import (
    ForecastAnalytics,
    ForecastPredictionCreate,
    ForecastPredictionRead,
    ForecastSummary,
)
from forecast.service import build_baseline_forecast, build_prediction_analytics
from models import ForecastPrediction, Station

router = APIRouter(prefix="/forecast", tags=["forecast"])


@router.get("/summary", response_model=ForecastSummary)
def forecast_summary(
    station_id: int | None = None, db: Session = Depends(get_db)
) -> ForecastSummary:
    if station_id and not db.get(Station, station_id):
        raise HTTPException(status_code=404, detail="Station not found")
    return build_baseline_forecast(db, station_id)


@router.post(
    "/predictions",
    response_model=ForecastPredictionRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_user)],
)
def create_prediction(
    payload: ForecastPredictionCreate, db: Session = Depends(get_db)
) -> ForecastPrediction:
    if not db.get(Station, payload.station_id):
        raise HTTPException(status_code=404, detail="Station not found")
    prediction = ForecastPrediction(**payload.model_dump())
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    return prediction


@router.get("/predictions", response_model=list[ForecastPredictionRead])
def list_predictions(
    station_id: int | None = None,
    horizon_days: int | None = Query(default=None, ge=1, le=180),
    latest_only: bool = False,
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
) -> list[ForecastPrediction]:
    query = db.query(ForecastPrediction)
    if station_id:
        query = query.filter(ForecastPrediction.station_id == station_id)
    if horizon_days:
        query = query.filter(ForecastPrediction.horizon_days == horizon_days)
    query = query.order_by(ForecastPrediction.prediction_date.desc(), ForecastPrediction.created_at.desc())
    return query.limit(1 if latest_only else limit).all()


@router.get("/predictions/{prediction_id}", response_model=ForecastPredictionRead)
def get_prediction(prediction_id: int, db: Session = Depends(get_db)) -> ForecastPrediction:
    prediction = db.get(ForecastPrediction, prediction_id)
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return prediction


@router.get("/analytics", response_model=ForecastAnalytics)
def prediction_analytics(
    horizon_days: int = Query(default=30, ge=1, le=180),
    station_id: int | None = None,
    db: Session = Depends(get_db),
) -> ForecastAnalytics:
    if station_id and not db.get(Station, station_id):
        raise HTTPException(status_code=404, detail="Station not found")
    return build_prediction_analytics(db, horizon_days, station_id)


@router.delete(
    "/predictions/{prediction_id}",
    response_model=Message,
    dependencies=[Depends(get_current_user)],
)
def delete_prediction(prediction_id: int, db: Session = Depends(get_db)) -> Message:
    prediction = db.get(ForecastPrediction, prediction_id)
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    db.delete(prediction)
    db.commit()
    return Message(message="Prediction deleted")
