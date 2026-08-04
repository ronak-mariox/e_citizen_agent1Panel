import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DashboardLayout from '../layouts/DashboardLayout.jsx';
import { WAITING_ROWS, WAITING_STATS } from '../constants/queueData.js';
import statAwaiting from '../assets/icons/waiting/stat-awaiting.svg';
import statReupload from '../assets/icons/waiting/stat-reupload.svg';
import statWaitingDays from '../assets/icons/waiting/stat-waiting-days.svg';
import rowRemind from '../assets/icons/waiting/row-remind.svg';
import rowView from '../assets/icons/waiting/row-view.svg';
import rowReverify from '../assets/icons/waiting/row-reverify.svg';
import rowAccept from '../assets/icons/waiting/row-accept.svg';
import reuploadAlert from '../assets/icons/waiting/reupload-alert.svg';
import '../styles/waiting.css';

const STAT_ICON = {
  awaiting: statAwaiting,
  reupload: statReupload,
  days: statWaitingDays,
};

/* The tab bar counts its own rows, so a filter can never disagree with the
   list it filters. `null` is the All tab. */
const TABS = [
  { id: 'all', label: 'All', tone: null },
  { id: 'query', label: 'Query Raised', tone: 'query' },
  { id: 'reupload', label: 'Re-upload Received', tone: 'reupload' },
];

const countFor = (tone) =>
  tone === null ? WAITING_ROWS.length : WAITING_ROWS.filter((row) => row.statusTone === tone).length;

function WaitingCustomerPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const activeTone = TABS.find((tab) => tab.id === activeTab).tone;
  const rows =
    activeTone === null ? WAITING_ROWS : WAITING_ROWS.filter((row) => row.statusTone === activeTone);

  return (
    <DashboardLayout>
      <main className="queue-page waiting-page">
        <header>
          <h1 className="queue-page__title">Waiting for Customer</h1>
          <p className="queue-page__subtitle">
            {WAITING_ROWS.length} applications awaiting customer response
          </p>
        </header>

        <section className="wc-stats" aria-label="Waiting summary">
          {WAITING_STATS.map((stat) => (
            <article className={`wc-stat wc-stat--${stat.tone}`} key={stat.id}>
              <div className="wc-stat__top">
                <p className="wc-stat__label">{stat.label}</p>
                <img src={STAT_ICON[stat.tone]} alt="" width="14.992" height="14.992" />
              </div>
              <p className="wc-stat__value">{stat.value}</p>
              <p className="wc-stat__note">{stat.note}</p>
            </article>
          ))}
        </section>

        <div className="wc-tabs" role="tablist" aria-label="Filter applications">
          {TABS.map((tab) => (
            <button
              className={`wc-tab ${activeTab === tab.id ? 'wc-tab--active' : ''}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label} ({countFor(tab.tone)})
            </button>
          ))}
        </div>

        <section className="wc-list" aria-label="Applications awaiting customer">
          {rows.map((row) => (
            <article className="wc-card" key={row.id}>
              <span className="wc-card__avatar" aria-hidden="true">
                {row.initials}
              </span>

              <div className="wc-card__body">
                <div className="wc-card__identity">
                  <h2 className="wc-card__name">{row.name}</h2>
                  <span className={`wc-status wc-status--${row.statusTone}`}>
                    <span className="wc-status__dot" aria-hidden="true" />
                    {row.status}
                  </span>
                  <span className={`wc-priority wc-priority--${row.priorityTone}`}>
                    {row.priority}
                  </span>
                </div>

                <p className="wc-card__meta">
                  {row.id} · {row.service} · {row.department}
                </p>

                <div className="wc-card__stats">
                  <span>Applied: {row.appliedDate}</span>
                  <span className="wc-card__waiting">Waiting {row.waitingDays} days</span>
                  <span className="wc-card__queries">Queries raised: {row.queriesRaised}</span>
                </div>

                {row.reupload ? (
                  <div className="wc-reupload">
                    <p className="wc-reupload__title">
                      <img src={reuploadAlert} alt="" width="13.12" height="13.12" />
                      New documents uploaded — re-verification required
                    </p>

                    <div className="wc-reupload__compare">
                      <div className="wc-doc">
                        <p className="wc-doc__label">Old Document</p>
                        <p className="wc-doc__name">{row.reupload.previous}</p>
                      </div>

                      <span className="wc-reupload__arrow" aria-hidden="true">
                        →
                      </span>

                      <div className="wc-doc wc-doc--new">
                        <p className="wc-doc__label">New Document</p>
                        <p className="wc-doc__name">{row.reupload.current}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* A re-upload swaps the nudge-and-wait pair for the two ways to
                  act on what the customer just sent. */}
              <div className="wc-card__actions">
                {row.reupload ? (
                  <>
                    {/* This row has no View — Re-Verify is its way into the
                        application, so it opens the same detail page. */}
                    <button
                      className="wc-action wc-action--reverify"
                      type="button"
                      onClick={() => navigate(`/assigned-queue/${row.id}`)}
                    >
                      <img src={rowReverify} alt="" width="11.247" height="11.247" />
                      Re-Verify
                    </button>
                    <button className="wc-action wc-action--accept" type="button">
                      <img src={rowAccept} alt="" width="11.247" height="11.247" />
                      Accept
                    </button>
                  </>
                ) : (
                  <>
                    <button className="wc-action wc-action--remind" type="button">
                      <img src={rowRemind} alt="" width="11.247" height="11.247" />
                      Remind
                    </button>
                    <button
                      className="wc-action wc-action--view"
                      type="button"
                      onClick={() => navigate(`/assigned-queue/${row.id}`)}
                    >
                      <img src={rowView} alt="" width="11.247" height="11.247" />
                      View
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </section>
      </main>
    </DashboardLayout>
  );
}

export default WaitingCustomerPage;
