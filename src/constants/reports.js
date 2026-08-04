/* Reports & Analytics — Figma node 155:6701. Series values and plot geometry
   are read straight off the exported chart vectors, so the rendered charts match
   the design point for point. */

export const REPORT_KPIS = [
  { id: 'time', tone: 'time', label: 'Avg Verification Time', value: '2.4 hrs' },
  { id: 'approval', tone: 'approval', label: 'Approval Rate', value: '87%' },
  { id: 'query', tone: 'query', label: 'Query Rate', value: '11%' },
  { id: 'rejection', tone: 'rejection', label: 'Rejection Rate', value: '2%' },
];

/* The mock gives all three series the same seven values, so they land on top of
   one another and only the last drawn one reads — exactly as the design shows. */
export const MONTHLY_WORK = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  ticks: [0, 20, 40, 60, 80],
  max: 80,
  series: [
    { key: 'assigned', label: 'Assigned', color: '#0052cc', values: [42, 55, 48, 63, 71, 59, 34] },
    { key: 'completed', label: 'Completed', color: '#16a34a', values: [42, 55, 48, 63, 71, 59, 34] },
    { key: 'forwarded', label: 'Forwarded', color: '#38bdf8', values: [42, 55, 48, 63, 71, 59, 34] },
  ],
};

/* Same story on the line chart: verified and pending share one set of values. */
export const DAILY_ACTIVITY = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  ticks: [0, 3, 6, 9, 12],
  max: 12,
  series: [
    { key: 'verified', label: 'Verified', color: '#16a34a', values: [8, 12, 6, 10, 5, 3, 0] },
    { key: 'pending', label: 'Pending', color: '#f59e0b', values: [8, 12, 6, 10, 5, 3, 0] },
  ],
};

/* Bars are drawn against the busiest department, so Revenue fills the track. */
export const DEPARTMENT_LOAD = [
  { id: 'revenue', label: 'Revenue', value: 12, color: '#2b7fff' },
  { id: 'urban', label: 'Urban Development', value: 7, color: '#615fff' },
  { id: 'registration', label: 'Registration', value: 5, color: '#00bba7' },
];

/* Clockwise slice order on the reports donut, which differs from the dashboard
   ring: the design puts rejected straight after completed. */
export const STATUS_SLICE_ORDER = ['completed', 'rejected', 'waiting', 'pending'];
