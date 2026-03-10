import { useEffect, useState, useMemo } from "react";
import "./HexTimeline.css";

/**
 * HexTimeline - 24-hour timeline around hexagon (Concentric Rings)
 * Each side = 4 hours (6 sides = 24 hours)
 * Outer ring = SUCCESS (green), Middle ring = ERROR (red), Inner ring = EXCEPTION (purple)
 * Pulsing glowing dot = current time (with ripple effect every ~12s)
 */

const SVG_WIDTH = 100;
const SVG_HEIGHT = 100;
const HEX_CENTER = { x: 50, y: 50 };

// Base hexagon vertices matching clip-path: polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)
const BASE_HEX_POINTS = [
  [20, 0],    // 0: top-left (0 hours)
  [80, 0],    // 1: top-right (4 hours)
  [100, 50],  // 2: right (8 hours)
  [80, 100],  // 3: bottom-right (12 hours)
  [20, 100],  // 4: bottom-left (16 hours)
  [0, 50],    // 5: left (20 hours)
];

// Scale hex points from center to create concentric rings
const scaleHexPoints = (points, scale) =>
  points.map(([x, y]) => [
    HEX_CENTER.x + (x - HEX_CENTER.x) * scale,
    HEX_CENTER.y + (y - HEX_CENTER.y) * scale,
  ]);

// Three concentric rings: outer (success), middle (error), inner (exception)
const RING_SCALES = {
  success: 1.07,
  error: 0.97,
  exception: 0.87,
};

const RING_HEX_POINTS = {
  success: scaleHexPoints(BASE_HEX_POINTS, RING_SCALES.success),
  error: scaleHexPoints(BASE_HEX_POINTS, RING_SCALES.error),
  exception: scaleHexPoints(BASE_HEX_POINTS, RING_SCALES.exception),
};

// Calculate side lengths and perimeter for a set of hex points
const calcDistance = (p1, p2) => Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2);

const calcPerimeterData = (hexPoints) => {
  const sideLengths = [];
  let totalPerimeter = 0;
  for (let i = 0; i < 6; i++) {
    const len = calcDistance(hexPoints[i], hexPoints[(i + 1) % 6]);
    sideLengths.push(len);
    totalPerimeter += len;
  }
  return { sideLengths, totalPerimeter };
};

// Pre-compute perimeter data for each ring
const RING_PERIMETER = {
  success: calcPerimeterData(RING_HEX_POINTS.success),
  error: calcPerimeterData(RING_HEX_POINTS.error),
  exception: calcPerimeterData(RING_HEX_POINTS.exception),
};

// Also compute for the base (used for tracer, current time dot, etc.)
const BASE_PERIMETER = calcPerimeterData(BASE_HEX_POINTS);

// Convert hours (0-24) to point on a specific ring's hexagon
const hoursToPointOnRing = (hours, ring) => {
  const hexPoints = RING_HEX_POINTS[ring];
  const { sideLengths, totalPerimeter } = RING_PERIMETER[ring];

  const normalized = ((hours % 24) + 24) % 24;
  const fraction = normalized / 24;
  let targetDist = fraction * totalPerimeter;

  let accumulated = 0;
  for (let i = 0; i < 6; i++) {
    const sideLen = sideLengths[i];
    if (accumulated + sideLen >= targetDist) {
      const progress = (targetDist - accumulated) / sideLen;
      const p1 = hexPoints[i];
      const p2 = hexPoints[(i + 1) % 6];
      return {
        x: p1[0] + (p2[0] - p1[0]) * progress,
        y: p1[1] + (p2[1] - p1[1]) * progress,
      };
    }
    accumulated += sideLen;
  }
  return { x: hexPoints[0][0], y: hexPoints[0][1] };
};

// Convert hours to point on the base hexagon (for tracer, current time, etc.)
const hoursToPoint = (hours) => {
  const normalized = ((hours % 24) + 24) % 24;
  const fraction = normalized / 24;
  let targetDist = fraction * BASE_PERIMETER.totalPerimeter;

  let accumulated = 0;
  for (let i = 0; i < 6; i++) {
    const sideLen = BASE_PERIMETER.sideLengths[i];
    if (accumulated + sideLen >= targetDist) {
      const progress = (targetDist - accumulated) / sideLen;
      const p1 = BASE_HEX_POINTS[i];
      const p2 = BASE_HEX_POINTS[(i + 1) % 6];
      return {
        x: p1[0] + (p2[0] - p1[0]) * progress,
        y: p1[1] + (p2[1] - p1[1]) * progress,
      };
    }
    accumulated += sideLen;
  }
  return { x: BASE_HEX_POINTS[0][0], y: BASE_HEX_POINTS[0][1] };
};

// Parse time string to a local Date object
// Server sends Singapore time (UTC+8), so we convert to viewer's local timezone
const parseDateTime = (timeStr) => {
  if (!timeStr) return null;

  // Try full datetime format: "2026-03-05 04:34:30"
  const dtMatch = timeStr.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2}):?(\d{2})?/);
  if (dtMatch) {
    const isoStr = `${dtMatch[1]}-${dtMatch[2]}-${dtMatch[3]}T${dtMatch[4].padStart(2, '0')}:${dtMatch[5]}:${dtMatch[6] || '00'}+08:00`;
    const d = new Date(isoStr);
    if (!isNaN(d)) return d;
  }

  // Fallback: time-only format "HH:mm:ss" — treat as Singapore time today
  const tMatch = timeStr.match(/(\d{1,2}):(\d{2}):?(\d{2})?/);
  if (!tMatch) return null;
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const isoStr = `${yyyy}-${mm}-${dd}T${tMatch[1].padStart(2, '0')}:${tMatch[2]}:${tMatch[3] || '00'}+08:00`;
  const d = new Date(isoStr);
  if (!isNaN(d)) return d;
  return null;
};

// Extract decimal hours from a Date object
const dateToHours = (d) => d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;

// Get start of today (midnight) in local timezone
const getLocalTodayStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// Generate points for a time segment on a specific ring
const generateSegmentPoints = (startHours, endHours, ring) => {
  const hexPoints = RING_HEX_POINTS[ring];
  const { sideLengths, totalPerimeter } = RING_PERIMETER[ring];

  if (endHours < startHours) {
    return [
      ...generateSegmentPoints(startHours, 24, ring),
      ...generateSegmentPoints(0, endHours, ring)
    ];
  }

  const points = [];
  const start = hoursToPointOnRing(startHours, ring);
  points.push(`${start.x},${start.y}`);

  const startFrac = startHours / 24;
  const endFrac = endHours / 24;

  let accumulated = 0;
  for (let i = 0; i < 6; i++) {
    const sideFrac = sideLengths[i] / totalPerimeter;
    const sideEndFrac = accumulated + sideFrac;

    if (sideEndFrac > startFrac && sideEndFrac < endFrac) {
      const vertex = hexPoints[(i + 1) % 6];
      points.push(`${vertex[0]},${vertex[1]}`);
    }
    accumulated += sideFrac;
  }

  const end = hoursToPointOnRing(endHours, ring);
  points.push(`${end.x},${end.y}`);

  return points;
};

// Get current time as decimal hours in viewer's local timezone
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

  // Process transactions - each type goes on its own ring
  const { segments, completionDots } = useMemo(() => {
    if (!transactions || transactions.length === 0) return { segments: [], completionDots: [] };

    const segs = [];
    const dots = [];
    const todayStart = getLocalTodayStart();
    const now = new Date();

    transactions.forEach(tx => {
      const startDate = parseDateTime(tx.startTime);
      const endDate = parseDateTime(tx.endTime);
      if (!startDate || !endDate) return;

      let type = 'success';
      if (tx.caseStatus === 'ERROR') type = 'error';
      else if (tx.caseStatus === 'EXCEPTION') type = 'exception';

      // Skip transactions that ended before today
      if (endDate < todayStart) return;

      // Clamp start to today's midnight if it started before today
      const clampedStart = startDate < todayStart ? todayStart : startDate;
      // Clamp end to current time so segments don't exceed "now"
      const clampedEnd = endDate > now ? now : endDate;

      // Skip if clamped range is invalid
      if (clampedStart >= clampedEnd) return;

      const startHours = dateToHours(clampedStart);
      const endHours = dateToHours(clampedEnd);

      // Generate segment on the ring for this type
      const points = generateSegmentPoints(startHours, endHours, type);
      if (points.length >= 2) {
        segs.push({
          type,
          points: points.join(' '),
          processName: tx.processName
        });
      }

      // Add dot at end time on the correct ring
      if (endDate <= now && endDate >= todayStart) {
        const pos = hoursToPointOnRing(dateToHours(endDate), type);
        dots.push({
          type,
          x: pos.x,
          y: pos.y,
          processName: tx.processName
        });
      }
    });

    return { segments: segs, completionDots: dots };
  }, [transactions, currentTime]);

  const currentPos = useMemo(() => hoursToPoint(currentTime), [currentTime]);

  // Generate hex paths for each ring (dotted guide lines)
  const ringPaths = useMemo(() => {
    const paths = {};
    for (const ring of ['success', 'error', 'exception']) {
      const pts = RING_HEX_POINTS[ring];
      paths[ring] = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]},${p[1]}`).join(' ') + ' Z';
    }
    return paths;
  }, []);

  // Path for the tracer light - from 00:00 around the full hexagon (base ring)
  const tracerPath = `M ${BASE_HEX_POINTS[0][0]},${BASE_HEX_POINTS[0][1]} ` +
    BASE_HEX_POINTS.slice(1).map(p => `L ${p[0]},${p[1]}`).join(' ') +
    ` L ${BASE_HEX_POINTS[0][0]},${BASE_HEX_POINTS[0][1]}`;

  // Check which rings have data (to only show guides for active rings)
  const activeRings = useMemo(() => {
    const rings = new Set();
    segments.forEach(seg => rings.add(seg.type));
    completionDots.forEach(dot => rings.add(dot.type));
    return rings;
  }, [segments, completionDots]);

  return (
    <svg
      className="hex-timeline"
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      preserveAspectRatio="none"
    >
      {/* Base dotted hexagon border (middle ring - always visible) */}
      <path
        d={ringPaths.error}
        fill="none"
        strokeDasharray="4,3"
        className="timeline-base"
      />

      {/* Subtle guide rings for outer and inner - only shown when they have data */}
      {activeRings.has('success') && (
        <path
          d={ringPaths.success}
          fill="none"
          strokeDasharray="2,4"
          className="timeline-ring-guide timeline-ring-guide-success"
        />
      )}
      {activeRings.has('exception') && (
        <path
          d={ringPaths.exception}
          fill="none"
          strokeDasharray="2,4"
          className="timeline-ring-guide timeline-ring-guide-exception"
        />
      )}

      {/* Transaction segments - each type on its own concentric ring */}
      {segments.map((seg, idx) => (
        <polyline
          key={`${machineName}-seg-${idx}`}
          points={seg.points}
          fill="none"
          stroke={seg.type === 'success' ? '#4caf50' : seg.type === 'error' ? '#f44336' : '#ab47bc'}
          strokeWidth="1.5"
          strokeLinecap="butt"
          className={`timeline-segment timeline-segment-${seg.type}`}
        >
          <title>{seg.processName} ({seg.type.toUpperCase()})</title>
        </polyline>
      ))}

      {/* Tracer light - moving along base hexagon edge */}
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
      <circle cx={BASE_HEX_POINTS[0][0]} cy={BASE_HEX_POINTS[0][1]} r="3" className="start-dot" />

      {/* Transaction completion dots - on their respective rings */}
      {completionDots.map((dot, idx) => (
        <circle
          key={`${machineName}-dot-${idx}`}
          cx={dot.x}
          cy={dot.y}
          r="2"
          className={`timeline-${dot.type}-fill`}
        >
          <title>{dot.processName} ({dot.type.toUpperCase()})</title>
        </circle>
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
      />
    </svg>
  );
};

export default HexTimeline;
