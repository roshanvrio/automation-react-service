import { useEffect, useRef, useState, useCallback } from "react";
import { useAnimation } from "../../context/AnimationContext";
import "./ActiveVMs.css";

const ActiveVMs = ({ activeVmUpdate, onVmProcessed, pendingVmCountRef, completedTransactions }) => {
  const centerRef = useRef(null);
  const {
    registerActiveCenter,
    queueAnimations,
    queueCompletionAnimation,
    queueExitAnimation,
    isVmCompleting,
    getVmCompletionOutcome
  } = useAnimation();

  // Displayed VMs - what's actually rendered on screen
  const [displayedVMs, setDisplayedVMs] = useState([]);
  // Track the latest added VM for popup animation
  const [latestAddedVm, setLatestAddedVm] = useState(null);
  // Dynamic grid dimensions
  const [gridStyle, setGridStyle] = useState({});

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

  // Calculate optimal grid layout based on container size and VM count
  const calculateGridLayout = useCallback(() => {
    if (!centerRef.current || displayedVMs.length === 0) return;

    const container = centerRef.current;
    const containerWidth = container.clientWidth - 20; // Account for padding
    const containerHeight = container.clientHeight - 20;
    const vmCount = displayedVMs.length;

    // Hexagon aspect ratio (width:height = 1:0.85)
    const hexRatio = 0.85;

    // Minimum and maximum card dimensions
    const minCardWidth = 80;
    const maxCardWidth = 220;
    const gapSize = 15;

    // Calculate optimal columns to fill the space
    // Try different column counts and find the best fit
    let bestLayout = { cols: 1, cardWidth: maxCardWidth, rows: vmCount };
    let bestScore = 0;

    for (let cols = 1; cols <= Math.min(vmCount, 10); cols++) {
      const rows = Math.ceil(vmCount / cols);

      // Calculate card width based on available width
      const availableWidth = containerWidth - (gapSize * (cols - 1));
      let cardWidth = Math.floor(availableWidth / cols);

      // Calculate card height
      const cardHeight = cardWidth * hexRatio;

      // Calculate total height needed
      const totalHeight = (rows * cardHeight) + (gapSize * (rows - 1));

      // Clamp card width
      cardWidth = Math.max(minCardWidth, Math.min(maxCardWidth, cardWidth));

      // Score based on how well it fills the space without overflow
      if (totalHeight <= containerHeight && cardWidth >= minCardWidth) {
        // Prefer layouts that use more of the available space
        const widthUtilization = (cols * cardWidth + (cols - 1) * gapSize) / containerWidth;
        const heightUtilization = totalHeight / containerHeight;
        const score = (widthUtilization * 0.4) + (heightUtilization * 0.6);

        if (score > bestScore) {
          bestScore = score;
          bestLayout = { cols, cardWidth, rows };
        }
      }
    }

    // If no layout fits, use minimum size with scrolling
    if (bestScore === 0) {
      const cols = Math.floor((containerWidth + gapSize) / (minCardWidth + gapSize));
      bestLayout = {
        cols: Math.max(1, cols),
        cardWidth: minCardWidth,
        rows: Math.ceil(vmCount / Math.max(1, cols))
      };
    }

    const cardHeight = Math.floor(bestLayout.cardWidth * hexRatio);

    // Set CSS variables for the grid
    setGridStyle({
      '--hex-cols': bestLayout.cols,
      '--hex-card-width': `${bestLayout.cardWidth}px`,
      '--hex-card-height': `${cardHeight}px`,
      '--hex-gap': `${gapSize}px`,
      '--hex-font-scale': Math.max(0.5, Math.min(1, bestLayout.cardWidth / 150)),
    });
  }, [displayedVMs.length]);

  // Recalculate layout when VM count changes or window resizes
  useEffect(() => {
    calculateGridLayout();

    const handleResize = () => {
      calculateGridLayout();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateGridLayout]);

  // Also recalculate after a short delay to ensure container is properly sized
  useEffect(() => {
    const timer = setTimeout(calculateGridLayout, 100);
    return () => clearTimeout(timer);
  }, [displayedVMs.length, calculateGridLayout]);

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

          // Trigger completion blink animation
          queueCompletionAnimation(removedVm.machineName, outcome);
          console.log(`✨ Completion animation queued for ${removedVm.machineName} with outcome: ${outcome}`);

          // After blink animation (2.5s), trigger exit animation and remove from display
          setTimeout(() => {
            console.log(`🚀 Starting exit animation for ${removedVm.machineName}`);
            queueExitAnimation(removedVm, outcome);

            // Remove from displayed VMs immediately after fade-out (the flying icon takes over)
            seenVmsRef.current.delete(removedVm.machineName);
            completingVmsRef.current.delete(removedVm.machineName);
            setDisplayedVMs(prev => prev.filter(vm => vm.machineName !== removedVm.machineName));
            console.log(`🗑️ Removed ${removedVm.machineName} from displayed VMs`);
          }, 2700); // 2.5s blink + 0.2s fade-out
        });
      }, 100); // Small delay to ensure completedTransactions is updated
    }
  }, [activeVmUpdate, displayedVMs, processQueue, queueCompletionAnimation, queueExitAnimation]);

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
        <div className="hex-grid hex-dynamic" style={gridStyle}>
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
