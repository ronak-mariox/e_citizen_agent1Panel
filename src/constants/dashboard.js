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

/* Accent colours live with the data because each tile owns its own hue. */
export const STAT_CARDS = [
  {
    id: 'total-assigned',
    icon: statLayers,
    accent: '#0052cc',
    value: '16',
    title: 'Total Assigned',
    subtitle: 'All time',
    trend: { direction: 'up', value: '12%' },
  },
  {
    id: 'pending-verification',
    icon: statClock,
    accent: '#fe9a00',
    value: '3',
    title: 'Pending Verification',
    subtitle: 'Need attention',
    trend: { direction: 'down', value: '5%' },
  },
  {
    id: 'waiting-customer',
    icon: statHourglass,
    accent: '#ff6900',
    value: '4',
    title: 'Waiting for Customer',
    subtitle: 'Pending response',
  },
  {
    id: 'forwarded',
    icon: statSend,
    accent: '#00bba7',
    value: '3',
    title: 'Forwarded to Agent 2',
    subtitle: 'Handed over',
  },
  {
    id: 'completed',
    icon: statCheck,
    accent: '#00a63e',
    value: '3',
    title: 'Completed',
    subtitle: 'This month',
  },
  {
    id: 'today-target',
    icon: statTarget,
    accent: '#615fff',
    value: '12 / 15',
    title: 'Today Target',
    subtitle: 'Applications done',
  },
  {
    id: 'high-priority',
    icon: statStar,
    accent: '#8e51ff',
    value: '7',
    title: 'High Priority',
    subtitle: 'Urgent cases',
  },
];

/* Series values are read straight off the exported Figma chart vectors, so the
   rendered curve matches the design point for point. */
export const TREND_CHART = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  series: [
    { key: 'assigned', label: 'Assigned', color: '#0052cc', values: [42, 55, 48, 63, 71, 59, 34] },
    { key: 'completed', label: 'Completed', color: '#16a34a', values: [38, 50, 44, 58, 65, 54, 29] },
  ],
};

export const STATUS_DISTRIBUTION = [
  { key: 'completed', label: 'Completed', value: 38, color: '#16a34a' },
  { key: 'pending', label: 'Pending', value: 24, color: '#f59e0b' },
  { key: 'waiting', label: 'Waiting', value: 14, color: '#2563eb' },
  { key: 'rejected', label: 'Rejected', value: 4, color: '#dc2626' },
];

export const RECENT_ACTIVITY = [
  {
    id: 'APP-2024-00418',
    initials: 'RK',
    name: 'Rajesh Kumar',
    priority: 'High',
    meta: 'APP-2024-00418 · Property Tax · Revenue',
    status: 'Assigned',
    date: '02 Jul 2024',
  },
  {
    id: 'APP-2024-00423',
    initials: 'DM',
    name: 'Deepak Mishra',
    priority: 'Medium',
    meta: 'APP-2024-00423 · Property Tax · Revenue',
    status: 'Assigned',
    date: '27 Jun 2024',
  },
  {
    id: 'APP-2024-00420',
    initials: 'AV',
    name: 'Anand Verma',
    priority: 'Medium',
    meta: 'APP-2024-00420 · Encumbrance Cert · Revenue',
    status: 'Pending Verification',
    date: '30 Jun 2024',
  },
  {
    id: 'APP-2024-00426',
    initials: 'AJ',
    name: 'Arun Joshi',
    priority: 'High',
    meta: 'APP-2024-00426 · Zone Certificate · Urban Dev',
    status: 'Verification Started',
    date: '28 Jun 2024',
  },
  {
    id: 'APP-2024-00427',
    initials: 'NG',
    name: 'Nisha Gupta',
    priority: 'Low',
    meta: 'APP-2024-00427 · Sale Deed · Registration',
    status: 'Pending Verification',
    date: '01 Jul 2024',
  },
  {
    id: 'APP-2024-00419',
    initials: 'PS',
    name: 'Priya Sharma',
    priority: 'High',
    meta: 'APP-2024-00419 · Building Plan · Urban Dev',
    status: 'Waiting Customer',
    date: '01 Jul 2024',
  },
];

export const PRIORITY_MODIFIER = {
  High: 'high',
  Medium: 'medium',
  Low: 'low',
};

export const STATUS_MODIFIER = {
  Assigned: 'assigned',
  'Pending Verification': 'pending',
  'Verification Started': 'started',
  'Waiting Customer': 'waiting',
};
