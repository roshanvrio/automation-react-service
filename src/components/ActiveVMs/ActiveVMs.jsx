import "./ActiveVMs.css";

const vmData = [
  { id: "VM-04", name: "Entry Control Hub", time: "220 mins" },
  { id: "VM-06", name: "TSF - MECR", time: "150 mins" },
  { id: "VM-18", name: "User Gatekeeper", time: "150 mins" },
  { id: "VM-22", name: "User Gatekeeper", time: "150 mins" },



];

const ActiveVMs = () => {
  return (
    <div className="dashboard-card center-height activevms-card">
      <div className="activevms-header">
        <span>🖥 Active VMs <strong>7</strong></span>

        <div className="legend">
          <span className="busy">Busy</span>
          <span className="success">Success</span>
          <span className="error">Error</span>
        </div>
      </div>

      <div className="activevms-scroll card-scroll">
        <div className="hex-grid">
          {vmData.map((vm, i) => (
            <div
              className={`hex-wrapper ${i === vmData.length - 1 ? "hex-animate" : ""}`}
              key={vm.id}
            >
              <div className="hex-border"></div>
              <div className="hex-card">
                <div className="hex-content">
                  <div className="hex-small">✉ Email</div>
                  <div className="hex-vm">🖥 {vm.id}</div>
                  <div className="hex-name">{vm.name}</div>
                  <div className="hex-time">
                    Last Run Time <strong>{vm.time}</strong>
                  </div>
                  <span className="uipath">UiPath</span>
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
