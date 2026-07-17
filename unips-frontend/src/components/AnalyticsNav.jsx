function AnalyticsNav({ reports, activeReportId, onSelect }) {
  return (
    <div className="overflow-x-auto border-b border-slate-200">
      <div className="flex min-w-max gap-1" role="tablist" aria-label="Analytics reports">
        {reports.map((report) => {
          const isActive = report.id === activeReportId;

          return (
            <button
              key={report.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(report.id)}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
              }`}
            >
              {report.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default AnalyticsNav;
