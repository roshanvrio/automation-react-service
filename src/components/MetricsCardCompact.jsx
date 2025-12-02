function MetricsCardCompact({ value, label, color, percentage, icon }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)',
      padding: '20px',
      borderRadius: '10px',
      border: '1px solid #333',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = color;
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = `0 8px 20px ${color}40`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = '#333';
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
    >
      {/* Background Accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100px',
        height: '100px',
        background: `radial-gradient(circle, ${color}20, transparent)`,
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          background: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${color}40`
        }}>
          <span style={{ fontSize: '20px' }}>{icon || '🤖'}</span>
        </div>
        
        <div style={{
          background: `${color}20`,
          color: color,
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 'bold'
        }}>
          {percentage}%
        </div>
      </div>

      {/* Value */}
      <div style={{
        fontSize: '36px',
        fontWeight: 'bold',
        color: 'white',
        marginBottom: '5px',
        fontFamily: 'monospace'
      }}>
        {value}
      </div>

      {/* Label */}
      <div style={{
        color: '#888',
        fontSize: '13px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '10px'
      }}>
        {label}
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '4px',
        background: '#2a2a2a',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          transition: 'width 1s ease',
          boxShadow: `0 0 10px ${color}`
        }} />
      </div>
    </div>
  );
}

export default MetricsCardCompact;