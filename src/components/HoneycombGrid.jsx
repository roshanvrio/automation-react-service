import React from 'react';
import HexagonCard from './HexagonCard';

const HoneycombGrid = ({ vmData }) => {
  // Honeycomb pattern: alternate rows are offset
  // Each row shifts by half a hexagon width
  const positions = [
    // Row 1 (offset)
    { row: 1, col: 2 },    // VM-34
    { row: 1, col: 4 },    // VM-03
    
    // Row 2 (normal)
    { row: 2, col: 1 },    // VM-14
    { row: 2, col: 3 },    // VM-22
    { row: 2, col: 5 },    // VM-05
    
    // Row 3 (offset)
    { row: 3, col: 2 },    // VM-32
    { row: 3, col: 4 },    // VM-18
    { row: 3, col: 6 },    // VM-27
    
    // Row 4 (normal)
    { row: 4, col: 3 },    // VM-11
    { row: 4, col: 5 }     // VM-31
  ];

  return (
    <div className="honeycomb-container">
      <div className="honeycomb-wrapper">
        <div className="honeycomb-grid">
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
    </div>
  );
};

export default HoneycombGrid;