import { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import ActiveVMHexagon from './ActiveVMHexagon';

// Flying Hexagon Component - animates from entry pool to grid position
const FlyingHexagon = ({ vm, startPos, endPos, hexSize, hexHeight, onAnimationEnd }) => {
  const [animationState, setAnimationState] = useState('starting');

  useEffect(() => {
    // Start the fly animation after a brief delay
    const startTimer = setTimeout(() => {
      setAnimationState('flying');
    }, 50);

    // Animation complete after 1.2s
    const endTimer = setTimeout(() => {
      setAnimationState('complete');
      if (onAnimationEnd) onAnimationEnd();
    }, 1250);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
    };
  }, [onAnimationEnd]);

  if (animationState === 'complete') return null;

  const isFlying = animationState === 'flying';

  return (
    <div
      className={`flying-hexagon ${isFlying ? 'flying' : ''}`}
      style={{
        '--start-x': `${startPos.x}px`,
        '--start-y': `${startPos.y}px`,
        '--end-x': `${endPos.x}px`,
        '--end-y': `${endPos.y}px`,
        '--hex-size': `${hexSize}px`,
        '--hex-height': `${hexHeight}px`,
        position: 'fixed',
        left: 0,
        top: 0,
        width: `${hexSize}px`,
        height: `${hexHeight}px`,
        transform: isFlying
          ? `translate(${endPos.x}px, ${endPos.y}px) scale(1) rotate(0deg)`
          : `translate(${startPos.x}px, ${startPos.y}px) scale(0.3) rotate(-180deg)`,
        opacity: isFlying ? 1 : 0.7,
        zIndex: 9999,
        pointerEvents: 'none',
        transition: isFlying
          ? 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease'
          : 'none',
      }}
    >
      <ActiveVMHexagon
        machineName={vm.machineName}
        processName={vm.processName}
        triggerType={vm.triggerIndication || 'Schedule'}
        rpaTool={vm.rpaTool || 'UiPath'}
      />
    </div>
  );
};

// Custom Desktop PC Icon matching the design
const DesktopIcon = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Monitor screen */}
    <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
    {/* Screen inner glow/display */}
    <rect x="4" y="5" width="16" height="10" rx="1" fill="currentColor" opacity="0.3" />
    {/* Stand neck */}
    <path d="M12 17V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Stand base */}
    <path d="M8 20H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const HoneycombGrid = ({
  activeVMs = [],
  idleVMs = [],
  poppingVM = null,
  newlyAddedVMs = [],  // VMs that just appeared and need pop animation
  refreshInterval = 20,
  onRefresh = null,  // Callback function to fetch data from backend
  isLoading = false  // Loading state while fetching data
}) => {
  const poppingVMRef = useRef(null);
  const containerRef = useRef(null);
  const gridRef = useRef(null);
  const sidebarRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 500 });
  const [countdown, setCountdown] = useState(refreshInterval);
  const [flyingVM, setFlyingVM] = useState(null); // VM currently flying in
  const [flyingPositions, setFlyingPositions] = useState({ start: null, end: null });
  const previousActiveVMsRef = useRef([]);
  const pendingAnimationRef = useRef(null); // Store VM waiting for animation
  const cachedStartPosRef = useRef(null); // Cache the start position when poppingVM is set

  // Refresh countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Call the refresh callback when timer reaches 0
          if (onRefresh && typeof onRefresh === 'function') {
            onRefresh();
          }
          return refreshInterval; // Reset to initial value
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [refreshInterval, onRefresh]);

  // Manual refresh function (can be triggered by a button if needed)
  const handleManualRefresh = () => {
    if (onRefresh && typeof onRefresh === 'function') {
      onRefresh();
    }
    setCountdown(refreshInterval); // Reset timer
  };

  // Sort idleVMs to put the popping VM at the top, and ensure it's included even if not in idleVMs
  const sortedIdleVMs = useMemo(() => {
    if (!poppingVM) return idleVMs;

    // Check if poppingVM exists in idleVMs
    const poppingIndex = idleVMs.indexOf(poppingVM);

    if (poppingIndex === -1) {
      // poppingVM is not in idleVMs (might have been removed), add it at top temporarily for animation
      console.log('⚠️ poppingVM not in idleVMs, adding temporarily:', poppingVM);
      return [poppingVM, ...idleVMs];
    }

    // Move the popping VM to the top of the list
    const sorted = [...idleVMs];
    sorted.splice(poppingIndex, 1);
    sorted.unshift(poppingVM);
    return sorted;
  }, [idleVMs, poppingVM]);

  // Container size detection with ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Smart honeycomb layout calculator - MUST be defined before effects that use it
  const { positions, gridConfig } = useMemo(() => {
    const count = activeVMs.length;
    if (count === 0) {
      return { positions: [], gridConfig: { hexSize: 120, hexHeight: 104, cols: 1, rows: 1 } };
    }

    const { width: containerWidth, height: containerHeight } = containerSize;

    // Padding inside the container (increased to accommodate hexagon outline which extends 6px outside)
    const padding = 50;
    const availableWidth = containerWidth - padding * 2;
    const availableHeight = containerHeight - padding * 2;

    // Hexagon proportions (width to height ratio is ~1.1547 for regular hexagon)
    const hexRatio = 1.1547;

    // Calculate optimal layout based on count and container aspect ratio
    const calculateOptimalHoneycombLayout = (numItems) => {
      // Aspect ratio of the container
      const aspectRatio = availableWidth / availableHeight;

      // Calculate optimal columns based on aspect ratio and item count
      // We want a layout that fills the space nicely
      let optimalCols;

      if (numItems === 1) {
        optimalCols = 1;
      } else if (numItems === 2) {
        optimalCols = 2;
      } else if (numItems <= 4) {
        optimalCols = Math.min(numItems, Math.ceil(aspectRatio * 1.5));
      } else {
        // For larger counts, calculate based on aspect ratio
        optimalCols = Math.ceil(Math.sqrt(numItems * aspectRatio / hexRatio));
        optimalCols = Math.max(2, Math.min(optimalCols, numItems));
      }

      // Calculate rows needed
      const rows = Math.ceil(numItems / optimalCols);

      // Recalculate columns to balance the grid
      const actualCols = Math.ceil(numItems / rows);

      // Generate honeycomb positions
      const positions = [];
      let index = 0;

      for (let row = 0; row < rows && index < numItems; row++) {
        const isOffsetRow = row % 2 === 1;
        const itemsRemaining = numItems - index;
        const itemsInThisRow = Math.min(actualCols, itemsRemaining);

        // Center this row
        const rowOffset = (actualCols - itemsInThisRow) / 2;

        for (let col = 0; col < itemsInThisRow && index < numItems; col++) {
          positions.push({
            row,
            col: col + rowOffset,
            isOffset: isOffsetRow
          });
          index++;
        }
      }

      return { positions, cols: actualCols, rows };
    };

    const layout = calculateOptimalHoneycombLayout(count);

    // Calculate hexagon size to fit all items
    // Spacing: ensure hexagons don't touch - add gap between them
    const hexGap = 12; // pixels gap between hexagons
    const horizontalSpacing = 1.7; // 105% of hex width between centers (slight gap)
    const verticalSpacing = 1.7;   // 90% of hex height for honeycomb nesting with gap

    // Calculate max hex size that fits
    const maxHexWidth = (availableWidth - (layout.cols - 1) * hexGap) / layout.cols;
    const maxHexHeight = (availableHeight - (layout.rows - 1) * hexGap) / layout.rows;

    // Use the smaller dimension to ensure fit, with hexagon proportions
    let hexSize = Math.min(maxHexWidth, maxHexHeight * hexRatio);

    // Apply size limits based on count for visual balance
    // Reduced max sizes to prevent cutoff on smaller screens
    const maxSize = count <= 3 ? 150 : count <= 7 ? 130 : count <= 12 ? 115 : count <= 20 ? 100 : 90;
    const minSize = 60;
    hexSize = Math.max(minSize, Math.min(maxSize, hexSize));

    const hexHeight = hexSize / 1.1547; // Maintain hexagon proportions

    return {
      positions: layout.positions,
      gridConfig: {
        hexSize,
        hexHeight,
        cols: layout.cols,
        rows: layout.rows,
        horizontalSpacing,
        verticalSpacing
      }
    };
  }, [activeVMs.length, containerSize]);

  // Calculate pixel positions for each hexagon - MUST be defined before effects that use it
  const hexagonPositions = useMemo(() => {
    const { hexSize, hexHeight, horizontalSpacing = 1.05, verticalSpacing = 0.90, cols, rows } = gridConfig;

    // Offset to account for hexagon outline extending outside (6px on each side)
    const outlineOffset = 10;

    // Calculate total grid dimensions with proper spacing (add offset for outlines)
    const totalWidth = cols * hexSize * horizontalSpacing + outlineOffset * 2;
    const totalHeight = rows * hexHeight * verticalSpacing + hexHeight * 0.1 + outlineOffset * 2;

    if (positions.length === 0) {
      return { items: [], totalWidth, totalHeight };
    }

    const items = positions.map((pos) => {
      // Base position with spacing (add offset to ensure outlines aren't clipped)
      let x = pos.col * hexSize * horizontalSpacing + outlineOffset;
      let y = pos.row * hexHeight * verticalSpacing + outlineOffset;

      // Apply honeycomb offset for odd rows (half hexagon width)
      if (pos.isOffset) {
        x += hexSize * horizontalSpacing * 0.5;
      }

      return { x, y };
    });

    return { items, totalWidth, totalHeight };
  }, [positions, gridConfig]);

  // Scroll to the popping VM when it changes
  useEffect(() => {
    if (poppingVM && poppingVMRef.current) {
      poppingVMRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [poppingVM]);

  // When poppingVM is set, store it and cache its position for later animation
  useEffect(() => {
    if (poppingVM) {
      pendingAnimationRef.current = poppingVM;
      console.log('🎯 poppingVM set to:', poppingVM, 'poppingVMRef.current:', !!poppingVMRef.current);

      // Wait for next frame to ensure DOM has updated with the highlighted element
      const capturePosition = () => {
        if (poppingVMRef.current) {
          const poppingRect = poppingVMRef.current.getBoundingClientRect();
          cachedStartPosRef.current = {
            x: poppingRect.left + poppingRect.width / 2,
            y: poppingRect.top + poppingRect.height / 2
          };
          console.log('📌 Position cached for:', poppingVM, 'at:', cachedStartPosRef.current);
          return true;
        } else if (sidebarRef.current) {
          // Fallback to sidebar center if element not found
          const sidebarRect = sidebarRef.current.getBoundingClientRect();
          cachedStartPosRef.current = {
            x: sidebarRect.left + sidebarRect.width / 2,
            y: sidebarRect.top + sidebarRect.height / 3
          };
          console.log('📌 Position cached (sidebar fallback) for:', poppingVM);
          return true;
        }
        return false;
      };

      // Multiple attempts to capture position
      // Attempt 1: Immediately
      if (!capturePosition()) {
        // Attempt 2: After 50ms
        setTimeout(() => {
          if (!cachedStartPosRef.current && !capturePosition()) {
            // Attempt 3: After 200ms
            setTimeout(() => {
              if (!cachedStartPosRef.current) {
                capturePosition();
              }
            }, 150);
          }
        }, 50);
      }
    }
  }, [poppingVM]);

  // Detect new VMs and trigger flying animation - MUST be after gridConfig and hexagonPositions are defined
  useEffect(() => {
    const prevVMs = previousActiveVMsRef.current;
    const newVM = activeVMs.find(
      vm => !prevVMs.some(prev => prev.machineName === vm.machineName)
    );

    // Check if this new VM matches the pending animation OR has a cached position ready
    const shouldAnimate = newVM && (
      pendingAnimationRef.current === newVM.machineName ||
      poppingVM === newVM.machineName ||
      cachedStartPosRef.current !== null  // Also trigger if we have a cached position
    );

    console.log('🔍 Flying detection:', {
      newVM: newVM?.machineName,
      poppingVM,
      pendingAnimation: pendingAnimationRef.current,
      cachedStartPos: cachedStartPosRef.current,
      shouldAnimate,
      sidebarRef: !!sidebarRef.current,
      gridRef: !!gridRef.current,
      prevVMsCount: prevVMs.length,
      activeVMsCount: activeVMs.length
    });

    if (shouldAnimate && newVM && sidebarRef.current && gridRef.current) {
      // Use setTimeout to ensure DOM is fully updated after state change
      setTimeout(() => {
        const gridArea = gridRef.current;
        const sidebar = sidebarRef.current;

        console.log('🎯 Animation elements:', {
          cachedStartPos: cachedStartPosRef.current,
          gridArea: !!gridArea,
          sidebar: !!sidebar
        });

        // Use cached position (captured when poppingVM was set), fallback to sidebar center
        let startPos;
        if (cachedStartPosRef.current) {
          startPos = {
            x: cachedStartPosRef.current.x - gridConfig.hexSize / 2,
            y: cachedStartPosRef.current.y - gridConfig.hexHeight / 2
          };
        } else if (sidebar) {
          const sidebarRect = sidebar.getBoundingClientRect();
          startPos = {
            x: sidebarRect.left + sidebarRect.width / 2 - gridConfig.hexSize / 2,
            y: sidebarRect.top + sidebarRect.height / 3 - gridConfig.hexHeight / 2
          };
        }

        if (startPos && gridArea) {
          const gridRect = gridArea.getBoundingClientRect();

          // Find the index of the new VM in activeVMs to get its target position
          const newVMIndex = activeVMs.findIndex(vm => vm.machineName === newVM.machineName);
          const targetPos = hexagonPositions.items[newVMIndex];

          console.log('📍 Positions:', {
            newVMIndex,
            targetPos,
            hexagonPositionsCount: hexagonPositions.items.length,
            startPos
          });

          if (targetPos) {
            // Calculate end position (absolute position in the grid)
            const endPos = {
              x: gridRect.left + targetPos.x,
              y: gridRect.top + targetPos.y
            };

            console.log('🚀 Flying animation starting:', {
              vm: newVM.machineName,
              from: startPos,
              to: endPos
            });

            setFlyingPositions({ start: startPos, end: endPos });
            setFlyingVM(newVM);

            // Clear cached position and pending animation
            cachedStartPosRef.current = null;
            pendingAnimationRef.current = null;
          }
        }
      }, 100); // Slightly longer delay to ensure DOM is ready
    }

    // Update previous VMs ref
    previousActiveVMsRef.current = [...activeVMs];
  }, [activeVMs, poppingVM, gridConfig.hexSize, gridConfig.hexHeight, hexagonPositions.items]);

  // Clear flying VM after animation completes
  const handleFlyingAnimationEnd = useCallback(() => {
    setFlyingVM(null);
    setFlyingPositions({ start: null, end: null });
  }, []);

  return (
    <div className="honeycomb-container">
      {/* Main content area with honeycomb grid and sidebar */}
      <div className="honeycomb-main">
        <div className="honeycomb-wrapper" ref={containerRef}>
          {/* Header Bar with Active VMs count and Status Legend - INSIDE the wrapper */}
          <div className="honeycomb-header">
            <div className="active-vms-indicator">
              <DesktopIcon size={20} />
              <span className="active-vms-label">Active VMs</span>
              <span className="active-vms-count">{activeVMs.length}</span>
            </div>
            <div className="status-legend">
              <div className="legend-item">
                <span className="legend-dash legend-busy">— —</span>
                <span className="legend-label">Busy</span>
              </div>
              <div className="legend-item">
                <span className="legend-dash legend-success">— —</span>
                <span className="legend-label">Success</span>
              </div>
              <div className="legend-item">
                <span className="legend-dash legend-error">— —</span>
                <span className="legend-label">Error</span>
              </div>
            </div>
          </div>
          {/* Refresh Timer - Bottom Left (Click to refresh manually) */}
          <div
            className={`refresh-timer ${isLoading ? 'refresh-loading' : ''}`}
            onClick={handleManualRefresh}
            title="Click to refresh now"
          >
            <span className="refresh-label">
              {isLoading ? 'Refreshing...' : 'Refresh In'}
            </span>
            <span className="refresh-countdown">
              {isLoading ? '--:--' : `${String(Math.floor(countdown / 60)).padStart(2, '0')}:${String(countdown % 60).padStart(2, '0')}`}
            </span>
          </div>

          {/* Grid area container */}
          <div className="honeycomb-grid-area" ref={gridRef}>
            <div
              className="honeycomb-grid honeycomb-auto-layout"
              style={{
                '--dynamic-hex-size': `${gridConfig.hexSize}px`,
                '--dynamic-hex-height': `${gridConfig.hexHeight}px`,
                width: hexagonPositions.totalWidth || '100%',
                height: hexagonPositions.totalHeight || '100%'
              }}
            >
              {/* Render Active VMs from backend */}
              {activeVMs.map((activeVM, index) => {
                const pos = hexagonPositions.items[index];
                const isFlying = flyingVM && flyingVM.machineName === activeVM.machineName;
                const isNewlyAdded = newlyAddedVMs.includes(activeVM.machineName);

                // Log when animation should trigger
                if (isNewlyAdded) {
                  console.log('🎬 RENDERING with hex-pop-in class:', activeVM.machineName, 'newlyAddedVMs:', newlyAddedVMs);
                }

                // Debug: always log to see what's happening
                console.log(`📦 Hexagon ${activeVM.machineName}: isNewlyAdded=${isNewlyAdded}, newlyAddedVMs=`, newlyAddedVMs);

                // Build class names
                const wrapperClasses = [
                  'hex-wrapper',
                  isFlying ? 'hex-flying-target' : '',
                  isNewlyAdded ? 'hex-pop-in' : ''
                ].filter(Boolean).join(' ');

                // For newly added hexagons, don't set inline transform/opacity - let CSS animation handle it
                const hexStyle = {
                  position: 'absolute',
                  left: `${pos?.x || 0}px`,
                  top: `${pos?.y || 0}px`,
                  width: `${gridConfig.hexSize}px`,
                  height: `${gridConfig.hexHeight}px`,
                  // Only add transitions for non-animating hexagons
                  ...(isNewlyAdded ? {} : {
                    transition: 'left 0.4s ease, top 0.4s ease',
                    opacity: isFlying ? 0 : 1,
                    transform: isFlying ? 'scale(0.8)' : 'scale(1)',
                  }),
                };

                return (
                  <div
                    key={`active-${activeVM.machineName}-${isNewlyAdded ? 'anim' : 'static'}-${index}`}
                    className={wrapperClasses}
                    style={hexStyle}
                  >
                    <ActiveVMHexagon
                      machineName={activeVM.machineName}
                      processName={activeVM.processName}
                      triggerType={activeVM.triggerIndication || 'Schedule'}
                      rpaTool={activeVM.rpaTool || 'UiPath'}
                    />
                  </div>
                );
              })}

            </div>
          </div>
        </div>

        {/* Analytics Section - Entry/Exit Pool (Idle VMs - NOT in progress) */}
        <div className="analytics-sidebar" ref={sidebarRef}>
          <div className="analytics-header">
            <span className="analytics-title">ENTRY</span>
          </div>
          <div className="vm-list-container">
            {sortedIdleVMs.length > 0 ? (
              sortedIdleVMs.map((vmName, index) => (
                <div
                  key={`idle-${vmName}-${index}`}
                  ref={poppingVM === vmName ? poppingVMRef : null}
                  className={`vm-list-item ${poppingVM === vmName ? 'vm-popping' : ''}`}
                >
                  <span className="vm-list-icon">🖥️</span>
                  <span className="vm-list-name">{vmName}</span>
                </div>
              ))
            ) : (
              <div className="vm-list-item" style={{ opacity: 0.5, justifyContent: 'center' }}>
                <span style={{ fontSize: 'var(--font-sm)', color: '#8b92b2' }}>No idle VMs</span>
              </div>
            )}
          </div>
          <div className="analytics-footer">
            <span className="analytics-exit">EXIT</span>
          </div>
        </div>
      </div>

      {/* Flying Hexagon Animation */}
      {flyingVM && flyingPositions.start && flyingPositions.end && (
        <FlyingHexagon
          vm={flyingVM}
          startPos={flyingPositions.start}
          endPos={flyingPositions.end}
          hexSize={gridConfig.hexSize}
          hexHeight={gridConfig.hexHeight}
          onAnimationEnd={handleFlyingAnimationEnd}
        />
      )}
    </div>
  );
};

export default HoneycombGrid;
