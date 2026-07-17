from datetime import datetime, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from models import AlertEvent, ForecastPrediction, NoiseReading, Station


def build_report_payload(db: Session, report_type: str, parameters: dict | None = None) -> dict:
    average_noise = db.query(func.avg(NoiseReading.noise_db)).scalar() or 0
    peak_noise = db.query(func.max(NoiseReading.noise_db)).scalar() or 0
    return {
        "report_type": report_type,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "parameters": parameters or {},
        "summary": {
            "stations": db.query(func.count(Station.id)).scalar() or 0,
            "readings": db.query(func.count(NoiseReading.id)).scalar() or 0,
            "average_noise_db": round(float(average_noise), 2),
            "peak_noise_db": round(float(peak_noise), 2),
            "open_alerts": db.query(func.count(AlertEvent.id)).filter(AlertEvent.status == "open").scalar() or 0,
            "predictions": db.query(func.count(ForecastPrediction.id)).scalar() or 0,
        },
    }
