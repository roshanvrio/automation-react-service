import { useState, useEffect, useRef } from "react";
import Header from "./components/Header/Header";
import BotsInQueue from "./components/BotsInQueue/BotsInQueue";
import VMUtilization from "./components/VMUtilization/VMUtilization";
import TopPerformingVM from "./components/TopPerformingVM/TopPerformingVM";
import ActiveVMs from "./components/ActiveVMs/ActiveVMs";
import Entry from "./components/Entry/Entry";

import "./App.css";

const App = () => {
  const [metrics, setMetrics] = useState({
    exceptions: 0,
    successful: 0,
    totalInQueue: 0,
    errors: 0,
    avgTime: 0
  });
  const [queuePriorityUpdate, setQueuePriorityUpdate] = useState([]);
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

      <div className="container-fluid mt-3">

        {/*Header */}
        <div className="row gx-3">
          <Header metrics={metrics} />

        </div>


        {/*Main content */}
        <div className="row mt-3">

          <div className="col-4">
            <div className="row gy-3">
              <div className="col-12">
                <BotsInQueue queuePriorityUpdate={queuePriorityUpdate} />
              </div>

              <div className="col-12">
                <div className="row gx-2">
                  <div className="col-8">
                    <VMUtilization />
                  </div>
                  <div className="col-4">
                    <TopPerformingVM />
                  </div>
                </div>
              </div>


            </div>
          </div>

          {/* CENTER COLUMN */}
          <div className="col-6">
            <ActiveVMs />
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-2">
            <Entry />
          </div>
        </div>

      </div>
    </div>


  );
};

export default App;
