import { TREND_SERIES } from '../../constants/dashboard.js';

/* Plot box taken from the Figma frame (726.779 x 199.992): the axes sit at
   14.23% / 10.44% horizontally and 6.25% / 17.5% vertically. */
const WIDTH = 726.779;
const HEIGHT = 199.992;
const LEFT = WIDTH * 0.1423;
const RIGHT = WIDTH * (1 - 0.1044);
const TOP = HEIGHT * 0.0625;
const BOTTOM = HEIGHT * 0.825;
const GRID_LINES = 5;

/**
 * Monthly assigned versus completed, for the agent looking at it.
 *
 * @param {Array} data `{ label, assigned, completed }` per month, oldest first —
 *   the server sends every month in the window, so a quiet one is a zero on the
 *   line rather than a gap the chart would close over.
 */
export function TrendChart({ data = [] }) {
  const labels = data.map((point) => point.label);
  const series = TREND_SERIES.map((line) => ({
    ...line,
    values: data.map((point) => point[line.key] ?? 0),
  }));

  /* An agent who has finished nothing yet makes every value zero, and dividing
     by that scale would put NaN into every path in the SVG — which renders as
     nothing at all, with no error to say why. One is the floor: the lines sit
     flat on the axis, which is what no work actually looks like. */
  const max = Math.max(1, ...series.flatMap((line) => line.values));

  /* A single month cannot be spread across the axis — the divisor would be
     zero — so it is drawn at the left, where the next one will follow it. */
  const span = Math.max(1, labels.length - 1);

  const xAt = (index) => LEFT + ((RIGHT - LEFT) * index) / span;
  const yAt = (value) => BOTTOM - ((BOTTOM - TOP) * value) / max;

  const toPoints = (values) => values.map((value, index) => `${xAt(index)},${yAt(value)}`);
  const linePath = (values) => `M${toPoints(values).join('L')}`;
  const areaPath = (values) => `${linePath(values)}L${RIGHT},${BOTTOM}L${LEFT},${BOTTOM}Z`;

  // Nothing to plot at all — the card keeps its shape and says so.
  if (labels.length === 0) {
    return <p className="dash-card__empty">No activity to chart yet.</p>;
  }

  return (
    <div className="trend-chart-scroll">
      <svg
        className="trend-chart"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Monthly assigned versus completed applications, ${labels[0]} to ${labels[labels.length - 1]}`}
      >
        {Array.from({ length: GRID_LINES }, (_, index) => {
          const y = TOP + ((BOTTOM - TOP) * index) / (GRID_LINES - 1);
          return <line className="trend-chart__grid" key={y} x1={LEFT} x2={RIGHT} y1={y} y2={y} />;
        })}

        {series.map((line) => (
          <path
            key={`${line.key}-area`}
            d={areaPath(line.values)}
            fill={line.color}
            fillOpacity="0.12"
          />
        ))}

        {series.map((line) => (
          <path
            key={`${line.key}-line`}
            className="trend-chart__line"
            d={linePath(line.values)}
            stroke={line.color}
          />
        ))}

        {labels.map((label, index) => (
          <text
            className="trend-chart__label"
            key={label}
            x={xAt(index)}
            y={190}
            textAnchor="middle"
          >
            {label}
          </text>
        ))}

        {series.map((line, index) => (
          <text
            className="trend-chart__legend"
            key={`${line.key}-legend`}
            x={LEFT + index * 90}
            y={10}
            fill={line.color}
          >
            {`— ${line.label}`}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default TrendChart;
