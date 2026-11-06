import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DashboardLayout from '../layouts/DashboardLayout.jsx';
import * as queueApi from '../api/queue.js';
import { getErrorMessage } from '../api/client.js';
import { useLiveRefresh } from '../hooks/useLiveRefresh.js';
import { initialsOf, priorityPill, statusPill } from '../constants/queueStatus.js';
import searchIcon from '../assets/icons/dashboard/search.svg';
import statPending from '../assets/icons/pending/stat-pending.svg';
import statProgress from '../assets/icons/pending/stat-progress.svg';
import statSla from '../assets/icons/pending/stat-sla.svg';
import exportIcon from '../assets/icons/pending/export.svg';
import refreshIcon from '../assets/icons/pending/refresh.svg';
import rowStart from '../assets/icons/pending/row-start.svg';
import rowReview from '../assets/icons/pending/row-review.svg';
import pagePrev from '../assets/icons/pending/page-prev.svg';
import pageNext from '../assets/icons/pending/page-next.svg';
import '../styles/pending.css';

const STAT_ICON = {
  pending: statPending,
  progress: statProgress,
  sla: statSla,
};

/* Applications waiting on this agent's document review.
 
   Two statuses, because that is what this screen has always drawn: `assigned` is
   one nobody has opened — the row that offers Start — and `under_verification`
   is one a review has been saved on, which offers Resume. An application parked
   with the citizen is neither; it sits under Waiting for Customer and is not
   listed here.

   Filtered by the server rather than by fetching the whole queue and narrowing
   it here: the queue is paged, so a client-side filter would hide rows that were
   simply on another page. */
const PENDING_STATUSES = ['assigned', 'under_verification'];

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 20;

function PendingVerificationPage() {
  const navigate = useNavigate();
  const [view, setView] = useState('list');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [total, setTotal] = useState(0);
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

  // Each keystroke would otherwise be a round trip whose answer is thrown away
  // the moment the next letter lands.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let cancelled = false;

    const silent = silentRef.current;
    silentRef.current = false;

    if (!silent) {
      // The spinner has to appear when the request starts, not when it finishes.
      setLoading(true);
      setLoadError(null);
    }

    queueApi
      .listMyQueue({ limit: PAGE_SIZE, search: debouncedQuery, status: PENDING_STATUSES })
      .then((data) => {
        if (cancelled) return;

        setLoadError(null);

        setRows(data.applications);
        setSummary(data.summary?.verification ?? null);
        setTotal(data.pagination?.total ?? data.applications.length);
      })
      .catch((error) => {
        if (cancelled || silent) return;

        setLoadError(getErrorMessage(error));
        setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    /* Guards against a slower earlier request landing after a newer one and
       showing results for a search the agent has moved on from. */
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, reloadToken]);

  /* The three cards, from the counts the API sends rather than from the rows on
     screen — this table is paged and searchable, and a card counted from a page
     would change every time a search narrowed it. */
  const stats = [
    {
      id: 'pending',
      tone: 'pending',
      label: 'Pending',
      value: summary?.notStarted ?? 0,
      note: 'Not yet started',
    },
    {
      id: 'progress',
      tone: 'progress',
      label: 'In Progress',
      value: summary?.inProgress ?? 0,
      note: 'Currently being verified',
    },
    {
      id: 'sla',
      tone: 'sla',
      label: 'Avg SLA Left',
      /* Negative where the average application is already past its date, which
         this has to be able to say rather than round up to a comfortable
         number. Null when nothing in the queue has a due date at all. */
      value:
        summary?.averageSlaHours == null
          ? '—'
          : `${summary.averageSlaHours < 0 ? 'Overdue' : `${summary.averageSlaHours} hrs`}`,
      note: 'Across all pending',
    },
  ];

  return (
    <DashboardLayout>
      <main className="queue-page pending-page">
        <section className="pv-header">
          <div>
            <h1 className="queue-page__title">Pending Verification</h1>
            <p className="pv-header__subtitle">
              {loading && !summary
                ? 'Loading applications…'
                : `${total} application${total === 1 ? '' : 's'} require document verification`}
            </p>
          </div>

          <div className="pv-view-toggle" role="group" aria-label="View mode">
            {['list', 'kanban'].map((mode) => (
              <button
                className={`pv-view-toggle__button ${
                  view === mode ? 'pv-view-toggle__button--active' : ''
                }`}
                type="button"
                key={mode}
                aria-pressed={view === mode}
                onClick={() => setView(mode)}
              >
                {mode === 'list' ? 'List' : 'Kanban'}
              </button>
            ))}
          </div>
        </section>

        <section className="pv-stats" aria-label="Verification summary">
          {stats.map((stat) => (
            <article className={`pv-stat pv-stat--${stat.tone}`} key={stat.id}>
              <div className="pv-stat__top">
                <p className="pv-stat__label">{stat.label}</p>
                <img src={STAT_ICON[stat.tone]} alt="" width="14.992" height="14.992" />
              </div>
              <p className="pv-stat__value">{stat.value}</p>
              <p className="pv-stat__note">{stat.note}</p>
            </article>
          ))}
        </section>

        <section className="pv-toolbar" aria-label="Table controls">
          <label className="pv-search" htmlFor="pending-search">
            <img src={searchIcon} alt="" width="13.12" height="13.12" />
            <input
              id="pending-search"
              type="search"
              placeholder="Search by application ID or citizen name"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <button className="pv-toolbar__button" type="button">
            <img src={exportIcon} alt="" width="13.12" height="13.12" />
            Export
          </button>

          <button className="pv-toolbar__button" type="button" onClick={reload}>
            <img src={refreshIcon} alt="" width="13.12" height="13.12" />
            Refresh
          </button>
        </section>

        <section className="pv-table-shell" aria-label="Pending verification table">
          <div className="pv-table__overflow">
            <div className="pv-table" role="table">
              <div className="pv-table__header" role="row">
                <div role="columnheader">Application ID</div>
                <div role="columnheader">Customer</div>
                <div role="columnheader">Department</div>
                <div role="columnheader">Service</div>
                <div role="columnheader">Priority</div>
                <div role="columnheader">Status</div>
                <div role="columnheader">Details</div>
                <div role="columnheader">Action</div>
              </div>

              {rows.map((row) => {
                const status = statusPill(row.status);
                const priority = priorityPill(row.effectivePriority ?? row.priority);
                /* The server's own count over the checklist the agent saved.
                   Zero on an application nobody has opened, which is what makes
                   this row offer Start rather than Resume. */
                const progress = row.verification?.progressPercent ?? 0;
                /* Whether a review has been opened at all — the saved timestamp,
                   not the percentage. An agent can open an application, save a
                   note and tick nothing, and that review has still been started;
                   reading the bar instead would send them back to Start. */
                const started = Boolean(row.verification?.startedAt);
                /* A citizen who has not filled in their profile has no name
                   anywhere, and their mobile is who they are. */
                const name = row.citizen?.fullName ?? row.citizen?.mobile ?? 'Unknown';

                return (
                  <div className="pv-table__row cursor-pointer" role="row" key={row.id}
                    onClick={() => navigate(`/assigned-queue/${row.id}`)}

                  >
                    <div className="pv-table__cell pv-table__id" role="cell">
                      {row.applicationNumber}
                    </div>

                    <div className="pv-table__cell" role="cell">
                      <span className="pv-customer">
                        <span className="pv-customer__avatar" aria-hidden="true">
                          {initialsOf(row.citizen?.fullName)}
                        </span>
                        <span className="pv-customer__name">{name}</span>
                      </span>
                    </div>

                    <div className="pv-table__cell pv-table__muted" role="cell">
                      {row.department?.name ?? '—'}
                    </div>

                    <div className="pv-table__cell" role="cell">
                      {row.service?.name ?? '—'}
                    </div>

                    <div className="pv-table__cell" role="cell">
                      <span className={`pv-priority pv-priority--${priority.tone}`}>
                        {priority.label}
                      </span>
                    </div>

                    <div className="pv-table__cell" role="cell">
                      <span className={`pv-status pv-status--${status.tone}`}>
                        <span className="pv-status__dot" aria-hidden="true" />
                        {status.label}
                      </span>
                    </div>

                    <div className="pv-table__cell pv-details" role="cell">
                      <span className="pv-progress">
                        <span className="pv-progress__track">
                          {/* The floor is the design's: a bar at a true 0% has no
                              fill to see, so it keeps a stub. The number beside
                              it is the real figure. */}
                          <span
                            className="pv-progress__fill"
                            style={{ width: `${Math.max(progress, 5)}%` }}
                          />
                        </span>
                        <span className="pv-progress__value">{progress}%</span>
                      </span>

                      <button
                        className={`pv-row-action ${started ? 'pv-row-action--resume' : ''}`}
                        type="button"
                        onClick={() => navigate(`/assigned-queue/${row.id}`)}
                      >
                        <img
                          src={started ? rowReview : rowStart}
                          alt=""
                          width="11.247"
                          height="11.247"
                        />
                        {started ? 'Resume' : 'Start'}
                      </button>
                    </div>

                    <div className="pv-table__cell" role="cell">
                      <button
                        className="pv-review"
                        type="button"
                        onClick={() => navigate(`/assigned-queue/${row.id}`)}
                      >
                        <img src={rowReview} alt="" width="11.247" height="11.247" />
                        Review
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Still loading, the request failed, and genuinely nothing to
                  verify say three different things, because what to do about
                  each is different. */}
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
                  {debouncedQuery
                    ? 'No application awaiting verification matches that search.'
                    : 'Nothing is waiting on your verification right now.'}
                </p>
              )}
            </div>
          </div>

          <div className="pv-table__footer">
            <p className="pv-table__count">
              Showing {rows.length} of {total} applications
            </p>

            <div className="pv-pagination">
              <button className="pv-pagination__step" type="button" aria-label="Previous page">
                <img src={pagePrev} alt="" width="13.12" height="13.12" />
              </button>
              <button className="pv-pagination__page pv-pagination__page--active" type="button">
                1
              </button>
              <button className="pv-pagination__step" type="button" aria-label="Next page">
                <img src={pageNext} alt="" width="13.12" height="13.12" />
              </button>
            </div>
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
}

export default PendingVerificationPage;
