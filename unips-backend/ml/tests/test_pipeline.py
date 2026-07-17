import unittest
import csv
from datetime import date
from pathlib import Path
from tempfile import TemporaryDirectory

from ml.pipeline import Observation, add_months, station_metadata, train_station
from ml.seed_demo_readings import latest_station_rows


class PipelineTests(unittest.TestCase):
    def test_add_months_crosses_year(self):
        self.assertEqual(add_months(date(2025, 11, 1), 3), date(2026, 2, 1))

    def test_station_training_returns_requested_forecasts(self):
        observations = []
        for index in range(36):
            observed_on = add_months(date(2022, 1, 1), index)
            value = 65 + (index % 12) * 0.5
            observations.append(
                Observation("TEST", observed_on, value, value + 3, value - 3, "OBSERVED", 17.0, 78.0)
            )
        report, forecasts, _ = train_station(observations, 3)
        self.assertEqual(len(forecasts), 3)
        self.assertEqual(report["station_code"], "TEST")
        self.assertEqual(forecasts[-1]["horizon_days"], 90)

    def test_station_metadata_uses_latest_coordinates(self):
        rows = station_metadata(
            {
                "HYD01": [
                    Observation("HYD01", date(2024, 1, 1), 65, 67, 63, "OBSERVED", 17.1, 78.1),
                    Observation("HYD01", date(2024, 2, 1), 66, 68, 64, "OBSERVED", 17.2, 78.2),
                ]
            }
        )
        self.assertEqual(rows[0]["code"], "HYD01")
        self.assertEqual(rows[0]["latitude"], 17.2)
        self.assertEqual(rows[0]["zone"], "Hyderabad")

    def test_latest_station_rows_keeps_newest_month(self):
        with TemporaryDirectory() as directory:
            path = Path(directory) / "readings.csv"
            with path.open("w", encoding="utf-8", newline="") as handle:
                writer = csv.DictWriter(
                    handle,
                    fieldnames=["station", "year", "month", "noise_db"],
                )
                writer.writeheader()
                writer.writerow({"station": "HYD01", "year": 2025, "month": 1, "noise_db": 65})
                writer.writerow({"station": "HYD01", "year": 2025, "month": 3, "noise_db": 78})
                writer.writerow({"station": "HYD01", "year": 2025, "month": 2, "noise_db": 70})

            rows = latest_station_rows(path)
            self.assertEqual(rows["HYD01"]["observed_on"], date(2025, 3, 1))
            self.assertEqual(rows["HYD01"]["noise_db"], 78)


if __name__ == "__main__":
    unittest.main()
