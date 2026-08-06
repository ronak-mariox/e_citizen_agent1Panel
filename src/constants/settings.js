import tabProfile from '../assets/icons/settings/tab-profile.svg';
import tabPassword from '../assets/icons/settings/tab-password.svg';
import tabSecurity from '../assets/icons/settings/tab-security.svg';
import tabLogout from '../assets/icons/settings/tab-logout.svg';

export const SETTINGS_TABS = [
  { id: 'profile', label: 'Profile', icon: tabProfile },
  { id: 'password', label: 'Password', icon: tabPassword },
  { id: 'security', label: 'Security', icon: tabSecurity },
];

export const LOGOUT_ICON = tabLogout;

export const DEFAULT_SETTINGS_TAB = SETTINGS_TABS[0].id;

/* The profile panel reads the signed-in account, not this — see
   components/settings/ProfilePanel.jsx. What is left here is the shape of an
   empty form, so the inputs stay controlled while the session is still loading.

   Note what an agent account does *not* carry: no email and no designation.
   backend/src/models/agent.js keeps a mobile number instead, because that is
   where a password-reset OTP is delivered. */
export const EMPTY_PROFILE = {
  fullName: '',
  employeeId: '',
  mobile: '',
  department: '',
  level: '',
  status: '',
};

/* Field order matches the designed two-column grid, row by row.

   Every one of these is read-only, and that is the system as it stands rather
   than an oversight: an agent account is opened and scoped by an administrator
   (backend/src/services/agent.service.js) and there is no endpoint for an agent
   to change their own. The mobile number is the one that must stay that way
   even when there is — it is where a password-reset code is sent, so letting it
   be edited from inside a live session is an account-takeover route. */
export const PROFILE_FIELDS = [
  { name: 'fullName', label: 'Full Name', type: 'text', autoComplete: 'name' },
  { name: 'employeeId', label: 'Employee ID', type: 'text', autoComplete: 'off' },
  { name: 'mobile', label: 'Mobile', type: 'tel', autoComplete: 'tel' },
  { name: 'department', label: 'Department', type: 'text', autoComplete: 'off' },
  { name: 'level', label: 'Level', type: 'text', autoComplete: 'off' },
  { name: 'status', label: 'Account Status', type: 'text', autoComplete: 'off' },
];

export const MIN_PASSWORD_LENGTH = 8;

export const PASSWORD_FIELDS = [
  { name: 'current', label: 'Current Password', autoComplete: 'current-password' },
  { name: 'next', label: 'New Password', autoComplete: 'new-password' },
  { name: 'confirm', label: 'Confirm New Password', autoComplete: 'new-password' },
];

/* `enabled` drives both the pill wording and its colour. */
export const SECURITY_OPTIONS = [
  {
    id: 'two-factor',
    title: 'Two-Factor Authentication',
    description: 'Add an extra layer of security to your account',
    enabled: true,
  },
  {
    id: 'session-timeout',
    title: 'Session Timeout',
    description: 'Automatically log out after 30 minutes of inactivity',
    enabled: true,
  },
  {
    id: 'login-alerts',
    title: 'Login Alerts',
    description: 'Get notified on new device logins',
    enabled: false,
  },
];

export const ACTIVE_SESSIONS = {
  title: 'Active Sessions',
  summary: '1 active session — Chrome · Windows · Bengaluru, IN',
  action: 'Revoke all other sessions',
};
