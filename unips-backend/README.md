# UNIPS Backend

FastAPI + SQLAlchemy + PostgreSQL backend for the Urban Noise Intelligence & Prediction System.

## Completed Scope

- Week 1: FastAPI project setup, PostgreSQL connection, SQLAlchemy models, JWT authentication, API structure.
- Week 2: Auth APIs, user CRUD APIs, JWT login system, AQI/noise APIs, Swagger docs.
- Week 3: GIS APIs, station APIs, WebSocket support, notification APIs.
- Week 4: Forecast APIs, prediction result storage, baseline forecast responses, forecast analytics.
- Week 5: Power BI report access records, secured dashboard summary, placeholder embed-token API.
- Week 6: Alert rules/events, automatic threshold alerts, report generation records, queued email alert logs.
- ML: monthly noise preprocessing, model validation, station forecasts, anomaly detection, station seeding, and forecast API upload utility.

## Weekly Documentation

- [Week 1](WEEK-1-README.md)
- [Week 2](WEEK-2-README.md)
- [Week 3](WEEK-3-README.md)
- [Week 4](WEEK-4-README.md)
- [Week 5](WEEK-5-README.md)
- [Week 6](WEEK-6-README.md)
- [ML forecasting](ml/README.md)

## Run Locally

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload
```

Swagger docs: `http://localhost:8000/docs`

API prefix: `http://localhost:8000/api`

Demo-friendly public reads:

- `GET /api/gis/stations.geojson`
- `GET /api/aqi/dashboard`
- `GET /api/forecast/summary`
- `GET /api/alerts/events`
- `GET /api/notifications`
- `GET /api/reports`
- `GET /api/powerbi/reports`

Create/update/delete routes are still JWT protected.

WebSockets:

- `ws://localhost:8000/ws/stations`
- `ws://localhost:8000/ws/alerts`

APP_NAME=UNIPS Backend
ENVIRONMENT=development
DATABASE_URL=postgresql+psycopg2://postgres:new_strong_password@localhost:5432/unips
SECRET_KEY=change-this-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173