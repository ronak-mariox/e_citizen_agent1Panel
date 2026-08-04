import { DAILY_ACTIVITY } from '../../constants/reports.js';

/* Same plot box as the bar chart (520.995 x 220 surface, axes at x 64.999 /
   515.995 and y 5.001 / 161.999), but points sit on the grid columns rather
   than inside a band. */
const WIDTH = 520.995;
const HEIGHT = 180;
const LEFT = 64.999;
const RIGHT = 515.995;
const TOP = 5.001;
const BOTTOM = 161.999;
const DOT_RADIUS = 4;
const TICK_LABEL_X = 56.999;
const DAY_LABEL_Y = 173.309;

const { labels, ticks, max, series } = DAILY_ACTIVITY;

const xAt = (index) => LEFT + ((RIGHT - LEFT) * index) / (labels.length - 1);
const yAt = (value) => BOTTOM - ((BOTTOM - TOP) * value) / max;

/* Catmull-Rom through every point, converted to cubics — the design's curve
   passes through each reading rather than easing past it. */
function curvePath(points) {
  let path = `M${points[0][0]},${points[0][1]}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index - 1] ?? points[index];
    const start = points[index];
    const end = points[index + 1];
    const next = points[index + 2] ?? end;

    const firstX = start[0] + (end[0] - previous[0]) / 6;
    const firstY = start[1] + (end[1] - previous[1]) / 6;
    const secondX = end[0] - (next[0] - start[0]) / 6;
    const secondY = end[1] - (next[1] - start[1]) / 6;

    path += `C${firstX},${firstY} ${secondX},${secondY} ${end[0]},${end[1]}`;
  }

  return path;
}

export function ActivityLineChart() {
  return (
    <div className="rp-chart">
      <svg
        className="rp-chart__plot"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Daily activity, ${labels[0]} to ${labels[labels.length - 1]}`}
      >
        {ticks.map((tick) => (
          <line
            className="rp-chart__grid"
            key={`row-${tick}`}
            x1={LEFT}
            x2={RIGHT}
            y1={yAt(tick)}
            y2={yAt(tick)}
          />
        ))}

        {labels.map((label, index) => (
          <line
            className="rp-chart__grid"
            key={`col-${label}`}
            x1={xAt(index)}
            x2={xAt(index)}
            y1={TOP}
            y2={BOTTOM}
          />
        ))}

        {/* Drawn in series order, so the last one sits on top — as exported. */}
        {series.map((line) => {
          const points = line.values.map((value, index) => [xAt(index), yAt(value)]);

          return (
            <g key={line.key}>
              <path className="rp-chart__line" d={curvePath(points)} stroke={line.color} />
              {points.map(([x, y], index) => (
                <circle
                  className="rp-chart__dot"
                  key={labels[index]}
                  cx={x}
                  cy={y}
                  r={DOT_RADIUS}
                  fill={line.color}
                />
              ))}
            </g>
          );
        })}

        {ticks.map((tick) => (
          <text
            className="rp-chart__tick"
            key={`tick-${tick}`}
            x={TICK_LABEL_X}
            y={yAt(tick)}
            textAnchor="end"
            dominantBaseline="middle"
          >
            {tick}
          </text>
        ))}

        {labels.map((label, index) => (
          <text
            className="rp-chart__tick"
            key={label}
            x={xAt(index)}
            y={DAY_LABEL_Y}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {label}
          </text>
        ))}
      </svg>

      <ul className="rp-legend">
        {series.map((line) => (
          <li className="rp-legend__item" key={line.key} style={{ color: line.color }}>
            <svg className="rp-legend__mark" viewBox="0 0 14 14" aria-hidden="true">
              <line x1="0" x2="14" y1="7" y2="7" stroke={line.color} strokeWidth="1.749" />
              <circle cx="7" cy="7" r="2.6" fill="#ffffff" stroke={line.color} strokeWidth="1.749" />
            </svg>
            {line.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ActivityLineChart;
