import { useState, useEffect, useRef } from 'react';
import './App.css';
import HoneycombGrid from './components/HoneycombGrid';
import MetricsBar from './components/MetricsBar';
import LeftSidebar from './components/LeftSidebar';

// WebSocket Configuration
const WS_DASHBOARD_URL = 'ws://127.0.0.1:8000/ws/dashboard';
const RECONNECT_INTERVAL = 3000; // 3 seconds

function App() {
  const [metrics, setMetrics] = useState({
    exceptions: 0,
    successful: 0,
    inProgress: 0,
    totalInQueue: 0,
    errors: 0,
    avgTime: 0
  });

  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [queuePriorityData, setQueuePriorityData] = useState([]);
  const [activeVMs, setActiveVMs] = useState([]);
  const [newlyAddedVMs, setNewlyAddedVMs] = useState(new Set()); // Track VMs that just appeared for animation
  // Generate 31 distinct VMs (0-30) with naming convention VM00.BOT, VM01.BOT, etc.
  const generateIdleVMs = () => {
    return Array.from({ length: 31 }, (_, i) => `VM${String(i).padStart(2, '0')}.BOT`);
  };
  const [idleVMs, setIdleVMs] = useState(generateIdleVMs());
  const [poppingVM, setPoppingVM] = useState(null); // VM name that's being assigned
  const [originalCounts, setOriginalCounts] = useState({}); // Track original counts for each process

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const activeVMsRef = useRef([]); // Ref to track current activeVMs for closure
  const isInitialLoadRef = useRef(true); // Skip animation on initial page load
  const animatedVMsRef = useRef(new Set()); // Track VMs that have already been animated

  // Keep ref in sync with state
  useEffect(() => {
    activeVMsRef.current = activeVMs;
  }, [activeVMs]);

  // DEBUG: Function to test animation manually
  const testAnimation = () => {
    if (activeVMs.length > 0) {
      const testVM = activeVMs[0].machineName;
      console.log('🧪 TEST: Triggering animation for:', testVM);
      setNewlyAddedVMs(new Set([testVM]));
      setTimeout(() => {
        setNewlyAddedVMs(new Set());
        console.log('🧪 TEST: Animation cleared');
      }, 3000);
    }
  };

  // Expose test function to window for debugging
  useEffect(() => {
    window.testHexAnimation = testAnimation;
    console.log('🧪 DEBUG: Run window.testHexAnimation() in console to test animation');
  }, [activeVMs]);

  // Unified WebSocket connection for dashboard
  const connectWebSocket = () => {
    try {
      console.log('Connecting to Dashboard WebSocket...');
      const ws = new WebSocket(WS_DASHBOARD_URL);

      ws.onopen = () => {
        console.log('✅ Dashboard WebSocket Connected');
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          switch (message.type) {
            case 'metrics_update':
              console.log('📊 Metrics received:', message.data);
              setMetrics({
                exceptions: message.data.exceptions || 0,
                successful: message.data.successful || 0,
                inProgress: message.data.inProgress || 0,
                totalInQueue: message.data.totalInQueue || 0,
                errors: message.data.errors || 0,
                avgTime: message.data.avgTime || 0
              });
              setLastUpdate(new Date());
              break;

            case 'queue_priority_update':
  console.log('📋 Queue Priority received:', message.data);
  // Debug: Log the first item's structure to see available fields
  if (message.data && message.data.length > 0) {
    console.log('📋 Queue item fields:', Object.keys(message.data[0]));
    console.log('📋 First queue item:', message.data[0]);
  }
  // Track original counts for new processes
  setOriginalCounts(prev => {
    const updated = { ...prev };
    message.data.forEach(item => {
      if (!(item.processName in updated)) {
        updated[item.processName] = item.totalCount;  // NEW field
      }
    });
    return updated;
  });
              setQueuePriorityData(message.data);
              setLastUpdate(new Date());
              break;

            case 'active_vms_update':
              console.log('🖥️ Active VMs received:', message.data);

              // Find NEW VMs that we haven't animated yet
              // Compare against animatedVMsRef which tracks all VMs we've ever shown
              const newVMs = message.data.filter(
                newVM => !animatedVMsRef.current.has(newVM.machineName)
              );

              console.log('📊 Already animated VMs:', Array.from(animatedVMsRef.current));
              console.log('📊 New VMs to animate:', newVMs.map(v => v.machineName));
              console.log('📊 isInitialLoadRef.current:', isInitialLoadRef.current);

              // Check if this is initial load (skip animation on page refresh)
              if (isInitialLoadRef.current) {
                console.log('📦 Initial load - updating VMs without animation');
                // Mark all current VMs as "already animated" so they don't animate later
                message.data.forEach(vm => animatedVMsRef.current.add(vm.machineName));
                setActiveVMs(message.data);
                setLastUpdate(new Date());
                isInitialLoadRef.current = false; // Mark initial load complete
              } else if (newVMs.length > 0) {
                const newVMNames = newVMs.map(vm => vm.machineName);
                console.log('🆕 NEW VMs DETECTED for animation:', newVMNames);

                // Mark these VMs as animated so we don't animate them again
                newVMNames.forEach(name => animatedVMsRef.current.add(name));

                // Step 1: After 1 second, highlight the VM in Entry pool
                setTimeout(() => {
                  setPoppingVM(newVMs[0].machineName);
                  console.log('🎯 Highlighting VM in entry pool:', newVMs[0].machineName);
                }, 1000);

                // Step 2: After 3 seconds, add hexagon with pop animation
                // Set BOTH states together so animation class is applied immediately
                setTimeout(() => {
                  console.log('🎬 Setting animation state AND activeVMs together for:', newVMNames);
                  setNewlyAddedVMs(new Set(newVMNames));
                  setActiveVMs(message.data);
                  setLastUpdate(new Date());
                  console.log('🎬 State should now have newlyAddedVMs:', newVMNames);
                }, 3000);

                // Step 3: Clear animation state after animation completes (2s after hexagon appears)
                setTimeout(() => {
                  setNewlyAddedVMs(new Set());
                  console.log('✅ Pop animation complete, clearing animation state');
                }, 5000);

                // Step 4: Clear the entry pool highlight
                setTimeout(() => {
                  setPoppingVM(null);
                  console.log('✅ Entry pool highlight cleared');
                }, 5500);
              } else {
                // No new VMs, just update immediately
                setActiveVMs(message.data);
                setLastUpdate(new Date());
              }
              break;

            case 'idle_vms_update':
              console.log('💤 Idle VMs received:', message.data);
              setIdleVMs(message.data);
              setLastUpdate(new Date());
              break;

            case 'error':
              console.error(`Error in ${message.source}: ${message.message}`);
              setError(message.message);
              break;

            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket Error:', error);
        setError('WebSocket connection error');
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket Disconnected');
        setIsConnected(false);

        // Attempt to reconnect after delay
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Attempting to reconnect...');
          connectWebSocket();
        }, RECONNECT_INTERVAL);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setError('Failed to establish WebSocket connection');
      setIsConnected(false);
    }
  };

  useEffect(() => {
    // Connect to WebSocket on mount
    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);


  // Transform queue priority data from WebSocket to the format expected by LeftSidebar
  // Calculate total as: current queue count + number of active VMs running that process
  const botsInQueue = queuePriorityData.length > 0
  ? queuePriorityData.map(item => {
      return {
        id: item.processName,
        name: item.processName,
        type: item.triggerIndication === 'Email' ? 'mail' : 'clock',
        status: 'In Queue',
        count: item.inQueueCount.toString(),    // NEW: Numerator (NEW status)
        totalCount: item.totalCount.toString()  // NEW: Denominator (all statuses)
      };
    })
    : [
        // Fallback data when WebSocket is not connected
        { id: 'loading', name: 'Waiting for data...', type: 'clock', status: 'Loading', count: '-', totalCount: '-' }
      ];

  const vmUtilization = [
    { id: 'VM-01', time: '245 mins', color: '#2dd4bf' },
    { id: 'VM-31', time: '245 mins', color: '#26c9b5' },
    { id: 'VM-29', time: '835 mins', color: '#1fb8a6' },
    { id: 'VM-22', time: '520 mins', color: '#1fb8a6' },
    { id: 'VM-05', time: '1087 mins', color: '#14b8a6' },
    { id: 'VM-16', time: '1200 mins', color: '#14b8a6' },
    { id: 'VM-13', time: '152 mins', color: '#2dd4bf' },
    { id: 'VM-01', time: '640 mins', color: '#1fb8a6' },
    { id: 'VM-13', time: '500 mins', color: '#1fb8a6' },
    { id: 'VM-29', time: '900 mins', color: '#14b8a6' },
    { id: 'VM-06', time: '850 mins', color: '#14b8a6' },
    { id: 'VM-11', time: '560 mins', color: '#1fb8a6' },
    { id: 'VM-16', time: '630 mins', color: '#1fb8a6' },
    { id: 'VM-13', time: '245 mins', color: '#2dd4bf' },
    { id: 'VM-29', time: '370 mins', color: '#26c9b5' },
    { id: 'VM-06', time: '720 mins', color: '#1fb8a6' },
    { id: 'VM-18', time: '999 mins', color: '#14b8a6' },
    { id: 'VM-12', time: '580 mins', color: '#1fb8a6' },
    { id: 'VM-25', time: '1350 mins', color: '#14b8a6' },
    { id: 'VM-05', time: '1200 mins', color: '#14b8a6' },
    { id: 'VM-29', time: '740 mins', color: '#1fb8a6' },
    { id: 'VM-27', time: '688 mins', color: '#1fb8a6' },
    { id: 'VM-06', time: '780 mins', color: '#1fb8a6' },
    { id: 'VM-07', time: '210 mins', color: '#2dd4bf' },
    { id: 'VM-13', time: '528 mins', color: '#1fb8a6' },
    { id: 'VM-34', time: '792 mins', color: '#1fb8a6' },
    { id: 'VM-29', time: '348 mins', color: '#26c9b5' },
    { id: 'VM-07', time: '124 mins', color: '#2dd4bf' },
    { id: 'VM-07', time: '1000 mins', color: '#14b8a6' }
  ];

  const topPerformer = {
    id: 'VM-32',
    time: '30000 mins+'
  };

  return (
    <div className="App">
      {/* Connection Status Indicator */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: isConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
        border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
        padding: '4px 8px',
        borderRadius: '4px',
        color: isConnected ? '#34d399' : '#f87171',
        fontSize: '9px',
        zIndex: 1000
      }}>
        <div style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: isConnected ? '#34d399' : '#f87171',
          animation: isConnected ? 'pulse 2s infinite' : 'none'
        }}></div>
        {isConnected ? 'Live' : 'Disconnected'}
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          position: 'absolute',
          top: '50px',
          right: '10px',
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          padding: '8px 16px',
          borderRadius: '6px',
          color: '#f87171',
          fontSize: '12px',
          zIndex: 1000,
          maxWidth: '300px'
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Metrics Bar */}
      <MetricsBar metrics={metrics} />

      {/* Main Content with Sidebar and Grid */}
      <div className="main-content">
        <LeftSidebar
          botsInQueue={botsInQueue}
          vmUtilization={vmUtilization}
          topPerformer={topPerformer}
        />
        <HoneycombGrid
          activeVMs={activeVMs.map(vm => {
            // Find trigger info from queue priority data
            const queueInfo = queuePriorityData.find(q => q.processName === vm.processName);
            return {
              ...vm,
              triggerIndication: queueInfo?.triggerIndication || vm.triggerIndication || 'Schedule',
              rpaTool: queueInfo?.rpaTool || vm.rpaTool || 'UiPath'
            };
          })}
          idleVMs={idleVMs}
          poppingVM={poppingVM}
          newlyAddedVMs={Array.from(newlyAddedVMs)}
        />
      </div>

      {/* Last update indicator */}
      {lastUpdate && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          fontSize: '10px',
          color: '#8b92b2',
          zIndex: 1000
        }}>
          📡 Real-time • Last update: {lastUpdate.toLocaleTimeString()}
        </div>
      )}

    </div>
  );
}

export default App;