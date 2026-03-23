import React, { useState, useEffect, useRef } from 'react';
import './HorizontalBarGraph.css';

const BAR_COLORS = [
  '#2ec4b6',
  '#5b9bd5',
  '#a8d948',
  '#f0a835',
  '#e06090',
];

const GRID_MARKS = [0, 25, 50, 75, 100];

export default function HourlySLAGraph({ data }) {
  const chartData = data && data.length > 0 ? data : [];
  const [animated, setAnimated] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (chartData.length === 0) return;
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [chartData]);

  if (chartData.length === 0) return null;

  return (
    <div className="hbar-card" ref={cardRef}>
      <div className="hbar-chart">
        {/* Grid lines */}
        <div className="hbar-grid">
          {GRID_MARKS.map((mark) => (
            <div key={mark} className="hbar-grid-line" style={{ left: `${mark}%` }} />
          ))}
        </div>

        {/* Rows */}
        <div className="hbar-rows">
          {chartData.map((item, i) => (
            <div className="hbar-row" key={i}>
              <div className="hbar-label">{item.name}</div>
              <div className="hbar-bar-track">
                <div
                  className="hbar-bar"
                  style={{
                    width: animated ? `${Math.min(item.value, 100)}%` : '0%',
                    background: BAR_COLORS[i % BAR_COLORS.length],
                    transitionDelay: `${i * 0.1}s`,
                  }}
                />
              </div>
              <div className="hbar-value" style={{ visibility: 'hidden' }}>
                <span className="hbar-percent">{item.value}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom scale */}
        <div className="hbar-scale">
          {GRID_MARKS.map((mark) => (
            <span key={mark} className="hbar-scale-label" style={{ left: `${mark}%` }}>
              {mark}%
            </span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="hbar-legend">
        {chartData.map((item, i) => (
          <div className="hbar-legend-item" key={i}>
            <span
              className="hbar-legend-swatch"
              style={{ background: BAR_COLORS[i % BAR_COLORS.length] }}
            />
            <span className="hbar-legend-label">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
