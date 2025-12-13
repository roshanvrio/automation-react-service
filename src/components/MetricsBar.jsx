import React from 'react';
import MetricCard from './MetricCard';

const MetricsBar = ({ metrics }) => {
  return (
    <div className="metrics-bar">
      <MetricCard
        type="exception"
        count={String(metrics.exceptions || 0).padStart(2, '0')}
        label="Exception"
      />
      <MetricCard
        type="successful"
        count={String(metrics.successful || 0).padStart(2, '0')}
        label="Successful"
      />
      <MetricCard
        type="progress"
        count={String(metrics.inProgress || 0).padStart(2, '0')}
        label="IN PROGRESS"
      />
      <MetricCard
        type="queue"
        count={String(metrics.totalInQueue || 0).padStart(2, '0')}
        label="Total in Queue"
      />
      <MetricCard
        type="error"
        count={String(metrics.errors || 0).padStart(2, '0')}
        label="Error"
      />
      <MetricCard
        type="time"
        count={`${metrics.avgTime || 0} mins`}
        label="Avg. Utilisation time"
      />
    </div>
  );
};

export default MetricsBar;