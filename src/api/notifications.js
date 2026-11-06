import { client } from './client.js';

/**
 * The signed-in agent's own notification centre — backend
 * src/routes/notification.routes.js.
 *
 * Nothing here passes a recipient: the server reads it off the token, so what
 * the console asks for and what it is allowed to see cannot come apart.
 */

/**
 * The rows, newest first, with the unread counts the chips draw from.
 *
 * `unread` is counted over everything rather than over the page, and it comes
 * back whole even when the list is narrowed to one type — the chips have to
 * keep saying what is waiting under the others.
 */
export async function listMyNotifications({ page, limit, type } = {}) {
  const response = await client.get('/notifications', {
    params: { page, limit, type: type === 'all' ? undefined : type },
  });

  return response.data.data;
}

/**
 * Mark one read, or all of them when no id is given.
 *
 * Answers with the new unread counts, which is all the screen needs to redraw —
 * the rows it already has.
 */
export async function markNotificationsRead(notificationId) {
  const path = notificationId ? `/notifications/${notificationId}/read` : '/notifications/read';
  const response = await client.patch(path);

  return response.data.data.unread;
}
