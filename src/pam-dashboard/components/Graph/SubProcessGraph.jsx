import React, { useState, useEffect } from 'react';
import useDensity from '../../hooks/useDensity';
import './HorizontalBarGraph.css';

const BAR_COLORS = [
  '#1a4f91',   
  '#6aa5dd',
  '#818d96',   
  '#31af6e',   
  '#58cfbd',   
];

const GRID_MARKS = [0, 25, 50, 75, 100];

export default function SubProcessGraph({ data }) {
  const chartData = data && data.length > 0 ? data : [];
  const [animated, setAnimated] = useState(false);
  const { ref: cardRef } = useDensity(chartData.length, { medium: 6, high: 9 });

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

  if (chartData.length === 0) {
    return null;
  }

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
              <div className="hbar-value">
                <span className="hbar-triangle">&#9650;</span>
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
    </div>
  );
}
