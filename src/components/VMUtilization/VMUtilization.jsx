import "./VMUtilization.css";

const VMUtilization = () => {

  const vmUtilization = [
    { id: "VM 01", time: "45 mins", color: "#2dd4bf" },
    { id: "VM 03", time: "205 mins", color: "#26c9b5" },
    { id: "VM 31", time: "534 mins", color: "#1fb8a6" },
    { id: "VM 28", time: "675 mins", color: "#1fb8a6" },
    { id: "VM 22", time: "1024 mins", color: "#14b8a6" },
    { id: "VM 05", time: "1527 mins", color: "#14b8a6" },
    { id: "VM 16", time: "1320 mins", color: "#14b8a6" },

    { id: "VM 11", time: "122 mins", color: "#2dd4bf" },
    { id: "VM 15", time: "150 mins", color: "#26c9b5" },
    { id: "VM 33", time: "350 mins", color: "#1fb8a6" },
    { id: "VM 26", time: "760 mins", color: "#1fb8a6" },
    { id: "VM 04", time: "875 mins", color: "#14b8a6" },
    { id: "VM 21", time: "890 mins", color: "#14b8a6" },
    { id: "VM 17", time: "1300 mins", color: "#14b8a6" },

    { id: "VM 02", time: "78 mins", color: "#2dd4bf" },
    { id: "VM 14", time: "199 mins", color: "#26c9b5" },
    { id: "VM 32", time: "583 mins", color: "#1fb8a6" },
    { id: "VM 29", time: "950 mins", color: "#14b8a6" },
    { id: "VM 25", time: "1350 mins", color: "#14b8a6" },
    { id: "VM 06", time: "350 mins", color: "#1fb8a6" },
    { id: "VM 18", time: "1200 mins", color: "#14b8a6" }
  ];
  return (
    <div className="dashboard-card small-card-height">

      <h5 className="card-title mb-3">VM Utilization</h5>

      <div className="vm-grid">
        {vmUtilization.map((vm, index) => (
          <div
            key={index}
            className="vm-cell"
            style={{ backgroundColor: vm.color }}
          >
            <div className="vm-id">{vm.id}</div>
            <div className="vm-time">{vm.time}</div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default VMUtilization;
