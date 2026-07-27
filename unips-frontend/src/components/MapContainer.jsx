import { useEffect, useMemo, useState } from "react";
import {
  CircleMarker,
  MapContainer as LeafletMapContainer,
  Popup,
  TileLayer,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import api from "../services/api";

const hyderabadCenter = [17.385, 78.4867];

function getStationId(feature) {
  const properties = feature.properties ?? {};

  return (
    properties.station_id ??
    properties.stationId ??
    properties.id ??
    properties.station_code ??
    feature.id
  );
}

function getMessageStationId(message) {
  const payload = message.data ?? message.reading ?? message;

  return (
    payload.station_id ??
    payload.stationId ??
    payload.station?.id ??
    message.station_id ??
    message.stationId
  );
}

function getNoiseLevel(source) {
  const payload = source.data ?? source.reading ?? source;

  return (
    payload.noise_db ??
    payload.noiseDb ??
    payload.noise_level ??
    payload.noiseLevel ??
    payload.noise ??
    payload.db ??
    null
  );
}

function getNoiseColor(noiseLevel) {
  if (noiseLevel === null || noiseLevel === undefined) return "#64748b";
  if (Number(noiseLevel) >= 75) return "#dc2626";
  if (Number(noiseLevel) >= 60) return "#d97706";
  return "#059669";
}

function formatTimestamp(value) {
  if (!value) return "Not available";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString();
}

function getMarkerPosition(feature) {
  const coordinates = feature.geometry?.coordinates;

  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;

  const [longitude, latitude] = coordinates;

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return [latitude, longitude];
}

function MapContainer() {
  const [stations, setStations] = useState([]);
  const [status, setStatus] = useState("Loading stations...");
  const [socketStatus, setSocketStatus] = useState("Connecting live updates...");

  useEffect(() => {
    let isMounted = true;

    api
      .get("/gis/stations.geojson")
      .then((response) => {
        if (!isMounted) return;

        setStations(response.data?.features ?? []);
        setStatus("Station layer loaded");
      })
      .catch(() => {
        if (!isMounted) return;

        setStatus("Could not load stations from backend");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/ws/stations");

    socket.addEventListener("open", () => {
      setSocketStatus("Live station updates connected");
    });

    socket.addEventListener("message", (event) => {
      let message;

      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }

      if (message.event !== "reading.created") return;

      const updatedStationId = getMessageStationId(message);
      const noiseLevel = getNoiseLevel(message);
      const payload = message.data ?? message.reading ?? message;

      setStations((currentStations) =>
        currentStations.map((feature) => {
          if (String(getStationId(feature)) !== String(updatedStationId)) {
            return feature;
          }

          return {
            ...feature,
            properties: {
              ...feature.properties,
              ...payload,
              latest_noise_db: noiseLevel,
            },
          };
        }),
      );
    });

    socket.addEventListener("close", () => {
      setSocketStatus("Live station updates disconnected");
    });

    socket.addEventListener("error", () => {
      setSocketStatus("Live station updates unavailable");
    });

    return () => {
      socket.close();
    };
  }, []);

  const stationMarkers = useMemo(
    () =>
      stations
        .map((feature) => ({
          feature,
          position: getMarkerPosition(feature),
        }))
        .filter((station) => station.position),
    [stations],
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">Hyderabad Station Map</h3>
          <p className="mt-1 text-sm text-slate-500">
            Station locations loaded from backend GeoJSON with live noise updates.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-medium">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            {status}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            {socketStatus}
          </span>
        </div>
      </div>

      <div className="h-[55vh] min-h-[380px]">
        <LeafletMapContainer
          center={hyderabadCenter}
          zoom={12}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {stationMarkers.map(({ feature, position }) => {
            const properties = feature.properties ?? {};
            const noiseLevel =
              properties.latest_noise_db ?? properties.noise_db ?? getNoiseLevel(properties);
            const markerColor = getNoiseColor(noiseLevel);

            return (
              <CircleMarker
                key={getStationId(feature)}
                center={position}
                radius={9}
                pathOptions={{
                  color: markerColor,
                  fillColor: markerColor,
                  fillOpacity: 0.85,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-slate-900">
                      {properties.name ?? properties.station_name ?? "Station"}
                    </p>
                    <p>
                      <span className="font-medium">Location:</span>{" "}
                      {properties.location_name ?? "Not available"}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      {properties.status ?? "Unknown"}
                    </p>
                    <p>
                      <span className="font-medium">Zone:</span>{" "}
                      {properties.zone ?? "Unassigned"}
                    </p>
                    <p>
                      <span className="font-medium">Noise:</span>{" "}
                      {noiseLevel !== null && noiseLevel !== undefined
                        ? `${noiseLevel} dB`
                        : "No reading yet"}
                    </p>
                    {(properties.latest_aqi !== null && properties.latest_aqi !== undefined) ||
                    (properties.aqi !== null && properties.aqi !== undefined) ? (
                      <p>
                        <span className="font-medium">AQI:</span>{" "}
                        {properties.latest_aqi ?? properties.aqi}
                      </p>
                    ) : null}
                    {(properties.latest_recorded_at || properties.recorded_at) && (
                      <p>
                        <span className="font-medium">Updated:</span>{" "}
                        {formatTimestamp(properties.latest_recorded_at ?? properties.recorded_at)}
                      </p>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </LeafletMapContainer>
      </div>

      <div className="flex flex-wrap gap-4 border-t border-slate-200 px-5 py-3 text-xs text-slate-600">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-emerald-600" />
          Below 60 dB
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-amber-600" />
          60-74 dB
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-600" />
          75+ dB
        </span>
      </div>
    </div>
  );
}

export default MapContainer;
