import "./Header.css";
import MindsprintLogo from "../../assets/mindsprint.png";

const Header = ({ metrics, highlightKeys = [] }) => {
  // Helper to get highlight class based on highlightKeys passed from parent
  const getHighlightClass = (key) => {
    if (!highlightKeys.includes(key)) return '';

    // Return color-specific highlight class based on metric type
    switch (key) {
      case 'totalInQueue':
        return 'metric-highlight-cyan';
      case 'successful':
        return 'metric-highlight-green';
      case 'exceptions':
        return 'metric-highlight-purple';
      case 'errors':
        return 'metric-highlight-red';
      default:
        return 'metric-highlight-green';
    }
  };

  return (
    <>
    <div className="header-title">
      <img src={MindsprintLogo} alt="Mindsprint" className="mindsprint-logo" />
      <span>QUEUE DASHBOARD</span>
    </div>
    <div className="metrics-grid">
        <div className={`header-metric cyan ${getHighlightClass('totalInQueue')}`}>
          <div className="metric-icon">
            <i className="bi bi-cpu-fill"></i>
          </div>
          <div className="metric-text">
            <div className="metric-value">{metrics?.totalInQueue || 0}</div>
            <div className="metric-label">Total in Queue</div>
          </div>
        </div>

        <div className={`header-metric green ${getHighlightClass('successful')}`}>
          <div className="metric-icon">
            <i className="bi bi-lightning-fill"></i>
          </div>
          <div className="metric-text">
            <div className="metric-value">{metrics?.successful || 0}</div>
            <div className="metric-label">Successful</div>
          </div>
        </div>

        <div className={`header-metric purple ${getHighlightClass('exceptions')}`}>
          <div className="metric-icon">
            <i className="bi bi-activity"></i>
          </div>
          <div className="metric-text">
            <div className="metric-value">{metrics?.exceptions || 0}</div>
            <div className="metric-label">Exception</div>
          </div>
        </div>

        <div className={`header-metric red ${getHighlightClass('errors')}`}>
          <div className="metric-icon">
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>
          <div className="metric-text">
            <div className="metric-value">{metrics?.errors || 0}</div>
            <div className="metric-label">Error</div>
          </div>
        </div>

        <div className={`header-metric teal ${getHighlightClass('avgTime')}`}>
          <div className="metric-icon">
            <i className="bi bi-clock-fill"></i>
          </div>
          <div className="metric-text">
            <div className="metric-value">{metrics?.avgTime || 0} mins</div>
            <div className="metric-label">Avg. Execution Time</div>
          </div>
        </div>
    </div>
    </>
  );
};

export default Header;
