function BotsRunningCard({ running, total }) {
  return (
    <div style={{
      background: '#1a1a1a',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #333'
    }}>
      <h3 style={{
        color: 'white',
        margin: '0 0 20px 0',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        No. of Bots Running
      </h3>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        height: '130px'
      }}>
        {/* Concentric circles */}
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${100 - i * 16}px`,
              height: `${100 - i * 16}px`,
              border: '2px solid #2a5555',
              borderRadius: '50%',
              opacity: 0.6
            }}
          />
        ))}
        
        {/* Center text */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center'
        }}>
          <span style={{
            color: 'white',
            fontSize: '28px',
            fontWeight: 'bold'
          }}>
            {running}
          </span>
          <span style={{
            color: '#666',
            fontSize: '28px',
            fontWeight: 'bold'
          }}>
            /{total}
          </span>
        </div>
      </div>
    </div>
  );
}

export default BotsRunningCard;