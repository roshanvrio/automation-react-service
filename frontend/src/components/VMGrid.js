import React, { useEffect, useState } from "react";
import { fetchVMs } from "../api/api";

export default function VMGrid() {
  const [vms, setVms] = useState([]);
  
  useEffect(() => {
    fetchVMs()
      .then(data => setVms(data.vms || []))
      .catch(err => {
        console.error("Failed to fetch VMs:", err);
      });
  }, []);
  
  // Find the VM with the most activity (for demonstration)
  const topVM = vms.find(vm => vm.is_active) || { name: "VM_26" };
  
  // Create array of 35 VMs
  const allVMs = Array.from({ length: 35 }, (_, i) => {
    const vmNumber = i + 1;
    const vmName = `VM_${String(vmNumber).padStart(2, '0')}`;
    const existingVM = vms.find(vm => vm.name === vmName);
    // Active VMs matching the cyan boxes in the image: VM_02, VM_04, VM_09, VM_10, VM_16, VM_19, VM_25, VM_26, VM_34, VM_35
    const isActiveByDefault = [2, 4, 9, 10, 16, 19, 25, 26, 34, 35].includes(vmNumber);
    return {
      id: vmNumber,
      name: vmName,
      is_active: existingVM?.is_active || (vms.length === 0 && isActiveByDefault)
    };
  });
  
  return (
    <div className="vm-grid-section">
      <div className="vm-header">
        <h3>Active VMs</h3>
        <div className="vm-header-underline"></div>
      </div>
      
      <div className="vm-grid">
  {allVMs.map(vm => (
    <div key={vm.id} className="vm-wrapper">
      <div className={`vm-box ${vm.is_active ? 'active' : ''}`}>
      </div>
      <span className="vm-name">{vm.name}</span>
    </div>
  ))}
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