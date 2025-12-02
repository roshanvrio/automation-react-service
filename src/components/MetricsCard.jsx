function MetricsCard({ value, label, color, percentage }) {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{
      background: 'linear-gradient(145deg, #1e1e1e, #2a2a2a)',
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid #333',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    }}
    >
      {/* Circular Progress */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <svg width="90" height="90" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx="45"
            cy="45"
            r="40"
            stroke="#2a2a2a"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="45"
            cy="45"
            r="40"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ 
              transition: 'stroke-dashoffset 1s ease',
              filter: `drop-shadow(0 0 6px ${color})`
            }}
          />
        </svg>
        
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <div style={{
            color: 'white',
            fontSize: '26px',
            fontWeight: 'bold',
            fontFamily: 'monospace'
          }}>
            {value}
          </div>
        </div>
      </div>

      {/* Text Content */}
      <div style={{ flex: 1 }}>
        <div style={{
          color: color,
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '5px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {label}
        </div>
        <div style={{
          color: '#888',
          fontSize: '12px',
          marginBottom: '8px'
        }}>
          Bot Programs
        </div>
        <div style={{
          background: '#1a1a1a',
          padding: '4px 12px',
          borderRadius: '4px',
          display: 'inline-block',
          border: `1px solid ${color}30`
        }}>
          <span style={{
            color: color,
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {percentage}%
          </span>
          <span style={{
            color: '#666',
            fontSize: '12px',
            marginLeft: '5px'
          }}>
            Active
          </span>
        </div>
      </div>

      {/* Trend Indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        color: '#4ade80',
        fontSize: '14px',
        fontWeight: '600'
      }}>
        <span>↗</span>
        <span>+12%</span>
      </div>
    </div>
  );
}

export default MetricsCard;