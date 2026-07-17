import { FaChartBar, FaLock } from "react-icons/fa";

function PowerBIContainer({ report }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{report.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{report.description}</p>
        </div>

        <div className="text-sm text-slate-500">
          Last refreshed: <span className="font-medium text-slate-700">{report.updatedAt}</span>
        </div>
      </div>

      <div className="grid min-h-[520px] lg:grid-cols-[1fr_300px]">
        <div className="flex min-h-[420px] flex-col items-center justify-center bg-slate-50 p-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-50 text-2xl text-teal-700 shadow-sm">
            <FaChartBar />
          </span>
          <h3 className="mt-5 text-lg font-semibold text-slate-900">
            Power BI report container ready
          </h3>
          <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
            This area will render the embedded report when the backend provides its
            report ID, embed URL, and secure embed token.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800">
            <FaLock />
            {report.status}
          </span>
        </div>

        <aside className="border-t border-slate-200 bg-white p-5 lg:border-l lg:border-t-0">
          <h3 className="font-semibold text-slate-900">Mock Report Summary</h3>
          <p className="mt-1 text-sm text-slate-500">
            Temporary preview while Power BI credentials are pending.
          </p>

          <div className="mt-6 space-y-6">
            {report.metrics.map((metric) => (
              <div key={metric.label}>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-slate-600">{metric.label}</span>
                  <span className="font-semibold text-slate-900">{metric.value}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-600"
                    style={{ width: `${metric.width}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

export default PowerBIContainer;
