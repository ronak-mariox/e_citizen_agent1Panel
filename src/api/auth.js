import { client } from './client.js';

/**
 * The agent auth endpoints, one function per backend route.
 *
 * Anything other than a 2xx makes axios throw, so reaching a return means the
 * call worked — there is no `response.ok` to check. Every response uses the same
 * envelope, `{ success, statusCode, message, data }`, so these unwrap `data`.
 */

/**
 * Signs an agent in with their employee ID and password.
 *
 * Returns `{ user, accessToken, refreshToken }`. The refresh token is also set
 * as an httpOnly cookie, and that is the copy the app actually relies on — the
 * one in the body is there for non-browser clients.
 */
export async function login({ employeeId, password }) {
  const response = await client.post('/auth/login', { employeeId, password });

  return response.data.data;
}

/** Swaps the refresh cookie for a fresh access token. */
export async function refresh() {
  const response = await client.post('/auth/refresh');

  return response.data.data;
}

/** Revokes the refresh token server-side and clears the cookie. */
export async function logout() {
  const response = await client.post('/auth/logout');

  return response.data;
}

/** The signed-in agent, read from the token — used to revalidate on boot. */
export async function getMe() {
  const response = await client.get('/auth/me');

  return response.data.data.user;
}

/** Step 1 of the reset flow — sends a 6-digit code to the agent's mobile. */
export async function forgotPassword({ employeeId }) {
  const response = await client.post('/auth/password/forgot', { employeeId });

  return response.data.data;
}

export async function resendResetOtp({ employeeId }) {
  const response = await client.post('/auth/password/resend', { employeeId });

  return response.data.data;
}

/**
 * Step 2 — a correct code returns a short-lived `resetToken`, the only thing
 * that authorises step 3. The code itself is spent here.
 */
export async function verifyResetOtp({ employeeId, otp }) {
  const response = await client.post('/auth/password/verify-otp', { employeeId, otp });

  return response.data.data;
}

/** Step 3 — sets the new password and kills every existing session. */
export async function resetPassword({ resetToken, newPassword }) {
  const response = await client.post('/auth/password/reset', { resetToken, newPassword });

  return response.data;
}

/** Changes the signed-in agent's password. Ends every session, including this one. */
export async function changePassword({ currentPassword, newPassword }) {
  const response = await client.patch('/auth/password/change', { currentPassword, newPassword });

  return response.data;
}

export default {
  login,
  refresh,
  logout,
  getMe,
  forgotPassword,
  resendResetOtp,
  verifyResetOtp,
  resetPassword,
  changePassword,
};
