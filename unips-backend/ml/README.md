# UNIPS ML Forecasting

This folder contains a deliberately small noise-forecasting pipeline. It preprocesses the monthly station dataset, compares a seasonal
baseline with a ridge autoregression model, flags unusual historical readings, creates
six months of forecasts, and exports backend-ready files.

## Implemented

- CSV validation and chronological preprocessing
- Per-station monthly forecasting
- Seasonal-naive baseline for comparison
- Ridge autoregression using trend, seasonality, lag, and rolling features
- Time-ordered validation with MAE, RMSE, and R-squared
- Residual-based anomaly detection
- JSON and CSV prediction exports
- Station metadata export for backend seeding
- Station seeding helper for FastAPI
- Demo noise reading seeder for dashboard, live map values, and alert testing
- Optional upload to `POST /api/forecast/predictions`

Prophet and LSTM are listed as future extensions because they add larger dependencies
and are not required for the current baseline forecasting workflow.

## Setup

From the backend directory:

```powershell
.\.venv\Scripts\python.exe -m pip install -r ml\requirements.txt
```

## Train

```powershell
.\.venv\Scripts\python.exe -m ml.train `
  --data "C:\Users\Varun\Downloads\HYD_with_noise_db_filled.csv" `
  --output ml\artifacts `
  --months 6
```

Generated files:

- `training_report.json`: validation metrics and model coefficients
- `stations.csv`: station codes and coordinates for backend seeding
- `predictions.csv`: easy to inspect or import into Power BI
- `predictions.json`: input for the uploader
- `anomalies.csv`: unusual historical readings

## Seed Stations in FastAPI

Start FastAPI, log in, copy the JWT token, and run:

```powershell
.\.venv\Scripts\python.exe -m ml.seed_stations `
  --token "YOUR_JWT_TOKEN" `
  --dry-run
```

If the dry run looks right, run it again without `--dry-run`:

```powershell
.\.venv\Scripts\python.exe -m ml.seed_stations `
  --token "YOUR_JWT_TOKEN"
```

## Upload Forecasts to FastAPI

After stations exist in the database, run:

```powershell
.\.venv\Scripts\python.exe -m ml.upload_predictions `
  --token "YOUR_JWT_TOKEN" `
  --dry-run
```

If the dry run shows no skipped station codes, upload for real:

```powershell
.\.venv\Scripts\python.exe -m ml.upload_predictions `
  --token "YOUR_JWT_TOKEN"
```

Then check `GET /api/forecast/predictions` in Swagger or from the frontend service.

## Seed Dashboard and Alert Demo Data

Dashboard average noise and hotspots use `noise_readings`, not ML predictions.
After stations exist, seed one latest reading per HYD station and a default high-noise alert rule:

```powershell
.\.venv\Scripts\python.exe -m ml.seed_demo_readings `
  --data "C:\Users\Varun\Downloads\HYD_with_noise_db_filled.csv" `
  --token "YOUR_JWT_TOKEN" `
  --dry-run
```

If the dry run looks right, run it again without `--dry-run`:

```powershell
.\.venv\Scripts\python.exe -m ml.seed_demo_readings `
  --data "C:\Users\Varun\Downloads\HYD_with_noise_db_filled.csv" `
  --token "YOUR_JWT_TOKEN"
```

Then check:

- `GET /api/aqi/dashboard`
- `GET /api/aqi/readings`
- `GET /api/alerts/events`
- `GET /api/notifications`
