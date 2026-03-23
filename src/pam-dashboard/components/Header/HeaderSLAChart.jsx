import './HeaderSLAChart.css';

export const BAR_COLORS = ['#4ade80', '#22d3ee', '#ff6b6b', '#f59e0b', '#60a5fa'];

const DEFAULT_SLOTS = [
  '0-2 hrs', '2-4 hrs', '4-6 hrs', '6-8 hrs', '8-10 hrs',
  '10-12 hrs', '12-14 hrs', '14-16 hrs', '16-18 hrs', '18-20 hrs',
  '20-22 hrs', '22-24 hrs',
];

const Y_MIN = 70;
const Y_MAX = 100;
const Y_TICKS = [70, 78, 86, 100];

export default function HeaderSLAChart({ data }) {
  const chartData = data?.series_data ?? [];
  const timeSlots = data?.slots ?? DEFAULT_SLOTS;

  const pct = (value) => {
    const clamped = Math.max(Y_MIN, Math.min(Y_MAX, value));
    return ((clamped - Y_MIN) / (Y_MAX - Y_MIN)) * 100;
  };

  return (
    <div className="hsla-chart">
      {/* Y-axis */}
      <div className="hsla-yaxis">
        {Y_TICKS.slice().reverse().map((v) => (
          <span
            key={v}
            className="hsla-yaxis-label"
            style={{ bottom: `${pct(v)}%` }}
          >
            {v}
          </span>
        ))}
      </div>

      {/* Plot region */}
      <div className="hsla-plot">
        {/* Grid lines */}
        {Y_TICKS.map((v) => (
          <div
            key={v}
            className="hsla-grid-line"
            style={{ bottom: `${pct(v)}%` }}
          />
        ))}

        {/* Bar groups */}
        <div className="hsla-groups">
          {timeSlots.map((slot, si) => (
            <div className="hsla-group" key={si}>
              <div className="hsla-bars">
                {chartData.map((series, bi) => {
                  const val = series[si] ?? 0;
                  return (
                    <div className="hsla-bar-col" key={bi}>
                      <span className="hsla-bar-label">{val}%</span>
                      <div
                        className="hsla-bar"
                        style={{
                          height: `${pct(val)}%`,
                          backgroundColor: BAR_COLORS[bi],
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <span className="hsla-x-label">{slot}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
