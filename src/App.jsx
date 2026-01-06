import { useState, useEffect, useRef } from "react";
import Header from "./components/Header/Header";
import BotsInQueue from "./components/BotsInQueue/BotsInQueue";
import VMUtilization from "./components/VMUtilization/VMUtilization";
import TopPerformingVM from "./components/TopPerformingVM/TopPerformingVM";
import ActiveVMs from "./components/ActiveVMs/ActiveVMs";
import Entry from "./components/Entry/Entry";
import AnimationOverlay from "./components/AnimationOverlay/AnimationOverlay";
import { AnimationProvider } from "./context/AnimationContext";

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
  const wsRef = useRef(null);

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
            setActiveVmUpdate(message.data);
          }
          if (message.type === "idle_vms_update" && message.data) {
            console.log("Idle VM Update:", message.data);
            setIdleVmUpdate(message.data);
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
            <ActiveVMs activeVmUpdate={activeVmUpdate} />
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
