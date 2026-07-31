/**
 * This build is the Agent 1 portal, so only `agent_1` accounts belong in it.
 *
 * The backend issues a valid session to any staff account that signs in — one
 * /auth/login serves both panels — so refusing the wrong role is this app's job.
 * Backend routes that are genuinely Agent-1-only are additionally gated there
 * with `requireAgent1`; this check is about which shell to let someone into.
 */
export const PANEL_ROLE = 'agent_1';

export const PANEL_WRONG_ROLE_MESSAGE =
  'This account is not an Agent 1 account. Please sign in on the portal for your role.';
