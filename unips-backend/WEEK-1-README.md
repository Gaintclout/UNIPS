# UNIPS Backend - Week 1 Documentation

## Student

Ramcharan - Backend Development

## Week 1 Focus

Project setup, database configuration, API structure, initial models, and authentication foundation.

## Tasks Completed

### 1. FastAPI Project Setup

- Created a FastAPI backend project.
- Added a flat project structure matching the team's preferred style.
- Added `main.py` as the application entry point.
- Added health check endpoint:
  - `GET /api/health`

### 2. PostgreSQL Configuration

- Added database configuration in `database.py`.
- Configured SQLAlchemy engine and session handling.
- Added `.env.example` for local database settings.

### 3. SQLAlchemy Setup

- Added SQLAlchemy declarative base.
- Added reusable `get_db` dependency.
- Configured automatic table creation on startup for development.

### 4. Initial Database Models

Created initial models in `models.py` for:

- Users
- Stations
- Noise readings
- GIS zones
- Notifications
- Forecast predictions
- Power BI reports
- Alert rules
- Alert events
- Email logs
- Report jobs

### 5. JWT Authentication Foundation

- Added password hashing.
- Added JWT access token creation.
- Added JWT decoding.
- Added current-user dependency for protected routes.

### 6. API Structure

Created feature-based folders:

- `auth/`
- `users/`
- `stations/`
- `aqi/`
- `gis/`
- `notifications/`
- `forecast/`
- `alerts/`
- `powerbi/`
- `reports/`
- `realtime/`

## Important Files

- `main.py`
- `database.py`
- `models.py`
- `config.py`
- `auth/utils.py`
- `auth/deps.py`
- `requirements.txt`

## Integration-Dependent Items Not Done In Week 1

- Production database migration tool such as Alembic.
- Production secret management.
- Deployment environment setup.
- Real user-role permission matrix beyond basic role storage.

## Status

Week 1 backend setup is complete for local development.

