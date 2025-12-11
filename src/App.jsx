import { useState, useEffect } from 'react';
import './App.css';
import HoneycombGrid from './components/HoneycombGrid';
import MetricsBar from './components/MetricsBar';
import LeftSidebar from './components/LeftSidebar';

function App() {
  const [scale, setScale] = useState(1);
  const [metrics, setMetrics] = useState({
    exceptions: 9,
    successful: 25,
    inProgress: 7,
    errors: 25,
    avgTime: 25
  });

  // Auto-scale based on screen size
  useEffect(() => {
    const calculateScale = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const baseWidth = 1920;
      const baseHeight = 1080;
      const scaleX = width / baseWidth;
      const scaleY = height / baseHeight;
      const newScale = Math.min(scaleX, scaleY);
      setScale(newScale);
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  // Fetch metrics from API
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch('/api/metrics');
        const data = await response.json();
        setMetrics({
          exceptions: data.exceptions || 0,
          successful: data.successful || 0,
          inProgress: data.inProgress || 0,
          errors: data.errors || 0,
          avgTime: data.avgTime || 0
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
        // Keep default values on error
      }
    };

    // Fetch initially
    fetchMetrics();

    // Fetch every 30 seconds
    const metricsInterval = setInterval(fetchMetrics, 30000);
    
    return () => clearInterval(metricsInterval);
  }, []);

  const vmData = [
    {
      id: 'VM-34',
      task: 'Account Creation',
      utilization: '800 mins',
      status: 'schedule',
      isTopPerforming: true,
      automation: 'uipath'
    },
    {
      id: 'VM-03',
      task: 'Access Control',
      utilization: '150 mins',
      status: 'email',
      automation: 'uipath'
    },
    {
      id: 'VM-14',
      task: 'System Backup',
      utilization: '512 mins',
      status: 'schedule',
      automation: 'uipath'
    },
    {
      id: 'VM-22',
      task: 'Data Sync',
      utilization: '345 mins',
      automation: 'uipath'
    },
    {
      id: 'VM-05',
      task: 'Log Monitoring',
      utilization: '430 mins',
      status: 'clock',
      automation: 'uipath'
    },
    {
      id: 'VM-32',
      task: 'Process 2234',
      utilization: '200 mins',
      status: 'clock',
      automation: 'uipath'
    },
    {
      id: 'VM-18',
      task: 'Network Configuration',
      utilization: '215 mins',
      status: 'clock',
      automation: 'uipath'
    },
    {
      id: 'VM-27',
      task: 'Incident Response',
      utilization: '360 mins',
      status: 'clock',
      automation: 'uipath'
    },
    {
      id: 'VM-11',
      task: 'Resource Allocation',
      utilization: '487 mins',
      status: 'clock',
      automation: 'uipath'
    },
    {
      id: 'VM-31',
      task: 'Patch Management',
      utilization: '590 mins',
      status: 'clock',
      automation: 'uipath'
    }
  ];

  const botsInQueue = [
    { name: 'Nigeria Reports - NG31', type: 'mail', status: 'In Queue', count: '312' },
    { name: 'Nigeria Reports - NG36', type: 'mail', status: 'In Queue', count: '300' },
    { name: 'InvoiceVetting', type: 'clock', status: 'In Queue', count: '289' },
    { name: 'PO Creation_Posting GR_Remittance Advice', type: 'clock', status: 'In Queue', count: '245' },
    { name: 'Shipment Instruction & Booking Advise Creatio', type: 'clock', status: 'In Queue', count: '234' },
    { name: 'Invoice Indexing & Posting in OTM Automation', type: 'clock', status: 'In Queue', count: '198' },
    { name: 'QualitricsAutomation', type: 'mail', status: 'In Queue', count: '176' },
    { name: 'TSF - MECR', type: 'clock', status: 'In Queue', count: '156' },
    { name: 'PixelPilot88.bot', type: 'clock', status: 'In Queue', count: '143' }
  ];

  const vmUtilization = [
    { id: 'VM-01', time: '245 mins', color: '#2dd4bf' },
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
    <div className="App" style={{
      transform: `scale(${scale})`,
      transformOrigin: 'center center',
      width: '100vw',
      height: '100vh'
    }}>
      {/* Metrics Bar */}
      <MetricsBar metrics={metrics} />

      {/* Main Content with Sidebar and Grid */}
      <div className="main-content">
        <LeftSidebar
          botsInQueue={botsInQueue}
          vmUtilization={vmUtilization}
          topPerformer={topPerformer}
        />
        <HoneycombGrid vmData={vmData} />
      </div>
    </div>
  );
}

export default App;