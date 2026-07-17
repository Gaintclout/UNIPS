import { useState } from "react";
import PageHeader from "../components/PageHeader";

function Settings() {
  const [settings, setSettings] = useState({
    emailAlerts: true,
    highRiskOnly: false,
    autoRefresh: true,
    refreshInterval: "30",
    defaultView: "dashboard",
  });
  const [saved, setSaved] = useState(false);

  function handleToggle(event) {
    const { name, checked } = event.target;

    setSettings((currentSettings) => ({
      ...currentSettings,
      [name]: checked,
    }));
    setSaved(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setSettings((currentSettings) => ({
      ...currentSettings,
      [name]: value,
    }));
    setSaved(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSaved(true);
  }

  const toggles = [
    {
      name: "emailAlerts",
      label: "Email alerts",
      description: "Receive notifications when new risk alerts are generated.",
    },
    {
      name: "highRiskOnly",
      label: "High-risk alerts only",
      description: "Hide low and medium severity alerts from notification summaries.",
    },
    {
      name: "autoRefresh",
      label: "Auto refresh",
      description: "Automatically refresh dashboard data at the selected interval.",
    },
  ];

  return (
    <div className="flex min-h-screen w-full justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-6 sm:px-8 lg:px-12">
      <div className="w-full max-w-3xl space-y-8 animate-fade-in-up">
        <PageHeader
          title="Settings"
          description="Manage alert preferences, refresh behavior, and default landing views for this frontend workspace."
        />

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="space-y-4">
            {toggles.map((toggle) => (
              <label
                key={toggle.name}
                className="flex items-start justify-between gap-6 rounded-xl border border-slate-200 p-4 transition-colors hover:border-teal-200 hover:bg-teal-50/30"
              >
                <span>
                  <span className="block font-medium text-slate-900">{toggle.label}</span>
                  <span className="mt-1 block text-sm text-slate-500">
                    {toggle.description}
                  </span>
                </span>

                <span className="relative mt-1 inline-flex shrink-0">
                  <input
                    type="checkbox"
                    name={toggle.name}
                    checked={settings[toggle.name]}
                    onChange={handleToggle}
                    className="peer sr-only"
                  />
                  <span className="h-6 w-11 rounded-full bg-slate-300 transition-colors peer-checked:bg-teal-600" />
                  <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                </span>
              </label>
            ))}

            <div className="grid gap-5 border-t border-slate-200 pt-6 md:grid-cols-2">
              <label>
                <span className="block text-sm font-medium text-slate-800">
                  Refresh interval
                </span>
                <select
                  name="refreshInterval"
                  value={settings.refreshInterval}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                >
                  <option value="15">15 seconds</option>
                  <option value="30">30 seconds</option>
                  <option value="60">1 minute</option>
                  <option value="300">5 minutes</option>
                </select>
              </label>

              <label>
                <span className="block text-sm font-medium text-slate-800">
                  Default landing page
                </span>
                <select
                  name="defaultView"
                  value={settings.defaultView}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                >
                  <option value="dashboard">Dashboard</option>
                  <option value="forecast">Forecast</option>
                  <option value="alerts">Alerts</option>
                  <option value="analytics">Analytics</option>
                  <option value="reports">Reports</option>
                </select>
              </label>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center">
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 px-5 py-3 font-semibold text-white shadow-sm transition hover:from-teal-700 hover:to-teal-800 active:scale-[0.99]"
            >
              Save settings
            </button>

            {saved && (
              <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Settings saved locally for this mock screen.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Settings;
