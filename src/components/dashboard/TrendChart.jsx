import { TREND_CHART } from '../../constants/dashboard.js';

/* Plot box taken from the Figma frame (726.779 x 199.992): the axes sit at
   14.23% / 10.44% horizontally and 6.25% / 17.5% vertically. */
const WIDTH = 726.779;
const HEIGHT = 199.992;
const LEFT = WIDTH * 0.1423;
const RIGHT = WIDTH * (1 - 0.1044);
const TOP = HEIGHT * 0.0625;
const BOTTOM = HEIGHT * 0.825;
const GRID_LINES = 5;

const { labels, series } = TREND_CHART;
const MAX = Math.max(...series.flatMap((line) => line.values));

const xAt = (index) => LEFT + ((RIGHT - LEFT) * index) / (labels.length - 1);
const yAt = (value) => BOTTOM - ((BOTTOM - TOP) * value) / MAX;

const toPoints = (values) => values.map((value, index) => `${xAt(index)},${yAt(value)}`);

const linePath = (values) => `M${toPoints(values).join('L')}`;
const areaPath = (values) => `${linePath(values)}L${RIGHT},${BOTTOM}L${LEFT},${BOTTOM}Z`;

export function TrendChart() {
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
