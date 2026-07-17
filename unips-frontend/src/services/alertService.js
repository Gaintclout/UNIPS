import api from "./api";

const fallbackAlertData = {
  activeAlerts: 4,
  highRiskZones: 2,
  latestSpike: "82 dB",
  responseStatus: "Monitoring",
  alerts: [
    {
      id: 1,
      title: "High risk zone detected",
      location: "Station A - Main Gate",
      severity: "High",
      noise: "82 dB",
      time: "10 min ago",
      message: "Noise level is above the safe threshold.",
    },
    {
      id: 2,
      title: "Sudden spike recorded",
      location: "Station C - Academic Block",
      severity: "High",
      noise: "79 dB",
      time: "18 min ago",
      message: "Sharp increase detected compared with the last reading.",
    },
    {
      id: 3,
      title: "Moderate noise warning",
      location: "Station B - Library Road",
      severity: "Medium",
      noise: "68 dB",
      time: "35 min ago",
      message: "Noise is elevated but still below the critical range.",
    },
    {
      id: 4,
      title: "Area back to normal",
      location: "Station D - Parking",
      severity: "Low",
      noise: "54 dB",
      time: "1 hr ago",
      message: "Noise levels have returned to the normal range.",
    },
  ],
};

function pickValue(source, keys, fallback) {
  const value = keys.map((key) => source?.[key]).find((item) => item !== undefined && item !== null);
  return value ?? fallback;
}

function getList(payload, keys) {
  if (Array.isArray(payload)) return payload;
  return keys.map((key) => payload?.[key]).find(Array.isArray) ?? [];
}

function normalizeSeverity(value) {
  const severity = String(value ?? "Low").toLowerCase();
  if (severity.includes("high") || severity.includes("critical")) return "High";
  if (severity.includes("medium") || severity.includes("moderate")) return "Medium";
  return "Low";
}

function formatDecibels(value) {
  if (value === undefined || value === null || value === "") return "- dB";
  return typeof value === "number" ? `${Math.round(value)} dB` : String(value);
}

function normalizeAlerts(eventsPayload, notificationsPayload) {
  const events = getList(eventsPayload, ["events", "items", "results", "data"]);
  const notifications = getList(notificationsPayload, ["notifications", "items", "results", "data"]);
  const items = events.length > 0 ? events : notifications;

  return items.map((item, index) => {
    const stationName = pickValue(item, ["station_name", "stationName", "station"], "Station");
    const locationName = pickValue(item, ["location_name", "locationName", "location", "zone"], "");
    const noise = pickValue(item, ["noise", "noise_db", "reading", "value"], undefined);

    return {
      id: pickValue(item, ["id", "event_id", "notification_id"], index + 1),
      title: pickValue(item, ["title", "event", "type"], "Noise alert generated"),
      location: locationName ? `${stationName} - ${locationName}` : String(stationName),
      severity: normalizeSeverity(pickValue(item, ["severity", "risk", "risk_level", "level"], "Low")),
      noise: formatDecibels(noise),
      time: pickValue(item, ["time", "created_at", "timestamp", "updated_at"], "Recently"),
      message: pickValue(
        item,
        ["message", "description", "details"],
        noise ? `Noise reading reached ${formatDecibels(noise)}.` : "New alert event received.",
      ),
    };
  });
}

export const getAlertData = async () => {
  try {
    const [eventsResponse, notificationsResponse] = await Promise.allSettled([
      api.get("/alerts/events"),
      api.get("/notifications"),
    ]);
    const events = eventsResponse.status === "fulfilled" ? eventsResponse.value.data : {};
    const notifications =
      notificationsResponse.status === "fulfilled" ? notificationsResponse.value.data : {};
    const alerts = normalizeAlerts(events, notifications);

    if (alerts.length === 0) return fallbackAlertData;

    const highRiskZones = alerts.filter((alert) => alert.severity === "High").length;
    const latestSpike =
      alerts.find((alert) => alert.noise !== "- dB")?.noise ?? fallbackAlertData.latestSpike;

    return {
      activeAlerts: alerts.length,
      highRiskZones,
      latestSpike,
      responseStatus: highRiskZones > 0 ? "Monitoring" : "Stable",
      alerts,
    };
  } catch {
    return fallbackAlertData;
  }
};
