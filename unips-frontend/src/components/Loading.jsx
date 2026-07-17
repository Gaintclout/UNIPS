function Loading({ title, message }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-6 sm:px-8 lg:px-12">
      {title && (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            Loading Workspace
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950 sm:text-4xl">
            {title}
          </h1>
        </div>
      )}

      <div className="mt-8 space-y-8" role="status" aria-live="polite" aria-label={message}>
        <div className="flex items-center gap-3 text-slate-600">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-teal-600" />
          <span className="font-medium">{message}</span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="min-h-28 animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="mt-4 h-8 w-32 rounded bg-slate-300" />
            </div>
          ))}
        </div>

        <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-5 w-40 rounded bg-slate-300" />
          <div className="mt-6 h-72 rounded-xl bg-slate-200" />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="h-12 rounded bg-slate-200" />
            <div className="h-12 rounded bg-slate-200" />
            <div className="h-12 rounded bg-slate-200" />
          </div>
        </div>

        <span className="sr-only">{message}</span>
      </div>
    </div>
  );
}

export default Loading;
