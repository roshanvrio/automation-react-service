import { useMemo } from 'react';
import './IssueTable.css';

export default function IssueTable({ data = [] }) {
  const animKey = useMemo(() => JSON.stringify(data), [data]);

  return (
    <div className="issue-table">
      <div className="it-header">
        <span className="it-hcell it-col-process">Process</span>
        <span className="it-hcell it-col-vm">VM</span>
        <span className="it-hcell it-col-issue">Issue</span>
        <span className="it-hcell it-col-total">Total</span>
        <span className="it-hcell it-col-error">Error</span>
      </div>
      {data.length > 0 ? (
        <div className="it-body" key={animKey}>
          {data.map((row, i) => (
            <div
              key={i}
              className="it-row"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className="it-cell it-col-process">{row.process}</span>
              <span className="it-cell it-col-vm">{row.vm}</span>
              <span className="it-cell it-col-issue">{row.issue}</span>
              <span className="it-cell it-col-total">{row.total}</span>
              <span className="it-cell it-col-error">{row.error}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
