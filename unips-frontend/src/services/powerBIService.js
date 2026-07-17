import api from "./api";

const fallbackAnalyticsReports = [
  {
    id: "executive-overview",
    title: "Executive Overview",
    description: "Combined operational health, noise risk, and station coverage.",
    updatedAt: "Today, 9:30 AM",
    status: "Awaiting embed token",
    metrics: [
      { label: "Average Noise", value: "68 dB", width: 68 },
      { label: "Active Stations", value: "45", width: 82 },
      { label: "High Risk Zones", value: "2", width: 38 },
    ],
  },
  {
    id: "noise-analytics",
    title: "Noise Analytics",
    description: "Long-term noise patterns and zone-level comparisons.",
    updatedAt: "Today, 9:15 AM",
    status: "Awaiting embed token",
    metrics: [
      { label: "Peak Noise", value: "84 dB", width: 84 },
      { label: "Weekly Average", value: "66 dB", width: 66 },
      { label: "Safe Periods", value: "71%", width: 71 },
    ],
  },
  {
    id: "forecast-performance",
    title: "Forecast Performance",
    description: "Prediction accuracy, confidence, and model performance.",
    updatedAt: "Yesterday, 6:00 PM",
    status: "Awaiting embed token",
    metrics: [
      { label: "Confidence", value: "91%", width: 91 },
      { label: "Accuracy", value: "88%", width: 88 },
      { label: "Prediction Window", value: "24 hrs", width: 58 },
    ],
  },
  {
    id: "alert-analysis",
    title: "Alert Analysis",
    description: "Alert frequency, severity distribution, and response status.",
    updatedAt: "Today, 9:40 AM",
    status: "Awaiting embed token",
    metrics: [
      { label: "Active Alerts", value: "4", width: 45 },
      { label: "Resolved Today", value: "12", width: 76 },
      { label: "High Severity", value: "2", width: 35 },
    ],
  },
];

function pickValue(source, keys, fallback) {
  const value = keys.map((key) => source?.[key]).find((item) => item !== undefined && item !== null);
  return value ?? fallback;
}

function getList(payload, keys) {
  if (Array.isArray(payload)) return payload;
  return keys.map((key) => payload?.[key]).find(Array.isArray) ?? [];
}

function normalizeMetrics(metrics, index) {
  if (Array.isArray(metrics) && metrics.length > 0) {
    return metrics.map((metric) => ({
      label: pickValue(metric, ["label", "name", "metric"], "Metric"),
      value: String(pickValue(metric, ["value", "display_value", "displayValue"], "-")),
      width: Number(pickValue(metric, ["width", "progress", "percentage"], 60)),
    }));
  }

  return fallbackAnalyticsReports[index % fallbackAnalyticsReports.length].metrics;
}

export const getAnalyticsReports = async () => {
  try {
    const response = await api.get("/powerbi/reports");
    const reports = getList(response.data, ["reports", "items", "results", "data"]);

    if (reports.length === 0) return fallbackAnalyticsReports;

    return reports.map((report, index) => ({
      id: String(pickValue(report, ["id", "report_id", "slug"], `report-${index + 1}`)),
      title: pickValue(report, ["title", "name", "report_name"], `Analytics Report ${index + 1}`),
      description: pickValue(
        report,
        ["description", "summary"],
        "Power BI report is registered. Embed rendering is pending token integration.",
      ),
      updatedAt: pickValue(report, ["updatedAt", "updated_at", "created_at"], "Recently"),
      status: pickValue(report, ["status", "state"], "Awaiting embed token"),
      metrics: normalizeMetrics(report.metrics, index),
    }));
  } catch {
    return fallbackAnalyticsReports;
  }
};

// Replace the mock service above with:
// api.get("/powerbi/reports") and api.get(`/powerbi/embed-config/${reportId}`)
// when the backend embed-token endpoint is available.
