function KPIcard({ title, value, accent = "teal" }) {
  const accents = {
    teal: "from-teal-400 to-teal-600",
    amber: "from-amber-400 to-amber-600",
    red: "from-red-400 to-red-600",
    sky: "from-sky-400 to-sky-600",
  };

  return (
    <div className="w-full max-w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`h-1.5 w-full bg-gradient-to-r ${accents[accent] ?? accents.teal}`}
        aria-hidden="true"
      />
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
        <h2 className="mt-3 break-words text-3xl font-bold leading-tight text-slate-900">
          {value}
        </h2>
      </div>
    </div>
  );
}

export default KPIcard;
