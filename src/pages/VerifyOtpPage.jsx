import { useLocation, useNavigate } from 'react-router-dom';

import AuthLayout from '../layouts/AuthLayout.jsx';
import OtpForm from '../components/OtpForm.jsx';

export function VerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const identifier = location.state?.identifier ?? '';

  // TODO: verify the code against the auth service once it is available.
  async function handleSubmit({ code }) {
    console.info('otp submitted', { identifier, code });
    // A verified code only unlocks the reset step — the agent signs in afterwards.
    navigate('/reset-password', { replace: true, state: { identifier } });
  }

  async function handleResend() {
    console.info('otp resend requested', { identifier });
  }

  return (
    <AuthLayout>
      <OtpForm identifier={identifier} onSubmit={handleSubmit} onResend={handleResend} />
    </AuthLayout>
  );
}

export default VerifyOtpPage;
