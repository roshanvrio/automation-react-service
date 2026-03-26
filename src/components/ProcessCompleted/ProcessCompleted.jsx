import "./ProcessCompleted.css";

const ProcessCompleted = ({ processCompletedUpdate }) => {
  const processes = Array.isArray(processCompletedUpdate) ? processCompletedUpdate : [];

  return (
    <div className="dashboard-cards card-scroll">
      <div className="card-title text-center">Process Completed - {processes.length}</div>

      <div className="process-completed-list">
        {processes.map((process, i) => {
          const icon = process.triggerIndication === "Email" ? "bi-envelope" : "bi-clock";

          return (
            <div className="process-completed-row" key={process.processName || i}>
              <div className="process-completed-left">
                <i className={`bi ${icon}`}></i>
                <span className="process-completed-name">{process.processName}</span>
              </div>
              <div className="process-completed-right">
                <span className="completed-count">{process.completedCount}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessCompleted;
