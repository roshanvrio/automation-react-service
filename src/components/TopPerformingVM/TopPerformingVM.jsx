import "./TopPerformingVM.css";

const TopPerformingVM = ({ topPerformer }) => {
  return (
    <div className="dashboard-card small-card-height">
      <div className="card-title">Top Performing VM</div>
      <div className="performer-display">
        <div className="performer-badge">
          {/* Outer stars with dashed lines */}
          <div className="star-burst-outer">
            {[...Array(16)].map((_, i) => (
              <div
                key={`outer-${i}`}
                className="star-ray-outer"
                style={{
                  transform: `rotate(${i * 22.5}deg)`,
                  animationDelay: `${i * 0.1}s`
                }}
              >
                <span className="star-icon">★</span>
              </div>
            ))}
          </div>
          {/* Inner stars */}
          <div className="star-burst-inner">
            {[...Array(8)].map((_, i) => (
              <div
                key={`inner-${i}`}
                className="star-ray-inner"
                style={{
                  transform: `rotate(${i * 45 + 22.5}deg)`,
                  animationDelay: `${i * 0.15}s`
                }}
              >
                <span className="star-icon-inner">★</span>
              </div>
            ))}
          </div>
          {/* Center circle with VM info */}
          <div className="performer-content">
            <span className="performer-vm-id">{topPerformer?.vmName || "N/A"}</span>
            <span className="performer-time">{topPerformer?.utilizationMinutes ? (topPerformer.utilizationMinutes / 60).toFixed(1) : 0} hrs</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default TopPerformingVM;