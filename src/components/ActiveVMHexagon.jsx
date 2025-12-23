import { Monitor, Mail, Clock } from 'lucide-react';

// SVG Hexagon outline with dashed stroke
const HexagonOutline = ({ className = '' }) => (
  <svg
    className={`hexagon-outline ${className}`}
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
  >
    <polygon
      points="25,0 75,0 100,50 75,100 25,100 0,50"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="0.6"
      strokeDasharray="8,4"
      strokeLinecap="round"
    />
  </svg>
);

const ActiveVMHexagon = ({ machineName, processName, triggerType, rpaTool }) => {
  const isEmailTrigger = triggerType?.toLowerCase() === 'email';

  return (
    <div className="hexagon active-vm-hexagon">
      {/* SVG Dashed Hexagon Outline */}
      <HexagonOutline />

      <div className="hexagon-inner">
        <div className="hexagon-content">
          {/* Trigger Type indicator */}
          <div className={`trigger-type-badge ${isEmailTrigger ? 'email-trigger' : 'schedule-trigger'}`}>
            {isEmailTrigger ? <Mail size={10} /> : <Clock size={10} />}
            <span>{isEmailTrigger ? 'Email' : 'Schedule'}</span>
          </div>

          {/* VM Name */}
          <div className="vm-header">
            <Monitor size={16} />
            <span className="vm-id">{machineName}</span>
          </div>

          {/* Process Name */}
          <div className="task-name active-process-name">{processName}</div>

          {/* RPA Tool indicator */}
          <div className="rpa-tool-badge">
            <span className="rpa-tool-name">{rpaTool || 'UiPath'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveVMHexagon;
