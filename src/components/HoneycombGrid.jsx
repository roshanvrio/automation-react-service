import React, { useMemo } from 'react';
import HexagonCard from './HexagonCard';

const HoneycombGrid = ({ vmData }) => {
  // Dynamic beehive layout calculator
  const { positions, gridConfig } = useMemo(() => {
    const count = vmData.length;

    // Calculate optimal honeycomb layout based on card count
    // Honeycomb pattern: odd rows offset, even rows normal
    const calculateLayout = (numCards) => {
      // Determine number of columns based on card count
      // Optimized for vertical space usage
      let cols;
      if (numCards <= 3) cols = 3;
      else if (numCards <= 7) cols = 4;
      else if (numCards <= 12) cols = 5;
      else if (numCards <= 20) cols = 5;  // Use 5 cols for 13-20 cards
      else if (numCards <= 30) cols = 6;
      else cols = 7;

      const positions = [];
      let cardIndex = 0;
      let row = 1;

      while (cardIndex < numCards) {
        const isOffsetRow = row % 2 === 1;
        const maxCols = isOffsetRow ? Math.floor(cols / 2) + 1 : Math.floor(cols / 2) + 1;

        for (let i = 0; i < maxCols && cardIndex < numCards; i++) {
          const col = isOffsetRow ? (i * 2 + 2) : (i * 2 + 1);
          positions.push({ row, col });
          cardIndex++;
        }
        row++;
      }

      return { positions, cols, rows: row - 1 };
    };

    const layout = calculateLayout(count);

    // Calculate dynamic hexagon size based on card count
    // Sizes optimized to fit on one screen without scrolling
    let hexSize, hexHeight;
    if (count <= 3) {
      hexSize = 'clamp(130px, 12vw, 180px)';
      hexHeight = 'clamp(113px, 10.4vw, 156px)';
    } else if (count <= 7) {
      hexSize = 'clamp(115px, 10.5vw, 155px)';
      hexHeight = 'clamp(100px, 9.1vw, 134px)';
    } else if (count <= 12) {
      hexSize = 'clamp(100px, 9.5vw, 140px)';
      hexHeight = 'clamp(87px, 8.2vw, 121px)';
    } else if (count <= 20) {
      hexSize = 'clamp(95px, 9vw, 135px)';
      hexHeight = 'clamp(82px, 7.8vw, 117px)';
    } else if (count <= 30) {
      hexSize = 'clamp(85px, 8vw, 120px)';
      hexHeight = 'clamp(74px, 6.9vw, 104px)';
    } else {
      hexSize = 'clamp(75px, 7vw, 105px)';
      hexHeight = 'clamp(65px, 6vw, 91px)';
    }

    return {
      positions: layout.positions,
      gridConfig: {
        cols: layout.cols,
        rows: layout.rows,
        hexSize,
        hexHeight
      }
    };
  }, [vmData.length]);

  // Generate VM list data for analytics section
  const vmListData = [
    { id: 'VM_01', name: 'VM_01' },
    { id: 'VM_21', name: 'VM_21' },
    { id: 'VM_03', name: 'VM_03' },
    { id: 'VM_05', name: 'VM_05' },
    { id: 'VM_08', name: 'VM_08' },
    { id: 'VM_35', name: 'VM_35' },
    { id: 'VM_09', name: 'VM_09' },
    { id: 'VM_10', name: 'VM_10' },
    { id: 'VM_07', name: 'VM_07' },
    { id: 'VM_12', name: 'VM_12' },
    { id: 'VM_13', name: 'VM_13' },
    { id: 'VM_14', name: 'VM_14' },
    { id: 'VM_24', name: 'VM_24' },
    { id: 'VM_23', name: 'VM_23' },
    { id: 'VM_16', name: 'VM_16' },
    { id: 'VM_17', name: 'VM_17' },
    { id: 'VM_19', name: 'VM_19' },
    { id: 'VM_20', name: 'VM_20' },
    { id: 'VM_25', name: 'VM_25' },
    { id: 'VM_26', name: 'VM_26' },
    { id: 'VM_27', name: 'VM_27' },
    { id: 'VM_28', name: 'VM_28' },
    { id: 'VM_30', name: 'VM_30' },
    { id: 'VM_31', name: 'VM_31' },
    { id: 'VM_32', name: 'VM_32' }
  ];

  return (
    <div className="honeycomb-container">
      <div className="honeycomb-wrapper">
        <div
          className="honeycomb-grid"
          style={{
            '--dynamic-hex-size': gridConfig.hexSize,
            '--dynamic-hex-height': gridConfig.hexHeight,
            '--dynamic-cols': gridConfig.cols,
            gridTemplateColumns: `repeat(${gridConfig.cols}, var(--dynamic-hex-size))`,
            gridAutoRows: `calc(var(--dynamic-hex-height) * 0.75)`
          }}
        >
          {vmData.map((vm, index) => (
            <div
              key={vm.id}
              className="hex-wrapper"
              style={{
                gridRow: positions[index]?.row || 1,
                gridColumn: positions[index]?.col || 1
              }}
            >
              <HexagonCard vm={vm} />
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Section - VM List */}
      <div className="analytics-sidebar">
        <div className="analytics-header">
          <span className="analytics-title">ENTRY</span>
        </div>
        <div className="vm-list-container">
          {vmListData.map((vm) => (
            <div key={vm.id} className="vm-list-item">
              <span className="vm-list-icon">📱</span>
              <span className="vm-list-name">{vm.name}</span>
            </div>
          ))}
        </div>
        <div className="analytics-footer">
          <span className="analytics-exit">EXIT</span>
        </div>
      </div>
    </div>
  );
};

export default HoneycombGrid;