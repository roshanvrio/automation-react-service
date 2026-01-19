import "./VMUtilization.css";

const VMUtilization = ({ vmUtilizationUpdate }) => {
  const vms = Array.isArray(vmUtilizationUpdate) ? vmUtilizationUpdate : [];
  const maxMinutes = Math.max(...vms.map((vm) => vm.utilizationMinutes || 0), 1);

  const getColor = (minutes) => {
    if (minutes === 0) return "rgb(230, 255, 250)";
    // Use logarithmic scale for better distribution
    const t = Math.log(1 + minutes) / Math.log(1 + maxMinutes);
    // Light: rgb(230, 255, 250) -> Dark: rgb(6, 78, 70)
    return `rgb(${Math.round(230 - 224 * t)}, ${Math.round(255 - 177 * t)}, ${Math.round(250 - 180 * t)})`;
  };

  return (
    <div className="dashboard-card small-card-heights">
      <div className="vm-header">
        <h5 className="card-title mb-0">VM Utilization</h5>
        <div className="vm-legend">
          <span className="legend-label">Less</span>
          <div className="legend-gradient"></div>
          <span className="legend-label">More</span>
        </div>
      </div>
      <div className="vm-grid">
        {vms.map((vm, index) => {
          const minutes = vm.utilizationMinutes || 0;
          const t = minutes === 0 ? 0 : Math.log(1 + minutes) / Math.log(1 + maxMinutes);
          const isDark = t > 0.5;
          return (
            <div
              key={index}
              className="vm-cell"
              style={{
                backgroundColor: getColor(minutes),
                color: isDark ? "#ffffff" : "#0a0e27",
              }}
            >
              <div className="vm-id">{vm.vmName}</div>
              <div className="vm-time">{(minutes / 60).toFixed(1)}hrs</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VMUtilization;
