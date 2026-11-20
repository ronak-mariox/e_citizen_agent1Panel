import { client } from './client.js';

/**
 * The documents an admin asked this agent for when the account was opened.
 *
 * The console will not open until they are all in, so these four calls are the
 * whole of what a brand-new agent can do — everything else answers with the
 * dialog still in front of them.
 *
 * Every one of them returns the *whole* checklist rather than the row it
 * touched: an upload can change more than its own row — it is what closes the
 * gate once it happens to be the last one — and a dialog rebuilt from one
 * authoritative response cannot drift out of step with the server the way a
 * locally patched list does.
 */

/** GET /agents/me/onboarding — the checklist, including the empty slots. */
export async function getOnboarding() {
  const response = await client.get('/agents/me/onboarding');

  return response.data.data.onboarding;
}

/**
 * Attach one file against one document type.
 *
 * Multipart, so the body is a FormData and the Content-Type header is left
 * alone — the browser sets it, and it has to, because only the browser knows
 * the multipart boundary it generated.
 *
 * Re-uploading a type replaces what was there rather than adding a second copy,
 * and clears any verdict an admin had already recorded against it.
 *
 * `variant` is only the education row's — which of the 10th, the 12th or the
 * degree was sent. Omitted for the other three, where the API refuses one.
 */
export async function uploadDocument({ type, variant, file }) {
  const body = new FormData();
  body.append('type', type);
  if (variant) body.append('variant', variant);
  body.append('document', file);

  const response = await client.post('/agents/me/onboarding/documents', body);

  return response.data.data.onboarding;
}

/** Detach one, and delete the file behind it. */
export async function removeDocument(documentId) {
  const response = await client.delete(`/agents/me/onboarding/documents/${documentId}`);

  return response.data.data.onboarding;
}

/**
 * Close the gate.
 *
 * The server checks the list again rather than taking the dialog's word for it,
 * so this is refused — not quietly accepted — if anything is still outstanding.
 */
export async function completeOnboarding() {
  const response = await client.post('/agents/me/onboarding/complete');

  return response.data.data.onboarding;
}

export default { getOnboarding, uploadDocument, removeDocument, completeOnboarding };
