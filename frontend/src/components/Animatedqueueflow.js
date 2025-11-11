import React, { useEffect, useState } from "react";
import mockData from "../data/mockData.json";

export default function AnimatedQueueFlow() {
  const [currentTask, setCurrentTask] = useState(null);
  const [animationPhase, setAnimationPhase] = useState("queue"); // queue, moving, processing, complete
  const [queuedTasks, setQueuedTasks] = useState([]);
  const [processingTasks, setProcessingTasks] = useState([]);
  
  useEffect(() => {
    // Load initial data
    setQueuedTasks(mockData.queued_tasks.slice(0, 5));
    setProcessingTasks(mockData.active_bots.slice(0, 3));
    
    // Start animation cycle
    const interval = setInterval(() => {
      animateTaskFlow();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const animateTaskFlow = () => {
    // Simulate taking a task from queue
    setAnimationPhase("moving");
    const task = queuedTasks[0];
    setCurrentTask(task);
    
    setTimeout(() => {
      setAnimationPhase("processing");
    }, 2000);
    
    setTimeout(() => {
      setAnimationPhase("complete");
      // Remove from queue and add to processing
      setQueuedTasks(prev => prev.slice(1));
    }, 4000);
    
    setTimeout(() => {
      setCurrentTask(null);
      setAnimationPhase("queue");
    }, 4500);
  };
  
  return (
    <div className="animated-queue-flow">
      <h2 className="flow-title">Queue Management Flow</h2>
      
      <div className="flow-container">
        {/* Queue Section */}
        <div className="flow-section queue-section">
          <div className="section-header">
            <span className="section-icon">📋</span>
            <h3>Task Queue</h3>
            <span className="count-badge">{queuedTasks.length}</span>
          </div>
          
          <div className="task-list">
            {queuedTasks.slice(0, 5).map((task, index) => (
              <div 
                key={task.id} 
                className={`task-card ${index === 0 && animationPhase === "moving" ? "moving-out" : ""}`}
              >
                <div className="task-priority" data-priority={task.priority}>
                  {task.priority}
                </div>
                <div className="task-info">
                  <div className="task-name">{task.process_name}</div>
                  <div className="task-meta">
                    <span className="task-region">{task.region}</span>
                    <span className="task-tat">~{task.estimated_tat}min</span>
                  </div>
                </div>
                <div className="task-position">#{index + 1}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Animation Path */}
        <div className="flow-arrow-section">
          <div className="arrow-container">
            <div className={`arrow-path ${animationPhase === "moving" ? "active" : ""}`}>
              {currentTask && animationPhase === "moving" && (
                <div className="moving-task">
                  <div className="moving-task-icon">🤖</div>
                  <div className="moving-task-name">{currentTask.process_name}</div>
                </div>
              )}
              <svg width="200" height="100" viewBox="0 0 200 100">
                <defs>
                  <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00ff9f" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#00ff9f" stopOpacity="1"/>
                  </linearGradient>
                </defs>
                <path 
                  d="M 10 50 L 160 50" 
                  stroke="url(#arrowGradient)" 
                  strokeWidth="3" 
                  fill="none"
                  className="arrow-line"
                />
                <polygon 
                  points="160,40 190,50 160,60" 
                  fill="#00ff9f"
                  className="arrow-head"
                />
              </svg>
              <div className="flow-label">FIFO Allocation</div>
            </div>
          </div>
        </div>
        
        {/* VM Processing Section */}
        <div className="flow-section vm-section">
          <div className="section-header">
            <span className="section-icon">💻</span>
            <h3>Virtual Machines</h3>
            <span className="count-badge">{processingTasks.length}/35</span>
          </div>
          
          <div className="vm-grid-flow">
            {processingTasks.map((bot, index) => (
              <div 
                key={bot.id} 
                className={`vm-processing-card ${animationPhase === "processing" && index === 0 ? "pulse" : ""}`}
              >
                <div className="vm-header">
                  <span className="vm-name">{bot.vm}</span>
                  <span className="vm-status active">Active</span>
                </div>
                <div className="vm-bot-info">
                  <div className="bot-avatar">🤖</div>
                  <div className="bot-details">
                    <div className="bot-name">{bot.name}</div>
                    <div className="bot-task">{bot.current_task}</div>
                  </div>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill" 
                    style={{width: `${bot.progress}%`}}
                  ></div>
                  <span className="progress-text">{bot.progress}%</span>
                </div>
              </div>
            ))}
            
            {/* Show available VMs */}
            {[...Array(3)].map((_, index) => (
              <div key={`available-${index}`} className="vm-processing-card available">
                <div className="vm-header">
                  <span className="vm-name">VM_{String(21 + index).padStart(2, '0')}</span>
                  <span className="vm-status">Available</span>
                </div>
                <div className="vm-waiting">
                  <div className="waiting-icon">⏳</div>
                  <div className="waiting-text">Ready for tasks</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Statistics Footer */}
      <div className="flow-statistics">
        <div className="stat-item">
          <div className="stat-label">Avg Wait Time</div>
          <div className="stat-value">
            {(queuedTasks.reduce((acc, t) => acc + t.waiting_time_mins, 0) / queuedTasks.length).toFixed(1)}min
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Total Processed Today</div>
          <div className="stat-value">{mockData.overview.completed}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Success Rate</div>
          <div className="stat-value">{mockData.overview.success_rate}%</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Active VMs</div>
          <div className="stat-value">{processingTasks.length}/35</div>
        </div>
      </div>
    </div>
  );
}