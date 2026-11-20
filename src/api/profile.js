import { client } from './client.js';

/**
 * The signed-in agent's own profile.
 *
 * The photo endpoints are multipart, so the body is a FormData and the
 * Content-Type header is left alone — the browser sets it, and it has to,
 * because only the browser knows the multipart boundary it generated.
 */

/**
 * Replace the avatar. Returns the stored path, relative to the API origin.
 *
 * The previous file is removed server-side, so nothing has to be cleaned up
 * here and the old URL stops resolving straight away.
 */
export async function uploadPhoto(file) {
  const body = new FormData();
  body.append('photo', file);

  const response = await client.post('/profile/me/photo', body);

  return response.data.data.photo;
}

/** Drop the avatar and the file behind it. */
export async function removePhoto() {
  const response = await client.delete('/profile/me/photo');

  return response.data.data.photo;
}

/** The HR-side record behind the read-only fields above — full name and
    address live here, not on the login account. */
export async function getMyProfile() {
  const response = await client.get('/profile/me');

  return response.data.data.profile;
}

/** Full name and address are the only fields this panel ever sends — see
    ProfilePanel.jsx for why the rest stay read-only. */
export async function updateMyProfile(data) {
  const response = await client.patch('/profile/me', data);

  return response.data.data.profile;
}

export default { uploadPhoto, removePhoto, getMyProfile, updateMyProfile };

/**
 * The services this agent's posting scopes them to.
 *
 * Read-only. A posting is an administrator's decision and there is no endpoint
 * for an agent to change their own, which is why this is a fetch and not a
 * form.
 *
 * Returns `{ department, handlesAllDepartmentServices, services }`. That middle
 * flag matters: an agent with no named services handles everything their
 * department offers, so the API answers with the department's full list and
 * says which of the two cases it is — the panel should not have to know the
 * convention to render it correctly.
 */
export async function getMyServices() {
  const response = await client.get('/agents/me/services');

  return response.data.data;
}
