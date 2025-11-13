import React, { useEffect, useState } from "react";
import { fetchVMs } from "../api/api";

export default function VMGrid() {
  const [vms, setVms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flippedVMs, setFlippedVMs] = useState(new Set());
  
  useEffect(() => {
    const loadVMs = async () => {
      try {
        setLoading(true);
        const data = await fetchVMs();
        
        // Create a map of machine names to their status and bot_id
        const vmDataMap = {};
        if (data.machines && Array.isArray(data.machines)) {
          data.machines.forEach(vm => {
            vmDataMap[vm.machine_name] = {
              is_active: vm.status === "active",
              bot_id: vm.bot_id || "No Bot"
            };
          });
        }
        
        // Create array of 35 VMs with real status and bot_id
        const allVMs = Array.from({ length: 35 }, (_, i) => {
          const vmNumber = i + 1;
          const vmName = `VM_${String(vmNumber).padStart(2, '0')}`;
          const vmData = vmDataMap[vmName] || { is_active: false, bot_id: "No Bot" };
          
          return {
            id: vmNumber,
            name: vmName,
            is_active: vmData.is_active,
            bot_id: vmData.bot_id
          };
        });
        
        setVms(allVMs);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch VMs:", err);
        setError(err.message);
        
        // Fallback to default active VMs
        const fallbackVMs = Array.from({ length: 35 }, (_, i) => {
          const vmNumber = i + 1;
          return {
            id: vmNumber,
            name: `VM_${String(vmNumber).padStart(2, '0')}`,
            is_active: [2, 4, 9, 10, 16, 19, 25, 26, 34, 35].includes(vmNumber),
            bot_id: "No Bot"
          };
        });
        setVms(fallbackVMs);
      } finally {
        setLoading(false);
      }
    };
    
    loadVMs();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadVMs, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Toggle flip state for a VM
  const handleVMMouseEnter = (vmId) => {
  // Find the VM to check if it's active
  const vm = vms.find(v => v.id === vmId);
  
  // Only flip if VM is active
  if (vm && vm.is_active) {
    setFlippedVMs(prev => {
      const newSet = new Set(prev);
      newSet.add(vmId);
      return newSet;
    });
  }
};

const handleVMMouseLeave = (vmId) => {
  // Find the VM to check if it's active
  const vm = vms.find(v => v.id === vmId);
  
  // Only unflip if VM is active
  if (vm && vm.is_active) {
    setFlippedVMs(prev => {
      const newSet = new Set(prev);
      newSet.delete(vmId);
      return newSet;
    });
  }
};
  
  // Find top performing VM (first active one)
  const activeVMs = vms.filter(vm => vm.is_active);
  const topVM = activeVMs.length > 0 ? activeVMs[0] : { name: "VM_26" };
  
  if (loading) {
    return (
      <div className="vm-grid-section">
        <div className="vm-header">
          <h3>Active VMs</h3>
          <div className="vm-header-underline"></div>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#00ffc8' }}>
          Loading VMs...
        </div>
      </div>
    );
  }
  
  return (
    <div className="vm-grid-section">
      <div className="vm-header">
        <h3>Active VMs</h3>
        <div className="vm-header-underline"></div>
      </div>
      
      {/* Only show error message if there's an actual error */}
      {error && (
        <div style={{ 
          padding: '0.5rem', 
          background: 'rgba(255, 71, 87, 0.1)', 
          color: '#ff4757',
          fontSize: '0.75rem',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          ⚠️ Connection error: {error}
        </div>
      )}
      
      <div className="vm-grid">
        {vms.map(vm => {
          const isFlipped = flippedVMs.has(vm.id);
          
          return (
            <div key={vm.id} className="vm-wrapper">
  <div 
  className={`vm-box-flip-container ${isFlipped ? 'flipped' : ''}`}
  onMouseEnter={() => handleVMMouseEnter(vm.id)}
  onMouseLeave={() => handleVMMouseLeave(vm.id)}
>
    {/* Front Side - VM Box */}
    <div className={`vm-box vm-box-front ${vm.is_active ? 'active' : ''}`}>
      <div className="vm-box-inner"></div>
    </div>
    
    {/* Back Side - Just Icon */}
    <div className="vm-box vm-box-back">
      <div className="bot-id-icon">🤖</div>
    </div>
  </div>
  
  {/* VM Name (shows when not flipped) */}
  {!isFlipped && <span className="vm-name">{vm.name}</span>}
  
  {/* Bot ID (shows when flipped) */}
  {isFlipped && <span className="bot-id-label">{vm.bot_id}</span>}
</div>
          );
        })}
      </div>
      
      <div className="vm-footer">
        <div className="footer-line"></div>
        <div className="top-vm-info">
          <span className="top-vm-label">Top Performing VM:</span>
          <span className="top-vm-value">{topVM.name}</span>
        </div>
      </div>
    </div>
  );
}