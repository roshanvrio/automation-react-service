import { useEffect, useRef, useState, useCallback } from "react";
import "./ProcessCompleted.css";

// How long each row stays highlighted before moving to next
const HIGHLIGHT_DURATION = 3500;

const ProcessCompleted = ({ processCompletedUpdate }) => {
  const processes = Array.isArray(processCompletedUpdate) ? processCompletedUpdate : [];
  const [highlightedKey, setHighlightedKey] = useState(null);
  // Store previous snapshot: Map<processName, { successCount, exceptionCount, errorCount }>
  const prevSnapshotRef = useRef(new Map());
  const rowRefsMap = useRef({});
  const isFirstLoad = useRef(true);
  // Queue of process keys waiting to be highlighted one by one
  const highlightQueue = useRef([]);
  const isProcessingHighlight = useRef(false);

  // Process highlight queue one at a time
  const processHighlightQueue = useCallback(() => {
    if (isProcessingHighlight.current || highlightQueue.current.length === 0) {
      return;
    }

    isProcessingHighlight.current = true;
    const nextKey = highlightQueue.current.shift();

    // Scroll to the row
    const el = rowRefsMap.current[nextKey];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    // Highlight it
    setHighlightedKey(nextKey);

    // After duration, clear and process next
    setTimeout(() => {
      setHighlightedKey(null);
      isProcessingHighlight.current = false;

      // Process next in queue
      if (highlightQueue.current.length > 0) {
        setTimeout(() => {
          processHighlightQueue();
        }, 400); // small gap between highlights
      }
    }, HIGHLIGHT_DURATION);
  }, []);

  // Detect newly added OR count-changed processes, queue highlights
  useEffect(() => {
    if (processes.length === 0) return;

    // Skip highlight on first load
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      const snapshot = new Map();
      processes.forEach(p => {
        snapshot.set(p.processName, {
          successCount: p.successCount || 0,
          exceptionCount: p.exceptionCount || 0,
          errorCount: p.errorCount || 0
        });
      });
      prevSnapshotRef.current = snapshot;
      return;
    }

    const changedKeys = [];
    const prev = prevSnapshotRef.current;

    processes.forEach(p => {
      const key = p.processName;
      const prevCounts = prev.get(key);
      const curSuccess = p.successCount || 0;
      const curException = p.exceptionCount || 0;
      const curError = p.errorCount || 0;

      if (!prevCounts) {
        changedKeys.push(key);
      } else if (
        prevCounts.successCount !== curSuccess ||
        prevCounts.exceptionCount !== curException ||
        prevCounts.errorCount !== curError
      ) {
        changedKeys.push(key);
      }
    });

    // Update snapshot
    const snapshot = new Map();
    processes.forEach(p => {
      snapshot.set(p.processName, {
        successCount: p.successCount || 0,
        exceptionCount: p.exceptionCount || 0,
        errorCount: p.errorCount || 0
      });
    });
    prevSnapshotRef.current = snapshot;

    if (changedKeys.length > 0) {
      // Add to queue, skip duplicates already queued
      changedKeys.forEach(key => {
        if (!highlightQueue.current.includes(key) && key !== highlightedKey) {
          highlightQueue.current.push(key);
        }
      });

      // Start processing if not already
      if (!isProcessingHighlight.current) {
        processHighlightQueue();
      }
    }
  }, [processes, processHighlightQueue, highlightedKey]);

  return (
    <div className="dashboard-cards card-scroll">
      <div className="card-title text-center">Process Completed - {processes.length}</div>

      <div className="process-completed-list">
        {processes.map((process, i) => {
          const icon = process.triggerIndication === "Email" ? "bi-envelope" : "bi-clock";
          const total = (process.successCount || 0) + (process.exceptionCount || 0) + (process.errorCount || 0);
          const key = process.processName || i;
          const isHighlighted = key === highlightedKey;

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
