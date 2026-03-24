import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

export const fetchRegions = async () => {
  const { data } = await apiClient.get('/country');
  return [...new Set(data.map((item) => item.region).filter(Boolean))];
};

/** Transform flat SLA rows into grouped series for HeaderSLAChart. */
function transformBarGraph(rows) {
  if (!rows || rows.length === 0) return { series_names: [], series_data: [] };

  const subprocesses = [...new Set(rows.map((r) => r.SubProcessName))];
  const slots = [...new Set(rows.map((r) => r.interval_range))];

  const lookup = {};
  rows.forEach((r) => {
    lookup[`${r.SubProcessName}|${r.interval_range}`] = r.sla_percentage ?? 0;
  });

  const series_data = subprocesses.map((sp) =>
    slots.map((slot) => lookup[`${sp}|${slot}`] ?? 0)
  );

  return { series_names: subprocesses, series_data, slots };
}

export const fetchHeaderData = async (region) => {
  const params = region ? { region } : {};
  const { data } = await apiClient.get('/header', { params });
  const inner = data?.data !== undefined ? data.data : data;

  const barGraph = transformBarGraph(inner.sla_bar_graph);

  return {
    total_completed: inner.total_completed,
    sla_percentage: inner.sla_percentage,
    sla_bar_graph: barGraph,
    subprocess_wise: inner.subprocess_wise,
  };
};

export const fetchSummaryData = async (region) => {
  const params = region ? { region } : {};
  const { data } = await apiClient.get('/summary', { params });
  return data;
};

export default apiClient;
