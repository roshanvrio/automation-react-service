import React from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import OverviewTiles from "../components/OverviewTiles";
import BotsInProgress from "../components/BotsInProgress";
import VMGrid from "../components/VMGrid";

export default function DashboardLayout() {
  return (
    <div className="dashboard-root">
      {/* Top Navigation Bar */}
      <Topbar />
      
      {/* Main Dashboard Body */}
      <div className="dashboard-body">
        {/* Left Sidebar */}
        <aside className="dashboard-left">
          <Sidebar />
        </aside>
        
        {/* Main Content Area */}
        <main className="dashboard-main">
          {/* Overview Stats Row */}
          <div className="dashboard-row">
            <OverviewTiles />
          </div>
          
          {/* Bots & VM Grid Row */}
          {/* Combined Bots & VM Section */}
<div className="dashboard-row lower">
  <div className="combined-bots-vm-card">
    <div className="bots-section">
      <BotsInProgress />
    </div>
    <div className="vms-section">
      <VMGrid />
    </div>
  </div>
</div>
        </main>
      </div>
    </div>
  );
}