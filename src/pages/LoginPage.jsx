import { useNavigate } from 'react-router-dom';

import AuthLayout from '../layouts/AuthLayout.jsx';
import LoginForm from '../components/LoginForm.jsx';

export function LoginPage() {
  const navigate = useNavigate();

  // TODO: replace with the real auth call once the agent auth service is available.
  async function handleSubmit(credentials) {
    console.info('login submitted', { employeeId: credentials.employeeId });
    navigate('/dashboard', { replace: true });
  }

  return (
    <AuthLayout>
      <LoginForm onSubmit={handleSubmit} />
    </AuthLayout>
  );
}

export default LoginPage;
