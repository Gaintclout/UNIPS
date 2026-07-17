from __future__ import annotations

import csv
import json
import math
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Any

import numpy as np


FEATURE_NAMES = [
    "trend",
    "month_sin",
    "month_cos",
    "lag_1",
    "lag_2",
    "lag_3",
    "lag_12",
    "rolling_3",
]


@dataclass
class Observation:
    station: str
    observed_on: date
    noise_db: float
    day_db: float
    night_db: float
    data_type: str
    latitude: float
    longitude: float


def add_months(value: date, months: int) -> date:
    index = value.year * 12 + value.month - 1 + months
    return date(index // 12, index % 12 + 1, 1)


def load_observations(path: Path) -> dict[str, list[Observation]]:
    stations: dict[str, list[Observation]] = {}
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        for row_number, row in enumerate(csv.DictReader(handle), start=2):
            if not (row.get("station") or "").strip():
                continue
            try:
                observation = Observation(
                    station=row["station"].strip(),
                    observed_on=date(int(row["year"]), int(row["month"]), 1),
                    noise_db=float(row["noise_db"]),
                    day_db=float(row["day"]),
                    night_db=float(row["night"]),
                    data_type=row["data_type"].strip().upper(),
                    latitude=float(row["lat"]),
                    longitude=float(row["lon"]),
                )
            except (KeyError, TypeError, ValueError) as exc:
                raise ValueError(f"Invalid dataset row {row_number}: {exc}") from exc
            stations.setdefault(observation.station, []).append(observation)

    if not stations:
        raise ValueError("Dataset contains no usable station rows")

    for station, observations in stations.items():
        observations.sort(key=lambda item: item.observed_on)
        dates = [item.observed_on for item in observations]
        if len(dates) != len(set(dates)):
            raise ValueError(f"Station {station} contains duplicate station-month rows")
        if len(observations) < 24:
            raise ValueError(f"Station {station} needs at least 24 monthly observations")
    return stations


def _feature(history: list[float], month: int, trend: int) -> list[float]:
    angle = 2 * math.pi * month / 12
    return [
        float(trend),
        math.sin(angle),
        math.cos(angle),
        history[-1],
        history[-2],
        history[-3],
        history[-12],
        float(np.mean(history[-3:])),
    ]


def build_supervised(observations: list[Observation]) -> tuple[np.ndarray, np.ndarray]:
    values = [item.noise_db for item in observations]
    rows: list[list[float]] = []
    targets: list[float] = []
    for index in range(12, len(observations)):
        rows.append(_feature(values[:index], observations[index].observed_on.month, index))
        targets.append(values[index])
    return np.asarray(rows, dtype=float), np.asarray(targets, dtype=float)


def fit_ridge(features: np.ndarray, targets: np.ndarray, alpha: float = 1.0) -> dict[str, Any]:
    means = features.mean(axis=0)
    scales = features.std(axis=0)
    scales[scales == 0] = 1.0
    normalized = (features - means) / scales
    design = np.column_stack([np.ones(len(normalized)), normalized])
    penalty = np.eye(design.shape[1]) * alpha
    penalty[0, 0] = 0
    coefficients = np.linalg.solve(design.T @ design + penalty, design.T @ targets)
    return {
        "intercept": float(coefficients[0]),
        "coefficients": coefficients[1:].tolist(),
        "feature_means": means.tolist(),
        "feature_scales": scales.tolist(),
        "alpha": alpha,
    }


def predict(model: dict[str, Any], features: np.ndarray) -> np.ndarray:
    normalized = (
        features - np.asarray(model["feature_means"])
    ) / np.asarray(model["feature_scales"])
    return model["intercept"] + normalized @ np.asarray(model["coefficients"])


def metrics(actual: np.ndarray, predicted: np.ndarray) -> dict[str, float]:
    errors = actual - predicted
    mae = float(np.mean(np.abs(errors)))
    rmse = float(np.sqrt(np.mean(errors**2)))
    denominator = float(np.sum((actual - actual.mean()) ** 2))
    r2 = 1 - float(np.sum(errors**2)) / denominator if denominator else 0.0
    return {"mae": round(mae, 3), "rmse": round(rmse, 3), "r2": round(r2, 3)}


def risk_level(noise_db: float) -> str:
    if noise_db >= 75:
        return "high"
    if noise_db >= 60:
        return "medium"
    return "low"


def train_station(
    observations: list[Observation], forecast_months: int
) -> tuple[dict[str, Any], list[dict[str, Any]], list[dict[str, Any]]]:
    features, targets = build_supervised(observations)
    validation_size = min(12, max(3, len(targets) // 5))
    split = len(targets) - validation_size
    validation_model = fit_ridge(features[:split], targets[:split])
    regression_predictions = predict(validation_model, features[split:])
    seasonal_predictions = np.asarray(
        [observations[index].noise_db for index in range(split, split + validation_size)]
    )
    regression_metrics = metrics(targets[split:], regression_predictions)
    baseline_metrics = metrics(targets[split:], seasonal_predictions)
    selected_model = (
        "ridge_autoregression"
        if regression_metrics["mae"] <= baseline_metrics["mae"]
        else "seasonal_naive"
    )

    final_model = fit_ridge(features, targets)
    fitted = predict(final_model, features)
    residuals = targets - fitted
    residual_std = float(residuals.std()) or 1.0
    anomalies: list[dict[str, Any]] = []
    for index, residual in enumerate(residuals, start=12):
        score = abs(float(residual)) / residual_std
        if score >= 2.5:
            item = observations[index]
            anomalies.append(
                {
                    "station_code": item.station,
                    "date": item.observed_on.isoformat(),
                    "actual_noise_db": round(item.noise_db, 2),
                    "expected_noise_db": round(float(fitted[index - 12]), 2),
                    "residual_db": round(float(residual), 2),
                    "anomaly_score": round(score, 2),
                }
            )

    history = [item.noise_db for item in observations]
    latest_date = observations[-1].observed_on
    selected_metrics = regression_metrics if selected_model == "ridge_autoregression" else baseline_metrics
    confidence = max(0.0, min(95.0, 100 - selected_metrics["rmse"] / np.mean(targets) * 100))
    forecasts: list[dict[str, Any]] = []
    for horizon in range(1, forecast_months + 1):
        forecast_date = add_months(latest_date, horizon)
        if selected_model == "ridge_autoregression":
            row = np.asarray([_feature(history, forecast_date.month, len(history))])
            value = max(0.0, float(predict(final_model, row)[0]))
        else:
            value = history[-12]
        history.append(value)
        forecasts.append(
            {
                "station_code": observations[0].station,
                "horizon_months": horizon,
                "horizon_days": min(180, horizon * 30),
                "prediction_date": forecast_date.isoformat(),
                "predicted_noise_db": round(value, 2),
                "confidence": round(float(confidence), 2),
                "risk_level": risk_level(value),
                "model_name": selected_model,
                "model_version": "1.0",
                "source": "ml_pipeline",
            }
        )

    model_report = {
        "station_code": observations[0].station,
        "training_rows": len(features),
        "training_start": observations[0].observed_on.isoformat(),
        "training_end": observations[-1].observed_on.isoformat(),
        "validation_rows": validation_size,
        "ridge_metrics": regression_metrics,
        "seasonal_naive_metrics": baseline_metrics,
        "selected_model": selected_model,
        "feature_names": FEATURE_NAMES,
        "model": final_model,
        "anomaly_count": len(anomalies),
    }
    return model_report, forecasts, anomalies


def run_pipeline(data_path: Path, output_dir: Path, forecast_months: int = 6) -> dict[str, Any]:
    if not 1 <= forecast_months <= 6:
        raise ValueError("forecast_months must be between 1 and 6")
    stations = load_observations(data_path)
    output_dir.mkdir(parents=True, exist_ok=True)

    model_reports: list[dict[str, Any]] = []
    forecasts: list[dict[str, Any]] = []
    anomalies: list[dict[str, Any]] = []
    for observations in stations.values():
        report, station_forecasts, station_anomalies = train_station(
            observations, forecast_months
        )
        model_reports.append(report)
        forecasts.extend(station_forecasts)
        anomalies.extend(station_anomalies)

    all_observations = [item for rows in stations.values() for item in rows]
    data_type_counts: dict[str, int] = {}
    for item in all_observations:
        data_type_counts[item.data_type] = data_type_counts.get(item.data_type, 0) + 1
    summary = {
        "dataset": str(data_path),
        "station_count": len(stations),
        "observation_count": len(all_observations),
        "date_start": min(item.observed_on for item in all_observations).isoformat(),
        "date_end": max(item.observed_on for item in all_observations).isoformat(),
        "data_type_counts": data_type_counts,
        "noise_db_min": round(min(item.noise_db for item in all_observations), 2),
        "noise_db_max": round(max(item.noise_db for item in all_observations), 2),
        "noise_db_average": round(
            float(np.mean([item.noise_db for item in all_observations])), 2
        ),
        "forecast_count": len(forecasts),
        "anomaly_count": len(anomalies),
        "average_ridge_mae": round(
            float(np.mean([item["ridge_metrics"]["mae"] for item in model_reports])), 3
        ),
        "average_baseline_mae": round(
            float(np.mean([item["seasonal_naive_metrics"]["mae"] for item in model_reports])), 3
        ),
        "selected_models": {
            name: sum(item["selected_model"] == name for item in model_reports)
            for name in ("ridge_autoregression", "seasonal_naive")
        },
    }

    (output_dir / "training_report.json").write_text(
        json.dumps({"summary": summary, "stations": model_reports}, indent=2),
        encoding="utf-8",
    )
    (output_dir / "predictions.json").write_text(
        json.dumps(forecasts, indent=2), encoding="utf-8"
    )
    _write_csv(output_dir / "predictions.csv", forecasts)
    _write_csv(output_dir / "anomalies.csv", anomalies)
    _write_csv(output_dir / "stations.csv", station_metadata(stations))
    return summary


def station_metadata(stations: dict[str, list[Observation]]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for station_code, observations in sorted(stations.items()):
        latest = observations[-1]
        rows.append(
            {
                "code": station_code,
                "name": f"{station_code} Monitoring Station",
                "location_name": f"Hyderabad {station_code}",
                "latitude": latest.latitude,
                "longitude": latest.longitude,
                "status": "active",
                "zone": "Hyderabad",
            }
        )
    return rows


def _write_csv(path: Path, rows: list[dict[str, Any]]) -> None:
    if not rows:
        path.write_text("", encoding="utf-8")
        return
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
