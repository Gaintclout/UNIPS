import api from "./api";

const fallbackDashboardData = {
  noise: "72 dB",
  hotspots: 12,
  stations: 45,
  risk: "High",
};

function pickValue(source, keys, fallback) {
  const value = keys.map((key) => source?.[key]).find((item) => item !== undefined && item !== null);
  return value ?? fallback;
}

function formatDecibels(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  return typeof value === "number" ? `${Math.round(value)} dB` : String(value);
}

export const getDashboardData = async () => {
  try {
    const response = await api.get("/aqi/dashboard");
    const data = response.data ?? {};

    return {
      noise: formatDecibels(
        pickValue(
          data,
          ["noise", "averageNoise", "average_noise", "avgNoise", "avg_noise", "average_noise_db", "avg_noise_db"],
          fallbackDashboardData.noise,
        ),
        fallbackDashboardData.noise,
      ),
      hotspots: pickValue(
        data,
        ["hotspots", "hotspotCount", "hotspot_count", "highRiskZones", "high_risk_zones"],
        fallbackDashboardData.hotspots,
      ),
      stations: pickValue(
        data,
        ["stations", "stationCount", "station_count", "activeStations", "active_stations"],
        fallbackDashboardData.stations,
      ),
      risk: pickValue(data, ["risk", "riskLevel", "risk_level", "status"], fallbackDashboardData.risk),
    };
  } catch {
    return fallbackDashboardData;
  }
};
