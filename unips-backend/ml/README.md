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



//*Gaint*//

Here’s the complete process for your Linux Bash terminal. Run commands from the backend directory:
cd "/home/frontend/Gaint Projects/UNIPS/unips-backend"
source .venv/bin/activate

1. Train the model
Use the path to your original historical CSV—not predictions.csv:
python -m ml.train \
  --data "/path/to/HYD_with_noise_db_filled.csv" \
  --output ml/artifacts \
  --months 6

  This generates forecasts and reports under ml/artifacts/, including predictions.json and stations.csv.

2. Start the backend
In another terminal, start FastAPI and make sure it is connected to the database your app uses:

cd "/home/frontend/Gaint Projects/UNIPS/unips-backend"
source .venv/bin/activate
uvicorn main:app --reload

3. Get a fresh UNIPS access token
Open http://localhost:8000/docs, use POST /api/auth/login, and copy access_token from the response. Use the UNIPS access token—not an admin refresh token. Since you’ve shared tokens in chat, get a new one and keep it private.

Back in the terminal where you’ll run the seed/upload commands, enter it without displaying it:

read -rsp "UNIPS access token: " TOKEN; echo

4. Seed stations
Preview first:

python -m ml.seed_stations --token "$TOKEN" --dry-run

If the expected station codes appear, create them:

python -m ml.seed_stations --token "$TOKEN"

You only need to seed stations that don’t already exist.

5. Preview and upload forecasts
Preview the upload:

python -m ml.upload_predictions \
  --file ml/artifacts/predictions.json \
  --token "$TOKEN" \
  --dry-run

  Confirm it processes forecasts and has no skipped station codes, then upload:
  python -m ml.upload_predictions \
  --file ml/artifacts/predictions.json \
  --token "$TOKEN"

  Then check GET /api/forecast/predictions in Swagger or refresh the frontend.

Optional—dashboard current-noise readings: Forecast uploads are predictions; they do not populate the current average-noise KPI. To seed demo readings, run ml.seed_demo_readings with the original historical CSV and the same token, previewing with --dry-run first.