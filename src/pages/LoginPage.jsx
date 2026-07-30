import { useNavigate } from 'react-router-dom';

import AuthLayout from '../layouts/AuthLayout.jsx';
import LoginForm from '../components/LoginForm.jsx';
// import axios from 'axios';

export function LoginPage() {
  const navigate = useNavigate();

  // TODO: replace with the real auth call once the agent auth service is available.
  async function handleSubmit(credentials) {
    console.log(credentials)
    console.info('login submitted', { employeeId: credentials.employeeId });
    // try {
    //   const response = await axios.post('', credentials);
    //   console.log(response.data);
    //   if (response.ok) {
    //     navigate('/dashboard', { replace: true });
    //   }
    // }
    // catch (error) {
    //   console.log(error)
    // }
            navigate('/dashboard', { replace: true });

  }

  return (
    <AuthLayout>
      <LoginForm onSubmit={handleSubmit} />
    </AuthLayout>
  );
}

export default LoginPage;
