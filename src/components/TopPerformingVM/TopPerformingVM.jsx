import "./TopPerformingVM.css";

const TopPerformingVM = () => {
  return (
    <div className="dashboard-card small-card-height top-vm-card">
      <div className="card-title">Top Performing VM</div>

      <div className="radial">
        {/* Rotating rays */}
        <div className="rays">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="ray"
              style={{ transform: `rotate(${i * 30}deg)` }}
            />
          ))}
        </div>

        {/* Static center */}
        <div className="center">
          <div className="vm-name">VM 32</div>
          <div className="vm-time">1000 mins</div>
        </div>
      </div>
    </div>
  );
};

export default TopPerformingVM;
