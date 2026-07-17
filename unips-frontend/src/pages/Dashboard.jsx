import { useEffect, useState } from "react";
import KPIcard from "../components/KPIcard";
import Loading from "../components/Loading";
import MapContainer from "../components/MapContainer";
import PageHeader from "../components/PageHeader";
import { getDashboardData } from "../services/dashboardService";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    getDashboardData().then((data) => {
      setDashboardData(data);
    });
  }, []);

  if (!dashboardData) {
    return <Loading title="Dashboard" message="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-6 sm:px-8 lg:px-12">
      <div className="w-full space-y-10 animate-fade-in-up">
        <PageHeader
          title="Dashboard"
          description="Operational overview of noise levels, monitored stations, and current risk status."
        />
        <br/>

        <section>
          <h2 className="mb-5 text-lg font-semibold text-slate-800">KPI Cards</h2>
        
          <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <KPIcard title="Average Noise" value={dashboardData.noise} accent="teal" />
            <KPIcard title="Hotspots" value={dashboardData.hotspots} accent="amber" />
            <KPIcard title="Stations" value={dashboardData.stations} accent="sky" />
            <KPIcard title="Risk" value={dashboardData.risk} accent="red" />
          </div>

          {dashboardData.risk === "High" && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 font-medium text-red-700 shadow-sm">
              
              <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
              <br/>
              Warning: High noise levels predicted
            </div>
          )}
        </section>
          <br/>
        <section>
          <h2 className="mb-5 text-lg font-semibold text-slate-800">Noise Map</h2>

          <MapContainer />
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
