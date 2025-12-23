import React from 'react';
import { Activity, Zap, Settings, AlertTriangle, Clock, Cpu } from 'lucide-react';

const MetricCard = ({ type, count, label }) => {
  const getIcon = () => {
    switch (type) {
      case 'exception':
        return <Activity size={26} strokeWidth={2.5} />;
      case 'successful':
        return <Zap size={26} strokeWidth={2.5} />;
      case 'progress':
        return <Settings size={26} strokeWidth={2.5} />;
      case 'queue':
        return <Cpu size={26} strokeWidth={2.5} />;
      case 'error':
        return <AlertTriangle size={26} strokeWidth={2.5} />;
      case 'time':
        return <Clock size={26} strokeWidth={2.5} />;
      default:
        return <Activity size={26} strokeWidth={2.5} />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'exception':
        return {
          bgColor: '#0A0E1A',
          borderColor: 'rgba(0, 217, 255, 0.20)',
          iconBg: '#8B5CF633',
          iconColor: '#BF00FF',
          countColor: '#BF00FF'
        };
      case 'successful':
        return {
          bgColor: '#0A0E1A',
          borderColor: 'rgba(0, 217, 255, 0.20)',
          iconBg: '#00C95033',
          iconColor: '#05DF72',
          countColor: '#05DF72'
        };
      case 'progress':
        return {
          bgColor: '#0A0E1A',
          borderColor: 'rgba(0, 217, 255, 0.20)',
          iconBg: 'rgba(14, 165, 233, 0.22)',
          iconColor: '#38bdf8',
          countColor: '#38bdf8'
        };
      case 'queue':
        return {
          bgColor: '#0A0E1A',
          borderColor: 'rgba(0, 217, 255, 0.20)',
          iconBg: '#00D9FF33',
          iconColor: '#00D9FF',
          countColor: '#00D9FF'
        };
      case 'error':
        return {
          bgColor: '#0A0E1A',
          borderColor: 'rgba(0, 217, 255, 0.20)',
          iconBg: '#DF050582',
          iconColor: '#FF0004',
          countColor: '#DF0505'
        };
      case 'time':
        return {
          bgColor: '#0A0E1A',
          borderColor: 'rgba(0, 217, 255, 0.20)',
          iconBg: '#04E1CD75',
          iconColor: '#00FFDD',
          countColor: '#04E1CD'
        };
      default:
        return {
          bgColor: '#0A0E1A',
          borderColor: 'rgba(0, 217, 255, 0.20)',
          iconBg: 'rgba(100, 120, 200, 0.22)',
          iconColor: '#6478c8',
          countColor: '#6478c8'
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className="metric-card"
      style={{
        backgroundColor: styles.bgColor,
        borderColor: styles.borderColor
      }}
    >
      <div
        className="metric-icon"
        style={{
          backgroundColor: styles.iconBg,
          color: styles.iconColor
        }}
      >
        {getIcon()}
      </div>
      <div className="metric-content">
        <div className="metric-count" style={{ color: styles.countColor }}>
          {count}
        </div>
        <div className="metric-label">{label}</div>
      </div>
    </div>
  );
};

export default MetricCard;