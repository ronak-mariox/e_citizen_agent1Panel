import { MONTHLY_WORK } from '../../constants/reports.js';

/* Plot box read off the Figma BarChart surface (520.995 x 220): the axes sit at
   x 64.999 / 515.995 and y 5.001 (max) / 161.999 (zero). A bar is 14 wide and
   starts 6.443 into its band, which is why it reads left of the month label. */
const WIDTH = 520.995;
const HEIGHT = 180;
const LEFT = 64.999;
const RIGHT = 515.995;
const TOP = 5.001;
const BOTTOM = 161.999;
const BAR_WIDTH = 14;
const BAR_INSET = 6.443;
const TICK_LABEL_X = 56.999;
const MONTH_LABEL_Y = 173.309;

const { labels, ticks, max, series } = MONTHLY_WORK;
const BAND = (RIGHT - LEFT) / labels.length;

const bandCenter = (index) => LEFT + BAND * (index + 0.5);
const barX = (index) => LEFT + BAND * index + BAR_INSET;
const yAt = (value) => BOTTOM - ((BOTTOM - TOP) * value) / max;

export function WorkBarChart() {
  return (
    <div className="rp-chart">
      <svg
        className="rp-chart__plot"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Monthly work summary, ${labels[0]} to ${labels[labels.length - 1]}`}
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

        {[LEFT, ...labels.map((label, index) => bandCenter(index)), RIGHT].map((x) => (
          <line className="rp-chart__grid" key={`col-${x}`} x1={x} x2={x} y1={TOP} y2={BOTTOM} />
        ))}

        {/* Drawn in series order, so the last one sits on top — as exported. */}
        {series.map((line) =>
          line.values.map((value, index) => (
            <rect
              key={`${line.key}-${labels[index]}`}
              x={barX(index)}
              y={yAt(value)}
              width={BAR_WIDTH}
              height={BOTTOM - yAt(value)}
              fill={line.color}
            />
          ))
        )}

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
            x={bandCenter(index)}
            y={MONTH_LABEL_Y}
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
            <span
              className="rp-legend__swatch"
              style={{ backgroundColor: line.color }}
              aria-hidden="true"
            />
            {line.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default WorkBarChart;
