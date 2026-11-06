/**
 * How an application's status and priority render in the queue.
 *
 * The API models fifteen statuses and four priorities; this console's stylesheet
 * has four status pills and three priority ones. Collapsing them here rather
 * than adding pills keeps the mapping in one place, and means a status the
 * panel has never heard of falls back to a plain pill instead of an unstyled
 * string.
 *
 * Keys mirror backend/src/constants/statuses.js. The tones key into the
 * .queue-pill--* modifiers in styles/dashboard.css.
 */

/** Backend status -> what the agent reads, and which pill it wears. */
export const STATUS_PILL = {
  assigned: { label: 'Assigned', tone: 'assigned' },

  // Work under way.
  under_verification: { label: 'Under Verification', tone: 'started' },
  in_progress: { label: 'In Progress', tone: 'started' },

  // Waiting on the citizen — the agent cannot move these on by themselves.
  query_raised: { label: 'Query Raised', tone: 'waiting' },
  reupload_requested: { label: 'Reupload Needed', tone: 'waiting' },
  pending_payment: { label: 'Payment Pending', tone: 'waiting' },

  // Waiting on somebody else: Agent 2, the department, or a decision.
  verified: { label: 'Verified', tone: 'pending' },
  pending_submission: { label: 'Ready to Forward', tone: 'pending' },
  submitted_to_department: { label: 'With Department', tone: 'pending' },
  escalated: { label: 'Escalated', tone: 'pending' },
  on_hold: { label: 'On Hold', tone: 'pending' },

  /* Finished, one way or the other.
  
     The working queues filter these out — an application nobody has to act on
     any more is not in anybody's queue — so for a long time nothing could draw
     them and they were left out of this map. The dashboard's activity list
     changed that: it shows what moved most recently whatever state it is in,
     and a closed application is very often the most recent thing of all.
     Without these they fell through to the amber "pending" fallback, so a
     finished application announced itself as outstanding work. */
  completed: { label: 'Completed', tone: 'approved' },
  rejected: { label: 'Rejected', tone: 'rejected' },
  cancelled: { label: 'Cancelled', tone: 'rejected' },
};

/**
 * Four priorities into three pills.
 *
 * `urgent` and `high` share the red one: both mean "before the others", and a
 * fourth shade nobody can rank at a glance would say less than three.
 */
export const PRIORITY_PILL = {
  urgent: { label: 'Urgent', tone: 'high' },
  high: { label: 'High', tone: 'high' },
  normal: { label: 'Normal', tone: 'medium' },
  low: { label: 'Low', tone: 'low' },
};

const titleCase = (value) =>
  String(value ?? '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const statusPill = (value) =>
  STATUS_PILL[value] ?? { label: titleCase(value) || '—', tone: 'pending' };

export const priorityPill = (value) =>
  PRIORITY_PILL[value] ?? { label: titleCase(value) || '—', tone: 'low' };

/** "RK" — the avatar beside a citizen's name. */
export const initialsOf = (name, fallback = '—') => {
  const trimmed = name?.trim();

  if (!trimmed) return fallback;

  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
};

/**
 * How long this has been sitting with the agent — "6h 00m".
 *
 * Time since it was assigned, which is what the column is for: an agent
 * scanning the queue is looking for what has been waiting longest, and a
 * timestamp makes them do the arithmetic themselves.
 */
export const waitingFor = (assignedAt) => {
  if (!assignedAt) return '—';

  const since = new Date(assignedAt);
  if (Number.isNaN(since.getTime())) return '—';

  const minutes = Math.max(0, Math.floor((Date.now() - since.getTime()) / 60000));

  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);

  // Past a couple of days the hours stop meaning anything to read.
  if (hours >= 48) return `${Math.floor(hours / 24)}d`;

  return `${hours}h ${String(minutes % 60).padStart(2, '0')}m`;
};
