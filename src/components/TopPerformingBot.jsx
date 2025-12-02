function TopPerformingBot({ botName }) {
  return (
    <div style={{
      background: '#1a1a1a',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #333'
    }}>
      <h3 style={{
        color: 'white',
        margin: '0 0 20px 0',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        Top Performing Bot
      </h3>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px',
        paddingBottom: '10px'
      }}>
        {/* Bot icon representation */}
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #4a9eff, #2d7acc)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(74, 158, 255, 0.5)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'white',
              borderRadius: '50%'
            }} />
          </div>
          
          {/* Sparkles */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '3px',
                height: '3px',
                background: '#ffdd00',
                borderRadius: '50%',
                top: `${Math.random() * 60}px`,
                left: `${Math.random() * 60}px`,
                animation: `sparkle ${1 + Math.random()}s infinite`
              }}
            />
          ))}
        </div>
        
        <div style={{
          color: 'white',
          fontSize: '16px',
          fontWeight: '500',
          fontFamily: 'monospace'
        }}>
          {botName}
        </div>
      </div>
    </div>
  );
}

export default TopPerformingBot;