from typing import Any

from models import Station


def station_feature(station: Station) -> dict[str, Any]:
    return {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [station.longitude, station.latitude]},
        "properties": {
            "id": station.id,
            "code": station.code,
            "name": station.name,
            "location_name": station.location_name,
            "status": station.status,
            "zone": station.zone,
        },
    }
