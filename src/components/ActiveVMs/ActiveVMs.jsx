import { useState } from "react";
import "./ActiveVMs.css";

const initialVMs = [
  { id: "VM-04", name: "Entry Control Hub", time: "220 mins" },
  { id: "VM-06", name: "TSF - MECR", time: "150 mins" },
  { id: "VM-18", name: "User Gatekeeper", time: "150 mins" },
];

const ActiveVMs = ({ onNewVM, animationActive }) => {
  const [vmData, setVmData] = useState(initialVMs);
  const [newVMIndex, setNewVMIndex] = useState(null);

  const handleAddVM = () => {
    // Trigger the global flying animation
    onNewVM();

    // After collision animation (1.2s), add the new VM with pop animation
    setTimeout(() => {
      const newVM = { id: "VM-22", name: "User Gatekeeper", time: "150 mins" };
      setVmData(prev => [...prev, newVM]);
      setNewVMIndex(vmData.length); // Index of new item

      // Clear the animation state after hex appears
      setTimeout(() => setNewVMIndex(null), 1000);
    }, 1200);
  };

  return (
    <div className="dashboard-card center-height activevms-card">
      <div className="activevms-header">
        <span>🖥 Active VMs <strong>{vmData.length}</strong></span>

        <div className="legend">
          <span className="busy">Busy</span>
          <span className="success">Success</span>
          <span className="error">Error</span>
        </div>
      </div>

      {/* Demo button - you can remove this later */}
      <button className="demo-trigger-btn" onClick={handleAddVM} disabled={animationActive}>
        + Simulate New VM Assignment
      </button>

      <div className="activevms-scroll card-scroll">
        <div className="hex-grid">
          {vmData.map((vm, i) => {
            const isNewlyAdded = i === newVMIndex;

            return (
              <div
                className={`hex-wrapper ${isNewlyAdded ? "hex-pop-in" : ""}`}
                key={`${vm.id}-${i}`}
              >
                {/* DASHED OUTLINE */}
                <svg className="hex-outline-svg" viewBox="0 0 200 220">
                  <polygon
                    points="50,2 150,2 198,110 150,218 50,218 2,110"
                  />
                </svg>

                {/* HEX CARD */}
                <div className={`hex-card ${isNewlyAdded ? "hex-card-pop" : ""}`}>
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
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActiveVMs;
