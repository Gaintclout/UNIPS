from __future__ import annotations

import argparse
import csv
import json
from datetime import date
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


def latest_station_rows(path: Path) -> dict[str, dict]:
    latest: dict[str, dict] = {}
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            station = (row.get("station") or "").strip()
            if not station:
                continue
            observed_on = date(int(row["year"]), int(row["month"]), 1)
            current = latest.get(station)
            if current is None or observed_on > current["observed_on"]:
                latest[station] = {
                    "observed_on": observed_on,
                    "noise_db": float(row["noise_db"]),
                }
    return latest


def ensure_default_alert_rule(base_url: str, token: str, dry_run: bool) -> str:
    rules = request_json(f"{base_url}/alerts/rules", token)
    for rule in rules:
        if rule.get("name") == "Demo high noise threshold":
            return "skipped_existing"

    if not dry_run:
        request_json(
            f"{base_url}/alerts/rules",
            token,
            method="POST",
            payload={
                "name": "Demo high noise threshold",
                "threshold_db": 75,
                "severity": "high",
                "channels": ["dashboard", "notification"],
                "message_template": "{station} recorded {noise_db} dB, above the {threshold_db} dB threshold.",
                "is_active": True,
            },
        )
    return "created"


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed demo noise readings for dashboard and alerts")
    parser.add_argument("--data", required=True, type=Path, help="Historical HYD noise CSV")
    parser.add_argument("--base-url", default="http://localhost:8000/api")
    parser.add_argument("--token", required=True, help="JWT access token")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    latest_rows = latest_station_rows(args.data)
    try:
        stations = request_json(f"{args.base_url}/stations", args.token)
        station_ids = {station["code"]: station["id"] for station in stations}
        alert_rule_status = ensure_default_alert_rule(args.base_url, args.token, args.dry_run)

        created = []
        skipped = []
        for station_code, row in sorted(latest_rows.items()):
            station_id = station_ids.get(station_code)
            if station_id is None:
                skipped.append(station_code)
                continue
            payload = {
                "station_id": station_id,
                "noise_db": row["noise_db"],
                "source": "demo_seed",
            }
            if not args.dry_run:
                request_json(f"{args.base_url}/aqi/readings", args.token, method="POST", payload=payload)
            created.append(
                {
                    "station_code": station_code,
                    "station_id": station_id,
                    "noise_db": row["noise_db"],
                    "observed_month": row["observed_on"].isoformat(),
                }
            )

        print(
            json.dumps(
                {
                    "alert_rule": alert_rule_status,
                    "created_readings": created,
                    "skipped_station_codes": skipped,
                    "dry_run": args.dry_run,
                },
                indent=2,
            )
        )
    except (HTTPError, URLError) as exc:
        raise SystemExit(f"Demo reading seed failed: {exc}") from exc


if __name__ == "__main__":
    main()
