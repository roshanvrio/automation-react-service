import { useEffect, useRef, useState, useCallback } from "react";
import "./ProcessCompleted.css";

const ProcessCompleted = ({ processCompletedUpdate }) => {
  const processes = Array.isArray(processCompletedUpdate) ? processCompletedUpdate : [];
  const [highlightedKeys, setHighlightedKeys] = useState(new Set());
  const prevProcessKeysRef = useRef(new Set());
  const rowRefsMap = useRef({});
  const isFirstLoad = useRef(true);

  // Build a unique key for each process row
  const getProcessKey = useCallback((process, index) => {
    return process.processName || `process_${index}`;
  }, []);

  // Detect newly added or updated processes, scroll & highlight
  useEffect(() => {
    const currentKeys = new Set(processes.map((p, i) => getProcessKey(p, i)));

    // Skip highlight on first load
    if (isFirstLoad.current) {
      if (processes.length > 0) {
        isFirstLoad.current = false;
        prevProcessKeysRef.current = currentKeys;
      }
      return;
    }

    // Find new keys that weren't in the previous set
    const newKeys = new Set();
    currentKeys.forEach(key => {
      if (!prevProcessKeysRef.current.has(key)) {
        newKeys.add(key);
      }
    });

    prevProcessKeysRef.current = currentKeys;

    if (newKeys.size > 0) {
      setHighlightedKeys(newKeys);

      // Scroll to the first new row
      const firstNewKey = [...newKeys][0];
      const el = rowRefsMap.current[firstNewKey];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      // Remove highlight after animation
      setTimeout(() => {
        setHighlightedKeys(new Set());
      }, 2000);
    }
  }, [processes, getProcessKey]);

  return (
    <div className="dashboard-cards card-scroll">
      <div className="card-title text-center">Process Completed - {processes.length}</div>

      <div className="process-completed-list">
        {processes.map((process, i) => {
          const icon = process.triggerIndication === "Email" ? "bi-envelope" : "bi-clock";
          const total = (process.successCount || 0) + (process.exceptionCount || 0) + (process.errorCount || 0);
          const key = getProcessKey(process, i);
          const isHighlighted = highlightedKeys.has(key);

          return (
            <div
              className={`process-completed-row${isHighlighted ? ' process-completed-highlight' : ''}`}
              key={key}
              ref={(el) => {
                if (el) rowRefsMap.current[key] = el;
              }}
            >
              <div className="process-completed-left">
                <i className={`bi ${icon}`}></i>
                <span className="process-completed-name">{process.processName}</span>
              </div>
              <div className="process-completed-right">
                <div className="count-chip success">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>{process.successCount || 0}</span>
                </div>
                <div className="count-chip exception">
                  <i className="bi bi-exclamation-circle-fill"></i>
                  <span>{process.exceptionCount || 0}</span>
                </div>
                <div className="count-chip error">
                  <i className="bi bi-x-circle-fill"></i>
                  <span>{process.errorCount || 0}</span>
                </div>
                <div className="count-total">{total}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessCompleted;
