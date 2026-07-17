import { useEffect, useState } from "react";
import KPIcard from "../components/KPIcard";
import Loading from "../components/Loading";
import PageHeader from "../components/PageHeader";
import PredictionChart from "../components/PredictionChart";
import { getForecastData } from "../services/forecastService";

const riskStyles = {
  High: "border-red-200 bg-red-50 text-red-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  Low: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

function getRisk(noise, safeThreshold) {
  if (noise > safeThreshold) return "High";
  if (noise >= safeThreshold - 10) return "Medium";
  return "Low";
}

function Forecast() {
  const [forecastData, setForecastData] = useState(null);

  useEffect(() => {
    getForecastData().then((data) => {
      setForecastData(data);
    });
  }, []);

  if (!forecastData) {
    return <Loading title="Forecast" message="Loading forecast..." />;
  }

  const peakPeriod = forecastData.trend.reduce((highest, item) =>
    item.noise > highest.noise ? item : highest,
  );
  const quietestPeriod = forecastData.trend.reduce((lowest, item) =>
    item.noise < lowest.noise ? item : lowest,
  );
  const averageNoise = Math.round(
    forecastData.trend.reduce((total, item) => total + item.noise, 0) /
      forecastData.trend.length,
  );
  const firstReading = forecastData.trend[0].noise;
  const lastReading = forecastData.trend[forecastData.trend.length - 1].noise;
  const overallChange = lastReading - firstReading;
  const trendDirection =
    overallChange > 0 ? "Increasing" : overallChange < 0 ? "Decreasing" : "Stable";

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-6 sm:px-8 lg:px-12">
      <div className="w-full space-y-10 animate-fade-in-up">
        <PageHeader
          title="Forecast"
          description="Review predicted noise levels, safe-threshold variance, and trend insights from forecast data."
        />
        <br/>
        <section>
          <h2 className="mb-5 text-lg font-semibold text-slate-800">
            Prediction KPI Cards
          </h2>

          <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <KPIcard title="Predicted Average" value={forecastData.averageNoise} accent="teal" />
            <KPIcard title="Peak Noise" value={forecastData.peakNoise} accent="red" />
            <KPIcard title="Risk Window" value={forecastData.riskWindow} accent="amber" />
            <KPIcard title="Confidence" value={forecastData.confidence} accent="sky" />
          </div>
        </section>
        <br/>
        <section>
          <h2 className="mb-5 text-lg font-semibold text-slate-800">
            Prediction Chart
          </h2>

          <PredictionChart
            data={forecastData.trend}
            safeThreshold={forecastData.safeThreshold}
          />
        </section>
        <br/>
        <section>
          <h2 className="mb-5 text-lg font-semibold text-slate-800">
            Prediction Table
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[680px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50 text-sm text-slate-600">
                <tr>
                  <th className="px-5 py-4 font-semibold">Time</th>
                  <th className="px-5 py-4 font-semibold">Predicted Noise</th>
                  <th className="px-5 py-4 font-semibold">Safe Threshold</th>
                  <th className="px-5 py-4 font-semibold">Difference</th>
                  <th className="px-5 py-4 font-semibold">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {forecastData.trend.map((item) => {
                  const difference = item.noise - forecastData.safeThreshold;
                  const risk = getRisk(item.noise, forecastData.safeThreshold);

                  return (
                    <tr key={item.time} className="text-sm text-slate-700 transition-colors hover:bg-slate-50">
                      <td className="px-5 py-4 font-medium text-slate-900">
                        {item.time}
                      </td>
                      <td className="px-5 py-4">{item.noise} dB</td>
                      <td className="px-5 py-4">{forecastData.safeThreshold} dB</td>
                      <td
                        className={`px-5 py-4 font-medium ${
                          difference > 0 ? "text-red-600" : "text-emerald-700"
                        }`}
                      >
                        {difference > 0 ? "+" : ""}
                        {difference} dB
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${riskStyles[risk]}`}
                        >
                          {risk}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
        <br/>
        <section>
          <h2 className="mb-5 text-lg font-semibold text-slate-800">
            Trend Analytics
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <p className="text-sm font-medium text-slate-500">Peak Period</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {peakPeriod.time}
              </p>
              <p className="mt-1 text-sm text-red-600">{peakPeriod.noise} dB predicted</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <p className="text-sm font-medium text-slate-500">Quietest Period</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {quietestPeriod.time}
              </p>
              <p className="mt-1 text-sm text-emerald-700">
                {quietestPeriod.noise} dB predicted
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <p className="text-sm font-medium text-slate-500">Calculated Average</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {averageNoise} dB
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Across {forecastData.trend.length} forecast periods
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <p className="text-sm font-medium text-slate-500">Overall Trend</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {trendDirection}
              </p>
              <p
                className={`mt-1 text-sm ${
                  overallChange > 0
                    ? "text-red-600"
                    : overallChange < 0
                      ? "text-emerald-700"
                      : "text-slate-500"
                }`}
              >
                {overallChange > 0 ? "+" : ""}
                {overallChange} dB from first to last period
              </p>
            </article>
          </div>
          <br/>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900">Forecast Insight</h3>
            <p className="mt-2 text-slate-600">
              Noise is expected to peak at {peakPeriod.time}. The main monitoring
              window should focus on the hours leading up to this peak, especially
              when readings move above 75 dB.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Forecast;
