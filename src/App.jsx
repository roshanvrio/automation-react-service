import { useState, useEffect, useRef, useCallback } from "react";
import Header from "./components/Header/Header";
import BotsInQueue from "./components/BotsInQueue/BotsInQueue";
import VMUtilization from "./components/VMUtilization/VMUtilization";
import TopPerformingVM from "./components/TopPerformingVM/TopPerformingVM";
import ActiveVMs from "./components/ActiveVMs/ActiveVMs";
import Entry from "./components/Entry/Entry";
import AnimationOverlay from "./components/AnimationOverlay/AnimationOverlay";
import RobotAnimator from "./components/RobotAnimator";
import ExitQueue from "./components/ExitQueue";
import { AnimationProvider } from "./context/AnimationContext";

import "./App.css";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

// Inner component that uses animation context
const AppContent = () => {
  // Displayed metrics - what Header shows
  const [displayedMetrics, setDisplayedMetrics] = useState({
    exceptions: 0,
    successful: 0,
    totalInQueue: 0,
    errors: 0,
    avgTime: 0
  });
  // Target metrics - from WebSocket
  const targetMetricsRef = useRef({
    exceptions: 0,
    successful: 0,
    totalInQueue: 0,
    errors: 0,
    avgTime: 0
  });
  // Keys currently being highlighted
  const [highlightKeys, setHighlightKeys] = useState([]);
  // Track if first metrics load
  const isFirstMetricsLoad = useRef(true);
  // Track pending VM count in ActiveVMs (shared ref)
  const pendingVmCountRef = useRef(0);

  const [queuePriorityUpdate, setQueuePriorityUpdate] = useState([]);
  const [activeVmUpdate, setActiveVmUpdate] = useState([]);
  const [idleVmUpdate, setIdleVmUpdate] = useState([]);
  const [vmUtilizationUpdate, setVmUtilizationUpdate] = useState([]);
  const [topPerformer, setTopPerformer] = useState(null);
  const [completedTransactions, setCompletedTransactions] = useState({
    successful: [],
    error: [],
    exception: []
  });
  const [vmCompletedTransactions, setVmCompletedTransactions] = useState([]);
  const wsRef = useRef(null);

  // Sync metrics directly to target (with highlight animation)
  const syncMetricsToTarget = useCallback(() => {
    const target = targetMetricsRef.current;

    setDisplayedMetrics(prev => {
      const keysToHighlight = [];
      const metricKeys = ['totalInQueue', 'successful', 'exceptions', 'errors', 'avgTime'];

      metricKeys.forEach(key => {
        const current = prev[key] || 0;
        const targetVal = target[key] || 0;
        if (current !== targetVal) {
          keysToHighlight.push(key);
        }
      });

      // Trigger highlight animation (0.4s × 8 blinks = 3.2s)
      if (keysToHighlight.length > 0) {
        setHighlightKeys(keysToHighlight);
        setTimeout(() => setHighlightKeys([]), 3200);
      }

      return { ...target };
    });
  }, []);

  // Called when a VM animation completes - update metrics one step
  const onVmProcessed = useCallback(() => {
    const target = targetMetricsRef.current;

    setDisplayedMetrics(prev => {
      const newMetrics = { ...prev };
      const keysToHighlight = [];

      // Move each metric one step towards target
      const metricKeys = ['totalInQueue', 'successful', 'exceptions', 'errors', 'avgTime'];

      metricKeys.forEach(key => {
        const current = prev[key] || 0;
        const targetVal = target[key] || 0;

        if (current < targetVal) {
          newMetrics[key] = current + 1;
          keysToHighlight.push(key);
        } else if (current > targetVal) {
          newMetrics[key] = current - 1;
          keysToHighlight.push(key);
        }
      });

      // Trigger highlight animation (0.4s × 8 blinks = 3.2s)
      if (keysToHighlight.length > 0) {
        setHighlightKeys(keysToHighlight);
        setTimeout(() => setHighlightKeys([]), 3200);
      }

      return newMetrics;
    });
  }, []);

  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket(SOCKET_URL);

      ws.onopen = () => {
        console.log("WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          //console.log("WebSocket Response:", message);
          if (message.type === "metrics_update" && message.data) {
            //console.log("Metrics Data:", message.data);
            // Store as target
            targetMetricsRef.current = message.data;

            // First load - set displayed immediately
            if (isFirstMetricsLoad.current) {
              isFirstMetricsLoad.current = false;
              setDisplayedMetrics(message.data);
            } else {
              // If no pending VM animations, sync metrics directly
              if (pendingVmCountRef.current === 0) {
                syncMetricsToTarget();
              }
              // Otherwise, metrics will update via onVmProcessed
            }
          }
          if (message.type === "queue_priority_update" && message.data) {
            //console.log("Queue Priority Update:", message.data);
            setQueuePriorityUpdate(message.data);
          }
          if (message.type === "active_vms_update" && message.data) {
            //console.log("Active VM Update:", message.data);
            setActiveVmUpdate(message.data);
          }
          if (message.type === "idle_vms_update" && message.data) {
            //console.log("Idle VM Update:", message.data);
            setIdleVmUpdate(message.data);
          }
          if (message.type === "vm_utilization_update" && message.data) {
            //console.log("VM Utilization Update:", message.data);
            setVmUtilizationUpdate(message.data.vmUtilization || []);
            setTopPerformer(message.data.topPerformer || null);
          }
          if (message.type === "completed_transactions_update" && message.data) {
            //console.log("Completed Transactions Update:", message.data);
            setCompletedTransactions(message.data);
          }
          if (message.type === "vm_completed_transactions_update" && message.data) {
            console.log("VM Completed Transactions Update:", message.data);
            setVmCompletedTransactions(message.data);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected. Reconnecting in 3 seconds...");
        setTimeout(connectWebSocket, 3000);
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <div className="app-root">
      {/* Animation overlay for flying icons */}
      <AnimationOverlay />
      {/* Robot mascot animation */}
      <RobotAnimator />
      {/* Exit queue overlay showing VMs waiting to be processed */}
      <ExitQueue />

      <div className="container-fluid">

        {/*Header */}
        <Header metrics={displayedMetrics} highlightKeys={highlightKeys} />


        {/*Main content */}
        <div className="main-content-grid">

          {/* LEFT COLUMN */}
          <div className="left-column-grid">
            <BotsInQueue queuePriorityUpdate={queuePriorityUpdate} />
            <VMUtilization vmUtilizationUpdate={vmUtilizationUpdate} />
          </div>

          {/* CENTER COLUMN */}
          <div className="center-column">
            <ActiveVMs
              activeVmUpdate={activeVmUpdate}
              onVmProcessed={onVmProcessed}
              pendingVmCountRef={pendingVmCountRef}
              completedTransactions={completedTransactions}
              vmCompletedTransactions={vmCompletedTransactions}
            />
          </div>

          {/* RIGHT COLUMN - Entry + TopPerforming stacked */}
          <div className="right-column-grid">
            <Entry idleVmUpdate={idleVmUpdate} />
            <TopPerformingVM topPerformer={topPerformer} />
          </div>
        </div>

      </div>
    </div>
  );
};

// Main App wrapped with AnimationProvider
const App = () => {
  return (
    <AnimationProvider>
      <AppContent />
    </AnimationProvider>
  );
};

export default App;
