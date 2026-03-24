import { Header, SLAGauge, SubProcessGraph, HourlySLAGraph, ConcentricRingsChart, CaseReasonTable, IssueTable } from './components';
import useRegionCycling from './hooks/useRegionCycling';
import useDashboardData from './hooks/useDashboardData';

function getDensity(count, medium, high) {
  if (count >= high) return 'high';
  if (count >= medium) return 'medium';
  return 'default';
}

function GaugeGrid({ gaugeData = [] }) {
  const items = gaugeData.slice(0, 5);
  const row1 = items.slice(0, 3);
  const row2 = items.slice(3);
  const gaugeDensity = getDensity(items.length, 4, 5);

  return (
    <>
      <div className="sla_gauge-row" data-density={gaugeDensity}>
        {row1.map((item) => (
          <SLAGauge
            key={item.SubProcessName}
            density={gaugeDensity}
            value={item.today_sla ?? 0}
            label={item.SubProcessName}
            transactions={item.total_transactions ?? 0}
            weeklySla={item.weekly_sla ?? 0}
            weeklyCount={item.total_transactions ?? 0}
            monthlySla={item.monthly_sla ?? 0}
            monthlyCount={item.total_transactions ?? 0}
          />
        ))}
      </div>
      {row2.length > 0 && (
        <div className="sla_gauge-row" data-density={gaugeDensity}>
          {row2.map((item) => (
            <SLAGauge
              key={item.SubProcessName}
              density={gaugeDensity}
              value={item.today_sla ?? 0}
              label={item.SubProcessName}
              transactions={item.total_transactions ?? 0}
              weeklySla={item.weekly_sla ?? 0}
              weeklyCount={item.total_transactions ?? 0}
              monthlySla={item.monthly_sla ?? 0}
              monthlyCount={item.total_transactions ?? 0}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function Dashboard() {
  const { region, countdown, connected } = useRegionCycling();
  const { headerData, summaryData } = useDashboardData(region, connected);

  return (
    <div className="dashboard">
      <Header headerData={headerData} formatted={countdown} />

      <div className="sla_body">
        <span className="sla_body-title">Global Automation Health & Success Rate</span>
        <div className="sla_body-top">
          <div className="dashboard-card sla_compliance">
            <div className="sla_compliance-header">
              <div className="sla_compliance-header-left">
                <span className="sla_compliance-title">SLA Compliance (TAT)</span>
                <span className="sla_compliance-subtitle">% of Transactions Completed on TAT</span>
              </div>
              <span className="sla_compliance-pct">Total % of transactions met SLA - <strong>{summaryData?.percentage?.[0]?.SLA_Percentage ?? '00'}%</strong></span>
            </div>

            <div className="sla_compliance-gauges" data-density={getDensity(summaryData?.gauge?.length ?? 5, 4, 5)}>
              <GaugeGrid gaugeData={summaryData?.gauge ?? []} />
            </div>

            <div className="sla_compliance-bargraph">
              <span className="sla_compliance-bargraph-title">Hourly SLA</span>
              <HourlySLAGraph data={summaryData?.hourlySla ?? []} />
            </div>
          </div>
        </div>
        <div className="sla_body-bottom">
          <span className="critical-issue-title"><span className="warning-icon">⚠</span> Critical Issue Matrix ( Top 5 )</span>
          <div className="dashboard-card subprocess_summary">
            <div className="subprocess_col">
              <span className="subprocess_col-title">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Processes
              </span>
              <SubProcessGraph data={summaryData?.processes ?? []} />
            </div>
            <div className="subprocess_col">
              <span className="subprocess_col-title">🗄 VMs</span>
              <ConcentricRingsChart data={summaryData?.vms ?? []} />
            </div>
            <div className="subprocess_col">
              <span className="subprocess_col-title">★ Case Reasons</span>
              <CaseReasonTable data={summaryData?.caseReasons ?? []} />
            </div>
          </div>
          <div className="dashboard-card subprocess_count">
            <IssueTable data={summaryData?.issues ?? []} />
          </div>
        </div>
      </div>
    </div>
  );
}
