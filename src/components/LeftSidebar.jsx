import React from 'react';
import { Mail, Clock } from 'lucide-react';

const LeftSidebar = ({ botsInQueue, vmUtilization, topPerformer }) => {
  return (
    <div className="left-sidebar">
      {/* Bots in Queue Section */}
      <div className="sidebar-section bots-queue">
        <h3 className="section-title">Bots in Queue</h3>
        <div className="bots-list">
          {botsInQueue.map((bot, index) => (
            <div key={index} className="bot-item">
              <div className="bot-icon">
                {bot.type === 'mail' ? <Mail size={16} /> : <Clock size={16} />}
              </div>
              <div className="bot-details">
                <span className="bot-name">{bot.name}</span>
              </div>
              <div className="bot-status">
                <span className="status-badge-small">{bot.status}</span>
                <span className="bot-count">{bot.count}</span>
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
              <div className="star-burst">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="star-ray"
                    style={{ transform: `rotate(${i * 45}deg)` }}
                  />
                ))}
              </div>
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
