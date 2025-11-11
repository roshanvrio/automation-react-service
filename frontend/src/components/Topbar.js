import React from "react";
import mindsprintLogo from "../images/mind.png";

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="logo">
          <img src={mindsprintLogo} alt="MindSprint" className="logo-img" />
        </div>
        <div className="title">QUEUE DASHBOARD</div>
        <div className="bell">🔔</div>
      </div>
    </header>
  );
}

// Topbar component represents the top navigation bar of the dashboard.