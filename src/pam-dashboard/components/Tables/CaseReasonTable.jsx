import { useMemo } from 'react';
import useDensity from '../../hooks/useDensity';
import './CaseReasonTable.css';

export default function CaseReasonTable({ data = [] }) {
  const { ref: tableRef } = useDensity(data.length, { medium: 6, high: 10 });

  // Generate a key that changes whenever data changes, forcing re-mount & animation replay
  const animKey = useMemo(() => JSON.stringify(data), [data]);

  return (
    <div className="case-reason-table" ref={tableRef}>
      {data.length > 0 ? (
        <ul className="crt-list" key={animKey}>
          {data.map((row, i) => {
            const isException = row.CaseStatus === 'EXCEPTION';
            const statusClass = isException ? 'crt-exception' : 'crt-error';
            const icon = isException ? '⚠' : '⏱';

            return (
              <li
                key={i}
                className="crt-row"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className="crt-reason" title={row.reason}>{row.reason}</span>
                <span className={`crt-count ${statusClass}`}>
                  <span className="crt-icon">{icon}</span>
                  {row.count}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
