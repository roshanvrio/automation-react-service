import React from 'react';
import { Clock, Mail, Server } from 'lucide-react';

const HexagonCard = ({ vm }) => {
  const getStatusIcon = () => {
    switch (vm.status) {
      case 'clock':
        return <Clock size={16} />;
      case 'email':
        return <Mail size={16} />;
      case 'schedule':
        return <Clock size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className={`hexagon ${vm.isTopPerforming ? 'top-performing' : ''}`}>
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
          {vm.isTopPerforming && (
            <div className="top-label">TOP PERFORMING VM</div>
          )}
          
          <div className="vm-header">
            <Server size={18} />
            <span className="vm-id">{vm.id}</span>
          </div>

          {vm.status && (
            <div className="status-badge">
              {getStatusIcon()}
              <span>Schedule</span>
            </div>
          )}

          <div className="task-name">{vm.task}</div>

          <div className="utilization">
            <span className="util-label">VM Utilisation</span>
            <span className="util-value">{vm.utilization}</span>
          </div>

          {vm.automation && (
            <div className="automation-badge">
              <span className="uipath-logo">UI</span>
              <span>Path</span>
            </div>
          )}
        </div>

        <div className="hex-connector"></div>
      </div>
    </div>
  );
};

export default HexagonCard;