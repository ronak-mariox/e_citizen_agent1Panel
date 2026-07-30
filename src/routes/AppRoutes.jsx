import { Navigate, Route, Routes } from 'react-router-dom';

import LoginPage from '../pages/LoginPage.jsx';
import ForgotPasswordPage from '../pages/ForgotPasswordPage.jsx';
import VerifyOtpPage from '../pages/VerifyOtpPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import SectionPlaceholderPage from '../pages/SectionPlaceholderPage.jsx';
import { NAV_ITEMS } from '../constants/dashboard.js';

const PENDING_SECTIONS = NAV_ITEMS.filter((item) => item.to !== '/dashboard');

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      {PENDING_SECTIONS.map((item) => (
        <Route key={item.to} path={item.to} element={<SectionPlaceholderPage />} />
      ))}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;
