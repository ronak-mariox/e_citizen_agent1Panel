import navDashboard from '../assets/icons/dashboard/nav-dashboard.svg';
import navQueue from '../assets/icons/dashboard/nav-queue.svg';
import navPending from '../assets/icons/dashboard/nav-pending.svg';
import navWaiting from '../assets/icons/dashboard/nav-waiting.svg';
import navForwarded from '../assets/icons/dashboard/nav-forwarded.svg';
import navCompleted from '../assets/icons/dashboard/nav-completed.svg';
import navNotifications from '../assets/icons/dashboard/nav-notifications.svg';
import navReports from '../assets/icons/dashboard/nav-reports.svg';
import navSettings from '../assets/icons/dashboard/nav-settings.svg';

import statLayers from '../assets/icons/dashboard/stat-layers.svg';
import statClock from '../assets/icons/dashboard/stat-clock.svg';
import statHourglass from '../assets/icons/dashboard/stat-hourglass.svg';
import statSend from '../assets/icons/dashboard/stat-send.svg';
import statCheck from '../assets/icons/dashboard/stat-check.svg';
import statTarget from '../assets/icons/dashboard/stat-target.svg';
import statStar from '../assets/icons/dashboard/stat-star.svg';

export const NAV_ITEMS = [
  { label: 'Dashboard', icon: navDashboard, to: '/dashboard' },
  { label: 'Assigned Queue', icon: navQueue, to: '/assigned-queue' },
  { label: 'Pending Verification', icon: navPending, to: '/pending-verification' },
  { label: 'Waiting Customer', icon: navWaiting, to: '/waiting-customer' },
  { label: 'Forwarded to Agent 2', icon: navForwarded, to: '/forwarded' },
  { label: 'Completed Applications', icon: navCompleted, to: '/completed' },
  { label: 'Notifications', icon: navNotifications, to: '/notifications' },
  { label: 'Reports', icon: navReports, to: '/reports' },
  { label: 'Settings', icon: navSettings, to: '/settings' },
];

export const AGENT = {
  name: 'Ravi Kumar',
  role: 'Agent 1',
  initials: 'RK',
};

/**
 * The seven tiles, in the order the design lays them out.
 *
 * Presentation, plus where clicking one goes — `to` is a real route this app
 * already serves; `query`, where present, is what makes that route land
 * already narrowed to what the tile just counted, not just the section it
 * belongs to. The numbers come from GET /agent/dashboard, so this file no
 * longer says how much work anybody has: `toStatCards` below puts the two
 * together.
 *
 * Two tiles do not have an exact match and say so:
 *  - Total Assigned counts every status ever assigned (all time); Assigned
 *    Queue's own table only ever shows the *active* queue (nothing that has
 *    reached Agent 2 or closed), because a queue is worked from, not
 *    archived — there is no "everything ever" list anywhere in this app to
 *    send it to instead.
 *  - Completed and Closed Today both land on Completed Applications, which
 *    has no month/day filter of its own (only its 3 outcome tabs) — the
 *    closest real destination, not an exact one.
 */
const STAT_TILES = [
  {
    id: 'total-assigned',
    icon: statLayers,
    accent: '#0052cc',
    title: 'Total Assigned',
    subtitle: 'All time',
    to: '/assigned-queue',
  },
  {
    id: 'pending-verification',
    icon: statClock,
    accent: '#fe9a00',
    title: 'Pending Verification',
    subtitle: 'Need attention',
    to: '/pending-verification',
  },
  {
    id: 'waiting-customer',
    icon: statHourglass,
    accent: '#ff6900',
    title: 'Waiting for Customer',
    subtitle: 'Pending response',
    to: '/waiting-customer',
  },
  {
    id: 'forwarded',
    icon: statSend,
    accent: '#00bba7',
    title: 'Forwarded to Agent 2',
    subtitle: 'Handed over',
    to: '/forwarded',
  },
  {
    id: 'completed',
    icon: statCheck,
    accent: '#00a63e',
    title: 'Completed',
    subtitle: 'This month',
    to: '/completed',
  },
  {
    /* Drawn as "Today Target" in the mock-up, which needs a quota — and nothing
       on an agent or their profile sets one. So the tile counts the half that
       exists, which is also the half an agent checks a dashboard for. It goes
       back to a target the day an administrator can set one. */
    id: 'closed-today',
    icon: statTarget,
    accent: '#615fff',
    title: 'Closed Today',
    subtitle: 'Applications done',
    to: '/completed',
  },
  {
    id: 'high-priority',
    icon: statStar,
    accent: '#8e51ff',
    title: 'High Priority',
    subtitle: 'Urgent cases',
    to: '/assigned-queue',
    // Matches AssignedQueuePage's own High Priority card exactly (same
    // statuses, same two priorities) — see application.service.js's
    // listAgentQueue and dashboard.service.js's highPriority facet.
    query: { priority: 'high,urgent' },
  },
];

/**
 * The API's figures -> the seven cards.
 *
 * `trend` is present on only two of them, and that is the server's decision
 * rather than this file's: a percentage means something on a tile counting what
 * *happened* over a month, and nothing on one counting what is sitting in a
 * queue right now. StatCard already draws the chip only when it is given one.
 *
 * Zero rather than a dash on a missing figure — an agent holding nothing is
 * holding zero, which is a fact and not a gap.
 */
export function toStatCards(stats) {
  const value = {
    'total-assigned': stats?.totalAssigned ?? 0,
    'pending-verification': stats?.pendingVerification ?? 0,
    'waiting-customer': stats?.waitingCustomer ?? 0,
    forwarded: stats?.forwarded ?? 0,
    completed: stats?.completedThisMonth ?? 0,
    'closed-today': stats?.closedToday ?? 0,
    'high-priority': stats?.highPriority ?? 0,
  };

  const trend = {
    'total-assigned': stats?.totalAssignedChange ?? null,
    completed: stats?.completedChange ?? null,
  };

  return STAT_TILES.map((tile) => ({
    ...tile,
    value: String(value[tile.id]),
    trend: trend[tile.id] ?? undefined,
  }));
}

/** The two lines on the verification-trend chart, and the hue each one owns. */
export const TREND_SERIES = [
  { key: 'assigned', label: 'Assigned', color: '#0052cc' },
  { key: 'completed', label: 'Completed', color: '#16a34a' },
];

/** What each slice of the status ring is coloured, wherever it is drawn. */
export const SLICE_COLOR = {
  completed: '#16a34a',
  pending: '#f59e0b',
  waiting: '#2563eb',
  rejected: '#dc2626',
};

/* Still the reports screen's source — see components/reports/StatusDonut.jsx,
   which is not part of the dashboard and has not been connected yet. The
   dashboard's own ring reads live figures and takes only the colours above. */
export const STATUS_DISTRIBUTION = [
  { key: 'completed', label: 'Completed', value: 38, color: SLICE_COLOR.completed },
  { key: 'pending', label: 'Pending', value: 24, color: SLICE_COLOR.pending },
  { key: 'waiting', label: 'Waiting', value: 14, color: SLICE_COLOR.waiting },
  { key: 'rejected', label: 'Rejected', value: 4, color: SLICE_COLOR.rejected },
];

