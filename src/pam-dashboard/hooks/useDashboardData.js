import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchHeaderData as apiFetchHeaderData, fetchSummaryData as apiFetchSummaryData } from '../services/api';

/**
 * Aggregate hourly SLA rows into per-subprocess averages for the bar chart.
 * Input: [{ SubProcessName, sla_percentage, interval_range }, ...]
 * Output: [{ name, value }, ...]
 */
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

/**
 * Transform backend /api/summary response into the shape Dashboard.jsx expects.
 */
function transformSummary(raw) {
  if (!raw) return null;

  return {
    percentage: raw.sla_compliance?.percentage ?? [],
    gauge: raw.sla_compliance?.gauge ?? [],
    hourlySla: aggregateHourlySla(raw.sla_compliance?.hourly ?? []),
    twoHourSla: raw.sla_compliance?.two_hour ?? [],
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
      CaseStatus: 'ERROR',
    })),
  };
}

/**
 * Fetches header and summary data whenever the region changes.
 * Skips fetching when backend is not connected.
 *
 * @param {string|null} region - active region filter (null = All Regions)
 * @param {boolean} connected - whether the backend is reachable
 * @returns {{ headerData: object|null, summaryData: object|null }}
 */
export default function useDashboardData(region, connected) {
  const [headerData, setHeaderData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const prevRegionRef = useRef(undefined);

  const fetchData = useCallback(async (r) => {
    try {
      const data = await apiFetchHeaderData(r);
      setHeaderData(data);
    } catch (err) {
      console.error('Failed to fetch header data:', err);
    }

    try {
      const raw = await apiFetchSummaryData(r);
      setSummaryData(transformSummary(raw));
    } catch (err) {
      console.error('Failed to fetch summary data:', err);
    }
  }, []);

  useEffect(() => {
    if (!connected) return;
    if (prevRegionRef.current === region) return;
    prevRegionRef.current = region;
    fetchData(region);
  }, [region, connected, fetchData]);

  return { headerData, summaryData };
}
