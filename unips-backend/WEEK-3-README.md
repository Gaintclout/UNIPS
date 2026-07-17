# UNIPS Backend - Week 3 Documentation

## Student

Ramcharan - Backend Development

## Week 3 Focus

GIS APIs, station APIs, WebSocket support, and notification APIs.

## Tasks Completed

### 1. Station APIs

Implemented station management endpoints:

- `GET /api/stations`
- `POST /api/stations`
- `GET /api/stations/{station_id}`
- `PATCH /api/stations/{station_id}`
- `DELETE /api/stations/{station_id}`

Stations include:

- Station code
- Name
- Location name
- Latitude
- Longitude
- Status
- Zone

### 2. GIS APIs

The backend includes GIS-compatible endpoints:

- `GET /api/gis/stations.geojson`
- `GET /api/gis/zones`
- `POST /api/gis/zones`
- `PATCH /api/gis/zones/{zone_id}`
- `DELETE /api/gis/zones/{zone_id}`
- `GET /api/gis/heatmap`

`stations.geojson` returns stations in GeoJSON format for Leaflet, QGIS exports, or other map tools.

### 3. GIS Integration Support

The backend GIS endpoints support the frontend map flow and can serve station points, GIS zones, and heatmap-ready station data.

### 4. WebSocket Support

Implemented real-time WebSocket endpoints:

- `ws://localhost:8000/ws/stations`
- `ws://localhost:8000/ws/alerts`

When a new noise reading is created, `/ws/stations` broadcasts:

- Event name
- Station ID
- Noise value
- AQI value
- Reading timestamp

When alerts or notifications are created, `/ws/alerts` can broadcast updates.

### 5. Notification APIs

Implemented notification endpoints:

- `GET /api/notifications`
- `POST /api/notifications`
- `PATCH /api/notifications/{notification_id}/read`
- `DELETE /api/notifications/{notification_id}`

## Important Files

- `stations/router.py`
- `stations/schemas.py`
- `gis/router.py`
- `gis/schemas.py`
- `gis/service.py`
- `notifications/router.py`
- `notifications/schemas.py`
- `realtime/router.py`
- `websocket_manager.py`

## Integration-Dependent Items Not Done In Week 3

- QGIS-generated production layer upload workflow.
- PostGIS spatial queries.
- Real sensor WebSocket streaming from hardware or external services.

## Status

Week 3 backend support is complete for stations, GIS endpoints, WebSockets, and notifications.
