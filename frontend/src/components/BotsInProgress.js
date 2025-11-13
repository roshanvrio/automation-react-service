import React, { useEffect, useState } from "react";
import botIcon from "../images/Line.png"; 
import vmIcon from "../images/VM.png";
import botHeaderIcon from "../images/Bot.png"; 

export default function BotsInProgress() {
  const [bots, setBots] = useState([
    { id: 1, name: "Optimous_28", vm: "VM_02", progress: 0, stopCounter: 0 },
    { id: 2, name: "NerdyBot_01", vm: "VM_10", progress: 10, stopCounter: 0 },
    { id: 3, name: "ByteKnight_1", vm: "VM_11", progress: 20, stopCounter: 0 },
    { id: 4, name: "TechWhiz_11", vm: "VM_19", progress: 30, stopCounter: 0 },
    { id: 5, name: "Botzilla_ZZ", vm: "VM_24", progress: 40, stopCounter: 0 },
    { id: 6, name: "GizmoGuru", vm: "VM_25", progress: 50, stopCounter: 0 },
    { id: 7, name: "DataDroid", vm: "VM_35", progress: 60, stopCounter: 0 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBots((prevBots) =>
        prevBots.map((bot) => {
          let newProgress = bot.progress + 2; // Faster sliding speed
          
          // Define stopping points (e.g., 20%, 40%, 60%, 80%)
          const stopPoints = [20, 40, 60, 80];
          const stopDuration = 3; // How many cycles to pause (3 * 100ms = 0.3 seconds)
          
          // Check if we're at a stop point
          let atStopPoint = false;
          for (let stop of stopPoints) {
            if (newProgress >= stop && bot.progress < stop) {
              newProgress = stop;
              atStopPoint = true;
              break;
            }
          }
          
          // If at stop point, pause for a duration
          if (atStopPoint && (!bot.stopCounter || bot.stopCounter <= 0)) {
            return {
              ...bot,
              progress: newProgress,
              stopCounter: stopDuration
            };
          }
          
          // If currently pausing at a stop
          if (bot.stopCounter && bot.stopCounter > 0) {
            return {
              ...bot,
              stopCounter: bot.stopCounter - 1
            };
          }
          
          // When progress reaches 100%, reset to 0 instantly
          if (newProgress >= 100) {
            newProgress = 0;
          }
          
          return {
            ...bot,
            progress: newProgress,
            stopCounter: 0
          };
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bots-progress-section">
      <div className="progress-header">
        <div className="header-icon bot-icon-header">
          <img src={botHeaderIcon} alt="Bot" style={{
            width: '60px',
            height: '60px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 8px rgba(0, 255, 159, 0.5))'
          }} />
        </div>
        <h3>Bots In Progress</h3>
        <div className="header-icon vm-icon-header">
          <img src={vmIcon} alt="VM" style={{
            width: '40px',
            height: '40px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 8px rgba(0, 218, 218, 0.5))'
          }} />
        </div>
      </div>

      <div className="progress-list">
        {bots.map((bot) => {
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
                  {/* Removed progress-bar-fill - only show track line */}
                  <div 
                    className="progress-glider" 
                    style={{ 
                      left: `${bot.progress}%`,
                      transition: bot.progress < 1 ? 'none' : 'left 0.1s linear'
                    }}
                  >
                    <img 
                      src={botIcon} 
                      alt="Bot" 
                      className="glider-bot-icon"
                    />
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