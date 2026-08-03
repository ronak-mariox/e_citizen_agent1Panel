import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import DashboardLayout from '../layouts/DashboardLayout.jsx';
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
import alertTriangle from '../assets/icons/application/alert-triangle.svg';
import beginVerification from '../assets/icons/application/begin-verification.svg';
import saveDraft from '../assets/icons/application/save-draft.svg';
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

/* Timeline, notes and communication are the same card with different sources,
   so they share one renderer instead of three near-identical blocks. */
function EntryList({ entries, emptyMessage }) {
  if (entries.length === 0) {
    return <p className="app-entry-empty">{emptyMessage}</p>;
  }

  return (
    <div className="app-entry-list">
      {entries.map((entry) => (
        <article className="app-entry" key={entry.id}>
          <div className="app-entry__head">
            <p className="app-entry__title">{entry.title}</p>
            <p className="app-entry__time">{entry.time}</p>
          </div>
          <p className="app-entry__detail">{entry.detail}</p>
        </article>
      ))}
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
              const isReached = index + 1 <= application.stage;

              return (
                <li className="app-stepper__step" key={step}>
                  <span
                    className={`app-stepper__index ${isReached ? 'app-stepper__index--active' : ''}`}
                  >
                    {index + 1}
                  </span>
                  <span
                    className={`app-stepper__label ${isReached ? 'app-stepper__label--active' : ''}`}
                  >
                    {step}
                  </span>
                  {index < APPLICATION_STEPS.length - 1 ? (
                    <span className="app-stepper__line" aria-hidden="true" />
                  ) : null}
                </li>
              );
            })}
          </ol>

          <span className="app-status-badge">
            <span className="app-status-badge__dot" aria-hidden="true" />
            {application.status}
          </span>
        </section>

        <section className="app-hero" aria-label="Applicant summary">
          <span className="app-hero__avatar" aria-hidden="true">
            {application.initials}
          </span>

          <div className="app-hero__body">
            <div className="app-hero__identity">
              <h1 className="app-hero__name">{application.name}</h1>
              <span className="app-status-badge">
                <span className="app-status-badge__dot" aria-hidden="true" />
                {application.status}
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

              <div className="app-tabs__panel" role="tabpanel">
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

                {activeTab === 'timeline' ? (
                  <EntryList entries={application.timeline} emptyMessage="No activity recorded yet." />
                ) : null}

                {activeTab === 'notes' ? (
                  <EntryList entries={application.notes} emptyMessage="No notes added yet." />
                ) : null}

                {activeTab === 'communication' ? (
                  <EntryList entries={application.messages} emptyMessage="No messages exchanged yet." />
                ) : null}
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

              <p className="app-alert">
                <img src={alertTriangle} alt="" width="13.12" height="13.12" />
                Verification not started. Click below to begin reviewing documents.
              </p>

              <button className="app-primary-button" type="button">
                <img src={beginVerification} alt="" width="14.992" height="14.992" />
                Begin Document Verification
              </button>

              <button className="app-secondary-button" type="button">
                <img src={saveDraft} alt="" width="14.992" height="14.992" />
                Save Draft
              </button>
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
      </main>
    </DashboardLayout>
  );
}

export default ApplicationDetailsPage;
