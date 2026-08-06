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

/**
 * An uploaded file path -> a URL the browser can request.
 *
 * The API stores paths relative to its own origin (`/uploads/agents/…`), so
 * moving the API to another host does not invalidate every stored row. That
 * leaves the panel to rejoin the two, and the only origin it knows is inside
 * VITE_API_BASE_URL — which carries the /api/v1 prefix that these files sit
 * outside of, hence the trim.
 */
export function assetUrl(storedPath) {
  if (!storedPath) return '';
  if (/^https?:/.test(storedPath)) return storedPath;

  const base = import.meta.env.VITE_API_BASE_URL ?? '';
  const origin = base.replace(/\/api\/v\d+\/?$/, '').replace(/\/+$/, '');

  return origin + storedPath;
}
