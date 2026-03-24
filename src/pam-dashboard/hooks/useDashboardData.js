import { useState, useEffect } from 'react';
import { fetchHeaderData as apiFetchHeaderData, fetchSummaryData as apiFetchSummaryData } from '../services/api';

/** Aggregate hourly SLA rows into per-subprocess averages for the bar chart. */
function aggregateHourlySla(rows) {
  if (!rows || rows.length === 0) return [];
  const map = {};
  rows.forEach((r) => {
    if (!map[r.SubProcessName]) map[r.SubProcessName] = { sum: 0, count: 0 };
    map[r.SubProcessName].sum += r.sla_percentage ?? 0;
    map[r.SubProcessName].count += 1;
  });
  return Object.entries(map).map(([name, { sum, count }]) => ({
    name,
    value: Math.round((sum / count) * 100) / 100,
  }));
}

/** Transform backend /api/summary response into the shape Dashboard.jsx expects. */
function transformSummary(raw) {
  if (!raw) return null;

  return {
    percentage: raw.sla_compliance?.percentage ?? [],
    gauge: raw.sla_compliance?.gauge ?? [],
    hourlySla: aggregateHourlySla(raw.sla_compliance?.hourly ?? []),
    processes: (raw.process_analysis ?? []).map((r) => ({
      name: r.SubProcessName,
      value: r.ErrorPercentage,
    })),
    vms: (raw.vm_utilization ?? []).map((r) => ({
      name: r.machineName,
      value: r.ErrorPercentage,
    })),
    caseReasons: (raw.case_reasons ?? []).map((r) => ({
      reason: r.CaseReason,
      count: r.ErrorCount,
      CaseStatus: r.CaseStatus ?? 'ERROR',
    })),
    issues: (raw.issues ?? []).map((r) => ({
      process: r.SubProcessName,
      vm: r.machineName,
      issue: r.IssueDescription,
      total: r.TotalCount,
      error: r.ErrorCount,
    })),
  };
}

/**
 * Fetches header and summary data in parallel whenever the region changes.
 * Discards stale responses if region changes mid-flight.
 *
 * @param {string|null} region - active region filter (null = All Regions)
 * @param {boolean} connected - whether the backend is reachable
 * @returns {{ headerData: object|null, summaryData: object|null }}
 */
export default function useDashboardData(region, connected) {
  const [headerData, setHeaderData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    if (!connected) return;

    let aborted = false;

    Promise.allSettled([
      apiFetchHeaderData(region),
      apiFetchSummaryData(region),
    ]).then(([headerResult, summaryResult]) => {
      if (aborted) return;

      if (headerResult.status === 'fulfilled') {
        setHeaderData(headerResult.value);
      } else {
        console.error('Failed to fetch header data:', headerResult.reason);
      }

      if (summaryResult.status === 'fulfilled') {
        setSummaryData(transformSummary(summaryResult.value));
      } else {
        console.error('Failed to fetch summary data:', summaryResult.reason);
      }
    });

    return () => { aborted = true; };
  }, [region, connected]);

  return { headerData, summaryData };
}
