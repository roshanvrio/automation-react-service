import { useState, useRef, useEffect } from "react";
import { useAnimation } from "../../context/AnimationContext";
import "./BotsInQueue.css";
import Queue from "../../assets/Queue.png"

// Component to animate a single count value step by step
const AnimatedCount = ({ value, stepDuration = 400, className }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const animationRef = useRef(null);

  useEffect(() => {
    // Clear any existing animation
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }

    if (displayValue === value) return;

    const step = value > displayValue ? 1 : -1;

    animationRef.current = setInterval(() => {
      setDisplayValue(prev => {
        const next = prev + step;
        // Check if we've reached or passed the target
        if ((step > 0 && next >= value) || (step < 0 && next <= value)) {
          clearInterval(animationRef.current);
          animationRef.current = null;
          return value;
        }
        return next;
      });
    }, stepDuration);

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [value, stepDuration]);

  // Initialize on first render with actual value
  useEffect(() => {
    setDisplayValue(value);
  }, []);

  return <span className={className}>{displayValue}</span>;
};

const BotsInQueue = ({ queuePriorityUpdate }) => {
  const [changes, setChanges] = useState({});
  const prevCounts = useRef({});
  const { registerBotRef, highlightedBot, ghostBot } = useAnimation();

  // Build list of bots including ghost bot if needed
  const buildBotList = () => {
    const botList = Array.isArray(queuePriorityUpdate) ? [...queuePriorityUpdate] : [];

    // Add ghost bot if it's not already in the list (ensures row stays visible during animation)
    if (ghostBot && ghostBot.processName) {
      const ghostExists = botList.some(bot => bot.processName === ghostBot.processName);
      if (!ghostExists) {
        botList.push({
          processName: ghostBot.processName,
          triggerIndication: ghostBot.triggerIndication,
          inQueueCount: 0,
          totalCount: 0,
          isGhost: true
        });
      }
    }

    return botList;
  };

  const botList = buildBotList();

  // Ref callback to register bot row elements
  const setRowRef = (processName) => (element) => {
    if (element) {
      registerBotRef(processName, element);
    }
  };

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
    <div className="dashboard-cards card-scroll">
      <div className="card-title text-center">Bots in Queue</div>

      <div className="bots-list card-scroll">
        {botList.map((bot, i) => {
          const icon = bot.triggerIndication === "Email" ? "bi-envelope" : "bi-clock";
          // const icon = bot.triggerIndication && bot.triggerIndication === "Email" ? "bi-envelope" : "bi-clock";
          const key = `${bot.processName}-${i}`;
          const change = changes[key];

          const isHighlighted = highlightedBot === bot.processName;
          const isGhost = bot.isGhost === true;

          return (
            <div
              className={`bot-row ${isHighlighted ? 'bot-highlighted' : ''} ${isGhost ? 'bot-ghost' : ''}`}
              key={bot.processName || i}
              ref={setRowRef(bot.processName)}
            >

              {/* LEFT ICON + NAME */}
              <div className="bot-left">
                <i className={`bi ${icon}`}></i>
                <span className="bot-name">{bot.processName}</span>
              </div>

              {/* RIGHT STATUS */}
              <div className="bot-right">
                <span className="queue-chip">
                  <img src={Queue} alt="In Queue" className="queue-icon" /> In Queue
                </span>

                <span className="count-container">
                  {change?.inQueueDiff && (
                    <span className={`count-badge ${change.inQueueDiff > 0 ? 'positive' : 'negative'}`}>
                      {change.inQueueDiff > 0 ? `+${change.inQueueDiff}` : change.inQueueDiff}
                    </span>
                  )}
                  <AnimatedCount
                    value={bot.inQueueCount}
                    stepDuration={3100}
                    className={`queue-count ${change?.inQueueDiff ? 'glow-pulse' : ''}`}
                  />
                </span>

                <span className="queue-count"> / </span>

                <span className="count-container">
                  {change?.totalDiff && (
                    <span className={`count-badge ${change.totalDiff > 0 ? 'positive' : 'negative'}`}>
                      {change.totalDiff > 0 ? `+${change.totalDiff}` : change.totalDiff}
                    </span>
                  )}
                  <AnimatedCount
                    value={bot.totalCount}
                    stepDuration={3100}
                    className={`queue-count ${change?.totalDiff ? 'glow-pulse' : ''}`}
                  />
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
