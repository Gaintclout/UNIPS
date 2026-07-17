from datetime import datetime, timedelta, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from forecast.schemas import ForecastAnalytics, ForecastPoint, ForecastSummary
from models import ForecastPrediction, NoiseReading


SAFE_THRESHOLD_DB = 75


def risk_level(noise_db: float) -> str:
    if noise_db >= 75:
        return "high"
    if noise_db >= 60:
        return "medium"
    return "low"


def build_baseline_forecast(db: Session, station_id: int | None = None) -> ForecastSummary:
    query = db.query(NoiseReading)
    if station_id:
        query = query.filter(NoiseReading.station_id == station_id)
    readings = query.order_by(NoiseReading.recorded_at.desc()).limit(24).all()

    if readings:
        average_noise = sum(reading.noise_db for reading in readings) / len(readings)
        peak_noise = max(reading.noise_db for reading in readings)
    else:
        average_noise = 68.0
        peak_noise = 84.0

    now = datetime.now(timezone.utc)
    trend: list[ForecastPoint] = []
    for index in range(6):
        predicted = round(average_noise + ((index % 3) - 1) * 4 + index * 1.5, 1)
        trend.append(
            ForecastPoint(
                time=(now + timedelta(hours=index * 3)).strftime("%I %p"),
                noise=predicted,
                risk_level=risk_level(predicted),
            )
        )

    risk_window = "6 PM - 9 PM" if peak_noise >= SAFE_THRESHOLD_DB else "No critical window"
    return ForecastSummary(
        station_id=station_id,
        averageNoise=f"{round(average_noise, 1)} dB",
        peakNoise=f"{round(peak_noise, 1)} dB",
        riskWindow=risk_window,
        confidence="Baseline",
        safeThreshold=SAFE_THRESHOLD_DB,
        trend=trend,
    )


def build_prediction_analytics(
    db: Session, horizon_days: int, station_id: int | None = None
) -> ForecastAnalytics:
    query = db.query(ForecastPrediction).filter(ForecastPrediction.horizon_days == horizon_days)
    if station_id:
        query = query.filter(ForecastPrediction.station_id == station_id)

    total = query.count()
    average = query.with_entities(func.avg(ForecastPrediction.predicted_noise_db)).scalar() or 0
    high_risk_count = query.filter(ForecastPrediction.risk_level == "high").count()
    latest = query.order_by(ForecastPrediction.created_at.desc()).first()

    return ForecastAnalytics(
        station_id=station_id,
        horizon_days=horizon_days,
        total_predictions=total,
        average_prediction_db=round(float(average), 2),
        high_risk_count=high_risk_count,
        latest_model=latest.model_name if latest else None,
    )
