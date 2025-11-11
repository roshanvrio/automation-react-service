import React, { useEffect, useState } from "react";

export default function BotsInProgress() {
  const [bots, setBots] = useState([
    { id: 1, name: "Optimous_28", vm: "VM_02", progress: 0 },
    { id: 2, name: "NerdyBot_01", vm: "VM_10", progress: 10 },
    { id: 3, name: "ByteKnight_1", vm: "VM_11", progress: 20 },
    { id: 4, name: "TechWhiz_11", vm: "VM_19", progress: 30 },
    { id: 5, name: "Botzilla_ZZ", vm: "VM_24", progress: 40 },
    { id: 6, name: "GizmoGuru", vm: "VM_25", progress: 50 },
    { id: 7, name: "DataDroid", vm: "VM_35", progress: 60 },
  ]);

  // Slower animation with discrete steps
  useEffect(() => {
    const interval = setInterval(() => {
      setBots((prevBots) =>
        prevBots.map((bot) => {
          let newProgress = bot.progress + 0.75;
          
          if (newProgress >= 100) {
            newProgress = 0;
          }
          
          return {
            ...bot,
            progress: newProgress,
          };
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bots-progress-section">
      <div className="progress-header">
        <div className="header-icon bot-icon-header">🤖</div>
        <h3>Bots In Progress</h3>
        <div className="header-icon vm-icon-header">💻</div>
      </div>

      <div className="progress-list">
        {bots.map((bot) => {
          // Determine highlight state based on progress
          const isBotActive = bot.progress > 0 && bot.progress < 50;
          const isVMActive = bot.progress >= 50;
          
          return (
            <div key={bot.id} className="progress-item">
              <div 
                className={`bot-name-left ${isBotActive ? 'highlight' : ''}`}
                style={{
                  color: isBotActive ? '#00DADA' : '#ffffff',
                  transition: 'color 0.3s ease',
                  textShadow: isBotActive ? '0 0 10px rgba(0, 218, 218, 0.8)' : 'none'
                }}
              >
                {bot.name}
              </div>
              
              <div className="progress-track">
                <div className="progress-bar-bg">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${bot.progress}%` }}
                  ></div>
                  <div 
                    className="progress-glider" 
                    style={{ left: `${bot.progress}%` }}
                  >
                    <div className="glider-dot"></div>
                  </div>
                </div>
              </div>
              
              <div 
                className={`vm-name-right ${isVMActive ? 'highlight' : ''}`}
                style={{
                  color: isVMActive ? '#00DADA' : '#00DADA',
                  transition: 'color 0.3s ease',
                  textShadow: isVMActive ? '0 0 15px rgba(0, 218, 218, 1)' : '0 0 4px rgba(0, 218, 218, 0.4)',
                  fontWeight: isVMActive ? '900' : '700'
                }}
              >
                {bot.vm}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}