import "./ActiveVMs.css";

const ActiveVMs = () => {
  return (
    <div className="dashboard-card center-height">
      <div className="card-title">Active VMs</div>

      <div className="row g-2">
        {Array.from({ length: 24 }).map((_, i) => (
          <div className="col-3" key={i}>
            <div className="vm-tile">VM-{i + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveVMs;
