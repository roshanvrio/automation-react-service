import { useEffect, useRef } from "react";
import { useAnimation } from "../../context/AnimationContext";
import "./ActiveVMs.css";

const ActiveVMs = ({ activeVmUpdate, initialVms = [] }) => {
  const centerRef = useRef(null);
  const { registerActiveCenter, getAnimatingVms, completedAnimations, pendingAnimations, currentAnimation } = useAnimation();

  // Track VMs we've seen on first data load (local fallback for initialVms timing)
  const firstLoadVmsRef = useRef(null);
  const hasReceivedData = useRef(false);

  // Register the center area for animation target
  useEffect(() => {
    if (centerRef.current) {
      registerActiveCenter(centerRef.current);
    }
  }, [registerActiveCenter]);

  // Capture first load VMs locally to avoid timing issues
  if (Array.isArray(activeVmUpdate) && activeVmUpdate.length > 0 && !hasReceivedData.current) {
    hasReceivedData.current = true;
    firstLoadVmsRef.current = activeVmUpdate.map(vm => vm.machineName);
    console.log("ActiveVMs: First data received, storing:", firstLoadVmsRef.current);
  }

  // Filter VMs to only show those that should be visible
  const getVisibleVms = () => {
    if (!Array.isArray(activeVmUpdate)) return [];

    const animatingVms = getAnimatingVms();
    // Use both initialVms prop and local firstLoadVms for robustness
    const firstLoadVms = firstLoadVmsRef.current || [];

    console.log("getVisibleVms:", {
      activeVmUpdate: activeVmUpdate.map(v => v.machineName),
      initialVms,
      firstLoadVms,
      animatingVms,
      completedAnimations,
      pendingCount: pendingAnimations?.length || 0,
      hasCurrentAnimation: !!currentAnimation
    });

    return activeVmUpdate.filter(vm => {
      // VM is visible if:
      // 1. It was in the initial load (from prop OR local ref)
      // 2. OR it has completed its animation
      // 3. OR it's not currently animating
      const isInitial = initialVms.includes(vm.machineName) || firstLoadVms.includes(vm.machineName);
      const hasCompleted = completedAnimations.includes(vm.machineName);
      const isAnimating = animatingVms.includes(vm.machineName);

      const isVisible = isInitial || hasCompleted || !isAnimating;

      if (!isVisible) {
        console.log(`VM ${vm.machineName} hidden: isInitial=${isInitial}, hasCompleted=${hasCompleted}, isAnimating=${isAnimating}`);
      }

      return isVisible;
    });
  };

  const visibleVms = getVisibleVms();

  // Get the latest completed VM for popup animation
  const latestCompletedVm = completedAnimations.length > 0
    ? completedAnimations[completedAnimations.length - 1]
    : null;

  return (
    <div className="dashboard-card center-height activevms-card">
      <div className="activevms-header">
        <span>🖥 Active VMs <strong>{activeVmUpdate?.length || 0}</strong></span>

        <div className="legend">
          <span className="busy">Busy</span>
          <span className="success">Success</span>
          <span className="error">Error</span>
        </div>
      </div>

      <div className="activevms-scroll card-scroll" ref={centerRef}>
        <div className="hex-grid">
          {visibleVms.map((vm, i) => {
            const isNewlyAdded = vm.machineName === latestCompletedVm;

            return (
              <div
                className={`hex-wrapper ${isNewlyAdded ? 'hex-popup-animate' : ''}`}
                key={vm.machineName || i}
              >
                <div className="hex-border"></div>
                <div className="hex-card">
                  <div className="hex-content">
                    <div className="hex-small">{vm.triggerIndication === "Email" ? "✉" : "🕐"} {vm.triggerIndication}</div>
                    <div className="hex-vm">🖥 {vm.machineName}</div>
                    <div className="hex-name">{vm.processName}</div>
                    <div className="hex-time">
                      Last Run Time <strong>{vm.lastRunTime}</strong>
                    </div>
                    <span className="uipath">{vm.rpaTool}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActiveVMs;
