import "./VMUtilization.css";

const VMUtilization = ({ vmUtilizationUpdate }) => {
  return (
    <div className="dashboard-card small-card-heights">

      <h5 className="card-title mb-3">VM Utilization</h5>

      <div className="vm-grid">
        {Array.isArray(vmUtilizationUpdate) && vmUtilizationUpdate.map((vm, index) => (
          <div
            key={index}
            className="vm-cell"
            style={{ backgroundColor: "#14b8a6" }}
          >
            <div className="vm-id">{vm.vmName}</div>
            <div className="vm-time">{vm.utilizationHours} hrs</div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default VMUtilization;
