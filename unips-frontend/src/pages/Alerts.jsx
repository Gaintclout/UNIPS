import { useEffect, useState } from "react";
import ExportButtons from "../components/ExportButtons";
import KPIcard from "../components/KPIcard";
import Loading from "../components/Loading";
import PageHeader from "../components/PageHeader";
import { getAlertData } from "../services/alertService";

const severityStyles = {
  High: "border-red-200 bg-red-50 text-red-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  Low: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const severityDots = {
  High: "bg-red-500",
  Medium: "bg-amber-500",
  Low: "bg-emerald-500",
};

function Alerts() {
  const [alertData, setAlertData] = useState(null);

  useEffect(() => {
    getAlertData().then((data) => {
      setAlertData(data);
    });
  }, []);

  if (!alertData) {
    return <Loading title="Alerts" message="Loading alerts..." />;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-6 sm:px-8 lg:px-12">
      <div className="w-full space-y-10 animate-fade-in-up">
        <PageHeader
          title="Alerts"
          description="Monitor recent alerts, severity levels, and export alert history for reporting."
          actions={<ExportButtons filename="unips-alerts" data={alertData.alerts} />}
        />
        <br/>
        <section>
          <h2 className="mb-5 text-lg font-semibold text-slate-800">
            Alert Summary
          </h2>

          <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <KPIcard title="Active Alerts" value={alertData.activeAlerts} accent="red" />
            <KPIcard title="High Risk Zones" value={alertData.highRiskZones} accent="amber" />
            <KPIcard title="Latest Spike" value={alertData.latestSpike} accent="sky" />
            <KPIcard title="Status" value={alertData.responseStatus} accent="teal" />
          </div>
        </section>
        <br/>
        <section>
          <h2 className="mb-5 text-lg font-semibold text-slate-800">
            Recent Alerts
          </h2>

          <div className="grid gap-4">
            {alertData.alerts.map((alert) => (
              <article
                key={alert.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {alert.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {alert.location}
                    </p>
                    <p className="mt-3 text-slate-600">{alert.message}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${
                        severityStyles[alert.severity]
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${severityDots[alert.severity]}`} />
                      {alert.severity}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">
                      {alert.noise}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-500">
                      {alert.time}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Alerts;
