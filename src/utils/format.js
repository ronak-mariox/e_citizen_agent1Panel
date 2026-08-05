/** Display helpers shared by the shell and the settings screens. */

/** First letters of the first two words — "Ravi Kumar" -> "RK". */
export function initialsOf(name, fallback = 'AG') {
  const trimmed = name?.trim();

  if (!trimmed) return fallback;

  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

/** The stored role, as it reads on screen. */
export const ROLE_LABEL = {
  agent_1: 'Agent 1',
  agent_2: 'Agent 2',
};

/** Account lifecycle — USER_STATUS in backend/src/constants/statuses.js. */
export const STATUS_LABEL = {
  pending: 'Pending',
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
  blocked: 'Blocked',
};

const titleCase = (value) => String(value ?? '').replace(/_/g, ' ');

/**
 * The signed-in account -> the profile form's fields.
 *
 * `department` arrives populated from /auth/me, but is a bare ObjectId on an
 * older stored session and null on an agent who has not been posted yet — hence
 * the three-way fallback rather than a plain property read.
 */
export function agentProfileFrom(user) {
  return {
    fullName: user?.fullName ?? '',
    employeeId: user?.employeeId ?? '',
    mobile: user?.mobile ?? '',
    department: user?.department?.name ?? (user?.department ? '—' : 'Not posted yet'),
    level: ROLE_LABEL[user?.role] ?? titleCase(user?.role),
    status: STATUS_LABEL[user?.status] ?? titleCase(user?.status),
  };
}
