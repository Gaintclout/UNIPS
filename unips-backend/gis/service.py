from typing import Any

from models import NoiseReading, Station


def station_feature(station: Station, latest_reading: NoiseReading | None = None) -> dict[str, Any]:
    latest_noise_db = latest_reading.noise_db if latest_reading else None
    latest_aqi = latest_reading.aqi if latest_reading else None
    latest_recorded_at = latest_reading.recorded_at.isoformat() if latest_reading else None

    return {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [station.longitude, station.latitude]},
        "properties": {
            "id": station.id,
            "station_id": station.id,
            "code": station.code,
            "name": station.name,
            "location_name": station.location_name,
            "status": station.status,
            "zone": station.zone,
            "latest_noise_db": latest_noise_db,
            "latest_aqi": latest_aqi,
            "latest_recorded_at": latest_recorded_at,
        },
    }
