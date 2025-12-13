import React from 'react';
import { Activity, Zap, Settings, AlertTriangle, Clock, List } from 'lucide-react';

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
        return <List size={26} strokeWidth={2.5} />;
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
          bgColor: 'rgba(99, 102, 241, 0.12)',
          borderColor: 'rgba(99, 102, 241, 0.35)',
          iconBg: 'rgba(99, 102, 241, 0.22)',
          iconColor: '#818cf8',
          countColor: '#818cf8'
        };
      case 'successful':
        return {
          bgColor: 'rgba(16, 185, 129, 0.12)',
          borderColor: 'rgba(16, 185, 129, 0.35)',
          iconBg: 'rgba(16, 185, 129, 0.22)',
          iconColor: '#34d399',
          countColor: '#34d399'
        };
      case 'progress':
        return {
          bgColor: 'rgba(14, 165, 233, 0.12)',
          borderColor: 'rgba(14, 165, 233, 0.35)',
          iconBg: 'rgba(14, 165, 233, 0.22)',
          iconColor: '#38bdf8',
          countColor: '#38bdf8'
        };
      case 'queue':
        return {
          bgColor: 'rgba(245, 158, 11, 0.12)',
          borderColor: 'rgba(245, 158, 11, 0.35)',
          iconBg: 'rgba(245, 158, 11, 0.22)',
          iconColor: '#fbbf24',
          countColor: '#fbbf24'
        };
      case 'error':
        return {
          bgColor: 'rgba(239, 68, 68, 0.12)',
          borderColor: 'rgba(239, 68, 68, 0.35)',
          iconBg: 'rgba(239, 68, 68, 0.22)',
          iconColor: '#f87171',
          countColor: '#f87171'
        };
      case 'time':
        return {
          bgColor: 'rgba(139, 92, 246, 0.12)',
          borderColor: 'rgba(139, 92, 246, 0.35)',
          iconBg: 'rgba(139, 92, 246, 0.22)',
          iconColor: '#a78bfa',
          countColor: '#a78bfa'
        };
      default:
        return {
          bgColor: 'rgba(100, 120, 200, 0.12)',
          borderColor: 'rgba(100, 120, 200, 0.35)',
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