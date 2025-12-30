import "./ActiveVMs.css";

const vmData = [
  { id: "VM-04", name: "Entry Control Hub", time: "220 mins" },
  { id: "VM-06", name: "TSF - MECR", time: "150 mins" },
  { id: "VM-18", name: "User Gatekeeper", time: "150 mins" },
  { id: "VM-11", name: "Process 3254", time: "335 mins" },
  { id: "VM-33", name: "Permission Sentinel", time: "200 mins" },
  { id: "VM-29", name: "Entry Shield", time: "110 mins" },
  { id: "VM-29", name: "Entry Shield", time: "110 mins" },
  { id: "VM-29", name: "Entry Shield", time: "110 mins" },
  { id: "VM-29", name: "Entry Shield", time: "110 mins" }
];

const ActiveVMs = () => {
  return (
    <div className="dashboard-card center-height activevms-card">
      <div className="activevms-header">
        🖥 Active VMs <strong>{vmData.length}</strong>
      </div>

      <div className="activevms-scroll card-scroll">
        <div className="hex-grid">
          {vmData.map((vm, i) => (
            <div className="hex-card" key={i}>
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActiveVMs;
