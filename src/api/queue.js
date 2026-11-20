import { client } from './client.js';

/**
 * The signed-in agent's own queue — backend src/routes/agentQueue.routes.js.
 *
 * `/agent/applications` and not `/applications`: the plain path belongs to the
 * citizen and returns their own filings. This one returns what the assignment
 * engine gave *this* agent, and the server scopes it — nothing here passes an
 * agent id, because a client that could name one could name somebody else's.
 *
 * Anything other than a 2xx makes axios throw, so reaching a return means the
 * call worked. Every response uses the same envelope — `{ success, statusCode,
 * message, data }` — so these unwrap `data`.
 */

/**
 * The queue.
 *
 * Returns `{ applications, summary, pagination }`. `summary` is counted over
 * the whole queue rather than the page and ignores the filters, so the cards
 * above the table keep answering the same question while a search is typed.
 */
export async function listMyQueue({
  page,
  limit,
  search,
  status,
  priority,
  reuploaded,
} = {}) {
  const response = await client.get('/agent/applications', {
    // Undefined values are dropped by axios, so an unfiltered call sends no
    // query string at all rather than `?status=undefined`.
    params: {
      page,
      limit,
      search: search || undefined,
      /* One status or several — the console's sections are stages of the work
         rather than single statuses. Joined with commas rather than passed as an
         array: axios would serialise that as `status[]=a&status[]=b`, which
         Express reads as a key called `status[]` and the validator never sees. */
      status: !status || status === 'all' ? undefined : [status].flat().join(','),
      // One priority, or several — the dashboard's High Priority tile counts
      // `high` and `urgent` together, so a link into this queue can ask for
      // both at once. Same comma-joined shape as `status` above, for the
      // same axios-array-serialisation reason.
      priority: !priority || priority === 'all' ? undefined : [priority].flat().join(','),
      /* Whether the applicant has answered a query — the two halves of the
         Waiting for Customer screen. Left out entirely unless a caller asks,
         so `undefined` means "either", not "neither". */
      reuploaded,
    },
  });

  return response.data.data;
}

/** One of them in full. Another agent's is a 404, not a 403. */
export async function getQueueApplication(applicationId) {
  const response = await client.get(`/agent/applications/${applicationId}`);

  return response.data.data.application;
}

/**
 * Save how far this agent's review has got — the panel's Save Draft.
 *
 * PATCH, and it carries only what the agent produced: the checklist as they left
 * it, their verdict on each document, and any notes they have typed since the
 * last save. Not the application whole — the server refuses anything else, and a
 * screen that sent back the record it was given would be a way to rewrite the
 * fee the citizen was quoted.
 *
 * The first save is also what moves the application to `under_verification`,
 * which is what puts it on the Pending Verification screen. The server decides
 * that; nothing here names a status.
 *
 * Answers with the whole updated application, in the same shape
 * `getQueueApplication` returns, so the screen can re-seed from what was
 * actually stored rather than from what it hoped it sent.
 */
export async function saveQueueDraft(applicationId, { checklist, documents, notes } = {}) {
  const response = await client.patch(`/agent/applications/${applicationId}`, {
    checklist,
    documents,
    notes,
  });

  return response.data.data.application;
}

/**
 * The verification decision — approve, reject, or raise a query.
 *
 * One call for the three because the panel has one Verification Decision panel
 * and the server treats them as one event with three outcomes. Approving does
 * not close the application: the fee is collected afterwards, and
 * `recordPayment` below is what finishes it.
 *
 * The server refuses an approval whose checklist is not finished or whose
 * documents include a rejected one — those gates are read off what previous
 * saves stored, so the screen cannot talk its way past them.
 */
export async function submitDecision(applicationId, { action, reason, remarks, priority } = {}) {
  const response = await client.post(`/agent/applications/${applicationId}/decision`, {
    action,
    reason,
    remarks,
    priority,
  });

  return response.data.data.application;
}

/**
 * Send the department fee on, so Agent 2 can file the application.
 *
 * Not the applicant's fee. That one is `recordPayment` below, and it is what the
 * Payment Details section shows; this is the statutory amount Agent 1 passes
 * down the chain, and it is what the hand-off waits on.
 */
export async function payHandoverFee(applicationId, { method, reference, amount } = {}) {
  const response = await client.post(
    `/agent/applications/${applicationId}/handover-payment`,
    { method, reference, amount }
  );

  return response.data.data.application;
}

/**
 * Record the *applicant's* fee, taken at a counter.
 *
 * There is no gateway in this build; the platform's payment methods are offline
 * channels, so this is the officer's receipt. `method` is required. The server
 * refuses one taken on an unapproved application, a second one on an
 * application already paid, and any stated amount that does not match the fee
 * quoted at submit time.
 */
export async function recordPayment(applicationId, { method, reference, amount } = {}) {
  const response = await client.post(`/agent/applications/${applicationId}/payment`, {
    method,
    reference,
    amount,
  });

  return response.data.data.application;
}

/**
 * Hand the application to Agent 2 — the last thing this console does with it.
 *
 * The server checks the two conditions itself: approved, and paid for unless the
 * service is free. The panel disables the button on the same facts, but the
 * record is what makes it true rather than merely displayed.
 *
 * Answers with the whole application, so the decision card redraws into its
 * forwarded state from what was stored.
 */
export async function forwardToAgent2(applicationId) {
  const response = await client.post(`/agent/applications/${applicationId}/forward`);

  return response.data.data.application;
}

/**
 * Agent 2 needs more money: pass their request on to the applicant, who pays it
 * from the app into the company wallet. Agent 1 never handles the money.
 */
export async function forwardPaymentRequest(applicationId, paymentRequestId, { note } = {}) {
  const response = await client.post(
    `/agent/applications/${applicationId}/payment-requests/${paymentRequestId}/forward`,
    { note: note?.trim() || undefined }
  );

  return response.data.data.application;
}
