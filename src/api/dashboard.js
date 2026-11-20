import { client } from './client.js';

/**
 * The signed-in agent's dashboard — backend src/routes/dashboard.routes.js.
 *
 * One call for the whole screen rather than one per card. Every figure on it is
 * a different slice of the same collection, so the server reads them together;
 * seven requests would let the tiles disagree with each other as applications
 * moved between them.
 *
 * Nothing here passes an agent id: the server scopes the figures to the token,
 * so what the console asks for and what it is allowed to see cannot come apart.
 *
 * Returns `{ stats, trend, distribution, recent }`.
 */
export async function getMyDashboard() {
  const response = await client.get('/agent/dashboard');

  return response.data.data;
}
