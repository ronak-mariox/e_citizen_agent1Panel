import { useLocation, useNavigate } from 'react-router-dom';

import AuthLayout from '../layouts/AuthLayout.jsx';
import ResetPasswordForm from '../components/ResetPasswordForm.jsx';

export function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const identifier = location.state?.identifier ?? '';

  // TODO: send the new password to the auth service once it is available.
  async function handleSubmit({ password }) {
    console.info('password reset submitted', { identifier, length: password.length });
    navigate('/login', { replace: true });
  }

  return (
    <AuthLayout>
      <ResetPasswordForm onSubmit={handleSubmit} />
    </AuthLayout>
  );
}

export default ResetPasswordPage;
