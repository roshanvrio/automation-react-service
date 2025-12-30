import { useState, useRef, useEffect } from "react";
import "./BotsInQueue.css";

const BotsInQueue = ({ queuePriorityUpdate }) => {
  const [changes, setChanges] = useState({});
  const prevCounts = useRef({});

  useEffect(() => {
    if (!queuePriorityUpdate) return;

    const newChanges = {};

    queuePriorityUpdate.forEach((bot, i) => {
      const key = `${bot.processName}-${i}`;
      const prev = prevCounts.current[key];

      if (prev) {
        const inQueueDiff = bot.inQueueCount - prev.inQueue;
        const totalDiff = bot.totalCount - prev.total;

        if (inQueueDiff !== 0 || totalDiff !== 0) {
          newChanges[key] = { inQueueDiff, totalDiff };
        }
      }

      prevCounts.current[key] = {
        inQueue: bot.inQueueCount,
        total: bot.totalCount
      };
    });

    if (Object.keys(newChanges).length > 0) {
      setChanges(newChanges);
      setTimeout(() => setChanges({}), 2000);
    }
  }, [queuePriorityUpdate]);

  return (
    <div className="dashboard-card card-scroll">
      <div className="card-title text-center">Bots in Queue</div>

      <div className="bots-list">
        {queuePriorityUpdate && queuePriorityUpdate.map((bot, i) => {
          const icon = bot.triggerIndication === "Email" ? "bi-envelope" : "bi-clock";
          const key = `${bot.processName}-${i}`;
          const change = changes[key];

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

                <span className="count-container">
                  {change?.inQueueDiff && (
                    <span className={`count-badge ${change.inQueueDiff > 0 ? 'positive' : 'negative'}`}>
                      {change.inQueueDiff > 0 ? `+${change.inQueueDiff}` : change.inQueueDiff}
                    </span>
                  )}
                  <span className={`queue-count ${change?.inQueueDiff ? 'glow-pulse' : ''}`}>
                    {bot.inQueueCount}
                  </span>
                </span>

                <span className="queue-count"> /</span>

                <span className="count-container">
                  {change?.totalDiff && (
                    <span className={`count-badge ${change.totalDiff > 0 ? 'positive' : 'negative'}`}>
                      {change.totalDiff > 0 ? `+${change.totalDiff}` : change.totalDiff}
                    </span>
                  )}
                  <span className={`queue-count ${change?.totalDiff ? 'glow-pulse' : ''}`}>
                    {bot.totalCount}
                  </span>
                </span>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BotsInQueue;
