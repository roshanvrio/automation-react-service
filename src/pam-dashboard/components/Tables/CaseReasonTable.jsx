import { useRef } from 'react';
import useDensity from '../../hooks/useDensity';
import './CaseReasonTable.css';

export default function CaseReasonTable({ data = [] }) {
  const { ref: tableRef } = useDensity(data.length, { medium: 6, high: 10 });

  const counterRef = useRef(0);
  const prevDataRef = useRef(data);
  if (prevDataRef.current !== data) {
    counterRef.current += 1;
    prevDataRef.current = data;
  }
  const animKey = counterRef.current;

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
                key={`${row.reason}-${i}`}
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
