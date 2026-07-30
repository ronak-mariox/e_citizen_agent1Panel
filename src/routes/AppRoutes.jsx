import { Navigate, Route, Routes } from 'react-router-dom';

import LoginPage from '../pages/LoginPage.jsx';
import ForgotPasswordPage from '../pages/ForgotPasswordPage.jsx';
import VerifyOtpPage from '../pages/VerifyOtpPage.jsx';
import ResetPasswordPage from '../pages/ResetPasswordPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import SettingsPage from '../pages/SettingsPage.jsx';
import SectionPlaceholderPage from '../pages/SectionPlaceholderPage.jsx';
import { NAV_ITEMS } from '../constants/dashboard.js';

const BUILT_SECTIONS = ['/dashboard', '/settings'];
const PENDING_SECTIONS = NAV_ITEMS.filter((item) => !BUILT_SECTIONS.includes(item.to));

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      {PENDING_SECTIONS.map((item) => (
        <Route key={item.to} path={item.to} element={<SectionPlaceholderPage />} />
      ))}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;
