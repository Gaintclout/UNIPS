import api from "./api";

const fallbackForecastData = {
  averageNoise: "68 dB",
  peakNoise: "84 dB",
  riskWindow: "6 PM - 9 PM",
  confidence: "91%",
  safeThreshold: 75,
  trend: [
    { time: "8 AM", noise: 54 },
    { time: "11 AM", noise: 61 },
    { time: "2 PM", noise: 66 },
    { time: "5 PM", noise: 78 },
    { time: "8 PM", noise: 84 },
    { time: "11 PM", noise: 63 },
  ],
};

function pickValue(source, keys, fallback) {
  const value = keys.map((key) => source?.[key]).find((item) => item !== undefined && item !== null);
  return value ?? fallback;
}

function formatDecibels(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  return typeof value === "number" ? `${Math.round(value)} dB` : String(value);
}

function formatPercent(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  return typeof value === "number" ? `${Math.round(value)}%` : String(value);
}

function getList(payload, keys) {
  if (Array.isArray(payload)) return payload;
  return keys.map((key) => payload?.[key]).find(Array.isArray) ?? [];
}

function formatDateLabel(value, fallback) {
  if (!value) return fallback;
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function normalizeTrend(predictions) {
  const items = getList(predictions, ["predictions", "items", "results", "data"]);
  const firstStationId = items[0]?.station_id;
  const stationItems = firstStationId
    ? items.filter((item) => item.station_id === firstStationId)
    : items;

  const trend = stationItems
    .slice()
    .sort((a, b) => new Date(a.prediction_date ?? 0) - new Date(b.prediction_date ?? 0))
    .map((item, index) => ({
      time: formatDateLabel(
        pickValue(item, ["prediction_date", "time", "label", "hour", "timestamp", "created_at"], null),
        `Month ${index + 1}`,
      ),
      noise: Number(
        pickValue(
          item,
          ["predicted_noise_db", "noise", "noise_db", "predictedNoise", "predicted_noise", "value"],
          0,
        ),
      ),
      confidence: Number(pickValue(item, ["confidence"], 0)),
      riskLevel: pickValue(item, ["risk_level", "riskLevel"], null),
      modelName: pickValue(item, ["model_name", "modelName"], null),
    }))
    .filter((item) => Number.isFinite(item.noise) && item.noise > 0);

  return trend.length > 0 ? trend : fallbackForecastData.trend;
}

export const getForecastData = async () => {
  try {
    const [summaryResponse, predictionsResponse, analyticsResponse] = await Promise.all([
      api.get("/forecast/summary"),
      api.get("/forecast/predictions"),
      api.get("/forecast/analytics"),
    ]);

    const summary = summaryResponse.data ?? {};
    const analytics = analyticsResponse.data ?? {};
    const trend = normalizeTrend(predictionsResponse.data);
    const calculatedAverage = Math.round(
      trend.reduce((total, item) => total + item.noise, 0) / trend.length,
    );
    const calculatedPeak = Math.max(...trend.map((item) => item.noise));
    const peakPoint = trend.find((item) => item.noise === calculatedPeak);
    const averageConfidence = Math.round(
      trend.reduce((total, item) => total + (Number.isFinite(item.confidence) ? item.confidence : 0), 0) /
        trend.length,
    );

    return {
      averageNoise: formatDecibels(
        calculatedAverage,
        fallbackForecastData.averageNoise,
      ),
      peakNoise: formatDecibels(
        calculatedPeak,
        fallbackForecastData.peakNoise,
      ),
      riskWindow: pickValue(
        peakPoint,
        ["time"],
        pickValue(summary, ["riskWindow", "risk_window", "peakWindow", "peak_window"], fallbackForecastData.riskWindow),
      ),
      confidence: formatPercent(
        averageConfidence || pickValue(summary, ["confidence", "modelConfidence", "model_confidence"], fallbackForecastData.confidence),
        fallbackForecastData.confidence,
      ),
      safeThreshold: Number(
        pickValue(summary, ["safeThreshold", "safe_threshold", "threshold", "safe_threshold_db"], fallbackForecastData.safeThreshold),
      ),
      trend,
    };
  } catch {
    return fallbackForecastData;
  }
};
