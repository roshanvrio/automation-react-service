import React from 'react';
import { Monitor, Play } from 'lucide-react';

const ActiveVMHexagon = ({ machineName, processName }) => {
  return (
    <div className="hexagon active-vm-hexagon">
      {/* Hexagon dots - 8 dots per side = 48 total dots */}
      <div className="hexagon-dots">
        {/* Top-left edge - 8 dots */}
        {[...Array(8)].map((_, i) => (
          <div key={`tl-${i}`} className="dot dot-top-left" style={{ '--dot-index': i }}></div>
        ))}

        {/* Top-right edge - 8 dots */}
        {[...Array(8)].map((_, i) => (
          <div key={`tr-${i}`} className="dot dot-top-right" style={{ '--dot-index': i }}></div>
        ))}

        {/* Right edge - 8 dots */}
        {[...Array(8)].map((_, i) => (
          <div key={`r-${i}`} className="dot dot-right" style={{ '--dot-index': i }}></div>
        ))}

        {/* Bottom-right edge - 8 dots */}
        {[...Array(8)].map((_, i) => (
          <div key={`br-${i}`} className="dot dot-bottom-right" style={{ '--dot-index': i }}></div>
        ))}

        {/* Bottom-left edge - 8 dots */}
        {[...Array(8)].map((_, i) => (
          <div key={`bl-${i}`} className="dot dot-bottom-left" style={{ '--dot-index': i }}></div>
        ))}

        {/* Left edge - 8 dots */}
        {[...Array(8)].map((_, i) => (
          <div key={`l-${i}`} className="dot dot-left" style={{ '--dot-index': i }}></div>
        ))}
      </div>

      <div className="hexagon-inner">
        <div className="hexagon-content">
          {/* Status indicator - In Progress */}
          <div className="active-vm-status">
            <Play size={12} className="status-icon" />
            <span>IN PROGRESS</span>
          </div>

          {/* VM Name */}
          <div className="vm-header">
            <Monitor size={18} />
            <span className="vm-id">{machineName}</span>
          </div>

          {/* Process Name */}
          <div className="task-name active-process-name">{processName}</div>

          {/* Running indicator */}
          <div className="running-indicator">
            <span className="pulse-dot"></span>
            <span className="running-text">Running</span>
          </div>
        </div>

        <div className="hex-connector"></div>
      </div>
    </div>
  );
};

export default ActiveVMHexagon;
