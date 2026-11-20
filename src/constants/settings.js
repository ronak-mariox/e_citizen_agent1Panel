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

/* backend/src/models/common_schema.js's addressSchema, minus taluk and
   country (India, always, for this build) — line1/city/state/pincode are
   what an application actually needs to find the agent; the rest fill in
   detail once known. */
export const EMPTY_ADDRESS = {
  line1: '',
  line2: '',
  landmark: '',
  city: '',
  district: '',
  state: '',
  pincode: '',
};

/* Field order matches the designed two-column grid, row by row.

   Only Full Name is editable — `editable: true` is what ProfilePanel.jsx reads
   to decide which input in this grid takes typing instead of just showing a
   value. Everything else here is set by an administrator when the account is
   opened or scoped (backend/src/services/agent.service.js) and there is no
   endpoint for an agent to change it. Mobile is the one that must stay that
   way even once the rest are not — it is where a password-reset code is sent,
   so letting it be edited from inside a live session is an account-takeover
   route. */
export const PROFILE_FIELDS = [
  { name: 'fullName', label: 'Full Name', type: 'text', autoComplete: 'name', editable: true },
  { name: 'employeeId', label: 'Employee ID', type: 'text', autoComplete: 'off' },
  { name: 'mobile', label: 'Mobile', type: 'tel', autoComplete: 'tel' },
  { name: 'department', label: 'Department', type: 'text', autoComplete: 'off' },
  { name: 'level', label: 'Level', type: 'text', autoComplete: 'off' },
  { name: 'status', label: 'Account Status', type: 'text', autoComplete: 'off' },
];

/* Where the agent currently lives, with the pincode an application needs.
   Sent as PATCH /profile/me's `currentAddress` — see api/profile.js. */
export const ADDRESS_FIELDS = [
  { name: 'line1', label: 'Address Line 1', type: 'text', autoComplete: 'address-line1' },
  { name: 'line2', label: 'Address Line 2', type: 'text', autoComplete: 'address-line2' },
  { name: 'landmark', label: 'Landmark', type: 'text', autoComplete: 'off' },
  { name: 'city', label: 'City', type: 'text', autoComplete: 'address-level2' },
  { name: 'district', label: 'District', type: 'text', autoComplete: 'off' },
  { name: 'state', label: 'State', type: 'text', autoComplete: 'address-level1' },
  { name: 'pincode', label: 'Pincode', type: 'text', autoComplete: 'postal-code' },
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
