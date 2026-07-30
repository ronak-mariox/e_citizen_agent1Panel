import { useNavigate } from 'react-router-dom';

import AuthLayout from '../layouts/AuthLayout.jsx';
import ForgotPasswordForm from '../components/ForgotPasswordForm.jsx';

export function ForgotPasswordPage() {
  const navigate = useNavigate();

  // TODO: wire to the OTP request endpoint once the auth service is available.
  async function handleSubmit({ identifier }) {
    console.info('otp requested', { identifier });
    navigate('/verify-otp', { state: { identifier } });
  }

  return (
    <AuthLayout>
      <ForgotPasswordForm onSubmit={handleSubmit} />
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
