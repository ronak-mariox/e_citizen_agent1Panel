import { Navigate, Outlet, useLocation } from 'react-router-dom';

import OnboardingDialog from '../components/onboarding/OnboardingDialog.jsx';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Gate for the signed-in half of the app.
 *
 * While the session is still being confirmed nothing is rendered — returning
 * the login redirect during 'loading' would bounce an agent who is in fact
 * signed in, every time they refresh the page.
 *
 * The attempted path is remembered so a re-login lands where the agent meant
 * to go rather than always on the dashboard.
 */
export function ProtectedRoute() {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <p className="route-loading">Checking your session…</p>;
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  /* Two gates stand between a new account and its first piece of work: the
     agent hands in the documents an admin asked for, and an admin verifies
     them. This tests the second, which only closes once the first has — so one
     flag covers both stages and the dialog decides which of them to show.

     Gated here rather than on the dashboard because it applies to every
     signed-in screen: an agent who typed /reports straight into the address bar
     has to meet it too. The API enforces the same rule on its side
     (requireVerifiedAgent), so this is the door and not the lock.

     `=== false` and not `!user.documentsVerified`: an account loaded from a
     session stored before this field existed has it undefined, and treating
     that as "unverified" would put the dialog in front of every agent already
     signed in. Their next /auth/me fills it in properly.

     The outlet still renders underneath, so the dialog opens over the console
     the agent is on their way to rather than over a blank page — and closing
     it lands them exactly there without a second navigation. */
  const onboarding = user?.documentsVerified === false;

  return (
    <>
      <Outlet />
      {onboarding && <OnboardingDialog />}
    </>
  );
}

/**
 * The mirror image, for the auth screens: an agent who already has a session
 * should not be looking at the login form.
 */
export function PublicOnlyRoute() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <p className="route-loading">Checking your session…</p>;
  }

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
