# UNIPS Backend - Week 5 Documentation

## Student

Ramcharan - Backend Development

## Week 5 Focus

Power BI backend support, secure dashboard APIs, report access records, and embed-token placeholders.

## Tasks Completed

### 1. Power BI Report Records

Added `PowerBIReport` model to store:

- Report key
- Report name
- Workspace ID
- Report ID
- Dataset ID
- Embed URL
- Allowed roles
- Active status

### 2. Power BI Report APIs

Implemented endpoints:

- `GET /api/powerbi/reports`
- `POST /api/powerbi/reports`
- `PATCH /api/powerbi/reports/{report_id}`
- `DELETE /api/powerbi/reports/{report_id}`

### 3. Placeholder Embed Token API

Implemented:

- `POST /api/powerbi/reports/{report_id}/embed-token`

This returns a development placeholder token so the frontend can build the Power BI container flow before real Azure credentials are configured.

### 4. Secured Dashboard API

Implemented:

- `GET /api/powerbi/dashboard`

This returns backend summary counts for:

- Active Power BI reports
- Open alerts
- Stations
- Forecast predictions

### 5. Basic Report Access Security

- Power BI APIs are JWT protected.
- Embed-token endpoint checks the current user's role against the report's `allowed_roles`.

## Important Files

- `powerbi/router.py`
- `powerbi/schemas.py`
- `powerbi/service.py`
- `models.py`

## Integration-Dependent Items Not Done In Week 5

- Real Power BI Embedded Azure integration.
- Real Azure AD service principal authentication.
- Real Microsoft Power BI embed token generation.
- Dataset refresh API integration.
- Power BI workspace/report provisioning.

## Status

Week 5 backend is complete for local development and frontend integration. Real Power BI credentials are still required for production embedding.
