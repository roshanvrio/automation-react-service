function Header() {
  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
  
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div style={{
      background: '#1a1a1a',
      padding: '15px 25px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #333'
    }}>
      <div>
        <h1 style={{
          color: '#ff4444',
          fontSize: '28px',
          margin: 0,
          fontWeight: 'bold',
          letterSpacing: '2px'
        }}>
          MINDSPRINT
        </h1>
        <p style={{
          color: '#888',
          margin: '6px 0 0 0',
          fontSize: '12px',
          letterSpacing: '1px'
        }}>
          BUSINESS PROCESS SERVICES
        </p>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div style={{
          color: 'white',
          fontSize: '32px',
          fontWeight: 'bold',
          fontFamily: 'monospace'
        }}>
          {currentTime}
        </div>
        <div style={{
          color: '#888',
          fontSize: '13px',
          marginTop: '5px'
        }}>
          {currentDate}
        </div>
      </div>
    </div>
  );
}

export default Header;