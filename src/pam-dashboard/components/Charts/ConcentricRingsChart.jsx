import React, { useEffect, useState } from 'react';
import useDensity from '../../hooks/useDensity';
import './ConcentricRingsChart.css';

const COLORS = ['#ff6b8a', '#a78bfa', '#f0c040', '#00e5c8', '#e8455a'];
const TRACK_COLOR = 'rgba(100,140,180,0.08)';

const OUTER_RADIUS = 90;

const DENSITY_RING = {
  default: { thickness: 10, gap: 8 },
  medium:  { thickness: 9,  gap: 6 },
  high:    { thickness: 8,  gap: 4 },
};

export default function ConcentricRingsChart({ data = [] }) {
  const [mounted, setMounted] = useState(false);
  const { ref: cardRef, density } = useDensity(data.length, { medium: 4, high: 6 });

  const { thickness: RING_THICKNESS, gap: RING_GAP } = DENSITY_RING[density];

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const items = data.slice(0, 5);

  const PADDING = 15;
  const cx = OUTER_RADIUS + PADDING;
  const cy = OUTER_RADIUS + PADDING;
  const svgW = cx * 2 + 10;
  const svgH = cy * 2;

  const labelX = cx + 6;

  const rings = items.map((item, i) => {
    const r = OUTER_RADIUS - i * (RING_THICKNESS + RING_GAP);
    const circumference = 2 * Math.PI * r;
    const pct = Math.min(Math.max(item.value, 0), 100);
    const offset = circumference - (circumference * pct) / 100;

    const labelY = cy - r - 5;

    return { ...item, r, circumference, pct, offset, color: COLORS[i % COLORS.length], labelY };
  });

  return (
    <div className="rings-card" ref={cardRef}>
      <div className="rings-content">
        <div className="rings-svg-wrap">
          <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
            {rings.map((ring) => (
              <g key={ring.name}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={ring.r}
                  fill="none"
                  stroke={TRACK_COLOR}
                  strokeWidth={RING_THICKNESS}
                />
                {/* Rotate to 12 o'clock start, flip to run clockwise */}
                <circle
                  className="rings-arc"
                  cx={cx}
                  cy={cy}
                  r={ring.r}
                  fill="none"
                  stroke={ring.color}
                  strokeWidth={RING_THICKNESS}
                  strokeLinecap="round"
                  strokeDasharray={ring.circumference}
                  strokeDashoffset={mounted ? ring.offset : ring.circumference}
                  transform={`rotate(-90 ${cx} ${cy}) scale(1,-1) translate(0,-${cy * 2})`}
                />
                <text className="rings-pct" x={labelX} y={ring.labelY}>
                  {Math.round(ring.pct)}%
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="rings-legend">
          {rings.map((ring) => (
            <div className="rings-legend-item" key={ring.name}>
              <span className="rings-legend-dot" style={{ backgroundColor: ring.color }} />
              <span className="rings-legend-label">{ring.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
