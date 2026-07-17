import { FaDownload, FaFileCsv, FaFileCode } from "react-icons/fa";

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function convertToCsv(data) {
  if (!data.length) return "";

  const headers = Object.keys(data[0]);
  const rows = data.map((item) =>
    headers
      .map((header) => `"${String(item[header]).replaceAll('"', '""')}"`)
      .join(","),
  );

  return [headers.join(","), ...rows].join("\n");
}

function ExportButtons({ filename, data }) {
  const hasData = data.length > 0;

  function handleJsonExport() {
    if (!hasData) return;

    downloadFile(
      `${filename}.json`,
      JSON.stringify(data, null, 2),
      "application/json",
    );
  }

  function handleCsvExport() {
    if (!hasData) return;

    downloadFile(`${filename}.csv`, convertToCsv(data), "text/csv");
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <button
        type="button"
        disabled={!hasData}
        onClick={handleCsvExport}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FaFileCsv />
        Export CSV
      </button>

      <button
        type="button"
        disabled={!hasData}
        onClick={handleJsonExport}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FaFileCode />
        Export JSON
      </button>

      <span className="inline-flex items-center gap-2 text-sm text-slate-500">
        <FaDownload />
        Local export
      </span>
    </div>
  );
}

export default ExportButtons;
