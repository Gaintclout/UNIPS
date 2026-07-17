from __future__ import annotations

import argparse
import json
from pathlib import Path

from ml.pipeline import run_pipeline


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train UNIPS monthly noise forecasts")
    parser.add_argument("--data", required=True, type=Path, help="Historical noise CSV")
    parser.add_argument(
        "--output", type=Path, default=Path("ml/artifacts"), help="Artifact directory"
    )
    parser.add_argument(
        "--months", type=int, default=6, choices=range(1, 7), help="Forecast horizon"
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    result = run_pipeline(args.data, args.output, args.months)
    print(json.dumps(result, indent=2))
