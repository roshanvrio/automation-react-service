function ScheduledBots() {
  const bots = [
    { name: 'Pick Slip Notification', client: 'ofi', time: '19:59', status: 'scheduled' },
    { name: 'GPaaSoSoService-AReport', client: 'ARISE', time: '20:29', status: 'scheduled' },
    { name: 'PGI Report Outspan', client: 'ofi', time: '20:29', status: 'scheduled' },
    { name: 'BankStatements', client: 'MZM-OGA', time: '20:29', status: 'scheduled' },
    { name: 'PGI Report Repack', client: 'OGH', time: '20:29', status: 'pending' }
  ];

  return (
    <div style={{
      background: '#1a1a1a',
      padding: '12px 15px',
      borderRadius: '12px',
      border: '1px solid #333',
      overflow: 'hidden',
      minWidth: 0
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '1px solid #1a1a1a'
      }}>
        <div>
          <h3 style={{
            color: '#fff',
            margin: '0 0 4px 0',
            fontSize: '14px',
            fontWeight: '600',
            letterSpacing: '0.5px'
          }}>
            Scheduled Bots for Execution
          </h3>
          <p style={{
            color: '#666',
            margin: 0,
            fontSize: '11px'
          }}>
            {bots.length} bots scheduled for today
          </p>
        </div>

        <div style={{
          background: 'rgba(74, 222, 128, 0.15)',
          color: '#4ade80',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: '600',
          border: '1px solid rgba(74, 222, 128, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#4ade80',
            boxShadow: '0 0 8px #4ade80'
          }} />
          All Systems Active
        </div>
      </div>

      {/* Bots Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '12px'
      }}>
        {bots.map((bot, index) => (
          <div
            key={index}
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '233px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.background = 'rgba(74, 158, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(74, 158, 255, 0.4)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(74, 158, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Top accent line */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: bot.status === 'scheduled'
                ? 'linear-gradient(90deg, transparent, #4ade80, transparent)'
                : 'linear-gradient(90deg, transparent, #fbbf24, transparent)',
              opacity: 0.6
            }} />

            {/* Bot Icon */}
            <div style={{
              position: 'relative',
              width: '50px',
              height: '50px',
              background: 'linear-gradient(135deg, #1a4d7a, #2d7acc)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(74, 158, 255, 0.3)',
              marginTop: '4px'
            }}>
              <div style={{
                fontSize: '24px',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }}>
                🤖
              </div>

              {/* Status Indicator */}
              <div style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '14px',
                height: '14px',
                background: bot.status === 'scheduled' ? '#4ade80' : '#fbbf24',
                borderRadius: '50%',
                border: '2px solid #0a0a0a',
                boxShadow: `0 0 12px ${bot.status === 'scheduled' ? '#4ade80' : '#fbbf24'}`
              }} />
            </div>

            {/* Bot Info */}
            <div style={{
              textAlign: 'center',
              width: '100%',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div style={{
                color: '#e5e5e5',
                fontSize: '11px',
                fontWeight: '600',
                marginBottom: '6px',
                lineHeight: '1.3',
                wordBreak: 'break-word',
                minHeight: '85px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {bot.name}
              </div>

              <div>
                <div style={{
                  color: '#888',
                  fontSize: '9px',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: '500'
                }}>
                  {bot.client}
                </div>

                {/* Time Badge */}
                <div style={{
                  background: 'rgba(74, 158, 255, 0.1)',
                  color: '#4a9eff',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                  border: '1px solid rgba(74, 158, 255, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ fontSize: '11px' }}>⏰</span>
                  {bot.time}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ScheduledBots;
