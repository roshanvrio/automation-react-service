import "./ProcessCompleted.css";

const ProcessCompleted = ({ processCompletedUpdate }) => {
  const processes = Array.isArray(processCompletedUpdate) ? processCompletedUpdate : [];

  return (
    <div className="dashboard-cards card-scroll">
      <div className="card-title text-center">Process Completed - {processes.length}</div>

      <div className="process-completed-list">
        {processes.map((process, i) => {
          const icon = process.triggerIndication === "Email" ? "bi-envelope" : "bi-clock";
          const total = (process.successCount || 0) + (process.exceptionCount || 0) + (process.errorCount || 0);

          return (
            <div className="process-completed-row" key={process.processName || i}>
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
