import { useEffect, useState } from "react";
import ExportButtons from "../components/ExportButtons";
import KPIcard from "../components/KPIcard";
import Loading from "../components/Loading";
import PageHeader from "../components/PageHeader";
import { getReportData } from "../services/reportService";

const statusStyles = {
  Ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "In Review": "border-amber-200 bg-amber-50 text-amber-700",
  Draft: "border-slate-300 bg-slate-50 text-slate-600",
};

function Reports() {
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    getReportData().then((data) => {
      setReportData(data);
    });
  }, []);

  if (!reportData) {
    return <Loading title="Reports" message="Loading reports..." />;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-6 sm:px-8 lg:px-12">
      <div className="w-full space-y-10 animate-fade-in-up">
        <PageHeader
          title="Reports"
          description="Review generated summaries, report ownership, status, and export data for sharing."
          actions={<ExportButtons filename="unips-reports" data={reportData.reports} />}
        />
        <br/>

        <section>
          <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <KPIcard title="Total Reports" value={reportData.summary.totalReports} accent="teal" />
            <KPIcard title="Exports Ready" value={reportData.summary.exportsReady} accent="sky" />
            <KPIcard title="Pending Reviews" value={reportData.summary.pendingReviews} accent="amber" />
            <KPIcard title="Last Generated" value={reportData.summary.lastGenerated} accent="teal" />
          </div>
        </section>
        <br/>

        <section>
          <h2 className="mb-5 text-lg font-semibold text-slate-800">Report Library</h2>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[760px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50 text-sm text-slate-600">
                <tr>
                  <th className="px-5 py-4 font-semibold">Report</th>
                  <th className="px-5 py-4 font-semibold">Type</th>
                  <th className="px-5 py-4 font-semibold">Owner</th>
                  <th className="px-5 py-4 font-semibold">Updated</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reportData.reports.map((report) => (
                  <tr key={report.id} className="text-sm text-slate-700 transition-colors hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {report.name}
                    </td>
                    <td className="px-5 py-4">{report.type}</td>
                    <td className="px-5 py-4">{report.owner}</td>
                    <td className="px-5 py-4">{report.updatedAt}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                          statusStyles[report.status]
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Reports;
