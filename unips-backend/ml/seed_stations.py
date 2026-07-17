from __future__ import annotations

import argparse
import csv
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


def read_station_rows(path: Path) -> list[dict]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    return [
        {
            "code": row["code"].strip(),
            "name": row["name"].strip(),
            "location_name": row["location_name"].strip(),
            "latitude": float(row["latitude"]),
            "longitude": float(row["longitude"]),
            "status": row.get("status", "active").strip() or "active",
            "zone": row.get("zone", "").strip() or None,
        }
        for row in rows
        if row.get("code")
    ]


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed backend stations from ML artifacts")
    parser.add_argument("--file", type=Path, default=Path("ml/artifacts/stations.csv"))
    parser.add_argument("--base-url", default="http://localhost:8000/api")
    parser.add_argument("--token", required=True, help="JWT access token")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    station_rows = read_station_rows(args.file)
    try:
        existing = request_json(f"{args.base_url}/stations", args.token)
        existing_codes = {station["code"] for station in existing}
        created = []
        skipped = []
        for row in station_rows:
            if row["code"] in existing_codes:
                skipped.append(row["code"])
                continue
            if not args.dry_run:
                request_json(f"{args.base_url}/stations", args.token, method="POST", payload=row)
            created.append(row["code"])
        print(
            json.dumps(
                {
                    "created_station_codes": created,
                    "skipped_existing_station_codes": skipped,
                    "dry_run": args.dry_run,
                },
                indent=2,
            )
        )
    except (HTTPError, URLError) as exc:
        raise SystemExit(f"Station seed failed: {exc}") from exc


if __name__ == "__main__":
    main()
