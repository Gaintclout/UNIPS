from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ForecastPredictionCreate(BaseModel):
    station_id: int
    horizon_days: int = Field(ge=1, le=180)
    prediction_date: datetime
    predicted_noise_db: float
    confidence: float = Field(default=0.0, ge=0, le=100)
    risk_level: str = "low"
    model_name: str = "baseline"
    model_version: str | None = None
    source: str = "manual"
    input_window_start: datetime | None = None
    input_window_end: datetime | None = None
    extra_data: dict[str, Any] | None = None


class ForecastPredictionRead(ForecastPredictionCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ForecastPoint(BaseModel):
    time: str
    noise: float
    risk_level: str


class ForecastSummary(BaseModel):
    station_id: int | None = None
    averageNoise: str
    peakNoise: str
    riskWindow: str
    confidence: str
    safeThreshold: int
    trend: list[ForecastPoint]


class ForecastAnalytics(BaseModel):
    station_id: int | None = None
    horizon_days: int
    total_predictions: int
    average_prediction_db: float
    high_risk_count: int
    latest_model: str | None = None
