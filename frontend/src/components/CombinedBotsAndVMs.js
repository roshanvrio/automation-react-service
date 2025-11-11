import React, {useEffect, useState} from "react";
import { fetchVms } from "../api/api";
import BotsInProgress from "./BotsInProgress";

export default function CombinedBotsAndVMs(){
  const [vms, setVms] = useState([]);
  useEffect(()=>{ fetchVms().then(res => setVms(res.vms || [])).catch(()=>{}); }, []);
  
  // show 35 boxes (or from API) - matches the design with specific active VMs
  const display = vms.length ? vms : Array.from({length:35}).map((_,i)=>({
    id: i+1,
    name: `VM_${String(i+1).padStart(2,'0')}`,
    // Active VMs matching the cyan boxes in the image: VM_02, VM_04, VM_09, VM_10, VM_16, VM_19, VM_25, VM_26, VM_34, VM_35
    is_active: [2, 4, 9, 10, 16, 19, 25, 26, 34, 35].includes(i+1)
  }));

  return (
    <div className="combined-card">
      {/* Left Section - Bots In Progress */}
      <div className="bots-section">
        <h3>Bots In Progress</h3>
        <div className="bot-visual-new">
          <div className="bot-icon-wrapper">
            <div className="bot-icon"> 
              <div className="sound-bars">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <div className="bot-name-label">Optimus_28</div>
          </div>
          <div className="vm-monitor">
            <div className="monitor-screen">
              <div className="screen-text">Optimus_28</div>
            </div>
            <div className="monitor-stand"></div>
            <div className="monitor-base">VM_02</div>
          </div>
        </div>
      </div>

      {/* Vertical Divider Line */}
      <div className="vertical-divider"></div>

      {/* Right Section - Active VMs */}
      <div className="vms-section">
        <h3>Active VMs</h3>
        <div className="vm-grid">
          {display.map(vm => (
            <div key={vm.id} className={`vm-box ${vm.is_active ? 'active' : ''}`}>
              <div className="vm-box-inner"></div>
              <div className="vm-name">{vm.name}</div>
            </div>
          ))}
        </div>
        <div className="top-vm">Top Performing VM <span className="vm-highlight">VM_26</span></div>
      </div>
    </div>
  );
}