# UNIPS Backend - Week 2 Documentation

## Student

Ramcharan - Backend Development

## Week 2 Focus

Auth APIs, user CRUD APIs, JWT login, AQI/noise APIs, and Swagger documentation.

## Tasks Completed

### 1. Auth APIs

Implemented authentication endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/token`
- `GET /api/auth/me`

### 2. JWT Login System

- Login returns a bearer token.
- Protected APIs use the JWT token through FastAPI dependencies.
- Swagger authorization works through `/api/auth/token`.

### 3. User CRUD APIs

Implemented user management endpoints:

- `GET /api/users`
- `POST /api/users`
- `GET /api/users/{user_id}`
- `PATCH /api/users/{user_id}`
- `DELETE /api/users/{user_id}`

### 4. AQI / Noise APIs

Implemented AQI/noise reading endpoints:

- `GET /api/aqi/dashboard`
- `GET /api/aqi/readings`
- `POST /api/aqi/readings`
- `GET /api/aqi/stations/{station_id}/readings`

The dashboard endpoint returns:

- Average noise
- Hotspot count
- Station count
- Risk level

### 5. Swagger Documentation

FastAPI automatically generates Swagger docs:

- `http://localhost:8000/docs`

## Important Files

- `auth/router.py`
- `auth/schemas.py`
- `auth/utils.py`
- `auth/deps.py`
- `users/router.py`
- `users/schemas.py`
- `aqi/router.py`
- `aqi/schemas.py`

## Integration-Dependent Items Not Done In Week 2

- Real sensor ingestion pipeline.
- Live AQI provider integration.
- Production-grade role permissions for admin/operator/viewer.
- Production refresh-token flow.

## Status

Week 2 backend APIs are complete for local testing and frontend connection.
