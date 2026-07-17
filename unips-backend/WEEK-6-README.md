# UNIPS Backend - Week 6 Documentation

## Student

Ramcharan - Backend Development

## Week 6 Focus

Alerts APIs, report generation APIs, notification services, and email alert preparation.

## Tasks Completed

### 1. Alert Rules

Added `AlertRule` model and APIs:

- `GET /api/alerts/rules`
- `POST /api/alerts/rules`
- `PATCH /api/alerts/rules/{rule_id}`
- `DELETE /api/alerts/rules/{rule_id}`

Rules can define:

- Station-specific or global threshold
- Noise threshold in dB
- Severity
- Message template
- Notification channels
- Active/inactive status

### 2. Alert Events

Added `AlertEvent` model and APIs:

- `GET /api/alerts/events`
- `PATCH /api/alerts/events/{event_id}/resolve`
- `POST /api/alerts/evaluate/{reading_id}`

### 3. Automatic Alert Evaluation

When a new reading is created through:

- `POST /api/aqi/readings`

The backend now automatically checks active alert rules. If the reading crosses a threshold, it creates:

- Alert event
- Notification
- WebSocket alert broadcast

### 4. Report Generation Records

Added `ReportJob` model and APIs:

- `POST /api/reports/generate`
- `GET /api/reports`
- `GET /api/reports/{job_id}`

Generated report payloads include:

- Station count
- Reading count
- Average noise
- Peak noise
- Open alerts
- Prediction count

### 5. Email Alert Logs

Added `EmailLog` model and APIs:

- `POST /api/alerts/email`
- `GET /api/alerts/email`

This queues email alert records in the database. It does not send real email yet.

### 6. Notification Service Support

Existing notification APIs are connected with alert creation and WebSocket broadcasting.

## Important Files

- `alerts/router.py`
- `alerts/schemas.py`
- `alerts/service.py`
- `reports/router.py`
- `reports/schemas.py`
- `reports/service.py`
- `notifications/router.py`
- `websocket_manager.py`
- `models.py`

## Integration-Dependent Items Not Done In Week 6

- Real SMTP provider integration.
- Actual email sending.
- PDF/CSV file export endpoint.
- Scheduled daily/weekly reports.
- Firebase push notification integration.

## Status

Week 6 backend is complete for local API testing. External notification and export services can be connected later.
