import { useId, useMemo, useState, useEffect, useRef } from 'react';
import formatCompact from '../../utils/formatCompact';
import './SLAGauge.css';

/** Red ≤50%, Amber 50-80%, Green >80% */
const getZoneColor = (val) => {
  if (val <= 50) return '#FF4D4D';
  if (val <= 80) return '#FFB347';
  return '#00D084';
};

const dotAngles = [126, 90, 54];
const dotColors = ['#ff6600', '#ffcc00', '#00ff2a'];

const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const ANIM_DURATION = 1200;

const GAUGE_GEOM = {
  default: { r: 120, arcStroke: 20, trackStroke: 14, dotR: 10, needleW: 3, pivotOuter: 8, pivotMid: 5, pivotInner: 2.5, pctFs: 36, pctOffY: 36, ontimeFs: 12, ontimeOffY: 14 },
  medium:  { r: 105, arcStroke: 17, trackStroke: 12, dotR: 8,  needleW: 2.5, pivotOuter: 7, pivotMid: 4.5, pivotInner: 2, pctFs: 30, pctOffY: 30, ontimeFs: 10, ontimeOffY: 12 },
  high:    { r: 90,  arcStroke: 14, trackStroke: 10, dotR: 6,  needleW: 2, pivotOuter: 6, pivotMid: 4, pivotInner: 1.8, pctFs: 25, pctOffY: 26, ontimeFs: 9, ontimeOffY: 10 },
};

const CX = 150, CY = 140;

export default function SLAGauge({
  value = 0,
  label = '',
  transactions = 0,
  weeklySla = 0,
  weeklyCount = 0,
  monthlySla = 0,
  monthlyCount = 0,
  density = 'default',
}) {
  const pct = Math.min(Math.max(value, 0), 100);
  const [animatedValue, setAnimatedValue] = useState(0);
  const animFrameRef = useRef(null);
  const prevValueRef = useRef(0);

  const g = GAUGE_GEOM[density];
  const r = g.r;
  const needleLen = r * 0.95;

  const arcD = `M ${CX - r} ${CY} A ${r} ${r} 0 0 1 ${CX + r} ${CY}`;
  const dots = useMemo(() =>
    dotAngles.map((deg) => {
      const rad = (deg * Math.PI) / 180;
      return { x: CX + r * Math.cos(rad), y: CY - r * Math.sin(rad) };
    }),
    [r]
  );

  useEffect(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const startValue = prevValueRef.current;
    const target = Math.min(Math.max(value, 0), 100);
    prevValueRef.current = target;

    if (startValue === target) return;

    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / ANIM_DURATION, 1);
      setAnimatedValue(startValue + (target - startValue) * easeOut(progress));

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [value]);

  const mainColor = getZoneColor(pct);
  const weeklyColor = getZoneColor(weeklySla);
  const monthlyColor = getZoneColor(monthlySla);

  const angleDeg = 180 - (animatedValue / 100) * 180;
  const angleRad = (angleDeg * Math.PI) / 180;
  const tipX = CX + needleLen * Math.cos(angleRad);
  const tipY = CY - needleLen * Math.sin(angleRad);

  const uid = useId().replace(/:/g, '');

  return (
    <div className="sla-gauge" data-density={density}>
      <div className="sla-gauge-summary">
        <div className="sla-gauge-summary-box">
          <span className="sla-gauge-summary-title">Weekly</span>
          <div className="sla-gauge-summary-values">
            <span className="sla-gauge-summary-pct" style={{ color: weeklyColor }}>{weeklySla}%</span>
            <span className="sla-gauge-summary-count">{formatCompact(weeklyCount)}</span>
          </div>
        </div>
        <div className="sla-gauge-summary-box">
          <span className="sla-gauge-summary-title">Monthly</span>
          <div className="sla-gauge-summary-values">
            <span className="sla-gauge-summary-pct" style={{ color: monthlyColor }}>{monthlySla}%</span>
            <span className="sla-gauge-summary-count">{formatCompact(monthlyCount)}</span>
          </div>
        </div>
      </div>

      <div className="sla-gauge-meter">
        <svg viewBox="0 0 300 160" className="sla-gauge-svg">
          <defs>
            <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FF4D4D" />
              <stop offset="30%" stopColor="#FF8A3D" />
              <stop offset="55%" stopColor="#FFD54F" />
              <stop offset="75%" stopColor="#6BE675" />
              <stop offset="100%" stopColor="#00D084" />
            </linearGradient>

            <filter id={`ag-${uid}`} x="-15%" y="-15%" width="130%" height="130%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b1" />
              <feColorMatrix in="b1" type="matrix"
                values="0 0 0 0 0  0 1 0 0 0.4  0 0 0 0 0.3  0 0 0 0.35 0"
                result="greenBlur" />
              <feMerge>
                <feMergeNode in="greenBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id={`ng-${uid}`}>
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id={`tg-${uid}`}>
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path d={arcD} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={g.trackStroke} strokeLinecap="round" />

          <path
            d={arcD}
            fill="none"
            stroke={`url(#g-${uid})`}
            strokeWidth={g.arcStroke}
            strokeLinecap="round"
            filter={`url(#ag-${uid})`}
          />

          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={g.dotR} fill={dotColors[i]} />
          ))}

          <g filter={`url(#ng-${uid})`} className="sla-gauge-needle">
            <line
              x1={CX} y1={CY}
              x2={tipX} y2={tipY}
              stroke="#00E5FF"
              strokeWidth={g.needleW}
              strokeLinecap="round"
            />
          </g>

          <circle cx={CX} cy={CY} r={g.pivotOuter} fill="none" stroke="#00E5FF" strokeWidth="1.5" opacity="0.35" />
          <circle cx={CX} cy={CY} r={g.pivotMid} fill="#00E5FF" />
          <circle cx={CX} cy={CY} r={g.pivotInner} fill="#121c2e" />

          <text
            x={CX} y={CY - g.pctOffY}
            textAnchor="middle"
            className="sla-gauge-pct-text"
            filter={`url(#tg-${uid})`}
            style={{ fill: mainColor, fontSize: g.pctFs }}
          >
            {pct}%
          </text>
          <text
            x={CX} y={CY - g.ontimeOffY}
            textAnchor="middle"
            className="sla-gauge-ontime-text"
            style={{ fontSize: g.ontimeFs }}
          >
            ON-TIME
          </text>
        </svg>
      </div>

      <div className="sla-gauge-footer">
        <span className="sla-gauge-label">{label}</span>
        <span className="sla-gauge-footer-sep"></span>
        <span className="sla-gauge-transactions">Transactions {formatCompact(transactions)}</span>
      </div>
    </div>
  );
}
