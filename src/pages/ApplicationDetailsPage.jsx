import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import DashboardLayout from '../layouts/DashboardLayout.jsx';
import * as queueApi from '../api/queue.js';
import { getErrorMessage } from '../api/client.js';
import { useLiveRefresh } from '../hooks/useLiveRefresh.js';
import {
  APPLICATION_STEPS,
  CHECKLIST_ITEMS,
  toApplicationDetail,
  toVerificationDraft,
} from '../constants/applicationDetail.js';
import breadcrumbBack from '../assets/icons/application/breadcrumb-back.svg';
import metaHash from '../assets/icons/application/meta-hash.svg';
import metaPhone from '../assets/icons/application/meta-phone.svg';
import metaMail from '../assets/icons/application/meta-mail.svg';
import metaLocation from '../assets/icons/application/meta-location.svg';
import actionCall from '../assets/icons/application/action-call.svg';
import actionChat from '../assets/icons/application/action-chat.svg';
import actionRemind from '../assets/icons/application/action-remind.svg';
import actionDownload from '../assets/icons/application/action-download.svg';
import actionPrint from '../assets/icons/application/action-print.svg';
import sectionApplicant from '../assets/icons/application/section-applicant.svg';
import sectionProperty from '../assets/icons/application/section-property.svg';
import sectionPayment from '../assets/icons/application/section-payment.svg';
import chevronUp from '../assets/icons/application/chevron-up.svg';
import chevronDown from '../assets/icons/application/chevron-down.svg';
import stepCheck from '../assets/icons/application/step-check.svg';
import tabDocuments from '../assets/icons/application/tab-documents.svg';
import tabTimeline from '../assets/icons/application/tab-timeline.svg';
import tabNotes from '../assets/icons/application/tab-notes.svg';
import tabCommunication from '../assets/icons/application/tab-communication.svg';
import docFile from '../assets/icons/application/doc-file.svg';
import docView from '../assets/icons/application/doc-view.svg';
import docDownload from '../assets/icons/application/doc-download.svg';
import docApprove from '../assets/icons/application/doc-approve.svg';
import docReject from '../assets/icons/application/doc-reject.svg';
import checkWhite from '../assets/icons/application/check-white.svg';
import noteAttach from '../assets/icons/application/note-attach.svg';
import noteSend from '../assets/icons/application/note-send.svg';
import commCall from '../assets/icons/application/comm-call.svg';
import commCallArrow from '../assets/icons/application/comm-call-arrow.svg';
import commWhatsapp from '../assets/icons/application/comm-whatsapp.svg';
import commWhatsappArrow from '../assets/icons/application/comm-whatsapp-arrow.svg';
import commEmail from '../assets/icons/application/comm-email.svg';
import commEmailArrow from '../assets/icons/application/comm-email-arrow.svg';
import commReminder from '../assets/icons/application/comm-reminder.svg';
import commReminderArrow from '../assets/icons/application/comm-reminder-arrow.svg';
import alertTriangle from '../assets/icons/application/alert-triangle.svg';
import beginVerification from '../assets/icons/application/begin-verification.svg';
import saveDraft from '../assets/icons/application/save-draft.svg';
import decisionReview from '../assets/icons/application/decision-review.svg';
import decisionDocuments from '../assets/icons/application/decision-documents.svg';
import decisionApprove from '../assets/icons/application/decision-approve.svg';
import decisionQuery from '../assets/icons/application/decision-query.svg';
import decisionReject from '../assets/icons/application/decision-reject.svg';
import decisionInfo from '../assets/icons/application/decision-info.svg';
import modalApprove from '../assets/icons/application/modal-approve.svg';
import modalReject from '../assets/icons/application/modal-reject.svg';
import approvedSeal from '../assets/icons/application/approved-seal.svg';
import rejectedSeal from '../assets/icons/application/rejected-seal.svg';
import forwardAgent2 from '../assets/icons/application/forward-agent2.svg';
import viewForwarded from '../assets/icons/application/view-forwarded.svg';
import waitingHourglass from '../assets/icons/application/waiting-hourglass.svg';
import sendReminder from '../assets/icons/application/send-reminder.svg';
import queryClose from '../assets/icons/application/query-close.svg';
import queryUpload from '../assets/icons/application/query-upload.svg';
import querySend from '../assets/icons/application/query-send.svg';
import queryAlert from '../assets/icons/application/query-alert.svg';
import queryRemind from '../assets/icons/application/query-remind.svg';
import viewerZoom from '../assets/icons/application/viewer-zoom.svg';
import viewerDownload from '../assets/icons/application/viewer-download.svg';
import viewerClose from '../assets/icons/application/viewer-close.svg';
import viewerFile from '../assets/icons/application/viewer-file.svg';
import viewerApprove from '../assets/icons/application/viewer-approve.svg';
import viewerReject from '../assets/icons/application/viewer-reject.svg';
import '../styles/application.css';

const CONTACT_ACTIONS = [
  { id: 'call', label: 'Call', icon: actionCall },
  { id: 'chat', label: 'Chat', icon: actionChat },
  { id: 'remind', label: 'Remind', icon: actionRemind },
  { id: 'download', label: 'Download', icon: actionDownload },
  { id: 'print', label: 'Print', icon: actionPrint },
];

/**
 * The three that are ways of reaching the applicant.
 *
 * Every one of them is already drawn further down the page, as a row in the
 * Communication tab — this strip is a shortcut to them rather than a second set
 * of controls. So pressing one opens that tab and scrolls to it, and the agent
 * lands on the channel they asked for with the applicant's number or address
 * beside it.
 *
 * Download and Print are not here: they act on the application itself and have
 * nothing to do with contacting anybody.
 */
const CONTACT_CHANNELS = ['call', 'chat', 'remind'];

const TABS = [
  { id: 'documents', label: 'Documents', icon: tabDocuments },
  { id: 'timeline', label: 'Timeline', icon: tabTimeline },
  { id: 'notes', label: 'Notes', icon: tabNotes },
  { id: 'communication', label: 'Communication', icon: tabCommunication },
];

const DOCUMENT_STATUS_LABEL = {
  approved: 'Approved',
  pending: 'Pending',
  rejected: 'Rejected',
};

/* The design draws the reason dropdown empty, so the list itself is ours. */
const QUERY_REASONS = [
  'Document unclear or illegible',
  'Missing document',
  'Details mismatch',
  'Payment pending',
  'Other',
];

const QUERY_PRIORITIES = ['High', 'Medium', 'Low'];

/* Same story on the reject dialog — the control is drawn empty. */
const REJECTION_REASONS = [
  'Documents not genuine',
  'Applicant not eligible',
  'Duplicate application',
  'Property details mismatch',
  'Payment not received',
  'Other',
];

const TIMELINE_STATUS_LABEL = {
  completed: 'Completed',
  active: 'Active',
  pending: 'Pending',
};

/* A collapsible section: header strip plus a two-column field grid. The header
   is the button, so the whole strip is clickable as the design draws it. */
function DetailSection({ icon, title, isOpen, onToggle, fields }) {
  return (
    <section className="app-section">
      <button className="app-section__head" type="button" onClick={onToggle} aria-expanded={isOpen}>
        <span className="app-section__title">
          <img src={icon} alt="" width="14.992" height="14.992" />
          {title}
        </span>
        <img src={isOpen ? chevronUp : chevronDown} alt="" width="14.992" height="14.992" />
      </button>

      {isOpen ? (
        <div className="app-section__body">
          {/* A service whose form is all file uploads has no answers to show
              here. The section stays — the design has one — and says so. */}
          {fields.length === 0 ? (
            <p className="app-entry-empty">Nothing was recorded in this section.</p>
          ) : (
            fields.map((field) => (
              <div className="app-field" key={field.label}>
                <p className="app-field__label">{field.label}</p>
                <p className="app-field__value">{field.value}</p>
              </div>
            ))
          )}
        </div>
      ) : null}
    </section>
  );
}

/* The timeline rail: one dot per entry, coloured by state, with the connecting
   line drawn by the list itself so it never depends on the entry count. */
function Timeline({ entries }) {
  if (entries.length === 0) {
    return <p className="app-entry-empty">No activity recorded yet.</p>;
  }

  return (
    <ol className="app-timeline">
      {entries.map((entry) => (
        <li className="app-timeline__item" key={entry.id}>
          <span className={`app-timeline__dot app-timeline__dot--${entry.status}`} aria-hidden="true" />

          <div className="app-timeline__card">
            <div className="app-timeline__head">
              <p className="app-timeline__title">{entry.title}</p>
              <span className={`app-timeline__status app-timeline__status--${entry.status}`}>
                {TIMELINE_STATUS_LABEL[entry.status]}
              </span>
            </div>
            <p className="app-timeline__meta">
              {entry.time} · {entry.actor}
            </p>
            <p className="app-timeline__detail">{entry.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* Agent-private notes: an author-stamped list plus the composer.
 *
 * Save Note is a real save, not a local add — `onAdd` round-trips through
 * PATCH /agent/applications/:id the same way Save Draft elsewhere on this
 * page does (see saveDraftNow/persistDraft), and `notes` above always
 * reflects what the server actually has once it answers. That is what
 * makes a note Agent 2 can eventually be shown one: a note that only ever
 * existed in this component's own state never reached the record they
 * read from.
 */
function Notes({ notes, onAdd }) {
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const canSave = draft.trim().length > 0 && !saving;

  const save = async () => {
    if (!canSave) return;

    setSaving(true);
    setError(null);

    const ok = await onAdd(draft.trim());

    setSaving(false);

    // Not attempted — the payment popup has already said why; keep the text.
    if (ok === null) return;
    if (ok) setDraft('');
    else setError('Could not save this note — try again.');
  };

  return (
    <div className="app-notes">
      {notes.map((note) => (
        <article className="app-note" key={note.id}>
          <div className="app-note__head">
            <span className="app-note__avatar" aria-hidden="true">
              {note.initials}
            </span>
            <div>
              <p className="app-note__author">{note.author}</p>
              <p className="app-note__time">{note.time}</p>
            </div>
          </div>
          <p className="app-note__text">{note.text}</p>
        </article>
      ))}

      <div className="app-note-composer">
        <textarea
          className="app-note-composer__input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add a private note… (visible only to agents)"
          aria-label="Add a private note"
        />

        <div className="app-note-composer__footer">
          <button className="app-note-composer__attach" type="button" title="Attach a file">
            <img src={noteAttach} alt="Attach a file" width="14.992" height="14.992" />
          </button>

          <button
            className="app-note-composer__save"
            type="button"
            onClick={save}
            disabled={!canSave}
          >
            <img src={noteSend} alt="" width="13.12" height="13.12" />
            {saving ? 'Saving…' : 'Save Note'}
          </button>
        </div>

        {error && <p className="app-note-composer__error">{error}</p>}
      </div>
    </div>
  );
}

/* Communication is a launcher, not a log: one tinted row per channel, each
   carrying its own icon and arrow already tinted by the export. */
function Communication({ applicant }) {
  console.log('Communication component rendered with applicant:', applicant);
  const channels = [
    {
      id: 'call',
      title: 'Call Customer',
      detail: 'xxxxxxxxxx',
      icon: commCall,
      arrow: commCallArrow,
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      detail: 'Send via WhatsApp Business',
      icon: commWhatsapp,
      arrow: commWhatsappArrow,
    },
    {
      id: 'email',
      title: 'Send Email',
      detail: 'xyz@example.com',
      icon: commEmail,
      arrow: commEmailArrow,
    },
    {
      id: 'reminder',
      title: 'Send Reminder',
      detail: 'SMS + Email reminder',
      icon: commReminder,
      arrow: commReminderArrow,
    },
  ];

  return (
    <div className="app-channels">
      {channels.map((channel) => (
        <button className={`app-channel app-channel--${channel.id}`} type="button" key={channel.id}>
          <span className="app-channel__icon" aria-hidden="true">
            <img src={channel.icon} alt="" width="14.992" height="14.992" />
          </span>

          <span className="app-channel__body">
            <span className="app-channel__title">{channel.title}</span>
            <span className="app-channel__detail">{channel.detail}</span>
          </span>

          <img className="app-channel__arrow" src={channel.arrow} alt="" width="14.992" height="14.992" />
        </button>
      ))}
    </div>
  );
}

/* Every confirmation is drawn as the same card — badge, centred copy, split
   footer — so only the wording, the badge and the confirm label vary. `tone`
   stains the badge and the confirm button together: an approval reads green,
   a rejection red. */
/** Where an Agent 2 payment request has got to, from this officer's side. */
const PAYMENT_REQUEST_STAGE = {
  with_you: 'Waiting on you',
  with_applicant: 'With applicant',
  paid: 'Paid',
  waived: 'Waived',
  cancelled: 'Cancelled',
};

/**
 * "Payment not done yet" — what every verification control answers with while
 * the applicant still owes the fee. One button: there is nothing to confirm,
 * only something to know.
 */
function PaymentPendingDialog({ application, onClose }) {
  return (
    <div className="app-modal" role="dialog" aria-modal="true" aria-labelledby="app-unpaid-title" onClick={onClose}>
      <div className="app-modal__card" onClick={(event) => event.stopPropagation()}>
        <span className="app-modal__badge app-modal__badge--pending" aria-hidden="true">
          <img src={queryAlert} alt="" width="26.239" height="26.239" />
        </span>

        <h2 className="app-modal__title" id="app-unpaid-title">
          Payment Not Done Yet
        </h2>

        <p className="app-modal__text">
          The applicant has not paid the fee of <strong>{application.amountDue}</strong> on{' '}
          <strong>{application.id}</strong>.
        </p>
        <p className="app-modal__text app-modal__text--tight">
          Document verification can start once the payment is done.
        </p>

        <div className="app-modal__actions">
          <button
            className="app-modal__button app-modal__button--confirm app-modal__button--pending"
            type="button"
            onClick={onClose}
            autoFocus
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({
  title,
  confirmLabel,
  onConfirm,
  onCancel,
  icon = modalApprove,
  tone = 'approve',
  /* Blocks the confirm button — either because the request is in flight, or
     because the dialog is still missing something the server requires. One
     prop for both: from the button's point of view they are the same thing. */
  busy = false,
  /* What the server said when it refused. Shown in the dialog rather than on
     the card behind it: the agent is looking here, and an approval blocked by
     an unfinished checklist has to say so where the button that was pressed
     is. */
  error = null,
  children,
}) {
  return (
    <div
      className="app-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-dialog-title"
      onClick={onCancel}
    >
      {/* The scrim closes; clicks inside the card must not bubble to it. */}
      <div className="app-modal__card" onClick={(event) => event.stopPropagation()}>
        <span className={`app-modal__badge app-modal__badge--${tone}`} aria-hidden="true">
          <img src={icon} alt="" width="26.239" height="26.239" />
        </span>

        <h2 className="app-modal__title" id="app-dialog-title">
          {title}
        </h2>

        {children}

        {error ? (
          <p className="app-save-status app-save-status--error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="app-modal__actions">
          <button
            className="app-modal__button app-modal__button--cancel"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className={`app-modal__button app-modal__button--confirm app-modal__button--${tone}`}
            type="button"
            onClick={onConfirm}
            disabled={busy}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* Raising a query is the one dialog that collects rather than confirms, so it
   keeps its own state and hands the finished query back on send. */
function QueryDialog({ onSend, onCancel, busy = false, error = null }) {
  const [reason, setReason] = useState('');
  const [remarks, setRemarks] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [notify, setNotify] = useState(true);

  /* The reason is the category the citizen is shown, so the server requires it
     — refused here too, rather than making a round trip that cannot succeed. */
  const canSend = Boolean(reason) && !busy;

  return (
    <div
      className="app-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="query-dialog-title"
      onClick={onCancel}
    >
      <div
        className="app-modal__card app-modal__card--form"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="app-query__head">
          <h2 className="app-query__title" id="query-dialog-title">
            Raise Query
          </h2>
          <button className="app-query__close" type="button" onClick={onCancel} title="Close">
            <img src={queryClose} alt="Close" width="14.992" height="14.992" />
          </button>
        </div>

        <div className="app-query__field">
          <label className="app-query__label" htmlFor="query-reason">
            Reason Category
          </label>
          <select
            className="app-query__select"
            id="query-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          >
            {/* Blank first, as the design draws the control empty. */}
            <option value="" />
            {QUERY_REASONS.map((option) => (
              <option value={option} key={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="app-query__field">
          <label className="app-query__label" htmlFor="query-remarks">
            Remarks
          </label>
          <textarea
            className="app-query__textarea"
            id="query-remarks"
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
            placeholder="Describe the issue in detail…"
          />
        </div>

        <div className="app-query__field">
          <span className="app-query__label">Priority</span>
          <div className="app-query__choices" role="group" aria-label="Priority">
            {QUERY_PRIORITIES.map((level) => (
              <button
                className={`app-query__choice ${
                  priority === level ? 'app-query__choice--active' : ''
                }`}
                type="button"
                aria-pressed={priority === level}
                key={level}
                onClick={() => setPriority(level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="app-query__field">
          <span className="app-query__label">Attach Screenshot</span>
          <button className="app-query__upload" type="button">
            <img src={queryUpload} alt="" width="22.494" height="22.494" />
            <span>Click to upload or drag &amp; drop</span>
          </button>
        </div>

        <div className="app-query__notify">
          <div>
            <p className="app-query__notify-title">Notify Customer</p>
            <p className="app-query__notify-detail">Send SMS + Email</p>
          </div>

          <button
            className={`app-query__toggle ${notify ? 'app-query__toggle--on' : ''}`}
            type="button"
            role="switch"
            aria-checked={notify}
            aria-label="Notify customer"
            onClick={() => setNotify((current) => !current)}
          />
        </div>

        {error ? (
          <p className="app-save-status app-save-status--error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="app-modal__actions">
          <button
            className="app-modal__button app-modal__button--cancel"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="app-modal__button app-modal__button--send"
            type="button"
            onClick={() =>
              // The control is drawn with capitalised options; the API's enum is
              // lower case. Folded here rather than widening the enum.
              onSend({ reason, remarks, priority: priority.toLowerCase(), notify })
            }
            disabled={!canSend}
          >
            <img src={querySend} alt="" width="14.992" height="14.992" />
            {busy ? 'Sending…' : 'Send Query'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * The document itself, in a dialog over the tab it was opened from.
 *
 * An agent's whole job on this screen is deciding whether a file is acceptable,
 * and Approve / Reject sat next to an eye that did nothing — so the decision was
 * being made on a filename. Opening in a new tab was the other option and loses
 * the application: the point is to look at the file *and* the row it belongs to.
 *
 * What the browser can render varies by type, so the body switches on it rather
 * than assuming a PDF. Anything it cannot draw still gets the link, because
 * "open it in your own viewer" beats a blank panel.
 */
function DocumentPreview({ document: file, onClose, onDecide }) {
  const isImage = file.mimeType?.startsWith('image/');
  const isPdf = file.mimeType === 'application/pdf';
  /* The design draws the panel holding a placeholder, because a mock cannot
     render a real file. Anything the browser can actually draw is drawn; the
     placeholder is what the same panel falls back to, which is exactly the case
     the design was drawing. */
  const canRender = Boolean(file.previewUrl) && (isImage || isPdf);

  /* Approving from here is the same act as approving from the row behind it, so
     it goes through the same handler — and then closes, because the decision was
     the reason the file was opened. */
  const decide = (status) => {
    onDecide(file.id, status);
    onClose();
  };

  return (
    <div
      className="app-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-dialog-title"
      onClick={onClose}
    >
      <div
        className="app-modal__card app-modal__card--preview"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="app-preview__head">
          <div>
            <h2 className="app-preview__title" id="preview-dialog-title">
              {file.title}
            </h2>
            <p className="app-preview__meta">
              {file.category} · {file.size}
            </p>
          </div>

          <div className="app-preview__tools">
            {/* Opening the file full-size in its own tab is what "zoom" can
                honestly mean here — the panel is a fixed height, and the
                browser's own viewer is better at a large scan than a box
                inside a dialog. Absent while there is no file. */}
            {file.previewUrl ? (
              <a
                className="app-preview__tool"
                href={file.previewUrl}
                target="_blank"
                rel="noreferrer"
                title={`Open ${file.fileName} full size`}
              >
                <img src={viewerZoom} alt="Open full size" width="15" height="15" />
              </a>
            ) : null}

            {file.previewUrl ? (
              <a
                className="app-preview__tool"
                href={file.previewUrl}
                download={file.fileName}
                target="_blank"
                rel="noreferrer"
                title={`Download ${file.fileName}`}
              >
                <img src={viewerDownload} alt="Download" width="15" height="15" />
              </a>
            ) : null}

            <button className="app-preview__tool" type="button" onClick={onClose} title="Close">
              <img src={viewerClose} alt="Close" width="15" height="15" />
            </button>
          </div>
        </header>

        <div className="app-preview__body">
          {isImage && file.previewUrl ? (
            <img className="app-preview__image" src={file.previewUrl} alt={file.title} />
          ) : null}

          {/* <object> rather than <iframe>: it falls through to its own children
              when the browser has no PDF plug-in, which is the case this has to
              survive. */}
          {isPdf && file.previewUrl ? (
            <object
              className="app-preview__frame"
              data={file.previewUrl}
              type="application/pdf"
              aria-label={file.title}
            >
              <p className="app-preview__note">
                This browser cannot display PDFs inline — open it full size
                instead.
              </p>
            </object>
          ) : null}

          {/* The design's own panel content, and what it is for: a file the
              browser will not draw. The second line says which of the two
              reasons it is, because the next move differs — chase the applicant
              for a file they never sent, or open one the browser cannot show. */}
          {canRender ? null : (
            <div className="app-preview__placeholder">
              <img src={viewerFile} alt="" width="45" height="45" />
              <p className="app-preview__placeholder-title">{file.title}</p>
              <p className="app-preview__placeholder-note">
                {!file.previewUrl
                  ? 'Not uploaded yet — request it from the Communication tab'
                  : 'Document preview'}
              </p>
            </div>
          )}
        </div>

        <div className="app-preview__actions">
          <button
            className="app-preview__decision app-preview__decision--approve"
            type="button"
            onClick={() => decide('approved')}
          >
            <img src={viewerApprove} alt="" width="15" height="15" />
            Approve
          </button>

          <button
            className="app-preview__decision app-preview__decision--reject"
            type="button"
            onClick={() => decide('rejected')}
          >
            <img src={viewerReject} alt="" width="15" height="15" />
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * The screen, mounted only once its application is in hand.
 *
 * Split from the fetching wrapper below rather than guarding every read: this
 * half opens each of its dozen pieces of state *from* the record — which stop
 * the decision panel starts at, which documents are already approved — and
 * initialisers only run on the first render. A single component would have
 * seeded them all from an empty record and then never revisited them, so the
 * agent would be shown "Begin Document Verification" on an application that was
 * forwarded last week.
 */
function ApplicationDetails({ application, onSaved }) {
  const navigate = useNavigate();

  /* Payment details ships collapsed and the applicant strip open, as drawn. The
     sections between them are this service's own form steps, so their keys come
     off the record instead of being written in here. */
  const [openSections, setOpenSections] = useState(() => ({
    applicant: true,
    payment: false,
    ...Object.fromEntries(application.detailSections.map((section) => [section.id, true])),
  }));
  const [activeTab, setActiveTab] = useState('documents');
  const [verified, setVerified] = useState(() => application?.verified ?? []);
  const [notes, setNotes] = useState(() => application?.notes ?? []);
  // A row opens at whichever stop its own status puts it at, so arriving from
  // the waiting or forwarded screens lands on the right card rather than on
  // "Begin Document Verification".
  const tone = application?.statusTone;

  /* Whether this officer has actually opened the review — not the same as the
     application being open to one.

     Paying the fee moves the application to `under_verification`, which is what
     the applicant's tracking rail reads and is true: the file is with an officer
     now. But nobody has ticked anything yet, and the card must still offer Begin
     Document Verification. So this reads the stamp the first save writes rather
     than the status — reached is not started. Past the decision it stops
     mattering: an approved or queried application was plainly reviewed. */
  const startedByAgent = (record) =>
    Boolean(record?.verificationStartedAt) ||
    ['query', 'waiting', 'approved', 'forwarded', 'rejected'].includes(record?.statusTone);

  const [verificationStarted, setVerificationStarted] = useState(() =>
    startedByAgent(application)
  );
  // A rejected application is closed for good — it never walks on to approved
  // or forwarded. It arrives rejected, or becomes so from the reject dialog.
  const [rejected, setRejected] = useState(() => tone === 'rejected');
  const [rejectReason, setRejectReason] = useState('');
  // Which confirmation is open, if any: 'approve' | 'payment' | 'query'.
  const [dialog, setDialog] = useState(null);
  const [approved, setApproved] = useState(() => ['approved', 'forwarded'].includes(tone));
  // A query the agent raises here reads 'query'; a row that arrives already
  // parked with the customer reads 'waiting'. The design draws them apart.
  const [queryStatus, setQueryStatus] = useState(() =>
    ['query', 'waiting'].includes(tone) ? tone : null
  );
  /* Whether the fee is in, and whether the application is finished. Both read
     off the record — `isPaid` and a `completed` status — rather than being
     remembered from the click that caused them, so a refresh lands on the same
     card the agent left. */
  const [completed, setCompleted] = useState(() => Boolean(application.isCompleted));
  /* The hand-off to Agent 2. Still browser-only: there is no Agent 2 queue on
     the backend to hand anything to — no assignment field, no routes — so this
     stays a local flag rather than pretending a record was moved. */
  /* Whether it has already gone. Read from the record and never set locally:
     forwarding navigates to the forwarded queue, and reopening the application
     afterwards learns it from the server like everything else. */
  const forwarded = Boolean(application.isForwarded);
  // The Agent 2 payment request being sent on to the applicant, if any.
  const [forwardingRequest, setForwardingRequest] = useState(null);
  /* Save Draft, in flight. One flag for both copies of the button — the design
     puts one on the not-yet-started card and another on the review card, and
     they are the same action, so pressing either must disable both. */
  const [saving, setSaving] = useState(false);
  /* Any workflow action in flight — a decision, a payment. Separate from
     `saving` so the Save Draft button can say "Saving…" while a dialog's
     confirm button says its own thing, but both are disabled by either. */
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [savedAt, setSavedAt] = useState(null);

  // Which document the viewer is showing, if any.
  const [preview, setPreview] = useState(null);

  /* The records panel, so the contact strip at the top of the page can bring the
     agent down to the tab it just opened. */
  const tabsRef = useRef(null);
  const [documentStatus, setDocumentStatus] = useState(() =>
    Object.fromEntries((application?.documents ?? []).map((doc) => [doc.id, doc.status]))
  );

  const quickInfo = useMemo(
    () => [
      { label: 'Application ID', value: application.id },
      { label: 'Department', value: application.department },
      { label: 'Service', value: application.service },
      { label: 'Applied Date', value: application.appliedDate },
      /* Counted down from the service's promised turnaround, which is what this
         line has always claimed to show. */
      { label: 'SLA Remaining', value: application.slaRemaining, tone: 'warning' },
      { label: 'Assigned At', value: application.assignedAt },
    ],
    [application]
  );

  const toggleSection = (section) => {
    setOpenSections((current) => ({ ...current, [section]: !current[section] }));
  };

  /* Every verification control goes through this: while the applicant still
     owes the fee it shows the "payment not done yet" popup instead of acting.
     The server refuses the same work, so this is the explanation, not the lock. */
  const [paymentBlocked, setPaymentBlocked] = useState(false);
  const unlessUnpaid =
    (action) =>
    async (...args) => {
      if (application.paymentPending) {
        /* What this screen holds can be older than the payment: the page was
           opened before the applicant paid, and the live refresh may lag. Ask the
           server before refusing — if the fee is in now, take the fresh record
           and carry on with the click instead of showing a stale popup. */
        let fresh = null;
        try {
          fresh = toApplicationDetail(await queueApi.getQueueApplication(application.applicationId));
        } catch {
          // Could not check — keep to what the screen last knew.
        }

        if (!fresh || fresh.paymentPending) {
          setPaymentBlocked(true);
          // null, not false: "stopped before trying", which the Notes tab
          // must not report as a failed save.
          return null;
        }

        onSaved?.(fresh);
      }
      return action(...args);
    };

  const toggleChecklistItem = unlessUnpaid((id) => {
    setVerified((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  });

  /**
   * Open the Communication tab and take the agent down to it.
   *
   * The contact strip sits at the top of a long page and the channels it points
   * at are at the bottom, so switching the tab alone would look like nothing
   * happened. Scrolling is the other half of the press.
   *
   * The scroll runs after the tab has been painted rather than in the same
   * frame: the panel that opens is taller than the one that closes on most
   * applications, so measuring before React re-renders lands short.
   */
  const openCommunication = () => {
    setActiveTab('communication');

    requestAnimationFrame(() => {
      /* `start`, not `nearest`. What has to be on screen is the panel *below*
         the tab strip — the channels themselves — and `nearest` treats the strip
         as already in view the moment its top edge is anywhere in the viewport,
         which on this page it usually is. The agent would press Chat and watch
         nothing move. Putting the strip at the top of the viewport is what
         brings the panel under it fully into view. */
      /* Animated, unless the agent has asked their system for less motion —
         scrollIntoView does not consult that preference on its own. */
      const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

      tabsRef.current?.scrollIntoView({
        behavior: still ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  };

  const setDocument = unlessUnpaid((id, status) => {
    setDocumentStatus((current) => ({ ...current, [id]: status }));
  });

  /**
   * Save Draft — everything the agent has changed on this screen, in one PATCH.
   *
   * The screen's state is the draft: the checklist as it is ticked right now, the
   * verdict currently showing on every document, and any note typed since the
   * last save. `toVerificationDraft` is what turns that into the body the API
   * accepts, so nothing here has to know the server's own vocabulary.
   *
   * Re-seeds from the response rather than assuming the send worked. The
   * server's copy is the one that survives a refresh, and the notes come back
   * with their real ids and timestamps — which is also what stops the next save
   * appending them a second time.
   */
  /**
   * Re-reads the outcome flags off whatever the server just returned.
   *
   * Shared by every path that applies a fresh record: a query only closes once
   * every document it named is verified, and that can happen from a Save Draft
   * on this very card — approving the re-uploaded documents and saving is the
   * one and only thing that resolves it. Without this, the card would keep
   * showing Query Raised / Waiting for Customer forever, because nothing else
   * ever tells it the query is gone.
   */
  const applyStatusFlags = (saved) => {
    const next = saved.statusTone;

    // Same rule as the seed above — see startedByAgent.
    if (startedByAgent(saved)) setVerificationStarted(true);
    setRejected(next === 'rejected');
    setApproved(['approved', 'forwarded'].includes(next));
    setQueryStatus(['query', 'waiting'].includes(next) ? next : null);
    setCompleted(Boolean(saved.isCompleted));
  };

  /**
   * The actual PATCH, shared by every button that saves this card — Save
   * Draft, and Save Note in the Notes tab below. `notesToSend` is the only
   * thing that ever differs between callers: Save Draft resends `notes` as
   * the screen already holds it, Save Note adds the one just typed first —
   * see toVerificationDraft's own note on why sending the whole checklist
   * and document map every time is fine either way.
   */
  const persistDraft = async (notesToSend) => {
    // A second press while the first is in flight would save the same work twice
    // and, on a first save, write two "verification started" timeline entries.
    if (saving || busy) return false;

    setSaving(true);
    setSaveError(null);

    try {
      const saved = toApplicationDetail(
        await queueApi.saveQueueDraft(
          application.applicationId,
          toVerificationDraft({ verified, documentStatus, notes: notesToSend })
        )
      );

      /* What the server actually stored, not what was sent. */
      setVerified(saved.verified);
      setNotes(saved.notes);
      setDocumentStatus(
        Object.fromEntries(saved.documents.map((document) => [document.id, document.status]))
      );
      applyStatusFlags(saved);

      setSavedAt(new Date());

      // Lifts it to the wrapper so the hero badge, the stepper and Quick Info
      // read the stored record too.
      onSaved?.(saved);

      return true;
    } catch (error) {
      // Nothing is marked saved on a failure — the screen must not look like it
      // worked when the record did not change.
      setSaveError(getErrorMessage(error));
      setSavedAt(null);

      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveDraftNow = unlessUnpaid(() => persistDraft(notes));

  /* The Notes tab's own save — appends one note and persists immediately,
     rather than leaving it sitting in local state until the agent happens to
     press Save Draft elsewhere on the page (which was the bug: a note typed
     and "saved" here never actually reached the record, so Agent 2 could
     never have seen it either). */
  const addNote = unlessUnpaid((text) => persistDraft([...notes, { text }]));

  /**
   * Applies whatever the server says the application now is.
   *
   * Every workflow action answers with the whole record, so the card it lands
   * on is the server's decision rather than the panel's guess about what its
   * own click should have caused. That is the difference between a screen that
   * survives a refresh and one that only looks like it worked.
   */
  const applyRecord = (saved) => {
    setVerified(saved.verified);
    setNotes(saved.notes);
    setDocumentStatus(
      Object.fromEntries(saved.documents.map((document) => [document.id, document.status]))
    );
    applyStatusFlags(saved);

    onSaved?.(saved);
  };

  /**
   * One runner for every workflow action.
   *
   * They all do the same four things — refuse to double-fire, clear the last
   * message, call the API, apply what came back — and writing that out five
   * times is five places for the error handling to be slightly different. A
   * failure leaves the card exactly as it was: nothing is applied unless the
   * server confirmed it.
   */
  const runAction = async (call) => {
    if (busy) return false;

    setBusy(true);
    setSaveError(null);

    try {
      applyRecord(toApplicationDetail(await call()));
      setDialog(null);

      return true;
    } catch (error) {
      /* The server refuses an approval whose checklist is unfinished or whose
         documents include a rejected one, and a fee taken on either. Those
         messages are written for the agent, so they are shown rather than
         flattened into "something went wrong". */
      setSaveError(getErrorMessage(error));
      setSavedAt(null);

      return false;
    } finally {
      setBusy(false);
    }
  };

  /* What the screen last committed, for a live refetch to check on landing:
     a save or action in flight, or a record applied since it set out, means
     its answer may be older than what is shown. */
  const liveGuard = useRef(null);
  useEffect(() => {
    liveGuard.current = { application, saving, busy };
  });

  /* Live: whatever changed elsewhere — the applicant paying or re-uploading,
     Agent 2 asking for more, a new timeline entry — shows up without a reload,
     and so does the fee arriving when the officer comes back to this tab.

     The server-owned record (badge, payment, documents, requests, timeline) is
     always taken. The agent's own draft — checklist, document verdicts, notes —
     is merged part by part: a part still as the last stored record left it
     takes the server's value, a part the agent has changed keeps theirs. */
  useLiveRefresh(async () => {
    if (saving || busy) return;

    const base = application;
    let fresh;
    try {
      fresh = toApplicationDetail(await queueApi.getQueueApplication(base.applicationId));
    } catch {
      return; // Keeps what is on screen.
    }

    const now = liveGuard.current;
    if (now.saving || now.busy || now.application !== base) return;

    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    if (same(fresh, base)) return;

    const baseStatus = Object.fromEntries(base.documents.map((doc) => [doc.id, doc.status]));

    setVerified((current) => (same(current, base.verified) ? fresh.verified : current));
    setNotes((current) => (same(current, base.notes) ? fresh.notes : current));
    setDocumentStatus((current) =>
      Object.fromEntries(
        fresh.documents.map((doc) => [
          doc.id,
          doc.id in current && current[doc.id] !== baseStatus[doc.id] ? current[doc.id] : doc.status,
        ])
      )
    );
    applyStatusFlags(fresh);

    onSaved?.(fresh);
  }, ['applications']);

  const decide = (payload) =>
    runAction(() => queueApi.submitDecision(application.applicationId, payload));

  /* Passing Agent 2's request for more money on to the applicant. Agent 1
     sends the ask; the applicant pays the company, never this officer. */
  const sendPaymentRequest = async () => {
    const sent = await runAction(() =>
      queueApi.forwardPaymentRequest(application.applicationId, forwardingRequest.id)
    );
    if (sent) setForwardingRequest(null);
  };

  /**
   * Hand it to Agent 2 — the last thing this console does with the application.
   *
   * Straight to the forwarded queue on success, because the application is no
   * longer this officer's to work on and leaving them on its detail page would
   * invite them to keep trying. On a failure nothing moves: the card stays as it
   * was and says what the server refused.
   */
  const forward = async () => {
    const moved = await runAction(() =>
      queueApi.forwardToAgent2(application.applicationId)
    );

    if (moved) navigate('/forwarded');
  };

  /* One line under whichever Save Draft button is on screen. Both copies show
     it, because either could be the one that was pressed. */
  const saveStatus = saveError ? (
    <p className="app-save-status app-save-status--error" role="alert">
      {saveError}
    </p>
  ) : savedAt ? (
    <p className="app-save-status app-save-status--ok" role="status">
      Draft saved at {savedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
    </p>
  ) : null;

  const { applicant, payment } = application;
  const verifiedCount = verified.length;
  const progressPercent = Math.round((verifiedCount / CHECKLIST_ITEMS.length) * 100);

  // The card only ever walks forward — started, decided, then handed on — and
  // each stop pushes the stepper along and restamps both status pills. A
  // rejection is a decision too, so it lands on the same stop an approval does
  // and simply goes no further.
  const currentStage = Math.max(
    application.stage,
    forwarded ? 4 : approved || rejected ? 3 : verificationStarted ? 2 : 0
  );
  const statusLabel = rejected
    ? 'Rejected'
    : forwarded
      ? 'Forwarded'
      : approved
        ? 'Approved'
        : queryStatus === 'query'
          ? 'Query Raised'
          : queryStatus === 'waiting'
            ? 'Waiting Customer'
            : verificationStarted
              ? 'Verification Started'
              : application.status;
  const statusTone = rejected
    ? 'rejected'
    : forwarded
      ? 'forwarded'
      : approved
        ? 'approved'
        : queryStatus
          ? queryStatus
          : verificationStarted
            ? 'started'
            : application.statusTone;

  return (
    <DashboardLayout>
      <main className="queue-page application-page">
        <nav className="app-breadcrumb" aria-label="Breadcrumb">
          <Link className="app-breadcrumb__back" to="/assigned-queue">
            <img src={breadcrumbBack} alt="" width="13.12" height="13.12" />
            Assigned Queue
          </Link>
          <span className="app-breadcrumb__divider" aria-hidden="true">
            /
          </span>
          <span className="app-breadcrumb__id">{application.id}</span>
        </nav>

        <section className="app-stepper" aria-label="Application progress">
          <ol className="app-stepper__list">
            {APPLICATION_STEPS.map((step, index) => {
              const position = index + 1;
              const state =
                position < currentStage ? 'complete' : position === currentStage ? 'active' : 'todo';

              return (
                <li className="app-stepper__step" key={step}>
                  <span className={`app-stepper__index app-stepper__index--${state}`}>
                    {state === 'complete' ? (
                      <img src={stepCheck} alt="" width="13.12" height="13.12" />
                    ) : (
                      position
                    )}
                  </span>
                  <span className={`app-stepper__label app-stepper__label--${state}`}>{step}</span>
                  {index < APPLICATION_STEPS.length - 1 ? (
                    <span
                      className={`app-stepper__line ${
                        state === 'complete' ? 'app-stepper__line--complete' : ''
                      }`}
                      aria-hidden="true"
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>

          <span className={`app-status-badge app-status-badge--${statusTone}`}>
            <span className="app-status-badge__dot" aria-hidden="true" />
            {statusLabel}
          </span>
        </section>

        <section className="app-hero" aria-label="Applicant summary">
          <span className="app-hero__avatar" aria-hidden="true">
            {application.initials}
          </span>

          <div className="app-hero__body">
            <div className="app-hero__identity">
              <h1 className="app-hero__name">{application.name}</h1>
              <span className={`app-status-badge app-status-badge--${statusTone}`}>
                <span className="app-status-badge__dot" aria-hidden="true" />
                {statusLabel}
              </span>
              <span className={`app-priority app-priority--${application.priorityTone}`}>
                {application.priority}
              </span>
            </div>

            <div className="app-hero__meta">
              <span className="app-hero__meta-item">
                <img src={metaHash} alt="" width="11.247" height="11.247" />
                {application.id}
              </span>
              <span className="app-hero__meta-item">
                <img src={metaPhone} alt="" width="11.247" height="11.247" />
                {applicant.mobile}
              </span>
              <span className="app-hero__meta-item">
                <img src={metaMail} alt="" width="11.247" height="11.247" />
                {applicant.email}
              </span>
              <span className="app-hero__meta-item">
                <img src={metaLocation} alt="" width="11.247" height="11.247" />
                {applicant.address}
              </span>
            </div>
          </div>

          <div className="app-hero__actions">
            {CONTACT_ACTIONS.map((action) => {
              if (CONTACT_CHANNELS.includes(action.id)) {
                return (
                  <button
                    className={`app-contact-button app-contact-button--${action.id}`}
                    type="button"
                    key={action.id}
                    onClick={() => openCommunication()}
                  >
                    <img src={action.icon} alt="" width="11.247" height="11.247" />
                    {action.label}
                  </button>
                );
              }

              /* Download and Print both act on the department's own
                 certificate, once the case has one — there is nothing to
                 download or print about an application still in progress,
                 which is what leaves both disabled until then rather than
                 handing back an empty file or an unstyled printout of this
                 page's own chrome. */
              return application.certificateUrl ? (
                <a
                  className={`app-contact-button app-contact-button--${action.id}`}
                  key={action.id}
                  href={application.certificateUrl}
                  download={action.id === 'download' ? (application.certificateName ?? true) : undefined}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src={action.icon} alt="" width="11.247" height="11.247" />
                  {action.label}
                </a>
              ) : (
                <button
                  className={`app-contact-button app-contact-button--${action.id}`}
                  type="button"
                  key={action.id}
                  disabled
                  title="No certificate on this application yet"
                >
                  <img src={action.icon} alt="" width="11.247" height="11.247" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </section>

        <div className="app-columns">
          <div className="app-columns__main">
            <DetailSection
              icon={sectionApplicant}
              title="Applicant Information"
              isOpen={openSections.applicant}
              onToggle={() => toggleSection('applicant')}
              fields={[
                { label: 'Full Name', value: applicant.fullName },
                { label: 'Mobile', value: applicant.mobile },
                { label: 'Email', value: applicant.email },
                { label: 'Address', value: applicant.address },
                { label: 'Department', value: application.department },
                { label: 'Service', value: application.service },
                { label: 'Application ID', value: application.id },
                { label: 'Submission Date', value: application.appliedDate },
              ]}
            />

            {/* What the citizen actually filled in, in the steps the service
                asked it in. The design drew this as one "Property Details"
                block because the mock-up was a property-tax application; the
                catalogue is every service, so the section titles and the fields
                inside them come from the record. Same component, same styling,
                same collapsing behaviour — only the content is no longer
                assumed. */}
            {application.detailSections.map((section) => (
              <DetailSection
                key={section.id}
                icon={sectionProperty}
                title={section.title}
                isOpen={openSections[section.id]}
                onToggle={() => toggleSection(section.id)}
                fields={section.fields}
              />
            ))}

            <DetailSection
              icon={sectionPayment}
              title="Payment Details"
              isOpen={openSections.payment}
              onToggle={() => toggleSection('payment')}
              /* The receipt as the applicant's payment left it. "Due Date" is
                 gone from this list because nothing records one — the fee falls
                 due the moment an officer has the application — and a row that
                 could only ever be a dash was taking the place of the four that
                 carry real answers. */
              fields={[
                { label: 'Payment Mode', value: payment.mode },
                { label: 'Payment Status', value: payment.status },
                { label: 'Transaction ID', value: payment.transactionId },
                { label: 'Payment Date', value: payment.paidOn },
                { label: 'Receipt', value: payment.receipt },
                { label: 'Amount', value: payment.amount },
              ]}
            />

            <section className="app-tabs" aria-label="Application records" ref={tabsRef}>
              <div className="app-tabs__bar" role="tablist" aria-label="Application records">
                {TABS.map((tab) => (
                  <button
                    className={`app-tab ${activeTab === tab.id ? 'app-tab--active' : ''}`}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <img src={tab.icon} alt="" width="13.12" height="13.12" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div
                className={`app-tabs__panel ${
                  activeTab === 'timeline' ? 'app-tabs__panel--timeline' : ''
                }`}
                role="tabpanel"
              >
                {activeTab === 'documents' ? (
                  <div className="app-docs">
                    {application.documents.map((document) => {
                      const status = documentStatus[document.id];

                      return (
                        <article className={`app-doc app-doc--${status}`} key={document.id}>
                          <div className="app-doc__identity">
                            <span className="app-doc__thumb" aria-hidden="true">
                              <img src={docFile} alt="" width="14.992" height="14.992" />
                            </span>
                            <div>
                              <p className="app-doc__title">{document.title}</p>
                              <p className="app-doc__detail">
                                {document.category} · {document.size} · {document.date}
                              </p>
                            </div>
                          </div>

                          <div className="app-doc__actions">
                            <span className={`app-doc__status app-doc__status--${status}`}>
                              {DOCUMENT_STATUS_LABEL[status]}
                            </span>

                            <button
                              className="app-doc__icon-button"
                              type="button"
                              title={
                                document.previewUrl
                                  ? `Preview ${document.fileName}`
                                  : 'Not uploaded yet'
                              }
                              onClick={() => setPreview(document)}
                            >
                              <img src={docView} alt="Preview" width="13.12" height="13.12" />
                            </button>

                            {/* Downloading is navigation to the file, so it is a
                                link — and it is simply absent while there is no
                                file, rather than a control that does nothing.
                                `download` is a hint the browser drops on a
                                cross-origin file; it then opens instead, which
                                is the same review the agent wanted. */}
                            {document.previewUrl ? (
                              <a
                                className="app-doc__icon-button"
                                href={document.previewUrl}
                                download={document.fileName}
                                target="_blank"
                                rel="noreferrer"
                                title={`Download ${document.fileName}`}
                              >
                                <img
                                  src={docDownload}
                                  alt="Download"
                                  width="13.12"
                                  height="13.12"
                                />
                              </a>
                            ) : null}

                            <button
                              className="app-doc__decision app-doc__decision--approve"
                              type="button"
                              onClick={() => setDocument(document.id, 'approved')}
                            >
                              <img src={docApprove} alt="" width="11.247" height="11.247" />
                              Approve
                            </button>
                            <button
                              className="app-doc__decision app-doc__decision--reject"
                              type="button"
                              onClick={() => setDocument(document.id, 'rejected')}
                            >
                              <img src={docReject} alt="" width="11.247" height="11.247" />
                              Reject
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : null}

                {activeTab === 'timeline' ? <Timeline entries={application.timeline} /> : null}

                {activeTab === 'notes' ? <Notes notes={notes} onAdd={addNote} /> : null}

                {activeTab === 'communication' ? <Communication applicant={applicant} /> : null}
              </div>
            </section>
          </div>

          <aside className="app-columns__side">
            <section className="app-card" aria-label="Verification checklist">
              <h2 className="app-card__title">Verification Checklist</h2>

              <div className="app-progress__head">
                <p className="app-progress__count">
                  {verifiedCount} of {CHECKLIST_ITEMS.length} verified
                </p>
                <p className="app-progress__percent">{progressPercent}%</p>
              </div>

              <div className="app-progress__track">
                <span className="app-progress__fill" style={{ width: `${progressPercent}%` }} />
              </div>

              <ul className="app-checklist">
                {CHECKLIST_ITEMS.map((item) => {
                  const isDone = verified.includes(item.id);

                  return (
                    <li key={item.id}>
                      <label className={`app-checklist__item ${isDone ? 'is-done' : ''}`}>
                        <input
                          className="app-checklist__input"
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggleChecklistItem(item.id)}
                        />
                        <span className="app-checklist__box" aria-hidden="true">
                          {isDone ? <img src={checkWhite} alt="" width="11.247" height="11.247" /> : null}
                        </span>
                        <span className="app-checklist__label">{item.label}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="app-card" aria-label="Verification decision">
              <h2 className="app-card__title">Verification Decision</h2>

              {/* A rejection is terminal, so the panel states the verdict and
                  offers nothing further — no hand-off, no payment, no draft. */}
              {rejected ? (
                <div className="app-outcome app-outcome--rejected">
                  <img src={rejectedSeal} alt="" width="29.996" height="29.996" />
                  <p className="app-outcome__title">Application Rejected</p>
                  <p className="app-outcome__text">This case is closed.</p>
                </div>
              ) : approved ? (
                <>
                  <div className="app-outcome app-outcome--approved">
                    <img src={approvedSeal} alt="" width="29.996" height="29.996" />
                    {/* Same card, same seal — only the wording says which of the
                        three stops after the decision this application is at. */}
                    <p className="app-outcome__title">
                      {completed
                        ? 'Application Completed'
                        : forwarded
                          ? 'Forwarded to Agent 2'
                          : 'Application Approved'}
                    </p>
                    {/* Approving no longer closes the application — it makes it
                        ready to hand on, which is what the card now says. The
                        line changes once it has gone. */}
                    <p className="app-outcome__text">
                      {completed
                        ? 'Verification approved and the fee has been collected. This application is closed.'
                        : forwarded
                          ? 'Verification complete. Handed to Agent 2 for final decision.'
                          : application.agent2Missing
                            ? 'Verification complete. Waiting for an Agent 2 in this department.'
                            : 'Verification complete. Hand it to Agent 2 for the final decision.'}
                    </p>
                  </div>

                  {/* Every route onwards drops away once the application is
                      finished, leaving only the way to go look at it. */}
                  {forwarded || completed ? null : (
                    <>
                      {/* Nobody to hand it to: say so here rather than letting
                          the click fail, and say the admin knows. */}
                      {application.agent2Missing ? (
                        <p className="app-alert app-alert--blocked" role="status">
                          <img src={alertTriangle} alt="" width="13.12" height="13.12" />
                          <span>
                            No Agent 2 is set up for <strong>{application.department}</strong> yet, so
                            this application cannot be forwarded.{' '}
                            {application.agent2MissingNotified
                              ? 'The admin has been notified — you can forward it once an Agent 2 is added.'
                              : 'The admin will be notified.'}
                          </span>
                        </p>
                      ) : null}

                      {/* No department fee to send any more — the company pays
                          Agent 2 from its own wallet — so the hand-off is live
                          the moment the application is approved, which is what
                          the server checks too. */}
                      <button
                        className={
                          application.canForward
                            ? 'app-primary-button app-primary-button--agent2'
                            : 'app-muted-button'
                        }
                        type="button"
                        disabled={!application.canForward || busy}
                        onClick={forward}
                      >
                        <img src={forwardAgent2} alt="" width="14.992" height="14.992" />
                        {busy ? 'Forwarding…' : 'Forward to Agent 2'}
                      </button>
                    </>
                  )}

                  <button
                    className="app-secondary-button"
                    type="button"
                    onClick={() => navigate('/forwarded')}
                  >
                    <img src={viewForwarded} alt="" width="14.992" height="14.992" />
                    View in Forwarded Queue
                  </button>
                </>
              ) : queryStatus === 'query' ? (
                <>
                  <div className="app-outcome app-outcome--query">
                    <img src={queryAlert} alt="" width="29.996" height="29.996" />
                    <p className="app-outcome__title">Query Raised</p>
                    <p className="app-outcome__text">
                      Waiting for customer to respond. Reminder can be sent from Communication tab.
                    </p>
                  </div>

                  <button
                    className="app-secondary-button app-secondary-button--query"
                    type="button"
                    onClick={() => setActiveTab('communication')}
                  >
                    <img src={queryRemind} alt="" width="14.992" height="14.992" />
                    Send Reminder
                  </button>

                  <button
                    className="app-primary-button app-primary-button--reject"
                    type="button"
                    onClick={() => setDialog('reject')}
                  >
                    <img src={decisionReject} alt="" width="14.992" height="14.992" />
                    Reject Application
                  </button>

                  {/* The re-uploaded documents are reviewed from the Documents
                      tab while the query sits open, and approving them there
                      is only ever a local tick — this is what persists it and
                      is the one thing that can resolve the query and bring
                      this card back to its normal buttons. */}
                  <button
                    className="app-secondary-button app-secondary-button--tight"
                    type="button"
                    onClick={saveDraftNow}
                    disabled={saving}
                  >
                    <img src={saveDraft} alt="" width="14.992" height="14.992" />
                    {saving ? 'Saving…' : 'Save Draft'}
                  </button>

                  {saveStatus}
                </>
              ) : queryStatus === 'waiting' ? (
                <>
                  <div className="app-outcome app-outcome--waiting">
                    <img src={waitingHourglass} alt="" width="29.996" height="29.996" />
                    <p className="app-outcome__title">Waiting for Customer</p>
                    <p className="app-outcome__text">
                      Query has been sent. Awaiting customer response.
                    </p>
                  </div>

                  <button className="app-secondary-button" type="button">
                    <img src={sendReminder} alt="" width="14.992" height="14.992" />
                    Send Reminder
                  </button>

                  {/* Same reason the query template has one — see above. */}
                  <button
                    className="app-secondary-button app-secondary-button--tight"
                    type="button"
                    onClick={saveDraftNow}
                    disabled={saving}
                  >
                    <img src={saveDraft} alt="" width="14.992" height="14.992" />
                    {saving ? 'Saving…' : 'Save Draft'}
                  </button>

                  {saveStatus}
                </>
              ) : verificationStarted ? (
                <>
                  <p className="app-alert app-alert--review">
                    <img src={decisionReview} alt="" width="13.12" height="13.12" />
                    Review all documents in the Documents tab, then submit your decision.
                  </p>

                  <button
                    className="app-decision-button app-decision-button--documents"
                    type="button"
                    onClick={() => setActiveTab('documents')}
                  >
                    <img src={decisionDocuments} alt="" width="13.12" height="13.12" />
                    Go to Documents Tab
                  </button>

                  <button
                    className="app-decision-button app-decision-button--approve"
                    type="button"
                    onClick={unlessUnpaid(() => setDialog('approve'))}
                  >
                    <img src={decisionApprove} alt="" width="14.992" height="14.992" />
                    Approve &amp; Forward
                  </button>

                  <button
                    className="app-decision-button app-decision-button--query"
                    type="button"
                    onClick={() => setDialog('query')}
                  >
                    <img src={decisionQuery} alt="" width="14.992" height="14.992" />
                    Raise Query to Customer
                  </button>

                  <button
                    className="app-decision-button app-decision-button--reject"
                    type="button"
                    onClick={() => setDialog('reject')}
                  >
                    <img src={decisionReject} alt="" width="14.992" height="14.992" />
                    Reject Application
                  </button>

                  <button
                    className="app-secondary-button app-secondary-button--tight"
                    type="button"
                    onClick={saveDraftNow}
                    disabled={saving}
                  >
                    <img src={saveDraft} alt="" width="14.992" height="14.992" />
                    {saving ? 'Saving…' : 'Save Draft'}
                  </button>

                  {saveStatus}

                  <p className="app-decision-note">
                    <img src={decisionInfo} alt="" width="13.12" height="13.12" />
                    Approving will forward this to Agent 2 for final review.
                  </p>
                </>
              ) : (
                <>
                  <p className="app-alert">
                    <img src={alertTriangle} alt="" width="13.12" height="13.12" />
                    Verification not started. Click below to begin reviewing documents.
                  </p>

                  {/* Starting a review is a save of an empty one, so it reuses
                      Save Draft's endpoint rather than adding a second route
                      that would set the same status. That is what persists the
                      move to Verification Started and puts the row on the
                      Pending Verification screen.

                      An outstanding fee does not stand in the way: the applicant
                      pays it from their own app, and the officer's work carries
                      on either way. The fee shows in Payment Details and on the
                      applicant's tracking rail until it lands. */}
                  <button
                    className="app-primary-button"
                    type="button"
                    onClick={saveDraftNow}
                    disabled={saving || busy}
                  >
                    <img src={beginVerification} alt="" width="14.992" height="14.992" />
                    {saving ? 'Starting…' : 'Begin Document Verification'}
                  </button>

                  <button
                    className="app-secondary-button"
                    type="button"
                    onClick={saveDraftNow}
                    disabled={saving}
                  >
                    <img src={saveDraft} alt="" width="14.992" height="14.992" />
                    {saving ? 'Saving…' : 'Save Draft'}
                  </button>

                  {saveStatus}
                </>
              )}
            </section>

            {application.paymentRequests.length > 0 && (
              <section className="app-card" aria-label="Payment requests from Agent 2">
                <h2 className="app-card__title">Payment Requests from Agent 2</h2>
                <p className="app-payreq__lead">
                  Agent 2 needs more money to finish this application. Send it to the applicant — they pay
                  the company from the app.
                </p>

                <ul className="app-payreq__list">
                  {application.paymentRequests.map((request) => (
                    <li className="app-payreq" key={request.id}>
                      <div className="app-payreq__head">
                        <span className="app-payreq__amount">{request.amount}</span>
                        <span className={`app-payreq__stage app-payreq__stage--${request.stage}`}>
                          {PAYMENT_REQUEST_STAGE[request.stage] ?? request.stage}
                        </span>
                      </div>
                      <p className="app-payreq__reason">{request.reason}</p>
                      {request.remarks && <p className="app-payreq__remarks">{request.remarks}</p>}
                      {request.awaitingAgent1 && (
                        <button
                          className="app-primary-button app-primary-button--agent2"
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            setSaveError(null);
                            setForwardingRequest(request);
                          }}
                        >
                          Send to Applicant
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="app-card" aria-label="Quick info">
              <h2 className="app-card__title">Quick Info</h2>

              <dl className="app-quick-info">
                {quickInfo.map((item) => (
                  <div className="app-quick-info__row" key={item.label}>
                    <dt className="app-quick-info__label">{item.label}</dt>
                    <dd
                      className={`app-quick-info__value ${
                        item.tone === 'warning' ? 'app-quick-info__value--warning' : ''
                      }`}
                    >
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </aside>
        </div>

        {preview ? (
          <DocumentPreview
            document={preview}
            onDecide={setDocument}
            onClose={() => setPreview(null)}
          />
        ) : null}

        {dialog === 'approve' ? (
          <ConfirmDialog
            title="Approve Application?"
            confirmLabel={busy ? 'Approving…' : 'Yes, Approve'}
            busy={busy}
            error={saveError}
            onCancel={() => setDialog(null)}
            onConfirm={() => decide({ action: 'approve' })}
          >
            <p className="app-modal__text">
              You are about to approve <strong>{application.id}</strong>
            </p>
            <p className="app-modal__text app-modal__text--tight">
              for <strong>{application.name}</strong>. This will forward the application to Agent 2.
            </p>
          </ConfirmDialog>
        ) : null}

        {dialog === 'reject' ? (
          <ConfirmDialog
            title="Reject Application?"
            confirmLabel={busy ? 'Rejecting…' : 'Confirm Reject'}
            /* The applicant is told this reason and nothing else, so the server
               requires one — held here as well, to refuse the click rather than
               make the round trip that would be refused. */
            busy={busy || !rejectReason}
            error={saveError}
            icon={modalReject}
            tone="reject"
            onCancel={() => setDialog(null)}
            onConfirm={() => decide({ action: 'reject', reason: rejectReason })}
          >
            <p className="app-modal__text">
              This action cannot be undone. The applicant will be notified.
            </p>

            {/* Left-aligned inside a centred card, as drawn. */}
            <div className="app-modal__field">
              <label className="app-query__label" htmlFor="reject-reason">
                Rejection Reason
              </label>
              <select
                className="app-query__select"
                id="reject-reason"
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
              >
                {/* Blank first, as the design draws the control empty. */}
                <option value="" />
                {REJECTION_REASONS.map((option) => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </ConfirmDialog>
        ) : null}

        {dialog === 'query' ? (
          <QueryDialog
            busy={busy}
            error={saveError}
            onCancel={() => setDialog(null)}
            onSend={(query) => decide({ action: 'query', ...query })}
          />
        ) : null}

        {paymentBlocked ? (
          <PaymentPendingDialog application={application} onClose={() => setPaymentBlocked(false)} />
        ) : null}

        {forwardingRequest ? (
          <ConfirmDialog
            title="Send Payment Request"
            confirmLabel={busy ? 'Sending…' : 'Send to Applicant'}
            busy={busy}
            error={saveError}
            onCancel={() => setForwardingRequest(null)}
            onConfirm={sendPaymentRequest}
          >
            <p className="app-modal__text">
              Ask the applicant to pay <strong>{forwardingRequest.amount}</strong> more on{' '}
              <strong>{application.id}</strong>
            </p>
            <p className="app-modal__text app-modal__text--tight">
              {forwardingRequest.reason}. They are notified and pay from the app, into the company
              wallet; the company passes it on to Agent 2.
            </p>
          </ConfirmDialog>
        ) : null}
      </main>
    </DashboardLayout>
  );
}

/**
 * Fetches the one application the route names, then hands it to the screen.
 *
 * The id in the path is the record's own, which is what the queue table
 * navigates with — not the APP-… number shown on screen. The server scopes the
 * read to the signed-in agent, so another agent's application answers 404 and
 * not 403: telling the two apart would confirm that the id exists.
 *
 * Three empty states, because what to do about each differs — wait, retry, or
 * go back — and one spinner-shaped message for all three would say none of it.
 */
function ApplicationDetailsPage() {
  const navigate = useNavigate();
  const { applicationId } = useParams();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [reloadToken, setReloadToken] = useState(0);
  const reload = () => setReloadToken((token) => token + 1);

  useEffect(() => {
    let cancelled = false;

    // The message has to change when the request starts, not when it finishes.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see above
    setLoading(true);
    setLoadError(null);

    queueApi
      .getQueueApplication(applicationId)
      .then((record) => {
        if (cancelled) return;

        setApplication(toApplicationDetail(record));
      })
      .catch((error) => {
        if (cancelled) return;

        setLoadError(getErrorMessage(error));
        setApplication(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    /* Guards against a slower earlier request landing after a newer one — an
       agent clicking two rows in quick succession would otherwise be shown the
       first application on the second one's URL. */
    return () => {
      cancelled = true;
    };
  }, [applicationId, reloadToken]);

  if (loading) {
    return (
      <DashboardLayout>
        <main className="queue-page application-page">
          <nav className="app-breadcrumb" aria-label="Breadcrumb">
            <Link className="app-breadcrumb__back" to="/assigned-queue">
              <img src={breadcrumbBack} alt="" width="13.12" height="13.12" />
              Assigned Queue
            </Link>
          </nav>
          <h1 className="queue-page__title">Loading application…</h1>
          <p className="queue-page__subtitle">Fetching the full record and its documents.</p>
        </main>
      </DashboardLayout>
    );
  }

  if (loadError) {
    return (
      <DashboardLayout>
        <main className="queue-page application-page">
          <nav className="app-breadcrumb" aria-label="Breadcrumb">
            <Link className="app-breadcrumb__back" to="/assigned-queue">
              <img src={breadcrumbBack} alt="" width="13.12" height="13.12" />
              Assigned Queue
            </Link>
          </nav>
          <h1 className="queue-page__title">This application could not be loaded</h1>
          <p className="queue-page__subtitle" role="alert">
            {loadError}
          </p>
          <button className="queue-action" type="button" onClick={reload}>
            Try again
          </button>
        </main>
      </DashboardLayout>
    );
  }

  if (!application) {
    return (
      <DashboardLayout>
        <main className="queue-page application-page">
          <h1 className="queue-page__title">Application not found</h1>
          <p className="queue-page__subtitle">
            It is not in your queue — it may have been reassigned or closed.
          </p>
          <button
            className="queue-action"
            type="button"
            onClick={() => navigate('/assigned-queue')}
          >
            Back to queue
          </button>
        </main>
      </DashboardLayout>
    );
  }

  /* Keyed on the record, so moving between two applications remounts the screen
     rather than carrying the first one's decision state onto the second. A save
     replaces this copy in place — same key, so the screen keeps the tab and the
     sections the agent had open while the badge and the stepper catch up. */
  return (
    <ApplicationDetails
      key={application.applicationId}
      application={application}
      onSaved={setApplication}
    />
  );
}

export default ApplicationDetailsPage;
