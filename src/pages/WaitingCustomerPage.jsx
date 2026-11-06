import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DashboardLayout from '../layouts/DashboardLayout.jsx';
import * as queueApi from '../api/queue.js';
import { getErrorMessage } from '../api/client.js';
import { useLiveRefresh } from '../hooks/useLiveRefresh.js';
import { initialsOf, priorityPill, statusPill } from '../constants/queueStatus.js';
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

/* Both halves of one round trip.

   An application is parked with its applicant under either status — the agent
   asked a question, or asked for a file again — and what separates the two tabs
   is not which of those it was but whether anything has come back. So both tabs
   ask for both statuses and split on `reuploaded`, which the server sets the
   moment a citizen replaces a document and clears once the agent has looked at
   it. That is why the two counts always add up to the All tab. */
const PARKED = ['query_raised', 'reupload_requested'];

const TABS = [
  { id: 'all', label: 'All', reuploaded: undefined },
  { id: 'query', label: 'Query Raised', reuploaded: false },
  { id: 'reupload', label: 'Re-upload Received', reuploaded: true },
];

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * How long this has been sitting with the applicant, as the card says it.
 *
 * Whole days since the last thing that happened to it. "Waiting today" rather
 * than "0 days" for something that moved this morning, and the singular for one
 * — a reply that arrived an hour ago reading "Waiting 0 days" looks like a bug
 * on a screen whose whole job is to show how long people have been waiting.
 */
const waitingFor = (row) => {
  const since = row.lastActivity?.at ?? row.updatedAt;
  const at = since ? new Date(since) : null;

  if (!at || Number.isNaN(at.getTime())) return 'Waiting';

  const days = Math.max(0, Math.floor((Date.now() - at.getTime()) / DAY_MS));

  if (days === 0) return 'Waiting today';

  return `Waiting ${days} day${days === 1 ? '' : 's'}`;
};

const DATE = { day: '2-digit', month: 'short', year: 'numeric' };

const shortDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-IN', DATE);
};

const PAGE_SIZE = 20;

function WaitingCustomerPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [reloadToken, setReloadToken] = useState(0);
  const reload = () => setReloadToken((token) => token + 1);

  /* A live refetch is silent: what is on screen stays up while it loads, and a
     failed one keeps it. */
  const silentRef = useRef(false);
  useLiveRefresh(() => {
    silentRef.current = true;
    reload();
  }, ['applications']);

  /* Which row is being accepted, and what went wrong if it did. Keyed by
     application so two cards cannot disable each other's button. */
  const [accepting, setAccepting] = useState(null);
  const [acceptError, setAcceptError] = useState(null);

  /**
   * Accept the document the applicant sent back.
   *
   * The same call the Documents tab makes when an officer approves a file —
   * approving one *is* a save — so there is no second endpoint and no second
   * definition of what accepting means. The server is what then closes the
   * query it answered and, if nothing else is outstanding, takes the
   * application off this screen.
   */
  const accept = async (row) => {
    if (accepting || !row.reupload?.documents?.length) return;

    setAccepting(row.id);
    setAcceptError(null);

    try {
      await queueApi.saveQueueDraft(row.id, {
        documents: row.reupload.documents.map((one) => ({
          id: one.documentId,
          status: 'verified',
        })),
      });

      // Refetched rather than removed here: whether it leaves this tab is the
      // server's answer, and it depends on queries this card cannot see.
      reload();
    } catch (error) {
      setAcceptError(getErrorMessage(error));
    } finally {
      setAccepting(null);
    }
  };

  useEffect(() => {
    let cancelled = false;

    // Looked up in here rather than above, so the effect depends on the tab
    // itself and not on an object rebuilt on every render.
    const { reuploaded } = TABS.find((tab) => tab.id === activeTab);

    const silent = silentRef.current;
    silentRef.current = false;

    if (!silent) {
      // The message has to change when the request starts, not when it finishes.
      setLoading(true);
      setLoadError(null);
    }

    queueApi
      .listMyQueue({ limit: PAGE_SIZE, status: PARKED, reuploaded })
      .then((data) => {
        if (cancelled) return;

        setLoadError(null);

        setRows(data.applications);
        setSummary(data.summary?.waiting ?? null);
      })
      .catch((error) => {
        if (cancelled || silent) return;

        setLoadError(getErrorMessage(error));
        setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, reloadToken]);

  const parked = (summary?.awaiting ?? 0) + (summary?.reupload ?? 0);

  /* The three cards, from the counts the API sends rather than from the rows on
     screen — the list is paged and tab-filtered. */
  const stats = [
    {
      id: 'awaiting',
      tone: 'awaiting',
      label: 'Awaiting Response',
      value: summary?.awaiting ?? 0,
      note: 'Query sent, no reply',
    },
    {
      id: 'reupload',
      tone: 'reupload',
      label: 'Re-upload Received',
      value: summary?.reupload ?? 0,
      note: 'Ready for re-verification',
    },
    {
      id: 'days',
      tone: 'days',
      label: 'Avg Waiting Days',
      /* A dash while nothing is parked — an average of nothing is not zero. */
      value: summary?.averageWaitingDays == null ? '—' : summary.averageWaitingDays,
      note: 'Days since query raised',
    },
  ];

  const countFor = (tab) =>
    tab.id === 'all'
      ? parked
      : tab.id === 'query'
        ? summary?.awaiting ?? 0
        : summary?.reupload ?? 0;

  return (
    <DashboardLayout>
      <main className="queue-page waiting-page">
        <header>
          <h1 className="queue-page__title">Waiting for Customer</h1>
          <p className="queue-page__subtitle">
            {loading && !summary
              ? 'Loading applications…'
              : `${parked} application${parked === 1 ? '' : 's'} awaiting customer response`}
          </p>
        </header>

        <section className="wc-stats" aria-label="Waiting summary">
          {stats.map((stat) => (
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
              {tab.label} ({countFor(tab)})
            </button>
          ))}
        </div>

        {acceptError ? (
          <p className="queue-empty queue-empty--error" role="alert">
            {acceptError}
          </p>
        ) : null}

        <section className="wc-list" aria-label="Applications awaiting customer">
          {rows.map((row) => {
            const status = statusPill(row.status);
            const priority = priorityPill(row.effectivePriority ?? row.priority);
            const name = row.citizen?.fullName ?? row.citizen?.mobile ?? 'Unknown';
            /* What the applicant sent back, if they have — one entry per
               document. The filenames are copied onto the application when a
               file is replaced, because the document row itself has already
               been overwritten by then, so "what it was before" exists
               nowhere else, and the list endpoint would otherwise have to
               fetch every application's documents to draw one line. Null on a
               row still waiting. */
            const reupload = row.reupload;

            return (
            <article className="wc-card" key={row.id}>
              <span className="wc-card__avatar" aria-hidden="true">
                {initialsOf(row.citizen?.fullName)}
              </span>

              <div className="wc-card__body">
                <div className="wc-card__identity">
                  <h2 className="wc-card__name">{name}</h2>
                  {/* The pill says which half of the round trip this is, which
                      is what the agent is scanning for — a reply that has come
                      back reads differently from one still outstanding, whatever
                      status it is filed under. */}
                  <span className={`wc-status wc-status--${reupload ? 'reupload' : 'query'}`}>
                    <span className="wc-status__dot" aria-hidden="true" />
                    {reupload ? 'Re-upload Received' : status.label}
                  </span>
                  <span className={`wc-priority wc-priority--${priority.tone}`}>
                    {priority.label}
                  </span>
                </div>

                <p className="wc-card__meta">
                  {row.applicationNumber} · {row.service?.name ?? '—'} ·{' '}
                  {row.department?.name ?? '—'}
                </p>

                <div className="wc-card__stats">
                  <span>Applied: {shortDate(row.submittedAt)}</span>
                  <span className="wc-card__waiting">{waitingFor(row)}</span>
                  {/* How much chasing this application has taken — every query
                      ever raised on it, which is what the design counts. */}
                  <span className="wc-card__queries">
                    Queries raised: {row.queryCount ?? 0}
                  </span>
                </div>

                {reupload ? (
                  <div className="wc-reupload">
                    <p className="wc-reupload__title">
                      <img src={reuploadAlert} alt="" width="13.12" height="13.12" />
                      {reupload.documents.length
                        ? `${reupload.documents.map((one) => one.label).join(', ')} re-uploaded — re-verification required`
                        : 'New documents uploaded — re-verification required'}
                    </p>

                    {/* One row per document — a query naming three of them gets
                        three old → new comparisons, not one row with the rest
                        reduced to a name in the title above. */}
                    {reupload.documents.map((document) => (
                      <div className="wc-reupload__compare" key={document.documentId ?? document.currentName}>
                        <div className="wc-doc">
                          <p className="wc-doc__label">Old Document</p>
                          {/* Null where the officer asked for something that was
                              never uploaded — there is no earlier file to name. */}
                          <p className="wc-doc__name">{document.previousName ?? '—'}</p>
                        </div>

                        <span className="wc-reupload__arrow" aria-hidden="true">
                          →
                        </span>

                        <div className="wc-doc wc-doc--new">
                          <p className="wc-doc__label">New Document</p>
                          <p className="wc-doc__name">{document.currentName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* A re-upload swaps the nudge-and-wait pair for the two ways to
                  act on what the customer just sent. */}
              <div className="wc-card__actions">
                {reupload ? (
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
                    <button
                      className="wc-action wc-action--accept"
                      type="button"
                      onClick={() => accept(row)}
                      disabled={accepting !== null}
                    >
                      <img src={rowAccept} alt="" width="11.247" height="11.247" />
                      {accepting === row.id ? 'Accepting…' : 'Accept'}
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
            );
          })}

          {/* Still loading, the request failed, and genuinely nothing parked
              say three different things. */}
          {loading && rows.length === 0 && (
            <p className="queue-empty">Loading applications…</p>
          )}

          {!loading && loadError && (
            <p className="queue-empty queue-empty--error" role="alert">
              {loadError}
              <button className="queue-action" type="button" onClick={reload}>
                Try again
              </button>
            </p>
          )}

          {!loading && !loadError && rows.length === 0 && (
            <p className="queue-empty">
              Nothing is waiting on a customer right now. An application lands here when you raise a
              query on it.
            </p>
          )}
        </section>
      </main>
    </DashboardLayout>
  );
}

export default WaitingCustomerPage;
