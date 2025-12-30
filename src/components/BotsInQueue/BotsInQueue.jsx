import "./BotsInQueue.css";

const BotsInQueue = ({ queuePriorityUpdate }) => {
  console.log("BotsInQueue Props - queuePriorityUpdate:", queuePriorityUpdate);
  return (
    <div className="dashboard-card card-scroll">
      <div className="card-title text-center">Bots in Queue</div>

      <div className="bots-list">
        {queuePriorityUpdate && queuePriorityUpdate.map((bot, i) => {
          const icon = bot.triggerIndication === "Email" ? "bi-envelope" : "bi-clock";

          return (
            <div className="bot-row" key={i}>

              {/* LEFT ICON + NAME */}
              <div className="bot-left">
                <i className={`bi ${icon}`}></i>
                <span className="bot-name">{bot.processName}</span>
              </div>

              {/* RIGHT STATUS */}
              <div className="bot-right">
                <span className="queue-chip">
                  <i className="bi bi-robot"></i> In Queue
                </span>
                <span className="queue-count">{bot.inQueueCount} /</span>
                <span className="queue-count">{bot.totalCount}</span>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BotsInQueue;
