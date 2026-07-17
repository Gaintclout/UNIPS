import { useEffect, useState } from "react";
import AnalyticsNav from "../components/AnalyticsNav";
import Loading from "../components/Loading";
import PageHeader from "../components/PageHeader";
import PowerBIContainer from "../components/PowerBIContainer";
import { getAnalyticsReports } from "../services/powerBIService";

function Analytics() {
  const [reports, setReports] = useState(null);
  const [activeReportId, setActiveReportId] = useState("");

  useEffect(() => {
    getAnalyticsReports().then((data) => {
      setReports(data);
      setActiveReportId(data[0]?.id ?? "");
    });
  }, []);

  if (!reports) {
    return <Loading title="Analytics" message="Loading analytics workspace..." />;
  }

  const activeReport = reports.find((report) => report.id === activeReportId);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-6 sm:px-8 lg:px-12">
      <div className="w-full space-y-8 animate-fade-in-up">
        <PageHeader
          title="Analytics"
          description="Prepared workspace for executive, operational, forecast, and alert analysis reports."
        />
        <br/>
        <AnalyticsNav
          reports={reports}
          activeReportId={activeReportId}
          onSelect={setActiveReportId}
        />

        {activeReport ? (
          <PowerBIContainer report={activeReport} />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
            Select a report to view analytics.
          </div>
        )}
      </div>
    </div>
  );
}

export default Analytics;
