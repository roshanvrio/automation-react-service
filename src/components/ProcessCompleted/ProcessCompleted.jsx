import { useEffect, useRef } from "react";
import "./ProcessCompleted.css";

// Scroll config
const SCROLL_PX = 1;       // pixels per tick
const TICK_MS = 30;         // interval between ticks
const PAUSE_TICKS = 80;     // ticks to pause at top/bottom (~2.4s)

const ProcessCompleted = ({ processCompletedUpdate }) => {
  const processes = Array.isArray(processCompletedUpdate) ? processCompletedUpdate : [];
  const listRef = useRef(null);

  // Continuous auto-scroll using setInterval — runs once on mount
  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;

    let direction = 1;
    let pauseCount = 0;

    const id = setInterval(() => {
      // Pausing at boundary
      if (pauseCount > 0) {
        pauseCount--;
        return;
      }

      const maxScroll = listEl.scrollHeight - listEl.clientHeight;
      if (maxScroll <= 1) return;

      listEl.scrollTop += SCROLL_PX * direction;

      if (direction === 1 && listEl.scrollTop >= maxScroll - 1) {
        listEl.scrollTop = maxScroll;
        direction = -1;
        pauseCount = PAUSE_TICKS;
      } else if (direction === -1 && listEl.scrollTop <= 1) {
        listEl.scrollTop = 0;
        direction = 1;
        pauseCount = PAUSE_TICKS;
      }
    }, TICK_MS);

    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="dashboard-cards card-scroll">
      <div className="card-title text-center">Process Completed - {processes.length}</div>

      <div className="process-completed-list" ref={listRef}>
        {processes.map((process, i) => {
          const icon = process.triggerIndication === "Email" ? "bi-envelope" : "bi-clock";
          const total = (process.successCount || 0) + (process.exceptionCount || 0) + (process.errorCount || 0);

          return (
            <div
              className="process-completed-row"
              key={process.processName || i}
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
