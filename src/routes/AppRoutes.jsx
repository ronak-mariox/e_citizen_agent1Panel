import { Navigate, Route, Routes } from 'react-router-dom';

import LoginPage from '../pages/LoginPage.jsx';
import ForgotPasswordPage from '../pages/ForgotPasswordPage.jsx';
import VerifyOtpPage from '../pages/VerifyOtpPage.jsx';
import ResetPasswordPage from '../pages/ResetPasswordPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import AssignedQueuePage from '../pages/AssignedQueuePage.jsx';
import ApplicationDetailsPage from '../pages/ApplicationDetailsPage.jsx';
import PendingVerificationPage from '../pages/PendingVerificationPage.jsx';
import WaitingCustomerPage from '../pages/WaitingCustomerPage.jsx';
import ForwardedPage from '../pages/ForwardedPage.jsx';
import CompletedApplicationsPage from '../pages/CompletedApplicationsPage.jsx';
import NotificationsPage from '../pages/NotificationsPage.jsx';
import ReportsPage from '../pages/ReportsPage.jsx';
import SettingsPage from '../pages/SettingsPage.jsx';
import SectionPlaceholderPage from '../pages/SectionPlaceholderPage.jsx';
import ProtectedRoute, { PublicOnlyRoute } from './ProtectedRoute.jsx';
import { NAV_ITEMS } from '../constants/dashboard.js';

/* Sections with a real screen; everything else in the nav still gets the
   placeholder. Listing a built section here keeps it from also being handed a
   placeholder route on the same path. */
const BUILT_SECTIONS = [
  '/dashboard',
  '/assigned-queue',
  '/pending-verification',
  '/waiting-customer',
  '/forwarded',
  '/completed',
  '/notifications',
  '/reports',
  '/settings',
];
const PENDING_SECTIONS = NAV_ITEMS.filter((item) => !BUILT_SECTIONS.includes(item.to));

export function AppRoutes() {
  return (
    <Routes>
      {/* Auth screens — closed to an agent who already has a session. */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Everything past sign-in. */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/assigned-queue" element={<AssignedQueuePage />} />
        <Route path="/assigned-queue/:applicationId" element={<ApplicationDetailsPage />} />
        <Route path="/pending-verification" element={<PendingVerificationPage />} />
        <Route path="/waiting-customer" element={<WaitingCustomerPage />} />
        <Route path="/forwarded" element={<ForwardedPage />} />
        <Route path="/completed" element={<CompletedApplicationsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        {PENDING_SECTIONS.map((item) => (
          <Route key={item.to} path={item.to} element={<SectionPlaceholderPage />} />
        ))}
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;



