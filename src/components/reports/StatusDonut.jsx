import { STATUS_DISTRIBUTION } from '../../constants/dashboard.js';
import { STATUS_SLICE_ORDER } from '../../constants/reports.js';

/* Ring geometry read off the exported Figma arcs: r 80 / 50 on a 160 box, the
   first slice opening at -77.4deg and each one ending 2.28deg early to leave
   the designed gap. Unlike the dashboard ring this one carries no centre total
   and no legend — the card is the chart alone. */
const SIZE = 160;
const CENTER = SIZE / 2;
const OUTER = 80;
const INNER = 50;
const START_DEGREES = -77.4;
const PAD_DEGREES = 2.28;

/* Reordered clockwise the way the design draws it, not the dashboard order. */
const SLICES = STATUS_SLICE_ORDER.map((key) =>
  STATUS_DISTRIBUTION.find((slice) => slice.key === key)
).filter(Boolean);

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

export function StatusDonut() {
  const total = SLICES.reduce((sum, slice) => sum + slice.value, 0);

  const segments = SLICES.map((slice, index) => {
    const preceding = SLICES.slice(0, index).reduce((sum, earlier) => sum + earlier.value, 0);
    const start = START_DEGREES + (preceding / total) * 360;
    const sweep = (slice.value / total) * 360;
    return { ...slice, d: segmentPath(start, start + sweep - PAD_DEGREES) };
  });

  return (
    <svg
      className="rp-donut"
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Status distribution across ${total} applications`}
    >
      {segments.map((segment) => (
        <path key={segment.key} d={segment.d} fill={segment.color} />
      ))}
    </svg>
  );
}

export default StatusDonut;
