import { STATUS_DISTRIBUTION } from '../../constants/dashboard.js';

/* Ring geometry read off the exported Figma arcs: r 56 / 38 on a 160 box, each
   segment ending 2.28deg early to leave the designed gap. */
const SIZE = 160;
const CENTER = SIZE / 2;
const OUTER = 56;
const INNER = 38;
const PAD_DEGREES = 2.28;

const pointAt = (radius, degrees) => {
  const radians = (degrees * Math.PI) / 180;
  return [CENTER + radius * Math.sin(radians), CENTER - radius * Math.cos(radians)];
};

function segmentPath(startDegrees, endDegrees) {
  const largeArc = endDegrees - startDegrees > 180 ? 1 : 0;
  const [outerStartX, outerStartY] = pointAt(OUTER, startDegrees);
  const [outerEndX, outerEndY] = pointAt(OUTER, endDegrees);
  const [innerEndX, innerEndY] = pointAt(INNER, endDegrees);
  const [innerStartX, innerStartY] = pointAt(INNER, startDegrees);

  return [
    `M${outerStartX},${outerStartY}`,
    `A${OUTER},${OUTER} 0 ${largeArc} 1 ${outerEndX},${outerEndY}`,
    `L${innerEndX},${innerEndY}`,
    `A${INNER},${INNER} 0 ${largeArc} 0 ${innerStartX},${innerStartY}`,
    'Z',
  ].join('');
}

export function DonutChart() {
  const total = STATUS_DISTRIBUTION.reduce((sum, slice) => sum + slice.value, 0);

  const segments = STATUS_DISTRIBUTION.map((slice, index) => {
    const preceding = STATUS_DISTRIBUTION.slice(0, index).reduce(
      (sum, earlier) => sum + earlier.value,
      0,
    );
    const start = (preceding / total) * 360;
    const sweep = (slice.value / total) * 360;
    return { ...slice, d: segmentPath(start, start + sweep - PAD_DEGREES) };
  });

  return (
    <>
      <svg
        className="donut-chart"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Status distribution across ${total} current applications`}
      >
        {segments.map((segment) => (
          <path key={segment.key} d={segment.d} fill={segment.color} />
        ))}
        <text
          className="donut-chart__total"
          x={CENTER}
          y={CENTER}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {total}
        </text>
      </svg>

      <div className="donut-legend">
        {STATUS_DISTRIBUTION.map((slice) => (
          <div className="donut-legend__row" key={slice.key}>
            <span className="donut-legend__name">
              <span className="donut-legend__dot" style={{ backgroundColor: slice.color }} />
              {slice.label}
            </span>
            <span className="donut-legend__value">{slice.value}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export default DonutChart;
