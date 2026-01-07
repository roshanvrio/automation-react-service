import { useEffect, useRef, useState, useCallback } from "react";
import { useAnimation } from "../../context/AnimationContext";
import "./ActiveVMs.css";

const ActiveVMs = ({ activeVmUpdate, onVmProcessed, pendingVmCountRef, completedTransactions }) => {
  const centerRef = useRef(null);
  const {
    registerActiveCenter,
    queueAnimations,
    queueCompletionAnimation,
    isVmCompleting,
    getVmCompletionOutcome
  } = useAnimation();

  // Displayed VMs - what's actually rendered on screen
  const [displayedVMs, setDisplayedVMs] = useState([]);
  // Track the latest added VM for popup animation
  const [latestAddedVm, setLatestAddedVm] = useState(null);

  // Pending queue - new VMs waiting to be added
  const pendingQueue = useRef([]);
  // Flag to track if we're processing the queue
  const isProcessingQueue = useRef(false);
  // Track if this is first data load
  const isFirstLoad = useRef(true);
  // Track all VMs we've seen (to prevent duplicates)
  const seenVmsRef = useRef(new Set());
  // Track VMs currently completing (to prevent duplicate animation triggers)
  const completingVmsRef = useRef(new Set());
  // Keep latest completedTransactions in ref for immediate access
  const completedTransactionsRef = useRef(completedTransactions);
  // Animation delay between items (ms)
  const ANIMATION_DELAY = 800;

  // Keep ref updated with latest completedTransactions
  useEffect(() => {
    completedTransactionsRef.current = completedTransactions;
  }, [completedTransactions]);

  // Register the center area for animation target
  useEffect(() => {
    if (centerRef.current) {
      registerActiveCenter(centerRef.current);
    }
  }, [registerActiveCenter]);

  // Process the pending queue one by one
  const processQueue = useCallback(() => {
    if (isProcessingQueue.current || pendingQueue.current.length === 0) {
      return;
    }

    isProcessingQueue.current = true;

    // Get the next VM from queue
    const nextVm = pendingQueue.current.shift();

    // Update pending count for parent
    if (pendingVmCountRef) {
      pendingVmCountRef.current = pendingQueue.current.length;
    }

    console.log("Processing queue - adding VM:", nextVm.machineName, "Remaining in queue:", pendingQueue.current.length);

    // Trigger the fly animation for this VM
    queueAnimations([nextVm]);

    // Add to displayed VMs after a small delay (let animation start)
    setTimeout(() => {
      setDisplayedVMs(prev => [...prev, nextVm]);
      setLatestAddedVm(nextVm.machineName);

      // Notify parent that a VM was processed - update metrics
      if (onVmProcessed) {
        onVmProcessed();
      }

      // Clear the latest added flag after animation completes
      setTimeout(() => {
        setLatestAddedVm(null);
      }, 500);

      isProcessingQueue.current = false;

      // Process next item in queue after delay
      if (pendingQueue.current.length > 0) {
        setTimeout(() => {
          processQueue();
        }, ANIMATION_DELAY);
      }
    }, 2800); // Wait for fly animation to complete (matching AnimationContext timing)
  }, [queueAnimations, onVmProcessed, pendingVmCountRef]);

  // Detect new VMs and queue them
  useEffect(() => {
    if (!Array.isArray(activeVmUpdate) || activeVmUpdate.length === 0) {
      return;
    }

    // First load - display all immediately without animation
    if (isFirstLoad.current) {
      console.log("First load - displaying all VMs immediately:", activeVmUpdate.map(vm => vm.machineName));
      isFirstLoad.current = false;
      // Mark all initial VMs as seen
      activeVmUpdate.forEach(vm => seenVmsRef.current.add(vm.machineName));
      setDisplayedVMs(activeVmUpdate);
      return;
    }

    // Find new VMs that we haven't seen before
    const newVMs = activeVmUpdate.filter(vm => !seenVmsRef.current.has(vm.machineName));

    if (newVMs.length > 0) {
      console.log("New VMs detected - adding to queue:", newVMs.map(vm => vm.machineName));
      // Mark as seen immediately to prevent duplicates
      newVMs.forEach(vm => seenVmsRef.current.add(vm.machineName));
      pendingQueue.current.push(...newVMs);

      // Update pending count for parent
      if (pendingVmCountRef) {
        pendingVmCountRef.current = pendingQueue.current.length;
      }

      // Start processing if not already
      if (!isProcessingQueue.current) {
        processQueue();
      }
    }

    // Handle removed VMs - detect completions and trigger animation
    const activeNames = activeVmUpdate.map(vm => vm.machineName);
    const removedVMs = displayedVMs.filter(vm =>
      !activeNames.includes(vm.machineName) &&
      !completingVmsRef.current.has(vm.machineName) // Don't re-trigger if already completing
    );

    if (removedVMs.length > 0) {
      console.log("VMs removed:", removedVMs.map(vm => vm.machineName));

      // Mark all as completing immediately to prevent duplicate triggers
      removedVMs.forEach(vm => completingVmsRef.current.add(vm.machineName));

      // Small delay to allow completedTransactions to update from websocket
      setTimeout(() => {
        // For each removed VM, determine outcome and trigger blink animation
        removedVMs.forEach(removedVm => {
          // Use ref to get the latest completedTransactions data
          const latestCompletedData = completedTransactionsRef.current;
          const outcome = determineOutcome(removedVm, latestCompletedData);
          console.log(`VM ${removedVm.machineName} completed with outcome: ${outcome}`);
          console.log(`📊 Checking against completedTransactions:`, latestCompletedData);

          // Trigger completion animation
          queueCompletionAnimation(removedVm.machineName, outcome);
          console.log(`✨ Completion animation queued for ${removedVm.machineName} with outcome: ${outcome}`);
        });
      }, 100); // Small delay to ensure completedTransactions is updated

      // Remove from seen set and displayed VMs after animation delay (2.5s blink + 0.5s fade)
      setTimeout(() => {
        // Remove only the specific VMs that were detected as removed
        const removedNames = new Set(removedVMs.map(vm => vm.machineName));
        console.log(`🗑️ Removing VMs after blink animation:`, Array.from(removedNames));
        removedNames.forEach(name => {
          seenVmsRef.current.delete(name);
          completingVmsRef.current.delete(name);
        });
        setDisplayedVMs(prev => prev.filter(vm => !removedNames.has(vm.machineName)));
      }, 3000); // 2.5s blink + 0.5s fade = 3s total
    }
  }, [activeVmUpdate, displayedVMs, processQueue, queueCompletionAnimation]);

  // Determine transaction outcome by matching transactionId
  const determineOutcome = (vm, completedTransactionsData) => {
    const txId = String(vm.transactionId); // Convert to string for comparison
    console.log(`🔍 determineOutcome for VM: ${vm.machineName}, txId: ${txId}, type: ${typeof vm.transactionId}`);

    if (!completedTransactionsData) {
      console.log(`❌ No completedTransactionsData available`);
      return 'unknown';
    }

    if (!vm.transactionId) {
      console.log(`❌ No transactionId on VM`);
      return 'unknown';
    }

    // Check successful list by transactionId (convert both to string for comparison)
    if (completedTransactionsData.successful?.some(t => String(t.transactionId) === txId)) {
      console.log(`✅ Found txId ${txId} in successful`);
      return 'success';
    }

    // Check error list by transactionId
    if (completedTransactionsData.error?.some(t => String(t.transactionId) === txId)) {
      console.log(`❗ Found txId ${txId} in error`);
      return 'error';
    }

    // Check exception list by transactionId
    if (completedTransactionsData.exception?.some(t => String(t.transactionId) === txId)) {
      console.log(`⚠️ Found txId ${txId} in exception`);
      return 'exception';
    }

    console.log(`❓ txId ${txId} not found. Available successful txIds:`,
      completedTransactionsData.successful?.map(t => t.transactionId).slice(0, 5));
    return 'unknown';
  };

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
          {displayedVMs.map((vm, i) => {
            const isNewlyAdded = vm.machineName === latestAddedVm;
            const isCompleting = isVmCompleting(vm.machineName);
            const completionOutcome = getVmCompletionOutcome(vm.machineName);

            // Determine blink class based on outcome
            let blinkClass = '';
            if (isCompleting) {
              blinkClass = `blink-${completionOutcome}`; // blink-success, blink-error, blink-exception
            }

            return (
              <div
                className={`hex-wrapper ${isNewlyAdded ? 'hex-popup-animate' : ''} ${blinkClass}`}
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
