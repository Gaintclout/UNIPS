from __future__ import annotations

import argparse
import json
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def request_json(url: str, token: str, method: str = "GET", payload: dict | None = None):
    body = json.dumps(payload).encode() if payload is not None else None
    request = Request(
        url,
        data=body,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    with urlopen(request, timeout=15) as response:
        return json.loads(response.read().decode())


def main() -> None:
    parser = argparse.ArgumentParser(description="Upload ML forecasts to FastAPI")
    parser.add_argument("--file", type=Path, default=Path("ml/artifacts/predictions.json"))
    parser.add_argument("--base-url", default="http://localhost:8000/api")
    parser.add_argument("--token", required=True, help="JWT access token")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    predictions = json.loads(args.file.read_text(encoding="utf-8"))
    try:
        stations = request_json(f"{args.base_url}/stations", args.token)
        station_ids = {station["code"]: station["id"] for station in stations}
        uploaded = 0
        skipped: set[str] = set()
        for prediction in predictions:
            station_code = prediction["station_code"]
            station_id = station_ids.get(station_code)
            if station_id is None:
                skipped.add(station_code)
                continue
            payload = {key: value for key, value in prediction.items() if key not in {"station_code", "horizon_months"}}
            payload["station_id"] = station_id
            payload["prediction_date"] = f'{payload["prediction_date"]}T00:00:00Z'
            payload["input_window_end"] = None
            payload["extra_data"] = {"station_code": station_code}
            if not args.dry_run:
                request_json(
                    f"{args.base_url}/forecast/predictions",
                    args.token,
                    method="POST",
                    payload=payload,
                )
            uploaded += 1
        print(json.dumps({"processed": uploaded, "skipped_station_codes": sorted(skipped), "dry_run": args.dry_run}, indent=2))
    except (HTTPError, URLError) as exc:
        raise SystemExit(f"Backend upload failed: {exc}") from exc


if __name__ == "__main__":
    main()
