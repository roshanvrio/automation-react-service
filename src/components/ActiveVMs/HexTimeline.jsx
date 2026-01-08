import { useEffect, useState, useMemo } from "react";
import "./HexTimeline.css";

/**
 * HexTimeline - 24-hour timeline around hexagon
 * Each side = 4 hours (6 sides = 24 hours)
 * Green = SUCCESS, Red = ERROR, Orange = EXCEPTION
 * Pulsing glowing dot = current time (with ripple effect every ~12s)
 */

const SVG_WIDTH = 100;
const SVG_HEIGHT = 100;

// Hexagon vertices matching clip-path: polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)
// Scaled to viewBox 0-100
const HEX_POINTS = [
  [20, 0],    // 0: top-left (0 hours)
  [80, 0],    // 1: top-right (4 hours)
  [100, 50],  // 2: right (8 hours)
  [80, 100],  // 3: bottom-right (12 hours)
  [20, 100],  // 4: bottom-left (16 hours)
  [0, 50],    // 5: left (20 hours)
];

// Calculate side lengths
const calcDistance = (p1, p2) => Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2);

const SIDE_LENGTHS = [];
let TOTAL_PERIMETER = 0;
for (let i = 0; i < 6; i++) {
  const len = calcDistance(HEX_POINTS[i], HEX_POINTS[(i + 1) % 6]);
  SIDE_LENGTHS.push(len);
  TOTAL_PERIMETER += len;
}

// Convert hours (0-24) to point on hexagon
const hoursToPoint = (hours) => {
  const normalized = ((hours % 24) + 24) % 24;
  const fraction = normalized / 24;
  let targetDist = fraction * TOTAL_PERIMETER;

  let accumulated = 0;
  for (let i = 0; i < 6; i++) {
    const sideLen = SIDE_LENGTHS[i];
    if (accumulated + sideLen >= targetDist) {
      const progress = (targetDist - accumulated) / sideLen;
      const p1 = HEX_POINTS[i];
      const p2 = HEX_POINTS[(i + 1) % 6];
      return {
        x: p1[0] + (p2[0] - p1[0]) * progress,
        y: p1[1] + (p2[1] - p1[1]) * progress,
      };
    }
    accumulated += sideLen;
  }
  return { x: HEX_POINTS[0][0], y: HEX_POINTS[0][1] };
};

// Parse time string to decimal hours
const parseTime = (timeStr) => {
  if (!timeStr) return null;
  const match = timeStr.match(/(\d{1,2}):(\d{2}):?(\d{2})?/);
  if (!match) return null;
  return parseInt(match[1]) + parseInt(match[2]) / 60 + parseInt(match[3] || 0) / 3600;
};

// Generate points for a time segment
const generateSegmentPoints = (startHours, endHours) => {
  if (endHours < startHours) {
    return [
      ...generateSegmentPoints(startHours, 24),
      ...generateSegmentPoints(0, endHours)
    ];
  }

  const points = [];
  const start = hoursToPoint(startHours);
  points.push(`${start.x},${start.y}`);

  const startFrac = startHours / 24;
  const endFrac = endHours / 24;

  let accumulated = 0;
  for (let i = 0; i < 6; i++) {
    const sideFrac = SIDE_LENGTHS[i] / TOTAL_PERIMETER;
    const sideEndFrac = accumulated + sideFrac;

    if (sideEndFrac > startFrac && sideEndFrac < endFrac) {
      const vertex = HEX_POINTS[(i + 1) % 6];
      points.push(`${vertex[0]},${vertex[1]}`);
    }
    accumulated += sideFrac;
  }

  const end = hoursToPoint(endHours);
  points.push(`${end.x},${end.y}`);

  return points;
};

// Get current time as decimal hours
const getCurrentHours = () => {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
};

const HexTimeline = ({ transactions = [], machineName }) => {
  const [currentTime, setCurrentTime] = useState(getCurrentHours());

  // Debug: log transactions for this VM
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      console.log(`🕐 HexTimeline [${machineName}] transactions:`, transactions);
    }
  }, [transactions, machineName]);

  // Update current time every minute (not every second since no animation)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentHours());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Process transactions
  const segments = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    return transactions
      .map(tx => {
        const startHours = parseTime(tx.startTime);
        const endHours = parseTime(tx.endTime);
        if (startHours === null || endHours === null) return null;

        let type = 'success';
        if (tx.caseStatus === 'ERROR') type = 'error';
        else if (tx.caseStatus === 'EXCEPTION') type = 'exception';

        return {
          type,
          points: generateSegmentPoints(startHours, endHours),
          processName: tx.processName
        };
      })
      .filter(Boolean);
  }, [transactions]);

  const currentPos = useMemo(() => hoursToPoint(currentTime), [currentTime]);
  const hexPath = HEX_POINTS.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]},${p[1]}`).join(' ') + ' Z';

  // Path for the tracer light - from 00:00 around the full hexagon
  const tracerPath = `M ${HEX_POINTS[0][0]},${HEX_POINTS[0][1]} ` +
    HEX_POINTS.slice(1).map(p => `L ${p[0]},${p[1]}`).join(' ') +
    ` L ${HEX_POINTS[0][0]},${HEX_POINTS[0][1]}`;

  return (
    <svg
      className="hex-timeline"
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      preserveAspectRatio="none"
    >
      {/* Glow filter for segments */}
      <defs>
        <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-orange" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-dot" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Base dotted hexagon border */}
      <path
        d={hexPath}
        fill="none"
        strokeDasharray="4,3"
        className="timeline-base"
      />

      {/* Tracer light - moving glow along the hexagon edge */}
      <circle r="2" className="timeline-tracer">
        <animateMotion
          dur="8s"
          repeatCount="indefinite"
          path={tracerPath}
        />
      </circle>
      <circle r="1.5" className="timeline-tracer-core">
        <animateMotion
          dur="8s"
          repeatCount="indefinite"
          path={tracerPath}
        />
      </circle>

      {/* 00:00 Start marker at top-left (midnight) */}
      <circle cx={HEX_POINTS[0][0]} cy={HEX_POINTS[0][1]} r="3" className="start-dot" />

      {/* Transaction segments */}
      {segments.map((seg, idx) => (
        <polyline
          key={`${machineName}-seg-${idx}`}
          points={seg.points.join(' ')}
          fill="none"
          className={`timeline-segment timeline-${seg.type}`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <title>{seg.processName} ({seg.type.toUpperCase()})</title>
        </polyline>
      ))}

      {/* Ripple effect - expanding ring to show direction */}
      <circle
        cx={currentPos.x}
        cy={currentPos.y}
        r="3"
        className="timeline-ripple"
      />

      {/* Current time dot - pulsing glow to indicate movement */}
      <circle
        cx={currentPos.x}
        cy={currentPos.y}
        r="3"
        className="timeline-dot"
        filter="url(#glow-dot)"
      />
    </svg>
  );
};

export default HexTimeline;
