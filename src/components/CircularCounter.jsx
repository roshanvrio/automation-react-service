function CircularCounter({ count }) {
  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      width: '80px',
      height: '80px'
    }}>
      <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="40"
          cy="40"
          r="35"
          stroke="#444"
          strokeWidth="3"
          fill="none"
        />
        <circle
          cx="40"
          cy="40"
          r="35"
          stroke="white"
          strokeWidth="3"
          fill="none"
          strokeDasharray={220}
          strokeDashoffset={0}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        {count}
      </div>
    </div>
  );
}

export default CircularCounter;