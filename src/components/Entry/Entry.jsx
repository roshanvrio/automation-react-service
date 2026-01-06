import { useEffect, useRef } from "react";
import { useAnimation } from "../../context/AnimationContext";
import "./Entry.css";

const Entry = ({ idleVmUpdate }) => {
  const { registerVmRef, highlightedVm, ghostVm } = useAnimation();
  const rowRefs = useRef({});

  // Get VM name from various data formats - prefer machineName for consistency with AnimationContext
  const getVmName = (vm) => {
    if (typeof vm === 'string') return vm;
    return vm.machineName || vm.name || vm.id || '';
  };

  // Cache all VM positions whenever the list changes
  useEffect(() => {
    if (!Array.isArray(idleVmUpdate)) return;

    // Register all current VMs
    idleVmUpdate.forEach(vm => {
      const vmName = getVmName(vm);
      const element = rowRefs.current[vmName];
      if (element) {
        registerVmRef(vmName, element);
      }
    });
  }, [idleVmUpdate, registerVmRef]);

  // Ref callback to store element reference
  const setRowRef = (vmName) => (element) => {
    if (element) {
      rowRefs.current[vmName] = element;
      registerVmRef(vmName, element);
    }
  };

  // Build the list of VMs to display (including ghost VM if animating)
  const buildVmList = () => {
    const vmList = Array.isArray(idleVmUpdate) ? [...idleVmUpdate] : [];

    // Add ghost VM if it's not already in the list
    if (ghostVm && ghostVm.name) {
      const ghostExists = vmList.some(vm => getVmName(vm) === ghostVm.name);
      if (!ghostExists) {
        vmList.push({ name: ghostVm.name, isGhost: true });
      }
    }

    return vmList;
  };

  const vmList = buildVmList();

  return (
    <div className="dashboard-card entry-card">

      <div className="entry-title">ENTRY</div>

      <div className="entry-list">
        {vmList.map((vm, i) => {
          const vmName = getVmName(vm);
          // Check highlight with case-insensitive comparison for robustness
          const isHighlighted = highlightedVm &&
            (highlightedVm === vmName ||
             highlightedVm.toLowerCase() === vmName.toLowerCase());
          const isGhost = vm.isGhost === true;

          return (
            <div
              className={`entry-row ${isHighlighted ? 'vm-highlighted' : ''} ${isGhost ? 'vm-ghost' : ''}`}
              key={vmName || i}
              ref={setRowRef(vmName)}
            >
              <i className="bi bi-display"></i>
              <span>{vmName}</span>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default Entry;
