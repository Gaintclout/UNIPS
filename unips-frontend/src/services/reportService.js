import api from "./api";

const fallbackReportData = {
  summary: {
    totalReports: 6,
    exportsReady: 4,
    pendingReviews: 2,
    lastGenerated: "Today, 10:30 AM",
  },
  reports: [
    {
      id: 1,
      name: "Daily Noise Summary",
      type: "Operational",
      owner: "Environment Team",
      status: "Ready",
      updatedAt: "Today, 10:30 AM",
    },
    {
      id: 2,
      name: "High Risk Zone Report",
      type: "Risk",
      owner: "Monitoring Team",
      status: "Ready",
      updatedAt: "Today, 9:45 AM",
    },
    {
      id: 3,
      name: "Forecast Accuracy Review",
      type: "Forecast",
      owner: "Analytics Team",
      status: "In Review",
      updatedAt: "Yesterday, 6:20 PM",
    },
    {
      id: 4,
      name: "Alert Response Timeline",
      type: "Alerts",
      owner: "Operations Team",
      status: "Ready",
      updatedAt: "Yesterday, 4:15 PM",
    },
    {
      id: 5,
      name: "Station Coverage Report",
      type: "Infrastructure",
      owner: "Admin Team",
      status: "Draft",
      updatedAt: "Jun 24, 2026",
    },
    {
      id: 6,
      name: "Weekly Executive Brief",
      type: "Executive",
      owner: "UNIPS Admin",
      status: "In Review",
      updatedAt: "Jun 23, 2026",
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

function normalizeStatus(value) {
  const status = String(value ?? "Draft").toLowerCase();
  if (status.includes("ready") || status.includes("complete") || status.includes("generated")) return "Ready";
  if (status.includes("review") || status.includes("pending")) return "In Review";
  return "Draft";
}

function normalizeReports(payload) {
  const reports = getList(payload, ["reports", "items", "results", "data"]);

  return reports.map((report, index) => ({
    id: pickValue(report, ["id", "report_id"], index + 1),
    name: pickValue(report, ["name", "title", "report_name"], `Report ${index + 1}`),
    type: pickValue(report, ["type", "category", "report_type"], "Operational"),
    owner: pickValue(report, ["owner", "created_by", "team"], "UNIPS Team"),
    status: normalizeStatus(pickValue(report, ["status", "state"], "Draft")),
    updatedAt: pickValue(report, ["updatedAt", "updated_at", "created_at", "generated_at"], "Recently"),
  }));
}

export const getReportData = async () => {
  try {
    const response = await api.get("/reports");
    const reports = normalizeReports(response.data);

    if (reports.length === 0) return fallbackReportData;

    return {
      summary: {
        totalReports: reports.length,
        exportsReady: reports.filter((report) => report.status === "Ready").length,
        pendingReviews: reports.filter((report) => report.status === "In Review").length,
        lastGenerated: reports[0]?.updatedAt ?? "Recently",
      },
      reports,
    };
  } catch {
    return fallbackReportData;
  }
};
