import mindsprintLogo from '../../../assets/mindsprint.png';
import formatCompact from '../../utils/formatCompact';
import HeaderSLAChart, { BAR_COLORS } from './HeaderSLAChart';

export default function Header({ headerData, formatted }) {
  const rawTotal = headerData?.total_completed?.[0]?.TotalCompleted;
  const displayTotal = rawTotal != null ? formatCompact(rawTotal) : '00';

  const barGraph = headerData?.sla_bar_graph ?? {};
  const seriesNames = barGraph.series_names ?? [];

  return (
    <>
      <div className="header-title">
        <h1 className="dashboard-title">Strategic & SLA Intelligence Dashboard</h1>
        <img src={mindsprintLogo} alt="Mindsprint" className="mindsprint-logo" />
        <span className="refresh-timer">
          <span className="refresh-label">Refresh In</span>
          <span className="refresh-time">{formatted}</span>
        </span>
      </div>

      <div className="top-row">
        <div className="dashboard-card header_transactions">
          <span className="header_transactions-label">Total Completed<br/>Transactions</span>
          <span className="header_transactions-value">{displayTotal}</span>
        </div>
        <div className="dashboard-card header_sla">
          {/* Left block: SLA info + legend */}
          <div className="header_sla-left">
            <div className="header_sla-text-area">
              <span className="header_sla-text">
                <span className="header_sla-label">SLA</span>
                <span className="header_sla-value">{headerData?.sla_percentage?.[0]?.SLA_Percentage ?? '00'}%</span>
              </span>
            </div>
            <div className="header_sla-hr" />
            <div className="header_sla-legend">
              {seriesNames.map((name, i) => (
                <div className="header_sla-legend-item" key={i}>
                  <span
                    className="header_sla-legend-swatch"
                    style={{ backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }}
                  />
                  <span className="header_sla-legend-name" style={{ color: BAR_COLORS[i % BAR_COLORS.length] }}>{name}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Chart */}
          <HeaderSLAChart data={barGraph} />
        </div>
      </div>
    </>
  );
}
