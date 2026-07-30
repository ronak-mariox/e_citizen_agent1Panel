import tabProfile from '../assets/icons/settings/tab-profile.svg';
import tabPassword from '../assets/icons/settings/tab-password.svg';
import tabSecurity from '../assets/icons/settings/tab-security.svg';
import tabLogout from '../assets/icons/settings/tab-logout.svg';

import { AGENT } from './dashboard.js';

export const SETTINGS_TABS = [
  { id: 'profile', label: 'Profile', icon: tabProfile },
  { id: 'password', label: 'Password', icon: tabPassword },
  { id: 'security', label: 'Security', icon: tabSecurity },
];

export const LOGOUT_ICON = tabLogout;

export const DEFAULT_SETTINGS_TAB = SETTINGS_TABS[0].id;

export const AGENT_PROFILE = {
  fullName: AGENT.name,
  employeeId: 'ECZ-A1-0042',
  email: 'ravi.kumar@ecitizen.gov.in',
  mobile: '+91 98765 00001',
  department: 'Revenue Verification',
  designation: 'Verification Agent',
};

/* Field order matches the designed two-column grid, row by row. */
export const PROFILE_FIELDS = [
  { name: 'fullName', label: 'Full Name', type: 'text', autoComplete: 'name' },
  { name: 'employeeId', label: 'Employee ID', type: 'text', autoComplete: 'off' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'mobile', label: 'Mobile', type: 'tel', autoComplete: 'tel' },
  { name: 'department', label: 'Department', type: 'text', autoComplete: 'off' },
  { name: 'designation', label: 'Designation', type: 'text', autoComplete: 'off' },
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
