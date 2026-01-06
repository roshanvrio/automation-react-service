import "./ActiveVMs.css";

const ActiveVMs = ({ activeVmUpdate }) => {
  return (
    <div className="dashboard-card center-height activevms-card">
      <div className="activevms-header">
        <span>🖥 Active VMs <strong>{activeVmUpdate?.length || 0}</strong></span>

        <div className="legend">
          <span className="busy">Busy</span>
          <span className="success">Success</span>
          <span className="error">Error</span>
        </div>
      </div>

      <div className="activevms-scroll card-scroll">
        <div className="hex-grid">
          {Array.isArray(activeVmUpdate) && activeVmUpdate.map((vm, i) => (
            <div
              className={`hex-wrapper ${i === activeVmUpdate.length - 1 ? "hex-animate" : ""}`}
              key={vm.machineName || i}
            >
              <div className="hex-border"></div>
              <div className="hex-card">
                <div className="hex-content">
                  <div className="hex-small">{vm.triggerIndication === "Email" ? "✉" : "🕐"} {vm.triggerIndication}</div>
                  <div className="hex-vm">🖥 {vm.machineName}</div>
                  <div className="hex-name">{vm.processName}</div>
                  <div className="hex-time">
                    Last Run Time <strong>{vm.lastRunTime}</strong>
                  </div>
                  <span className="uipath">{vm.rpaTool}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActiveVMs;
