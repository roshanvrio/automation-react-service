import { useState, useEffect, useRef } from "react";
import Header from "./components/Header/Header";
import BotsInQueue from "./components/BotsInQueue/BotsInQueue";
import VMUtilization from "./components/VMUtilization/VMUtilization";
import TopPerformingVM from "./components/TopPerformingVM/TopPerformingVM";
import ActiveVMs from "./components/ActiveVMs/ActiveVMs";
import Entry from "./components/Entry/Entry";
import AnimationOverlay from "./components/AnimationOverlay/AnimationOverlay";
import { AnimationProvider, useAnimation } from "./context/AnimationContext";

import "./App.css";

// Inner component that uses animation context
const AppContent = () => {
  const [metrics, setMetrics] = useState({
    exceptions: 0,
    successful: 0,
    totalInQueue: 0,
    errors: 0,
    avgTime: 0
  });
  const [queuePriorityUpdate, setQueuePriorityUpdate] = useState([]);
  const [activeVmUpdate, setActiveVmUpdate] = useState([]);
  const [idleVmUpdate, setIdleVmUpdate] = useState([]);
  const [vmUtilizationUpdate, setVmUtilizationUpdate] = useState([]);
  const [topPerformer, setTopPerformer] = useState(null);
  // Track initial VMs that were present on first load (no animation needed)
  const [initialVms, setInitialVms] = useState([]);
  const wsRef = useRef(null);
  const prevActiveVmsRef = useRef([]);
  const isFirstLoad = useRef(true);
  // Pending messages for batched processing
  const pendingUpdates = useRef({ active: null, idle: null });
  // Timer for batched processing to prevent duplicate calls
  const batchTimer = useRef(null);

  const { queueAnimations } = useAnimation();

  // Process batched updates - detect new VMs BEFORE state updates
  const processBatchedUpdates = () => {
    // Clear the timer
    batchTimer.current = null;

    const { active, idle } = pendingUpdates.current;

    // Only process if we have data
    if (!active && !idle) return;

    if (active) {
      // First load - just store initial VMs (NO animations)
      if (isFirstLoad.current) {
        console.log("FIRST LOAD - storing initial VMs, NO animations:", active.map(vm => vm.machineName));
        isFirstLoad.current = false;
        const initialMachineNames = active.map(vm => vm.machineName);
        setInitialVms(initialMachineNames);
        prevActiveVmsRef.current = initialMachineNames;
        // IMPORTANT: Do NOT call queueAnimations here
      } else {
        // Subsequent updates - detect new active VMs
        const prevMachineNames = prevActiveVmsRef.current;
        const newActiveVms = active.filter(
          vm => !prevMachineNames.includes(vm.machineName)
        );

        console.log("Subsequent update - prev:", prevMachineNames, "current:", active.map(vm => vm.machineName), "new:", newActiveVms.map(v => v.machineName));

        if (newActiveVms.length > 0) {
          console.log("Queueing animations for new VMs:", newActiveVms.length, newActiveVms.map(v => v.machineName));
          // Queue animations NOW while Entry still has the VMs
          queueAnimations(newActiveVms);
        }

        prevActiveVmsRef.current = active.map(vm => vm.machineName);
      }

      setActiveVmUpdate(active);
    }

    if (idle) {
      setIdleVmUpdate(idle);
    }

    // Clear pending
    pendingUpdates.current = { active: null, idle: null };
  };

  // Schedule batched processing (debounced)
  const scheduleBatchProcessing = () => {
    // Clear existing timer to prevent duplicate calls
    if (batchTimer.current) {
      clearTimeout(batchTimer.current);
    }
    // Schedule new processing
    batchTimer.current = setTimeout(processBatchedUpdates, 50);
  };

  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket("ws://127.0.0.1:8000/ws/dashboard");

      ws.onopen = () => {
        console.log("WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("WebSocket Response:", message);
          if (message.type === "metrics_update" && message.data) {
            console.log("Metrics Data:", message.data);
            setMetrics(message.data);
          }
          if (message.type === "queue_priority_update" && message.data) {
            console.log("Queue Priority Update:", message.data);
            setQueuePriorityUpdate(message.data);
          }
          if (message.type === "active_vms_update" && message.data) {
            console.log("Active VM Update:", message.data);
            // Store for batched processing
            pendingUpdates.current.active = message.data;
            scheduleBatchProcessing();
          }
          if (message.type === "idle_vms_update" && message.data) {
            console.log("Idle VM Update:", message.data);
            // Store for batched processing
            pendingUpdates.current.idle = message.data;
            scheduleBatchProcessing();
          }
          if (message.type === "vm_utilization_update" && message.data) {
            console.log("VM Utilization Update:", message.data);
            setVmUtilizationUpdate(message.data.vmUtilization || []);
            setTopPerformer(message.data.topPerformer || null);
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

      <div className="container-fluid">

        {/*Header */}
        <div className="row gx-3">
          <Header metrics={metrics} />

        </div>


        {/*Main content */}
        <div className="row mt-3">

          <div className="col-4">
            <div className="row gy-3">
              <div className="col-12 mb-5">
                <BotsInQueue queuePriorityUpdate={queuePriorityUpdate} />
              </div>

              <div className="col-12">
                <div className="row gx-2 mt-5">
                  <div className="col-7">
                    <VMUtilization vmUtilizationUpdate={vmUtilizationUpdate} />
                  </div>
                  <div className="col-5">
                    <TopPerformingVM topPerformer={topPerformer} />
                  </div>
                </div>
              </div>


            </div>
          </div>

          {/* CENTER COLUMN */}
          <div className="col-6">
            <ActiveVMs activeVmUpdate={activeVmUpdate} initialVms={initialVms} />
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-2">
            <Entry idleVmUpdate={idleVmUpdate} />
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
