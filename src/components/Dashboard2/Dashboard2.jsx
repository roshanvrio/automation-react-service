import { useState, useEffect, useMemo } from "react";
import * as d3 from "d3";

// ─── Sample Data ───────────────────────────────────────────
const COUNTRIES_DATA = [
  { id: "US", name: "United States", lat: 39.8283, lng: -98.5795, value: 850, category: "successful" },
  { id: "BR", name: "Brazil", lat: -14.235, lng: -51.9253, value: 620, category: "moderate" },
  { id: "GB", name: "UK", lat: 55.3781, lng: -3.436, value: 180, category: "moderate" },
  { id: "DE", name: "Germany", lat: 51.1657, lng: 10.4515, value: 220, category: "moderate" },
  { id: "FR", name: "France", lat: 46.2276, lng: 2.2137, value: 310, category: "moderate" },
  { id: "IN", name: "India", lat: 20.5937, lng: 78.9629, value: 1250, category: "successful" },
  { id: "CN", name: "China", lat: 35.8617, lng: 104.1954, value: 1100, category: "successful" },
  { id: "JP", name: "Japan", lat: 36.2048, lng: 138.2529, value: 480, category: "successful" },
  { id: "KR", name: "S. Korea", lat: 35.9078, lng: 127.7669, value: 350, category: "successful" },
  { id: "AU", name: "Australia", lat: -25.2744, lng: 133.7751, value: 280, category: "least" },
  { id: "ZA", name: "South Africa", lat: -30.5595, lng: 22.9375, value: 150, category: "least" },
  { id: "NG", name: "Nigeria", lat: 9.082, lng: 8.6753, value: 190, category: "moderate" },
  { id: "AE", name: "UAE", lat: 23.4241, lng: 53.8478, value: 260, category: "successful" },
  { id: "SG", name: "Singapore", lat: 1.3521, lng: 103.8198, value: 200, category: "moderate" },
  { id: "MX", name: "Mexico", lat: 23.6345, lng: -102.5528, value: 170, category: "least" },
  { id: "CA", name: "Canada", lat: 56.1304, lng: -106.3468, value: 340, category: "least" },
  { id: "SE", name: "Sweden", lat: 60.1282, lng: 18.6435, value: 120, category: "least" },
  { id: "EG", name: "Egypt", lat: 26.8206, lng: 30.8025, value: 160, category: "moderate" },
];

const CATEGORY_COLORS = {
  successful: {
    base: "#00BC7D", light: "#4aeaab", dark: "#008a5c",
    glow: "#00BC7D",
  },
  moderate: {
    base: "#FE9A00", light: "#ffc04d", dark: "#c77800",
    glow: "#FE9A00",
  },
  least: {
    base: "#FB2C36", light: "#ff7a7a", dark: "#c41e26",
    glow: "#FB2C36",
  },
};

const CATEGORY_LABELS = {
  successful: "Successful",
  moderate: "Moderate",
  least: "Least Successful",
};

const WORLD_GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const formatK = (n) => {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return n.toString();
};

// ─── CSS ───────────────────────────────────────────────────
const globalCSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,700&family=Space+Mono:wght@400;700&display=swap');

@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(2.2); opacity: 0; }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes scan-line {
  0% { top: 0%; }
  100% { top: 100%; }
}
@keyframes grid-flow {
  0% { background-position: 0 0; }
  100% { background-position: 40px 40px; }
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

// ─── SVG Defs ──────────────────────────────────────────────
function MapDefs() {
  return (
    <defs>
      {Object.entries(CATEGORY_COLORS).map(([cat, c]) => (
        <g key={cat}>
          <radialGradient id={`dot-${cat}`} cx="38%" cy="32%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="25%" stopColor={c.light} stopOpacity="0.7" />
            <stop offset="65%" stopColor={c.base} stopOpacity="0.8" />
            <stop offset="100%" stopColor={c.dark} stopOpacity="0.95" />
          </radialGradient>
          <filter id={`glow-${cat}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feFlood floodColor={c.glow} floodOpacity="0.4" result="c" />
            <feComposite in="c" in2="b" operator="in" result="g" />
            <feMerge>
              <feMergeNode in="g" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </g>
      ))}
      <filter id="land-glow" x="-2%" y="-2%" width="104%" height="104%">
        <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#0ea5e9" floodOpacity="0.05" />
      </filter>
    </defs>
  );
}

// ─── Dot Marker ────────────────────────────────────────────
function DotMarker({ x, y, r, pct, category, name }) {
  const c = CATEGORY_COLORS[category];
  return (
    <g>
      <circle cx={x} cy={y} r={r + 3} fill={c.glow} opacity="0.1" />
      <circle cx={x} cy={y} r={r + 1.5} fill="none" stroke={c.base} strokeWidth="0.5" opacity="0.18"
        style={{ animation: "pulse-ring 4s ease-out infinite", transformOrigin: `${x}px ${y}px` }} />
      <circle cx={x} cy={y} r={r} fill={`url(#dot-${category})`}
        filter={`url(#glow-${category})`}
        stroke={c.base} strokeWidth="0.7" strokeOpacity="0.45" />
      <circle cx={x - r * 0.2} cy={y - r * 0.24} r={r * 0.3}
        fill="white" opacity="0.3" />
      <text x={x} y={y - r - 5} textAnchor="middle"
        fill="#e2e8f0" fontSize="7.5" fontFamily="'DM Sans', sans-serif"
        fontWeight="600" letterSpacing="0.3"
        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.5)" }}>
        {name}
      </text>
      <text x={x} y={y + r + 10} textAnchor="middle"
        fill={c.base} fontSize="7" fontFamily="'Space Mono', monospace"
        fontWeight="700" opacity="0.9"
        style={{ textShadow: `0 0 4px ${c.glow}30` }}>
        {pct}%
      </text>
    </g>
  );
}

// ─── World Map (responsive) ────────────────────────────────
function WorldMap({ data }) {
  const [geoData, setGeoData] = useState(null);
  const W = 560;
  const H = 340;

  useEffect(() => {
    fetch(WORLD_GEO_URL).then(r => r.json()).then(setGeoData);
  }, []);

  const projection = useMemo(
    () => d3.geoNaturalEarth1().scale(W / 5.2).translate([W / 2, H / 2 + 10]),
    []
  );
  const pathGen = useMemo(() => d3.geoPath().projection(projection), [projection]);
  const totalValue = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);
  const bubbleScale = useMemo(
    () => d3.scaleLinear().domain([0, d3.max(data, d => d.value)]).range([4, 13]),
    [data]
  );

  const countries = useMemo(() => {
    if (!geoData) return [];
    try {
      const key = Object.keys(geoData.objects)[0];
      const geometries = geoData.objects[key].geometries;
      const arcs = geoData.arcs;
      const t = geoData.transform;
      const decodeArc = (ai) => {
        const rev = ai < 0; const idx = rev ? ~ai : ai;
        let arc = arcs[idx], coords = [], x = 0, y = 0;
        for (let i = 0; i < arc.length; i++) {
          x += arc[i][0]; y += arc[i][1];
          coords.push([t ? x * t.scale[0] + t.translate[0] : x, t ? y * t.scale[1] + t.translate[1] : y]);
        }
        if (rev) coords.reverse(); return coords;
      };
      const decodeRing = (ring) => {
        let c = [];
        for (const ai of ring) { const d = decodeArc(ai); c = c.concat(d.slice(c.length ? 1 : 0)); }
        return c;
      };
      return geometries.map(g => {
        if (g.type === "Polygon") return { type: "Feature", geometry: { type: "Polygon", coordinates: g.arcs.map(decodeRing) } };
        if (g.type === "MultiPolygon") return { type: "Feature", geometry: { type: "MultiPolygon", coordinates: g.arcs.map(p => p.map(decodeRing)) } };
        return null;
      }).filter(Boolean);
    } catch { return []; }
  }, [geoData]);

  const graticule = useMemo(() => d3.geoGraticule10(), []);
  const sorted = useMemo(() => [...data].sort((a, b) => b.value - a.value), [data]);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", display: "block" }}>
      <MapDefs />
      <path d={pathGen(graticule)} fill="none" stroke="#1e3a5f" strokeWidth="0.25" strokeOpacity="0.25" />
      <g filter="url(#land-glow)">
        {countries.map((f, i) => (
          <path key={i} d={pathGen(f)} fill="#0E394E" stroke="#16536e" strokeWidth="0.4" strokeOpacity="0.5" />
        ))}
      </g>
      {sorted.map(d => {
        const c = projection([d.lng, d.lat]);
        if (!c) return null;
        const pct = ((d.value / totalValue) * 100).toFixed(1);
        return <DotMarker key={d.id} x={c[0]} y={c[1]} r={bubbleScale(d.value)} pct={pct} category={d.category} name={d.name} />;
      })}
    </svg>
  );
}

// ─── KPI Card ──────────────────────────────────────────────
function KpiCard({ label, value, sub, color, icon, delay }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.65) 100%)",
      border: "1px solid rgba(30,58,95,0.45)",
      borderRadius: "10px",
      padding: "14px 16px",
      backdropFilter: "blur(12px)",
      animation: `fadeInUp 0.5s ease ${delay}s both`,
      borderLeft: `3px solid ${color}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{
          fontSize: "9px", fontFamily: "'Space Mono', monospace",
          color: "#64748b", textTransform: "uppercase", letterSpacing: "1.2px",
        }}>{label}</span>
        {icon && <span style={{ fontSize: "14px", opacity: 0.4 }}>{icon}</span>}
      </div>
      <div style={{
        fontSize: "24px", fontFamily: "'DM Sans', sans-serif",
        fontWeight: "700", color: color || "#e2e8f0", lineHeight: 1,
      }}>{value}</div>
      {sub && <div style={{
        fontSize: "10px", fontFamily: "'DM Sans', sans-serif", color: "#475569", marginTop: "5px",
      }}>{sub}</div>}
    </div>
  );
}

// ─── Legend Dot ─────────────────────────────────────────────
function LegendDot({ category, label, count }) {
  const c = CATEGORY_COLORS[category];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{
        width: "8px", height: "8px", borderRadius: "50%",
        background: c.base, boxShadow: `0 0 6px ${c.glow}50`,
      }} />
      <span style={{
        fontSize: "10px", fontFamily: "'DM Sans', sans-serif",
        color: "#94a3b8", fontWeight: "500",
      }}>{label}</span>
      <span style={{
        fontSize: "10px", fontFamily: "'Space Mono', monospace",
        color: "#475569",
      }}>({count})</span>
    </div>
  );
}

// ─── Region Bar ────────────────────────────────────────────
function RegionBar({ label, count, total, color, delay }) {
  return (
    <div style={{ animation: `fadeInUp 0.5s ease ${delay}s both` }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
        <span style={{ fontSize: "10px", fontFamily: "'DM Sans', sans-serif", color: "#94a3b8", fontWeight: "500" }}>{label}</span>
        <span style={{ fontSize: "9px", fontFamily: "'Space Mono', monospace", color: "#64748b" }}>{count}</span>
      </div>
      <div style={{ height: "3px", background: "rgba(30,58,95,0.35)", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{
          width: `${(count / total) * 100}%`, height: "100%",
          background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: "2px",
          transition: "width 0.6s ease",
        }} />
      </div>
    </div>
  );
}

// ─── Country Row ───────────────────────────────────────────
function CountryRow({ rank, name, value, max, category, delay }) {
  const c = CATEGORY_COLORS[category];
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "8px",
      animation: `fadeInUp 0.4s ease ${delay}s both`,
    }}>
      <span style={{ fontSize: "9px", fontFamily: "'Space Mono', monospace", color: "#475569", width: "16px" }}>
        {String(rank).padStart(2, "0")}
      </span>
      <div style={{
        width: "6px", height: "6px", borderRadius: "50%",
        background: c.base, flexShrink: 0,
      }} />
      <span style={{ fontSize: "10px", fontFamily: "'DM Sans', sans-serif", color: "#cbd5e1", fontWeight: "500", width: "55px", flexShrink: 0 }}>
        {name}
      </span>
      <div style={{ flex: 1, height: "4px", background: "rgba(30,58,95,0.25)", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{
          width: `${(value / max) * 100}%`, height: "100%",
          background: `linear-gradient(90deg, ${c.base}30, ${c.base})`, borderRadius: "2px",
        }} />
      </div>
      <span style={{
        fontSize: "10px", fontFamily: "'Space Mono', monospace",
        color: c.base, fontWeight: "700", width: "36px", textAlign: "right",
      }}>{formatK(value)}</span>
    </div>
  );
}

// ─── Category Breakdown Card ───────────────────────────────
function CategoryBreakdown({ data, totalValue }) {
  const groups = { successful: 0, moderate: 0, least: 0 };
  data.forEach(d => { groups[d.category] = (groups[d.category] || 0) + d.value; });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {Object.entries(groups).map(([cat, val], i) => {
        const c = CATEGORY_COLORS[cat];
        const pct = ((val / totalValue) * 100).toFixed(1);
        return (
          <div key={cat} style={{ animation: `fadeInUp 0.4s ease ${0.6 + i * 0.1}s both` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: c.base }} />
                <span style={{ fontSize: "10px", fontFamily: "'DM Sans', sans-serif", color: "#94a3b8", fontWeight: "500" }}>
                  {CATEGORY_LABELS[cat]}
                </span>
              </div>
              <span style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: c.base, fontWeight: "700" }}>
                {pct}%
              </span>
            </div>
            <div style={{ height: "6px", background: "rgba(30,58,95,0.3)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{
                width: `${pct}%`, height: "100%", borderRadius: "3px",
                background: `linear-gradient(90deg, ${c.base}50, ${c.base})`,
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Panel wrapper ─────────────────────────────────────────
const panelStyle = {
  background: "linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.65) 100%)",
  border: "1px solid rgba(30,58,95,0.45)",
  borderRadius: "10px",
  padding: "14px 16px",
};

const panelTitleStyle = {
  fontSize: "9px", fontFamily: "'Space Mono', monospace",
  color: "#64748b", textTransform: "uppercase", letterSpacing: "1.3px", marginBottom: "12px",
};

// ─── Main Dashboard ────────────────────────────────────────
export default function Dashboard2() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const data = COUNTRIES_DATA;
  const totalValue = data.reduce((s, d) => s + d.value, 0);
  const topValue = Math.max(...data.map(d => d.value));
  const successCount = data.filter(d => d.category === "successful").length;
  const modCount = data.filter(d => d.category === "moderate").length;
  const leastCount = data.filter(d => d.category === "least").length;

  const regionData = {};
  data.forEach(d => {
    let r;
    if (d.lng < -30) r = "Americas";
    else if (d.lng < 25) r = "Europe";
    else if (d.lng < 60) r = "MEA";
    else r = "Asia Pacific";
    regionData[r] = (regionData[r] || 0) + 1;
  });

  const topSorted = [...data].sort((a, b) => b.value - a.value).slice(0, 8);
  const topMax = topSorted[0]?.value || 1;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060e18",
      fontFamily: "'DM Sans', sans-serif",
      color: "#e2e8f0",
      padding: "20px 24px",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{globalCSS}</style>

      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.02, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)",
        backgroundSize: "40px 40px", animation: "grid-flow 8s linear infinite",
      }} />
      {/* Scan line */}
      <div style={{
        position: "absolute", left: 0, right: 0, height: "1px", pointerEvents: "none",
        background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.08), transparent)",
        animation: "scan-line 6s linear infinite",
      }} />

      {/* ─── Header ─── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: "16px", position: "relative", zIndex: 1,
        animation: "fadeInUp 0.5s ease both",
      }}>
        <div>
          <div style={{
            fontSize: "9px", fontFamily: "'Space Mono', monospace",
            color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "2.5px", marginBottom: "3px",
          }}>&#9670; Global Operations Monitor</div>
          <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#f1f5f9", margin: 0, letterSpacing: "-0.3px" }}>
            Global Data Overview
          </h1>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "16px", fontFamily: "'Space Mono', monospace", color: "#22d3ee", fontWeight: "700" }}>
            {time.toLocaleTimeString("en-US", { hour12: false })}
          </div>
          <div style={{ fontSize: "9px", fontFamily: "'Space Mono', monospace", color: "#475569", marginTop: "1px" }}>
            {time.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "short", day: "numeric" })}
          </div>
        </div>
      </div>

      {/* ─── 50/50 Main Layout ─── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "16px", position: "relative", zIndex: 1,
      }}>
        {/* ═══ LEFT: Map Panel (50%) ═══ */}
        <div style={{
          background: "linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(8,15,28,0.98) 100%)",
          border: "1px solid rgba(30,58,95,0.4)",
          borderRadius: "12px",
          padding: "16px",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Corner accents */}
          {[
            { top: 0, left: 0, bT: "2px solid #0ea5e9", bL: "2px solid #0ea5e9", br: "12px 0 0 0" },
            { top: 0, right: 0, bT: "2px solid #0ea5e9", bR: "2px solid #0ea5e9", br: "0 12px 0 0" },
            { bottom: 0, left: 0, bB: "2px solid #0ea5e9", bL: "2px solid #0ea5e9", br: "0 0 0 12px" },
            { bottom: 0, right: 0, bB: "2px solid #0ea5e9", bR: "2px solid #0ea5e9", br: "0 0 12px 0" },
          ].map((s, i) => (
            <div key={i} style={{
              position: "absolute", width: "20px", height: "20px", opacity: 0.3,
              top: s.top, left: s.left, right: s.right, bottom: s.bottom,
              borderTop: s.bT, borderLeft: s.bL, borderRight: s.bR, borderBottom: s.bB,
              borderRadius: s.br,
            }} />
          ))}

          <WorldMap data={data} />

          {/* Legend row */}
          <div style={{
            display: "flex", justifyContent: "center", alignItems: "center", gap: "20px",
            marginTop: "10px", paddingTop: "10px",
            borderTop: "1px solid rgba(30,58,95,0.25)",
          }}>
            <LegendDot category="successful" label="Successful" count={successCount} />
            <LegendDot category="moderate" label="Moderate" count={modCount} />
            <LegendDot category="least" label="Least Successful" count={leastCount} />
          </div>
        </div>

        {/* ═══ RIGHT: KPI Panels (50%) ═══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

          {/* KPI Cards Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            <KpiCard label="Total Value" value={formatK(totalValue)} sub="All countries" color="#22d3ee" delay={0.1} />
            <KpiCard label="Countries" value={data.length} sub={`${successCount} successful`} color="#00BC7D" delay={0.2} />
            <KpiCard label="Peak Value" value={formatK(topValue)} sub="Highest country" color="#FE9A00" delay={0.3} />
          </div>

          {/* Category Breakdown */}
          <div style={{ ...panelStyle, animation: "fadeInUp 0.5s ease 0.4s both" }}>
            <div style={panelTitleStyle}>Performance Breakdown</div>
            <CategoryBreakdown data={data} totalValue={totalValue} />
          </div>

          {/* Two-column: Region + Top Countries */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", flex: 1 }}>
            {/* Regional Distribution */}
            <div style={{ ...panelStyle, animation: "fadeInUp 0.5s ease 0.5s both" }}>
              <div style={panelTitleStyle}>Regional Distribution</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                {Object.entries(regionData).sort((a, b) => b[1] - a[1]).map(([r, c], i) => {
                  const colors = { "Americas": "#8b5cf6", "Europe": "#3b82f6", "Asia Pacific": "#22d3ee", "MEA": "#f59e0b" };
                  return <RegionBar key={r} label={r} count={c} total={data.length} color={colors[r] || "#64748b"} delay={0.6 + i * 0.06} />;
                })}
              </div>
            </div>

            {/* Top Countries */}
            <div style={{ ...panelStyle, animation: "fadeInUp 0.5s ease 0.55s both" }}>
              <div style={panelTitleStyle}>Top Countries</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                {topSorted.map((d, i) => (
                  <CountryRow key={d.id} rank={i + 1} name={d.name} value={d.value} max={topMax} category={d.category} delay={0.7 + i * 0.05} />
                ))}
              </div>
            </div>
          </div>

          {/* Live indicator */}
          <div style={{
            ...panelStyle,
            padding: "10px 14px",
            display: "flex", alignItems: "center", gap: "8px",
            animation: "fadeInUp 0.5s ease 0.8s both",
          }}>
            <div style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: "#00BC7D", boxShadow: "0 0 8px #00BC7D80",
              animation: "pulse-ring 2s ease infinite",
            }} />
            <span style={{
              fontSize: "9px", fontFamily: "'Space Mono', monospace",
              color: "#64748b", textTransform: "uppercase", letterSpacing: "1px",
            }}>Live &bull; All Systems Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
