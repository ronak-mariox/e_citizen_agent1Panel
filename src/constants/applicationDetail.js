import { initialsOf, priorityPill } from './queueStatus.js';
import { assetUrl, rupees } from '../utils/format.js';

/**
 * The API's application record -> the fields the details screen draws.
 *
 * The screen was built against a fixture whose field names were its own
 * ("appliedDate", "statusTone", a document's "size"), and the API answers with
 * the shape the database stores. Rather than rename either — the design is
 * signed off, and the API is three consoles' worth of shared contract — the two
 * meet here. One function, one place to look when a value on that screen is
 * wrong, and the page itself goes on reading the same property names it always
 * did.
 *
 * Everything below is derived from what /agent/applications/:id actually
 * returns. Where the API has no answer the field is a dash rather than a
 * plausible-looking number: an agent acting on a fabricated due date is worse
 * off than one who can see there isn't one.
 */

/* The four stages an application moves through on this panel. Lives here
   because it is the stepper's own structure and not application data. */
export const APPLICATION_STEPS = [
  'Assigned',
  'Verification Started',
  'Decision Made',
  'Forwarded to A2',
];

/**
 * The verification checklist, in the order it is shown.
 *
 * The list belongs to the panel — it is the reviewer's working list of things
 * confirmed by eye, not a property of an application — so it is defined here and
 * sent to the server on every save. The server stores it whole, labels included,
 * which is what lets it work out a progress percentage without this list having
 * to be written out a second time in the backend.
 *
 * Which items are *ticked* comes back from the API, so a half-finished review
 * reopens where it was left.
 */
export const CHECKLIST_ITEMS = [
  { id: 'identity', label: 'Identity Verified' },
  { id: 'property', label: 'Property Verified' },
  { id: 'payment', label: 'Payment Verified' },
  { id: 'signature', label: 'Signature Verified' },
  { id: 'supporting', label: 'Supporting Docs Verified' },
  { id: 'complete', label: 'Application Complete' },
];

/**
 * Where each status sits on the four-step stepper.
 *
 * The stepper is this panel's view of the work, so several API statuses land on
 * the same stop: an application on hold and one under verification are both
 * "started", because neither has been decided. A rejection is a decision and
 * lands on step 3 — it simply goes no further.
 */
const STAGE_BY_STATUS = {
  submitted: 1,
  assigned: 1,
  /* The fee is collected once an officer has the application and before they
     start, so this sits beside `assigned` — nothing has been verified yet. */
  pending_payment: 1,

  under_verification: 2,
  query_raised: 2,
  reupload_requested: 2,
  on_hold: 2,
  escalated: 2,

  verified: 3,
  rejected: 3,
  cancelled: 3,

  pending_submission: 4,
  submitted_to_department: 4,
  in_progress: 4,
  completed: 4,
};

/**
 * Status -> which stop the decision panel opens at, and which badge it wears.
 *
 * Distinct from STATUS_PILL in queueStatus.js on purpose: that one dresses a
 * table cell, this one also decides what the agent is offered. The page reads
 * this tone to work out whether to show "Begin Document Verification" or the
 * outcome card, so a status mapped to the wrong tone here shows the wrong
 * buttons — which is why the two maps are not shared.
 *
 * Tones key into .app-status-badge--* in styles/application.css. `assigned` has
 * no modifier there and wears the base badge, which is the state the design
 * draws it in.
 */
const DETAIL_TONE = {
  submitted: 'assigned',
  assigned: 'assigned',
  /* Waiting on the fee, which falls due before verification — so this reads as
     work not yet started, not as work finished. It used to mean the opposite:
     the money was collected after the officer approved, and this status sat at
     the end of the road. Moving the fee to the front moved this with it. */
  pending_payment: 'assigned',

  under_verification: 'started',
  on_hold: 'started',
  escalated: 'started',

  // Parked with the citizen. A raised query and a re-upload request are drawn
  // apart: the first is still the agent's to chase, the second is waiting on a
  // file that has been asked for.
  query_raised: 'query',
  reupload_requested: 'waiting',

  /* Everything from the decision onwards wears the approved badge. `verified`
     is the decision made with the fee outstanding, `pending_payment` the fee
     asked for, and `completed` both done — three stops on one road, and the
     card below them says which. Completed is not `forwarded`: the application
     finished here, and a badge saying it went to Agent 2 would be a claim about
     something that did not happen. */
  verified: 'approved',
  completed: 'approved',

  pending_submission: 'forwarded',
  submitted_to_department: 'forwarded',
  in_progress: 'forwarded',

  rejected: 'rejected',
  cancelled: 'rejected',
};

/** What a status reads as in the badge and on a timeline row. */
const STATUS_LABEL = {
  draft: 'Draft',
  submitted: 'Submitted',
  assigned: 'Assigned',
  under_verification: 'Verification Started',
  query_raised: 'Query Raised',
  reupload_requested: 'Reupload Requested',
  verified: 'Verified',
  pending_payment: 'Payment Pending',
  pending_submission: 'Ready to Forward',
  submitted_to_department: 'With Department',
  in_progress: 'In Progress',
  escalated: 'Escalated',
  on_hold: 'On Hold',
  completed: 'Completed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

/** What a timeline row is titled — "what happened", not "what state it is in". */
const TIMELINE_TITLE = {
  draft: 'Draft Saved',
  submitted: 'Application Submitted',
  assigned: 'Assigned to Agent 1',
  under_verification: 'Verification Started',
  query_raised: 'Query Raised',
  reupload_requested: 'Re-upload Requested',
  verified: 'Verification Complete',
  pending_payment: 'Sent for Payment',
  pending_submission: 'Ready to Forward',
  submitted_to_department: 'Submitted to Department',
  in_progress: 'In Progress at Department',
  escalated: 'Escalated',
  on_hold: 'Put On Hold',
  completed: 'Completed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

/** Statuses after which nothing further is expected to happen. */
const TERMINAL_STATUSES = ['completed', 'rejected', 'cancelled'];

/**
 * Six document states into the three the stylesheet draws.
 *
 * `reupload_requested` reads as rejected because that is what it is from the
 * document's point of view — this file was not accepted and another has been
 * asked for. `replaced` is the superseded copy of one, so it is neither.
 */
const DOCUMENT_TONE = {
  verified: 'approved',
  rejected: 'rejected',
  reupload_requested: 'rejected',
  pending: 'pending',
  under_review: 'pending',
  replaced: 'pending',
};

/**
 * And back again — the three verdicts this screen can reach, as the API names
 * them.
 *
 * Not derived by inverting DOCUMENT_TONE: that map is many-to-one (both
 * `rejected` and `reupload_requested` read as rejected), so inverting it would
 * have to pick one, and picking `reupload_requested` would silently ask the
 * citizen for a new file every time an agent rejected one.
 */
const DOCUMENT_DECISION = {
  approved: 'verified',
  rejected: 'rejected',
  pending: 'pending',
};

/**
 * How a fee can be taken — PAYMENT_METHOD in the backend's statuses.js.
 *
 * There is no gateway in this build, so every one of these is an offline
 * channel and the officer records which was used. Listed here rather than
 * fetched: it is an enum the API validates against, and a dropdown that had to
 * wait for a round trip to draw itself would be worse in every way.
 */
export const PAYMENT_METHODS = [
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'demand_draft', label: 'Demand Draft' },
  { value: 'other', label: 'Other' },
];

const PAYMENT_METHOD_LABEL = Object.fromEntries(
  PAYMENT_METHODS.map((method) => [method.value, method.label])
);

/** Who moved it. The API sends the kind of account, never the individual. */
const ACTOR_LABEL = {
  citizen: 'Citizen',
  agent_1: 'Agent 1',
  agent_2: 'Agent 2',
  admin: 'Admin',
};

const DASH = '—';

const titleCase = (value) =>
  String(value ?? '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const statusLabelOf = (status) => STATUS_LABEL[status] ?? (titleCase(status) || DASH);

const DATE = { day: '2-digit', month: 'short', year: 'numeric' };
const CLOCK = { hour: '2-digit', minute: '2-digit', hour12: true };

const asDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

/** "02 Jul 2024". */
const shortDate = (value) => asDate(value)?.toLocaleDateString('en-IN', DATE) ?? DASH;

/** "09:00 AM". */
const clockTime = (value) => asDate(value)?.toLocaleTimeString('en-US', CLOCK) ?? DASH;

/** "02 Jul 2024 at 09:00 AM" — the stamp the timeline puts under an entry. */
const dateTime = (value) => {
  const date = asDate(value);

  return date ? `${shortDate(date)} at ${clockTime(date)}` : DASH;
};

/**
 * How long is left on the internal SLA — "1d 4h left".
 *
 * The backend now works this out itself (`sla.remainingLabel`, from
 * `slaHours` and the citizen-owed pauses — see computeSlaStatus in
 * application.service.js), pausing while an application is parked on a query
 * or an additional payment. Not `expectedCompletionDate`: that is the
 * citizen's own promised date and is a different, untouched concept.
 */
const slaRemaining = (application) => application?.sla?.remainingLabel ?? DASH;

/**
 * The citizen's address as one line.
 *
 * The API sends the parts the schema stores and leaves the joining to whoever
 * is drawing it; the hero strip has one line for it. Empty parts are dropped
 * rather than left as stray commas, and a profile with no address at all reads
 * as a dash instead of an empty string that would collapse the row.
 */
const addressLine = (address) => {
  if (!address) return DASH;

  const parts = [
    address.line1,
    address.line2,
    address.landmark,
    address.city ?? address.taluk,
    address.district,
    address.state,
  ]
    .map((part) => part?.trim())
    .filter(Boolean);

  const line = parts.join(', ');
  const pincode = address.pincode?.trim();

  if (!line) return pincode || DASH;

  return pincode ? `${line} - ${pincode}` : line;
};

/**
 * The checklist as the agent last left it -> the ids the screen ticks.
 *
 * The screen holds ticked items as a list of ids, which is what its checkboxes
 * read; the API stores every item with a flag. Anything the API has that this
 * build no longer defines is dropped, so removing a checklist item does not
 * leave a tick nothing can untick.
 */
const verifiedKeys = (verification) => {
  const known = new Set(CHECKLIST_ITEMS.map((item) => item.id));

  return (verification?.checklist ?? [])
    .filter((item) => item.isVerified && known.has(item.key))
    .map((item) => item.key);
};

/**
 * The agent's saved notes -> the note cards.
 *
 * `isSaved` is what stops the next Save Draft sending these back and appending a
 * second copy of every note the agent has ever written: only notes without it
 * are new. The author is the server's, never the client's — see the service.
 */
const savedNotes = (verification) =>
  (verification?.notes ?? []).map((note) => ({
    id: note.id,
    author: note.author ?? 'Agent',
    initials: initialsOf(note.author, 'A1'),
    time: note.at ? `${shortDate(note.at)} · ${clockTime(note.at)}` : DASH,
    text: note.text,
    isSaved: true,
  }));

/** An answer's stored value as the field grid shows it. */
const answerValue = (value) => {
  // A multi-select stores an array; the grid has one line per field.
  if (Array.isArray(value)) return value.filter(Boolean).join(', ') || DASH;

  return String(value ?? '').trim() || DASH;
};

/**
 * The citizen's answers, grouped into the collapsible sections they were asked
 * in.
 *
 * Every service has its own form, and each field carries the step the admin put
 * it under — so what the fixture hard-coded as one "Property Details" section
 * with survey numbers in it is really "however many sections this particular
 * service asks for". The screen's section component is unchanged; it is handed
 * these instead of a fixed list.
 *
 * Always at least one section, even for an application with no answers on it:
 * the design has a section there, and a service whose form is all file uploads
 * would otherwise leave a gap between the applicant strip and the payment one.
 */
const answerSections = (answers = []) => {
  const groups = new Map();

  for (const answer of answers) {
    const title = answer.section?.trim() || 'Application Details';

    if (!groups.has(title)) groups.set(title, []);

    groups.get(title).push({ label: answer.label, value: answerValue(answer.value) });
  }

  if (groups.size === 0) groups.set('Application Details', []);

  return [...groups].map(([title, fields], index) => ({
    // Indexed rather than keyed on the title, because the open/closed state is
    // held under this and a section named "Payment Details" would otherwise
    // collide with the payment section's own key.
    id: `section-${index}`,
    title,
    fields,
  }));
};

/** "1.2 MB" — what the citizen's app reported when the file was picked. */
const fileSize = (bytes) => {
  if (!bytes) return DASH;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * What kind of file it is — "PDF", "JPG".
 *
 * The design's first subtitle slot was a category in the fixture ("Identity",
 * "Property"), which nothing on the application records: a document knows the
 * form field it answers and its label already says as much in the title above
 * it. The file's own type is the thing that slot can honestly hold, and it is
 * what tells a reviewer whether this opens as a scan or as a photograph.
 */
const fileKind = (document) => {
  const extension = document.originalName?.split('.').pop();

  if (extension && extension !== document.originalName) return extension.toUpperCase();

  // No usable filename — fall back to the reported MIME subtype ("pdf").
  const subtype = document.mimeType?.split('/').pop();

  return subtype ? subtype.toUpperCase() : 'File';
};

const toDocument = (document) => ({
  id: document.id,
  title: document.label,
  category: fileKind(document),
  size: fileSize(document.sizeBytes),
  /* What the preview needs: where the bytes are, and what they are. The API
     sends a path relative to its own origin, so `assetUrl` rejoins the two —
     the panel's only clue about that origin is inside VITE_API_BASE_URL. Null
     where nothing has been uploaded, which is what stops the viewer opening an
     empty frame. */
  previewUrl: document.isUploaded && document.url ? assetUrl(document.url) : null,
  mimeType: document.mimeType ?? null,
  fileName: document.originalName ?? document.label,
  /* When the bytes landed. A row the citizen named at submit but has not
     uploaded yet has no date, which is the normal state of a fresh
     application — see the document schema. */
  date: document.isUploaded ? shortDate(document.uploadedAt) : 'Not uploaded',
  status: DOCUMENT_TONE[document.status] ?? 'pending',
});

/**
 * The application's history, as the Timeline tab draws it.
 *
 * The API's entries are what actually happened, in order, and the last of them
 * is where the application stands now — so that one is `active` and the rest
 * are `completed`. Nothing is invented past it: the fixture carried a "Pending
 * Final Approval" row with dashes for its date, and a step nobody has taken is
 * not history.
 */
const toTimeline = (timeline = [], status) => {
  const terminal = TERMINAL_STATUSES.includes(status);

  return timeline.map((entry, index) => ({
    // A status can appear twice — queried, answered, queried again — so the
    // index is what makes the key unique.
    id: `${entry.status}-${index}`,
    title: TIMELINE_TITLE[entry.status] ?? titleCase(entry.status),
    time: dateTime(entry.at),
    // Null where the platform moved it itself: the assignment engine choosing an
    // agent is the common case, and it has no actor by design.
    actor: ACTOR_LABEL[entry.actorRole] ?? 'System Auto',
    detail: entry.note?.trim() || DASH,
    status: index < timeline.length - 1 || terminal ? 'completed' : 'active',
  }));
};

/**
 * One API application -> everything the details screen reads off it.
 *
 * @param {object} application The record from GET /agent/applications/:id.
 */
export function toApplicationDetail(application) {
  if (!application) return null;

  const citizen = application.citizen ?? {};
  const fees = application.fees ?? {};
  const priority = priorityPill(application.priority);

  /* A citizen who has never filled in their profile has no name anywhere, and
     their mobile is who they are — the same fallback the queue table uses, so a
     row and the screen it opens name the same person. */
  const name = citizen.fullName ?? citizen.mobile ?? 'Unknown';

  return {
    /* The number the citizen quotes and every screen shows. The route param and
       every API call use the record id below, which is what the queue table
       navigates with — the two are deliberately separate: one is for reading,
       one is for addressing. */
    id: application.applicationNumber ?? application.referenceNumber ?? application.id,
    applicationId: application.id,
    referenceNumber: application.referenceNumber ?? DASH,

    name,
    initials: initialsOf(citizen.fullName ?? name),

    department: application.department?.name ?? DASH,
    service: application.service?.name ?? DASH,

    priority: priority.label,
    priorityTone: priority.tone,

    status: statusLabelOf(application.status),
    statusTone: DETAIL_TONE[application.status] ?? 'assigned',
    stage: STAGE_BY_STATUS[application.status] ?? 1,

    appliedDate: shortDate(application.submittedAt),
    assignedAt: dateTime(application.assignedAt),
    slaRemaining: slaRemaining(application),

    /* The department's own certificate, once the case is closed — the hero
       strip's Download/Print read this. Null on every application that has
       not reached that point, same reasoning as a document's previewUrl. */
    certificateUrl: application.completionCertificate?.url
      ? assetUrl(application.completionCertificate.url)
      : null,
    certificateName: application.completionCertificate?.originalName ?? null,

    applicant: {
      fullName: citizen.fullName ?? DASH,
      mobile: citizen.mobile ?? DASH,
      email: citizen.email ?? DASH,
      address: addressLine(citizen.address),
    },

    /* However many steps this service's form asks in, in the order it asks
       them. Replaces the fixture's single fixed "Property Details" block. */
    detailSections: answerSections(application.answers),

    /* The receipt, as the Payment Details section lists it. Every line is the
       payment record's own — dashed while the fee is outstanding, because none
       of it exists until somebody pays.

       There is no gateway to mint a transaction id, so the reference the payer
       gave — a UTR, a cheque number, a counter receipt — is both the transaction
       id and what identifies the receipt. One field, shown twice under the two
       names the section uses, rather than a second identifier invented to fill a
       row. */
    payment: {
      mode: application.payment?.method
        ? PAYMENT_METHOD_LABEL[application.payment.method] ?? titleCase(application.payment.method)
        : DASH,
      status: application.isPaid ? 'Paid' : 'Pending',
      transactionId: application.payment?.reference || DASH,
      paidOn: shortDate(application.payment?.recordedAt),
      receipt: application.payment?.reference || DASH,
      /* What was actually taken once paid, and what is owed before that — the
         two are the same figure unless somebody changes the fee mid-flight, and
         showing the paid amount after the fact is the honest one. Stored as an
         integer in paise; the console shows whole rupees. */
      amount: rupees(
        ((application.isPaid ? application.payment?.amount : fees.totalAmount) ?? 0) / 100
      ),
    },

    /* The decision, and the state of the decision card's own payment. Read from
       the record rather than remembered in the browser, so a refresh — or
       another agent's screen — shows the same thing. */
    decision: application.decision?.outcome ?? null,
    decisionReason: application.decision?.reason ?? null,

    /* The fee Agent 1 passes on, which is what the Verification Decision card's
       payment button is about — NOT the applicant's. The applicant's is
       `payment` above and belongs to the Payment Details section; mapping one
       onto the other made an application read as paid for on the strength of
       money somebody else had handed over. */
    paymentSent: Boolean(application.handoverPayment?.paid),
    handoverDue: rupees((application.handoverPayment?.due ?? 0) / 100),
    handoverAmount: rupees((application.handoverPayment?.amount ?? 0) / 100),
    handoverReference: application.handoverPayment?.reference ?? null,
    /* Whether the hand-off has happened, and whether it may. Both read off the
       record, so a reloaded screen offers the button on the same facts the
       server would accept it on. */
    isForwarded: Boolean(application.forwardedAt),
    /* Approved and not yet gone — what the server checks. Agent 1 no longer
       sends the department fee: citizens pay the company, and the admin pays
       Agent 2 from the company wallet. */
    canForward:
      application.decision?.outcome === 'approved' &&
      !application.forwardedAt &&
      application.agent2Available !== false,

    /* No Agent 2 covers this department yet: the forward cannot happen, and
       the admins have been told (agent2MissingNotifiedAt). */
    agent2Missing: application.agent2Available === false,
    agent2MissingNotified: Boolean(application.agent2MissingNotifiedAt),

    /* The applicant still owes the fee — nothing can be verified until they
       pay (the server refuses it too). A free service never waits. */
    paymentPending: !application.isPaid && (application.fees?.totalAmount ?? 0) > 0,
    amountDue: rupees((application.fees?.totalAmount ?? 0) / 100),

    /* Agent 2's requests for more money. One routed through Agent 1 waits here
       (`awaitingAgent1`) until it is sent on to the applicant. */
    paymentRequests: (application.additionalPaymentRequests ?? []).map((one) => ({
      id: one.id,
      amount: rupees((one.amount ?? 0) / 100),
      reason: one.reason || 'No reason given',
      remarks: one.remarks ?? null,
      awaitingAgent1: Boolean(one.awaitingAgent1),
      stage:
        one.status !== 'pending'
          ? one.status
          : one.awaitingAgent1
            ? 'with_you'
            : 'with_applicant',
    })),

    /* Finished: approved and paid for. What the completed list is built from,
       and what tells the decision card to stop offering anything further. */
    isCompleted: application.status === 'completed',
    completedAt: application.completedAt ?? null,

    documents: (application.documents ?? []).map(toDocument),
    timeline: toTimeline(application.timeline, application.status),

    /* The agent's own review, as they last saved it. Empty on an application
       nobody has opened — which is the honest state of one — rather than
       arriving with a fixture agent's ticks and remarks already on it. */
    verified: verifiedKeys(application.verification),
    notes: savedNotes(application.verification),

    /* The percentage the queue screens draw, computed by the server over the
       checklist it stored. Read from the API rather than recomputed here so the
       bar on the verification table and the one on this screen cannot disagree
       about the same review. */
    progressPercent: application.verification?.progressPercent ?? 0,
    verificationStartedAt: application.verification?.startedAt ?? null,
  };
}

/**
 * The screen's working state -> the body PATCH /agent/applications/:id accepts.
 *
 * The inverse of the reading above, and the only place the two vocabularies
 * meet: the screen thinks in ticked ids and three document verdicts, the API in
 * flags and its own six-value status enum.
 *
 * The whole checklist goes every time, not just what changed. It is six booleans
 * and the server replaces it wholesale, so a partial send would need both sides
 * to agree on how to merge — and the failure mode of getting that wrong is a
 * tick silently disappearing, which is the one thing a reviewer must be able to
 * trust.
 *
 * @param {object} state `verified` ids, the `documentStatus` map, and the notes
 *   list as the screen currently holds them.
 */
export function toVerificationDraft({ verified = [], documentStatus = {}, notes = [] } = {}) {
  const ticked = new Set(verified);

  return {
    checklist: CHECKLIST_ITEMS.map((item) => ({
      key: item.id,
      label: item.label,
      isVerified: ticked.has(item.id),
    })),

    documents: Object.entries(documentStatus).map(([id, status]) => ({
      id,
      status: DOCUMENT_DECISION[status] ?? 'pending',
    })),

    /* Only what has not been stored yet. Everything already on the record comes
       back marked, so re-saving cannot append a second copy of a note. */
    notes: notes.filter((note) => !note.isSaved).map((note) => note.text),
  };
}

export default toApplicationDetail;
