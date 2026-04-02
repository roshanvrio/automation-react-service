import { useAnimation } from "../../context/AnimationContext";
import "./ExitQueue.css";

const ExitQueue = () => {
  const { completingVms } = useAnimation();

  // Convert Map to array for rendering
  const queuedVMs = Array.from(completingVms.entries()).map(([vmKey, { machineName, outcome }]) => ({
    vmKey,
    machineName,
    outcome
  }));

  // Don't render if no VMs in exit queue
  if (queuedVMs.length === 0) {
    return null;
  }

  // Get outcome icon and class
  const getOutcomeIcon = (outcome) => {
    switch (outcome) {
      case 'success':
        return 'bi-check-circle-fill';
      case 'error':
        return 'bi-x-circle-fill';
      case 'exception':
        return 'bi-exclamation-triangle-fill';
      default:
        return 'bi-question-circle-fill';
    }
  };

  return (
    <div className="exit-queue-container">
      <div className="exit-queue-header">
        <i className="bi bi-box-arrow-right"></i>
        <span>Exit Queue</span>
        <span className="exit-queue-count">{queuedVMs.length}</span>
      </div>

      <div className="exit-queue-list">
        {queuedVMs.map((vm, index) => (
          <div
            className={`exit-queue-item outcome-${vm.outcome}`}
            key={vm.vmKey}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <i className={`bi ${getOutcomeIcon(vm.outcome)} outcome-icon`}></i>
            <span className="exit-vm-name">{vm.machineName?.replace(/VM/gi, 'VA')}</span>
            <div className="exit-queue-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExitQueue;
