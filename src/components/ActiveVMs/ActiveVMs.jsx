import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useAnimation } from "../../context/AnimationContext";
import HexTimeline from "./HexTimeline";
import "./ActiveVMs.css";
import uiPath from "../../assets/uiPath.png";
import AutomationAnywhere from "../../assets/AutomationAnywhere_circleLogo.png";
import vmIcon from "../../assets/Icon.png";

const ActiveVMs = ({ activeVmUpdate, onVmProcessed, pendingVmCountRef, completedTransactions, vmCompletedTransactions = [] }) => {
  const centerRef = useRef(null);
  const hexRefsMap = useRef({});
  const {
    registerActiveCenter,
    registerActiveVmHex,
    queueAnimations,
    addToExitQueue,
    removeFromExitQueue,
    queueCompletionAnimation,
    queueExitAnimation,
    isVmCompleting,
    getVmCompletionOutcome,
    robotArrivedAtCenter,
    robotPickedUpVm
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

  // Exit queue - VMs waiting to be removed one by one
  const exitQueue = useRef([]);
  // Flag to track if we're processing the exit queue
  const isProcessingExitQueue = useRef(false);
  // Exit animation delay between items (ms)
  const EXIT_ANIMATION_DELAY = 800;

  // Track hexes waiting to be revealed (hidden until robot arrives at Active box)
  const [pendingHexReveal, setPendingHexReveal] = useState(new Set());

  // Track VMs blinking due to in-place status change (still in active list)
  const [statusBlinkVms, setStatusBlinkVms] = useState(new Map());
  // Track previous caseStatus for each VM to detect changes
  const prevCaseStatusRef = useRef(new Map());

  // Create a map of VM transactions for timeline display
  const vmTransactionsMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(vmCompletedTransactions)) {
      console.log('📊 vmCompletedTransactions received:', vmCompletedTransactions);
      vmCompletedTransactions.forEach(vmData => {
        if (vmData.machineName && Array.isArray(vmData.transactions)) {
          // Merge transactions if VM already exists in map
          const existing = map.get(vmData.machineName) || [];
          map.set(vmData.machineName, [...existing, ...vmData.transactions]);
        }
      });
      console.log('📊 vmTransactionsMap:', [...map.entries()]);
    }
    return map;
  }, [vmCompletedTransactions]);

  // Calculate optimal grid layout based on container size and VM count
  const visibleVmCount = displayedVMs.length - pendingHexReveal.size;
  const calculateGridLayout = useCallback(() => {
    if (!centerRef.current || visibleVmCount <= 0) return;

    const container = centerRef.current;
    const containerWidth = container.clientWidth - 20; // Account for padding
    const vmCount = visibleVmCount; // Only count visible hexes (exclude hex-hidden)

    // Hexagon aspect ratio (width:height = 1:0.85)
    const hexRatio = 0.85;

    // Responsive card dimensions based on screen width - use smaller min sizes to fit more columns
    const screenWidth = window.innerWidth;
    let minCardWidth, maxCardWidth, gapSize;

    if (screenWidth >= 1920) {
      minCardWidth = 100;  // Reduced from 120
      maxCardWidth = 180;
      gapSize = 20;
    } else if (screenWidth >= 1440) {
      minCardWidth = 90;   // Reduced from 100
      maxCardWidth = 160;
      gapSize = 18;
    } else if (screenWidth >= 1024) {
      minCardWidth = 80;   // Reduced from 90
      maxCardWidth = 140;
      gapSize = 15;
    } else if (screenWidth >= 768) {
      minCardWidth = 70;   // Reduced from 80
      maxCardWidth = 120;
      gapSize = 12;
    } else {
      minCardWidth = 60;   // Reduced from 70
      maxCardWidth = 100;
      gapSize = 10;
    }

    // Calculate max columns that can fit with minimum card width
    const maxPossibleCols = Math.floor((containerWidth + gapSize) / (minCardWidth + gapSize));

    // Determine target columns based on VM count - prefer more columns to use horizontal space
    let targetCols;
    if (vmCount <= 4) {
      targetCols = vmCount; // 1-4 VMs: show all in one row
    } else if (vmCount <= 8) {
      targetCols = 4; // 5-8 VMs: 4 per row
    } else if (vmCount <= 15) {
      targetCols = 5; // 9-15 VMs: 5 per row
    } else if (vmCount <= 24) {
      targetCols = 6; // 16-24 VMs: 6 per row
    } else if (vmCount <= 35) {
      targetCols = 7; // 25-35 VMs: 7 per row
    } else {
      targetCols = 8; // 36+ VMs: 8 per row
    }

    // Clamp target columns to what's actually possible
    const cols = Math.min(targetCols, maxPossibleCols, vmCount);
    const rows = Math.ceil(vmCount / cols);

    // Calculate card width to fill the available space
    const availableWidth = containerWidth - (gapSize * (cols - 1));
    let cardWidth = Math.floor(availableWidth / cols);

    // Clamp card width between min and max
    cardWidth = Math.max(minCardWidth, Math.min(maxCardWidth, cardWidth));

    const cardHeight = Math.floor(cardWidth * hexRatio);

    console.log(`Grid layout: ${vmCount} VMs → ${cols} cols × ${rows} rows, card: ${cardWidth}px`);

    // Set CSS variables for the grid
    setGridStyle({
      '--hex-cols': cols,
      '--hex-card-width': `${cardWidth}px`,
      '--hex-card-height': `${cardHeight}px`,
      '--hex-gap': `${gapSize}px`,
      '--hex-font-scale': Math.max(0.6, Math.min(1, cardWidth / 140)),
    });
  }, [visibleVmCount]);

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
  }, [visibleVmCount, calculateGridLayout]);

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

  // Reveal hex 50ms after robot physically arrives at Active box
  useEffect(() => {
    if (!robotArrivedAtCenter) return;
    const { machineName } = robotArrivedAtCenter;

    // Only reveal if this VM is pending reveal
    if (!pendingHexReveal.has(machineName)) return;

    console.log(`[HEX] Robot arrived at center for ${machineName}, scheduling hex reveal in 50ms`);

    const timer = setTimeout(() => {
      console.log(`[HEX] Hex VISIBLE for ${machineName} — 50ms after robot arrival at:`, Date.now());
      setPendingHexReveal(prev => {
        const next = new Set(prev);
        next.delete(machineName);
        return next;
      });
      // Trigger popup animation now that hex is visible
      setLatestAddedVm(machineName);
      setTimeout(() => setLatestAddedVm(null), 2400);
    }, 50);

    return () => clearTimeout(timer);
  }, [robotArrivedAtCenter, pendingHexReveal]);

  // Remove hex when robot picks up the completed VM (at 4800ms PICKING_COMPLETED_VM)
  useEffect(() => {
    if (!robotPickedUpVm) return;
    const { machineName } = robotPickedUpVm;

    console.log(`🗑️ Robot picked up ${machineName} at 4800ms - removing hex from display`);
    // Clean up completing state (removes blink class) right as hex disappears
    completingVmsRef.current.delete(machineName);
    removeFromExitQueue(machineName);
    seenVmsRef.current.delete(machineName);
    setDisplayedVMs(prev => prev.filter(vm => vm.machineName !== machineName));
  }, [robotPickedUpVm, removeFromExitQueue]);

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
    // Hex stays hidden via pendingHexReveal until robot physically arrives at Active box
    setTimeout(() => {
      setDisplayedVMs(prev => [...prev, nextVm]);
      // Mark hex as hidden - will be revealed when robot arrives + 50ms
      setPendingHexReveal(prev => new Set([...prev, nextVm.machineName]));
      console.log(`[HEX] Added ${nextVm.machineName} to displayedVMs (hidden, awaiting robot arrival)`);

      // Notify parent that a VM was processed - update metrics
      if (onVmProcessed) {
        onVmProcessed();
      }

      isProcessingQueue.current = false;

      // Process next item in queue after delay
      if (pendingQueue.current.length > 0) {
        setTimeout(() => {
          processQueue();
        }, ANIMATION_DELAY);
      }
    }, 2800); // Wait for fly animation to complete (matching AnimationContext timing)
  }, [queueAnimations, onVmProcessed, pendingVmCountRef]);

  // Determine transaction outcome by matching transactionId, with caseStatus/processStatus fallback
  const determineOutcome = useCallback((vm, completedTransactionsData) => {
    const txId = String(vm.transactionId); // Convert to string for comparison
    console.log(`🔍 determineOutcome for VM: ${vm.machineName}, txId: ${txId}, type: ${typeof vm.transactionId}`);

    // First try completedTransactions lookup by transactionId
    if (completedTransactionsData && vm.transactionId) {
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
    }

    // Fallback: check VM's own caseStatus field
    if (vm.caseStatus) {
      const status = vm.caseStatus.toUpperCase();
      if (status === 'ERROR') {
        console.log(`❗ Fallback: caseStatus is ERROR for ${vm.machineName}`);
        return 'error';
      }
      if (status === 'EXCEPTION') {
        console.log(`⚠️ Fallback: caseStatus is EXCEPTION for ${vm.machineName}`);
        return 'exception';
      }
      if (status === 'SUCCESS' || status === 'SUCCESSFUL') {
        console.log(`✅ Fallback: caseStatus is SUCCESS for ${vm.machineName}`);
        return 'success';
      }
    }

    // Fallback: check VM's processStatus field
    if (vm.processStatus) {
      const pStatus = vm.processStatus.toLowerCase();
      if (pStatus === 'failed' || pStatus === 'faulted') {
        console.log(`❗ Fallback: processStatus is ${vm.processStatus} for ${vm.machineName}`);
        return 'error';
      }
      if (pStatus === 'completed' || pStatus === 'successful') {
        console.log(`✅ Fallback: processStatus is ${vm.processStatus} for ${vm.machineName}`);
        return 'success';
      }
    }

    console.log(`❓ txId ${txId} not found and no status fallback. Available successful txIds:`,
      completedTransactionsData?.successful?.map(t => t.transactionId).slice(0, 5));
    return 'unknown';
  }, []);

  // Process the exit queue one by one (synced with robot animation)
  const processExitQueue = useCallback(() => {
    if (isProcessingExitQueue.current || exitQueue.current.length === 0) {
      return;
    }

    isProcessingExitQueue.current = true;

    // Get the next VM from exit queue
    const nextVm = exitQueue.current.shift();

    console.log("Processing exit queue - removing VM:", nextVm.machineName, "Remaining in queue:", exitQueue.current.length);

    // Use ref to get the latest completedTransactions data
    const latestCompletedData = completedTransactionsRef.current;
    const outcome = determineOutcome(nextVm, latestCompletedData);
    console.log(`VM ${nextVm.machineName} completed with outcome: ${outcome}`);

    // Add THIS VM to visual exit queue NOW (starts blinking for this one only)
    addToExitQueue([{ machineName: nextVm.machineName, outcome }]);
    console.log(`📋 Added ${nextVm.machineName} to visual exit queue (blinking starts)`);

    // Get fresh hex position from ref (important for first/last VM)
    let freshHexPosition = null;
    const hexElement = hexRefsMap.current[nextVm.machineName];
    if (hexElement) {
      const rect = hexElement.getBoundingClientRect();
      // Only use position if element has valid dimensions and position
      if (rect.width > 0 && rect.height > 0 && (rect.left > 50 || rect.top > 50)) {
        freshHexPosition = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          width: rect.width,
          height: rect.height
        };
        console.log(`📍 Fresh hex position for ${nextVm.machineName}:`, freshHexPosition);
      } else {
        console.log(`⚠️ Hex element for ${nextVm.machineName} has invalid rect:`, rect);
      }
    } else {
      console.log(`⚠️ No hex element found for ${nextVm.machineName}`);
    }

    // Trigger robot completion animation (robot will go to this VM)
    queueCompletionAnimation(nextVm.machineName, outcome, freshHexPosition);
    console.log(`✨ Robot animation queued for ${nextVm.machineName}`);

    // Trigger exit animation (flying VM icon) after robot picks up the VM
    // Hex removal is now handled by robotPickedUpVm signal at 4800ms (PICKING_COMPLETED_VM)
    setTimeout(() => {
      queueExitAnimation(nextVm, outcome);
    }, 4800);

    // Robot continues: 1400ms return → 1900ms place → 2200ms idle
    // Allow next exit queue item to start processing after robot finishes
    // NOTE: Do NOT remove from completingVms/exitQueue here — keep blink class
    // until hex is removed by robotPickedUpVm signal
    setTimeout(() => {
      console.log(`✅ Robot animation moving on for ${nextVm.machineName}`);

      isProcessingExitQueue.current = false;

      // Process next item in exit queue
      if (exitQueue.current.length > 0) {
        setTimeout(() => {
          processExitQueue();
        }, EXIT_ANIMATION_DELAY);
      }
    }, 2500); // Wait for full robot exit animation (2200ms + buffer)
  }, [queueCompletionAnimation, queueExitAnimation, determineOutcome, addToExitQueue, removeFromExitQueue]);

  // Keep track of displayed VMs in a ref for exit detection (avoids dependency issues)
  const displayedVmsRef = useRef([]);

  // Update the ref whenever displayedVMs changes
  useEffect(() => {
    displayedVmsRef.current = displayedVMs;
  }, [displayedVMs]);

  // Detect new VMs and queue them - ONLY runs when activeVmUpdate changes
  useEffect(() => {
    // Handle first load case - ONLY set flag to false when we have actual data
    if (isFirstLoad.current) {
      if (!Array.isArray(activeVmUpdate) || activeVmUpdate.length === 0) {
        // First load with empty array - keep isFirstLoad true, wait for real data
        console.log("First load with no VMs - waiting for websocket data");
        return;
      }

      // First load with VMs - display immediately without animation
      console.log("First load - displaying all VMs immediately:", activeVmUpdate.map(vm => vm.machineName));
      isFirstLoad.current = false; // Only set to false AFTER we have data
      activeVmUpdate.forEach(vm => {
        seenVmsRef.current.add(vm.machineName);
        // Initialize previous caseStatus so future changes can be detected
        if (vm.caseStatus) {
          prevCaseStatusRef.current.set(vm.machineName, vm.caseStatus.toUpperCase());
        }
      });
      setDisplayedVMs(activeVmUpdate);
      // Update ref immediately so exit detection works
      displayedVmsRef.current = activeVmUpdate;
      return;
    }

    // FIRST: Handle removed VMs - check BEFORE early return so exit works when activeVmUpdate is empty
    const activeNames = Array.isArray(activeVmUpdate) ? activeVmUpdate.map(vm => vm.machineName) : [];
    const currentDisplayedVMs = displayedVmsRef.current;

    // Find VMs that were removed (exit animations should always work after first load)
    const removedVMs = currentDisplayedVMs.filter(vm =>
      !activeNames.includes(vm.machineName) &&
      !completingVmsRef.current.has(vm.machineName) &&
      !exitQueue.current.some(queuedVm => queuedVm.machineName === vm.machineName)
    );

    if (removedVMs.length > 0) {
      console.log("VMs removed - adding to exit queue:", removedVMs.map(vm => vm.machineName));

      // Mark all as completing immediately to prevent duplicate triggers
      removedVMs.forEach(vm => completingVmsRef.current.add(vm.machineName));

      // Add to exit queue (will process one by one - blink and robot animation synced)
      exitQueue.current.push(...removedVMs);

      // Start processing exit queue if not already (with small delay)
      if (!isProcessingExitQueue.current) {
        setTimeout(() => {
          processExitQueue();
        }, 100);
      }
    }

    // Early return if no active VMs to process for entry
    if (!Array.isArray(activeVmUpdate) || activeVmUpdate.length === 0) {
      return;
    }

    // Find new VMs that we haven't seen before
    const newVMs = activeVmUpdate.filter(vm => !seenVmsRef.current.has(vm.machineName));

    // Update existing VMs with new data (e.g., lastRunTime) - use functional update
    setDisplayedVMs(prev => {
      const updated = prev.map(displayedVm => {
        const updatedVm = activeVmUpdate.find(vm => vm.machineName === displayedVm.machineName);
        if (updatedVm) {
          return updatedVm;
        }
        return displayedVm;
      });
      // Also update ref immediately
      displayedVmsRef.current = updated;
      return updated;
    });

    // Detect in-place caseStatus changes (VM still active but status changed to error/exception/success)
    activeVmUpdate.forEach(vm => {
      const prevStatus = prevCaseStatusRef.current.get(vm.machineName);
      const currentCaseStatus = vm.caseStatus?.toUpperCase();

      if (currentCaseStatus && currentCaseStatus !== prevStatus) {
        const isTerminal = ['SUCCESS', 'ERROR', 'EXCEPTION'].includes(currentCaseStatus);
        // Only trigger blink if this is a NEW status change (not initial load)
        if (isTerminal && prevStatus !== undefined && !completingVmsRef.current.has(vm.machineName)) {
          const outcome = currentCaseStatus === 'ERROR' ? 'error'
            : currentCaseStatus === 'EXCEPTION' ? 'exception'
            : 'success';
          console.log(`🔔 Status change detected for ${vm.machineName}: ${prevStatus} → ${currentCaseStatus} (${outcome})`);

          setStatusBlinkVms(prev => {
            const newMap = new Map(prev);
            newMap.set(vm.machineName, outcome);
            return newMap;
          });

          // Remove blink class after animation completes (2.5s)
          setTimeout(() => {
            setStatusBlinkVms(prev => {
              const newMap = new Map(prev);
              newMap.delete(vm.machineName);
              return newMap;
            });
          }, 2500);
        }
      }

      prevCaseStatusRef.current.set(vm.machineName, currentCaseStatus);
    });

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
    // IMPORTANT: Only depend on activeVmUpdate - NOT displayedVMs to avoid re-runs
  }, [activeVmUpdate, processQueue, processExitQueue, determineOutcome, addToExitQueue]);

  return (
    <div className="dashboard-card-center center-height activevms-card">
      <div className="activevms-header">
        <span className="card-title mb-0" style={{display:'inline-flex', alignItems:'center'}}><i className="bi bi-display" style={{marginRight:'0.4rem'}}></i> Active VMs <span style={{fontSize:'1.2rem', fontWeight:600, color:'#2dff8f', marginLeft:'0.5rem'}}>{activeVmUpdate?.length || 0}</span></span>

        <div className="legend mt-2">
          <span className="rounded-white">Start Hour</span>
          <span className="rounded-blue">Current Hour</span>
          <span className="busy">Idle</span>
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
              console.log(`🔴 [BLINK DEBUG] ${vm.machineName}: isCompleting=true, outcome=${completionOutcome}, blinkClass=${blinkClass}`);
            } else if (statusBlinkVms.has(vm.machineName)) {
              // In-place status change blink (VM still active, no fade-out)
              blinkClass = `status-blink-${statusBlinkVms.get(vm.machineName)}`;
            }

            // Check if hex is hidden (waiting for robot to arrive)
            const isHexHidden = pendingHexReveal.has(vm.machineName);

            // Get transactions for this VM's timeline
            const vmTransactions = vmTransactionsMap.get(vm.machineName) || [];

            return (
              <div
                className={`hex-wrapper ${isNewlyAdded ? 'hex-popup-animate' : ''} ${blinkClass} ${isHexHidden ? 'hex-hidden' : ''}`}
                key={vm.machineName || i}
                ref={(el) => {
                  if (el) {
                    hexRefsMap.current[vm.machineName] = el;
                    registerActiveVmHex(vm.machineName, el);
                  }
                }}
              >
                {/* 24-hour timeline around hexagon (always render for dotted border) */}
                <HexTimeline
                  transactions={vmTransactions}
                  machineName={vm.machineName}
                />
                <div className="hex-card">
                  <div className="hex-content">
                    <div className="hex-small">{vm.triggerIndication === "Email" ? "✉" : "⏱︎"} {vm.triggerIndication}</div>
                    <div className="hex-vm"><img src={vmIcon} alt="VM" className="vm-icon" /> {vm.machineName}</div>
                    <div className="hex-name">{vm.processName}</div>
                    {/* <div className="hex-time">
                      Last Run Time <strong>{vm.lastRunTime}</strong>
                    </div> */}

                    {/* Format "Hour(s)" to "Hr(s)" for brevity */}
                    <div className="hex-time">
                      Last Run Time{" "}
                      <strong>{vm.lastRunTime?.replace(/(\d+(?:\.\d+)?)\s*Hour(s)?/gi,(_, v) => `${v} ${Number(v) === 1 ? "hr" : "hrs"}`)}
                      </strong>
                    </div>
                    {/* <span className="uipath">{vm.rpaTool}</span> */}
                    {vm.rpaTool === "UiPath" && (
                      <img src={uiPath} alt="UiPathLogo" className="uipath-logo" />
                    )}
                    {vm.rpaTool === "AutomationAnywhere" && (
                      <img src={AutomationAnywhere} alt="AutomationAnywhere" className="AutomationAnywhere" />
                    )}
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
