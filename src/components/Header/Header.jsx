import "./Header.css";

const Header = ({ metrics, highlightKeys = [] }) => {
  // Helper to get highlight class based on highlightKeys passed from parent
  const getHighlightClass = (key) => {
    if (highlightKeys.includes(key)) return 'metric-highlight-increase';
    return '';
  };

  return (
    <div className="mt-3">
      <div className="row g-3 align-items-center">


        {/* METRICS */}
        <div className="col-lg-12 col-md-12">
          <div className="row g-3">

            <div className="col">
              <div className={`header-metric cyan ${getHighlightClass('totalInQueue')}`}>
                <div className="metric-icon">
                  <i className="bi bi-inbox-fill"></i>
                </div>
                <div className="metric-text">
                  <div className="metric-value">{metrics?.totalInQueue || 0}</div>
                  <div className="metric-label">Total in Queue</div>
                </div>
              </div>
            </div>

            <div className="col">
              <div className={`header-metric green ${getHighlightClass('successful')}`}>
                <div className="metric-icon">
                  <i className="bi bi-lightning-fill"></i>
                </div>
                <div className="metric-text">
                  <div className="metric-value">{metrics?.successful || 0}</div>
                  <div className="metric-label">Successful</div>
                </div>
              </div>
            </div>

            <div className="col">
              <div className={`header-metric purple ${getHighlightClass('exceptions')}`}>
                <div className="metric-icon">
                  <i className="bi bi-activity"></i>
                </div>
                <div className="metric-text">
                  <div className="metric-value">{metrics?.exceptions || 0}</div>
                  <div className="metric-label">Exception</div>
                </div>
              </div>
            </div>

            <div className="col">
              <div className={`header-metric red ${getHighlightClass('errors')}`}>
                <div className="metric-icon">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                </div>
                <div className="metric-text">
                  <div className="metric-value">{metrics?.errors || 0}</div>
                  <div className="metric-label">Error</div>
                </div>
              </div>
            </div>

            <div className="col">
              <div className={`header-metric teal ${getHighlightClass('avgTime')}`}>
                <div className="metric-icon">
                  <i className="bi bi-clock-fill"></i>
                </div>
                <div className="metric-text">
                  <div className="metric-value">{metrics?.avgTime || 0} mins</div>
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
