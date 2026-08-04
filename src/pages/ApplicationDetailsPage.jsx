import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import DashboardLayout from '../layouts/DashboardLayout.jsx';
import { AGENT } from '../constants/dashboard.js';
import { APPLICATION_STEPS, CHECKLIST_ITEMS, QUEUE_ROWS } from '../constants/queueData.js';
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
import forwardPayment from '../assets/icons/application/forward-payment.svg';
import forwardAgent2 from '../assets/icons/application/forward-agent2.svg';
import viewForwarded from '../assets/icons/application/view-forwarded.svg';
import waitingHourglass from '../assets/icons/application/waiting-hourglass.svg';
import sendReminder from '../assets/icons/application/send-reminder.svg';
import queryClose from '../assets/icons/application/query-close.svg';
import queryUpload from '../assets/icons/application/query-upload.svg';
import querySend from '../assets/icons/application/query-send.svg';
import queryAlert from '../assets/icons/application/query-alert.svg';
import queryRemind from '../assets/icons/application/query-remind.svg';
import '../styles/application.css';

const CONTACT_ACTIONS = [
  { id: 'call', label: 'Call', icon: actionCall },
  { id: 'chat', label: 'Chat', icon: actionChat },
  { id: 'remind', label: 'Remind', icon: actionRemind },
  { id: 'download', label: 'Download', icon: actionDownload },
  { id: 'print', label: 'Print', icon: actionPrint },
];

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
          {fields.map((field) => (
            <div className="app-field" key={field.label}>
              <p className="app-field__label">{field.label}</p>
              <p className="app-field__value">{field.value}</p>
            </div>
          ))}
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

/* "01 Jul 2024 · 03:15 PM" — the stamp the design puts under a note author. */
const noteStamp = (date) =>
  `${date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })} · ${date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })}`;

/* Agent-private notes: an author-stamped list plus the composer. Save Note is
   held at the design's disabled state until something is actually typed. */
function Notes({ notes, onAdd }) {
  const [draft, setDraft] = useState('');
  const canSave = draft.trim().length > 0;

  const save = () => {
    if (!canSave) return;

    onAdd({
      id: `note-${Date.now()}`,
      author: AGENT.name,
      initials: AGENT.initials,
      time: noteStamp(new Date()),
      text: draft.trim(),
    });
    setDraft('');
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
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
}

/* Communication is a launcher, not a log: one tinted row per channel, each
   carrying its own icon and arrow already tinted by the export. */
function Communication({ applicant }) {
  const channels = [
    {
      id: 'call',
      title: 'Call Customer',
      detail: applicant.mobile,
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
      detail: applicant.email,
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
function ConfirmDialog({
  title,
  confirmLabel,
  onConfirm,
  onCancel,
  icon = modalApprove,
  tone = 'approve',
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
function QueryDialog({ onSend, onCancel }) {
  const [reason, setReason] = useState('');
  const [remarks, setRemarks] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [notify, setNotify] = useState(true);

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
            onClick={() => onSend({ reason, remarks, priority, notify })}
          >
            <img src={querySend} alt="" width="14.992" height="14.992" />
            Send Query
          </button>
        </div>
      </div>
    </div>
  );
}

function ApplicationDetailsPage() {
  const navigate = useNavigate();
  const { applicationId } = useParams();
  const application = QUEUE_ROWS.find((row) => row.id === applicationId);

  // Payment details ships collapsed, the other two open — as drawn.
  const [openSections, setOpenSections] = useState({
    applicant: true,
    property: true,
    payment: false,
  });
  const [activeTab, setActiveTab] = useState('documents');
  const [verified, setVerified] = useState(() => application?.verified ?? []);
  const [notes, setNotes] = useState(() => application?.notes ?? []);
  // A row opens at whichever stop its own status puts it at, so arriving from
  // the waiting or forwarded screens lands on the right card rather than on
  // "Begin Document Verification".
  const tone = application?.statusTone;
  const [verificationStarted, setVerificationStarted] = useState(() =>
    ['started', 'query', 'waiting', 'approved', 'forwarded', 'rejected'].includes(tone)
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
  const [paymentSent, setPaymentSent] = useState(false);
  const [forwarded, setForwarded] = useState(() => tone === 'forwarded');
  const [documentStatus, setDocumentStatus] = useState(() =>
    Object.fromEntries((application?.documents ?? []).map((doc) => [doc.id, doc.status]))
  );

  const quickInfo = useMemo(
    () =>
      application
        ? [
            { label: 'Application ID', value: application.id },
            { label: 'Department', value: application.department },
            { label: 'Service', value: application.service },
            { label: 'Applied Date', value: application.appliedDate },
            { label: 'SLA Remaining', value: application.time, tone: 'warning' },
            { label: 'Assigned At', value: application.assignedAt },
          ]
        : [],
    [application]
  );

  const toggleSection = (section) => {
    setOpenSections((current) => ({ ...current, [section]: !current[section] }));
  };

  const toggleChecklistItem = (id) => {
    setVerified((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const setDocument = (id, status) => {
    setDocumentStatus((current) => ({ ...current, [id]: status }));
  };

  if (!application) {
    return (
      <DashboardLayout>
        <main className="queue-page application-page">
          <h1 className="queue-page__title">Application not found</h1>
          <p className="queue-page__subtitle">The requested application could not be located.</p>
          <button className="queue-action" type="button" onClick={() => navigate('/assigned-queue')}>
            Back to queue
          </button>
        </main>
      </DashboardLayout>
    );
  }

  const { applicant, property, payment } = application;
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
            {CONTACT_ACTIONS.map((action) => (
              <button
                className={`app-contact-button app-contact-button--${action.id}`}
                type="button"
                key={action.id}
              >
                <img src={action.icon} alt="" width="11.247" height="11.247" />
                {action.label}
              </button>
            ))}
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

            <DetailSection
              icon={sectionProperty}
              title="Property Details"
              isOpen={openSections.property}
              onToggle={() => toggleSection('property')}
              fields={[
                { label: 'Survey No.', value: property.surveyNo },
                { label: 'Plot No.', value: property.plotNo },
                { label: 'Total Area', value: property.totalArea },
                { label: 'Built-up Area', value: property.builtUpArea },
                { label: 'Property Type', value: property.propertyType },
                { label: 'Zone', value: property.zone },
              ]}
            />

            <DetailSection
              icon={sectionPayment}
              title="Payment Details"
              isOpen={openSections.payment}
              onToggle={() => toggleSection('payment')}
              fields={[
                { label: 'Status', value: payment.status },
                { label: 'Amount', value: payment.amount },
                { label: 'Due Date', value: payment.dueDate },
                { label: 'Payment Mode', value: payment.mode },
              ]}
            />

            <section className="app-tabs" aria-label="Application records">
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

                            <button className="app-doc__icon-button" type="button" title="Preview">
                              <img src={docView} alt="Preview" width="13.12" height="13.12" />
                            </button>
                            <button className="app-doc__icon-button" type="button" title="Download">
                              <img src={docDownload} alt="Download" width="13.12" height="13.12" />
                            </button>

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

                {activeTab === 'notes' ? (
                  <Notes
                    notes={notes}
                    onAdd={(note) => setNotes((current) => [...current, note])}
                  />
                ) : null}

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
                    <p className="app-outcome__title">
                      {forwarded ? 'Forwarded to Agent 2' : 'Application Approved'}
                    </p>
                    <p className="app-outcome__text">
                      Verification complete. Handed to Agent 2 for final decision.
                    </p>
                  </div>

                  {/* Both hand-off routes drop away once the file is gone,
                      leaving only the way to go look at it. */}
                  {forwarded ? null : (
                    <>
                      {paymentSent ? (
                        <button
                          className="app-primary-button app-primary-button--done"
                          type="button"
                          disabled
                        >
                          Payment Done
                        </button>
                      ) : (
                        <button
                          className="app-primary-button app-primary-button--payment"
                          type="button"
                          onClick={() => setDialog('payment')}
                        >
                          <img src={forwardPayment} alt="" width="14.992" height="14.992" />
                          Forward to Payment
                        </button>
                      )}

                      {/* Greyed until payment clears — the design keeps the route
                          on screen either way, so only its state changes. */}
                      <button
                        className={
                          paymentSent
                            ? 'app-primary-button app-primary-button--agent2'
                            : 'app-muted-button'
                        }
                        type="button"
                        disabled={!paymentSent}
                        onClick={() => setForwarded(true)}
                      >
                        <img src={forwardAgent2} alt="" width="14.992" height="14.992" />
                        Forward to Agent 2
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
                    onClick={() => setDialog('approve')}
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
                  >
                    <img src={saveDraft} alt="" width="14.992" height="14.992" />
                    Save Draft
                  </button>

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

                  <button
                    className="app-primary-button"
                    type="button"
                    onClick={() => setVerificationStarted(true)}
                  >
                    <img src={beginVerification} alt="" width="14.992" height="14.992" />
                    Begin Document Verification
                  </button>

                  <button className="app-secondary-button" type="button">
                    <img src={saveDraft} alt="" width="14.992" height="14.992" />
                    Save Draft
                  </button>
                </>
              )}
            </section>

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

        {dialog === 'approve' ? (
          <ConfirmDialog
            title="Approve Application?"
            confirmLabel="Yes, Approve"
            onCancel={() => setDialog(null)}
            onConfirm={() => {
              setApproved(true);
              setDialog(null);
            }}
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
            confirmLabel="Confirm Reject"
            icon={modalReject}
            tone="reject"
            onCancel={() => setDialog(null)}
            onConfirm={() => {
              setRejected(true);
              setDialog(null);
            }}
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
            onCancel={() => setDialog(null)}
            onSend={() => {
              setQueryStatus('query');
              setDialog(null);
            }}
          />
        ) : null}

        {dialog === 'payment' ? (
          <ConfirmDialog
            title="Forwarded For Payment"
            confirmLabel="Send"
            onCancel={() => setDialog(null)}
            onConfirm={() => {
              setPaymentSent(true);
              // Nothing is left outstanding once payment is away, so the
              // checklist closes out with it.
              setVerified(CHECKLIST_ITEMS.map((item) => item.id));
              setDialog(null);
            }}
          >
            <p className="app-modal__text">
              You are about to approve <strong>{application.id}</strong>
            </p>
            <p className="app-modal__text app-modal__text--tight">
              for <strong>{application.name}</strong>. This will forward the application to Payment
            </p>
          </ConfirmDialog>
        ) : null}
      </main>
    </DashboardLayout>
  );
}

export default ApplicationDetailsPage;
