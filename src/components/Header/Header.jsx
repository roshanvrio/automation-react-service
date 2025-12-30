import "./Header.css";

const Header = () => {
  return (
    <div className="mt-3">
      <div className="row g-3 align-items-center">


        {/* METRICS */}
        <div className="col-lg-12 col-md-12">
          <div className="row g-3">

            <div className="col">
              <div className="header-metric cyan">
                <div className="metric-icon">
                  <i className="bi bi-inbox-fill"></i>
                </div>
                <div className="metric-text">
                  <div className="metric-value">1200</div>
                  <div className="metric-label">Total in Queue</div>
                </div>
              </div>
            </div>

            <div className="col">
              <div className="header-metric green">
                <div className="metric-icon">
                  <i className="bi bi-lightning-fill"></i>
                </div>
                <div className="metric-text">
                  <div className="metric-value">25</div>
                  <div className="metric-label">Successful</div>
                </div>
              </div>
            </div>

            <div className="col">
              <div className="header-metric purple">
                <div className="metric-icon">
                  <i className="bi bi-activity"></i>
                </div>
                <div className="metric-text">
                  <div className="metric-value">09</div>
                  <div className="metric-label">Exception</div>
                </div>
              </div>
            </div>

            <div className="col">
              <div className="header-metric red">
                <div className="metric-icon">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                </div>
                <div className="metric-text">
                  <div className="metric-value">25</div>
                  <div className="metric-label">Error</div>
                </div>
              </div>
            </div>

            <div className="col">
              <div className="header-metric teal">
                <div className="metric-icon">
                  <i className="bi bi-clock-fill"></i>
                </div>
                <div className="metric-text">
                  <div className="metric-value">25 mins</div>
                  <div className="metric-label">Avg. Utilisation time</div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Header;
