import Header from './Header';
import MetricsCard from './MetricsCard';
import BotsRunningCard from './BotsRunningCard';
import TopPerformingBot from './TopPerformingBot';
import TopPerformingBots from './TopPerformingBots';
import BotStatusList from './BotStatusList';
import ScheduledBots from './ScheduledBots';
import CircularCounter from './CircularCounter';
import OrbitalScene from './3d/OrbitalScene';

function Dashboard() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Top Section - Header with Cards */}
      <div style={{
        display: 'flex',
        gap: '10px',
        padding: '10px 15px 0 15px',
        alignItems: 'stretch',
        overflow: 'hidden',
        flexShrink: 0
      }}>
        {/* Header */}
        <div style={{ flex: '0 0 auto', minWidth: '250px' }}>
          <Header />
        </div>

        {/* Top Section - Customer wise Bot program count and Scheduled Bots */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.5fr',
          gap: '10px',
          flex: 1,
          minWidth: 0,
          overflow: 'hidden'
        }}>
        {/* Customer wise Bot program count */}
        <div style={{
          background: '#1a1a1a',
          padding: '12px 15px',
          borderRadius: '8px',
          border: '1px solid #333',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{
            color: 'white',
            margin: '0 0 12px 0',
            fontSize: '13px',
            fontWeight: '500'
          }}>
            Customer wise Bot program count
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            flex: 1,
            alignItems: 'center'
          }}>
            <MetricsCard value={183} label="OA" color="#ff9f40" percentage={75} />
            <MetricsCard value={136} label="ofi" color="#c44bd4" percentage={60} />
            <MetricsCard value={21} label="Arise" color="#888" percentage={20} />
            <MetricsCard value={106} label="Others" color="#a3e635" percentage={45} />
          </div>
        </div>
        
        {/* Scheduled Bots for execution */}
        <ScheduledBots />
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(280px, 350px) 1fr',
        gap: '10px',
        padding: '5px 10px',
        maxHeight:'600px',
        overflow: 'hidden',
        minHeight: 0
      }}>
        {/* Left Sidebar */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        className="hide-scrollbar"
        >
          <BotsRunningCard running={5} total={35} />
          <TopPerformingBot botName="vm22.bot" />
          <TopPerformingBots />
        </div>
        
        {/* Center - 3D Orbital Scene */}
        <div style={{
          position: 'relative',
          background: '#0a0a0a',
          borderRadius: '8px',
          border: '1px solid #333',
          overflow: 'hidden',
          minHeight: 0
        }}>
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 10,
            maxWidth: '400px'
          }}>
            <BotStatusList />
          </div>
          
          <OrbitalScene />
          
          <CircularCounter count={13} />
          
          {/* Page counter */}
          <div style={{
            position: 'absolute',
            bottom: '15px',
            right: '15px',
            color: 'white',
            fontSize: '20px',
            fontFamily: 'monospace',
            fontWeight: 'bold'
          }}>
            5 / 7
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;