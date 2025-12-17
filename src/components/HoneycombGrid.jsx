import React, { useMemo, useEffect, useRef, useState } from 'react';
import ActiveVMHexagon from './ActiveVMHexagon';

const HoneycombGrid = ({ activeVMs = [], idleVMs = [], poppingVM = null }) => {
  const poppingVMRef = useRef(null);
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 500 });

  // Sort idleVMs to put the popping VM at the top
  const sortedIdleVMs = useMemo(() => {
    if (!poppingVM) return idleVMs;

    // Move the popping VM to the top of the list
    const poppingIndex = idleVMs.indexOf(poppingVM);
    if (poppingIndex === -1) return idleVMs;

    const sorted = [...idleVMs];
    sorted.splice(poppingIndex, 1);
    sorted.unshift(poppingVM);
    return sorted;
  }, [idleVMs, poppingVM]);

  // Scroll to the popping VM when it changes
  useEffect(() => {
    if (poppingVM && poppingVMRef.current) {
      poppingVMRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [poppingVM]);

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

  // Smart honeycomb layout calculator
  const { positions, gridConfig } = useMemo(() => {
    const count = activeVMs.length;
    if (count === 0) {
      return { positions: [], gridConfig: { hexSize: 120, hexHeight: 104, cols: 1, rows: 1 } };
    }

    const { width: containerWidth, height: containerHeight } = containerSize;

    // Padding inside the container
    const padding = 40;
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
    const horizontalSpacing = 1.8; // 105% of hex width between centers (slight gap)
    const verticalSpacing = 2;   // 90% of hex height for honeycomb nesting with gap

    // Calculate max hex size that fits
    const maxHexWidth = (availableWidth - (layout.cols - 1) * hexGap) / layout.cols;
    const maxHexHeight = (availableHeight - (layout.rows - 1) * hexGap) / layout.rows;

    // Use the smaller dimension to ensure fit, with hexagon proportions
    let hexSize = Math.min(maxHexWidth, maxHexHeight * hexRatio);

    // Apply size limits based on count for visual balance
    const maxSize = count <= 3 ? 180 : count <= 7 ? 155 : count <= 12 ? 140 : count <= 20 ? 125 : 110;
    const minSize = 70;
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


  // Calculate pixel positions for each hexagon
  const hexagonPositions = useMemo(() => {
    const { hexSize, hexHeight, horizontalSpacing = 1.05, verticalSpacing = 0.90, cols, rows } = gridConfig;

    // Calculate total grid dimensions with proper spacing
    const totalWidth = cols * hexSize * horizontalSpacing;
    const totalHeight = rows * hexHeight * verticalSpacing + hexHeight * 0.1;

    if (positions.length === 0) {
      return { items: [], totalWidth, totalHeight };
    }

    const items = positions.map((pos) => {
      // Base position with spacing
      let x = pos.col * hexSize * horizontalSpacing;
      let y = pos.row * hexHeight * verticalSpacing;

      // Apply honeycomb offset for odd rows (half hexagon width)
      if (pos.isOffset) {
        x += hexSize * horizontalSpacing * 0.5;
      }

      return { x, y };
    });

    return { items, totalWidth, totalHeight };
  }, [positions, gridConfig]);

  return (
    <div className="honeycomb-container">
      <div className="honeycomb-wrapper" ref={containerRef}>
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
            return (
              <div
                key={`active-${activeVM.machineName}-${index}`}
                className="hex-wrapper"
                style={{
                  position: 'absolute',
                  left: `${pos?.x || 0}px`,
                  top: `${pos?.y || 0}px`,
                  width: `${gridConfig.hexSize}px`,
                  height: `${gridConfig.hexHeight}px`,
                  transition: 'left 0.4s ease, top 0.4s ease'
                }}
              >
                <ActiveVMHexagon
                  machineName={activeVM.machineName}
                  processName={activeVM.processName}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Analytics Section - Entry/Exit Pool (Idle VMs - NOT in progress) */}
      <div className="analytics-sidebar">
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
  );
};

export default HoneycombGrid;