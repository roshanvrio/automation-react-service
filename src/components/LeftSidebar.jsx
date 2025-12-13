import React, { useState } from 'react';
import { Mail, Clock } from 'lucide-react';
import QueueCountDisplay from './QueueCountDisplay';

const LeftSidebar = ({ botsInQueue, vmUtilization, topPerformer }) => {
  const [animatingBots, setAnimatingBots] = useState({});

  const handleAnimationChange = (botId, isAnimating) => {
    setAnimatingBots(prev => ({ ...prev, [botId]: isAnimating }));
  };

  return (
    <div className="left-sidebar">
      {/* Bots in Queue Section */}
      <div className="sidebar-section bots-queue">
        <h3 className="section-title">Bots in Queue</h3>
        <div className="bots-list">
          {botsInQueue.map((bot) => (
            <div
              key={bot.id || bot.name}
              className={`bot-item ${animatingBots[bot.id || bot.name] ? 'bot-item-animating' : ''}`}
            >
              <div className="bot-icon">
                {bot.type === 'mail' ? <Mail size={16} /> : <Clock size={16} />}
              </div>
              <div className="bot-details">
                <span className="bot-name">{bot.name}</span>
              </div>
              <div className="bot-status">
                <span className="status-badge-small">{bot.status}</span>
                <QueueCountDisplay
                  count={bot.count}
                  processName={bot.name}
                  onAnimationChange={(isAnimating) => handleAnimationChange(bot.id || bot.name, isAnimating)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VM Utilization and Top Performing VM Combined Section */}
      <div className="sidebar-section vm-utilization-combined">
        <div className="vm-utilization-content">
          <h3 className="section-title">VM Utilisation</h3>
          <div className="vm-grid">
            {vmUtilization.map((vm, index) => (
              <div key={index} className="vm-cell" style={{ backgroundColor: vm.color }}>
                <span className="vm-id">{vm.id}</span>
                <span className="vm-time">{vm.time}</span>
              </div>
            ))}
          </div>
          <div className="utilization-legend">
            <span className="legend-item">
              <span className="legend-dot less"></span>Less
            </span>
            <span className="legend-item">
              <span className="legend-dot more"></span>More
            </span>
          </div>
        </div>

        <div className="top-performer-content">
          <h3 className="section-title">Top Performing VM</h3>
          <div className="performer-display">
            <div className="performer-badge">
              {/* Outer stars with dashed lines */}
              <div className="star-burst-outer">
                {[...Array(16)].map((_, i) => (
                  <div
                    key={`outer-${i}`}
                    className="star-ray-outer"
                    style={{
                      transform: `rotate(${i * 22.5}deg)`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  >
                    <span className="star-icon">★</span>
                  </div>
                ))}
              </div>
              {/* Inner stars */}
              <div className="star-burst-inner">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={`inner-${i}`}
                    className="star-ray-inner"
                    style={{
                      transform: `rotate(${i * 45 + 22.5}deg)`,
                      animationDelay: `${i * 0.15}s`
                    }}
                  >
                    <span className="star-icon-inner">★</span>
                  </div>
                ))}
              </div>
              {/* Center circle with VM info */}
              <div className="performer-content">
                <span className="performer-vm-id">{topPerformer.id}</span>
                <span className="performer-time">{topPerformer.time}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
