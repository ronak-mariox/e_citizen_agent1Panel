import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import DashboardLayout from '../layouts/DashboardLayout.jsx';
import searchIcon from '../assets/icons/dashboard/search.svg';
import exportIcon from '../assets/icons/pending/export.svg';
import refreshIcon2 from '../assets/icons/pending/refresh.svg';
import * as queueApi from '../api/queue.js';
import { getErrorMessage } from '../api/client.js';
import { useLiveRefresh } from '../hooks/useLiveRefresh.js';
import { initialsOf, priorityPill, statusPill, waitingFor } from '../constants/queueStatus.js';

/* The applications this agent has actually been given.

   Rows come from the API — the assignment engine decides who holds what, and
   this reads it back. Nothing here passes an agent id: the server scopes the
   list to the token, so what the console asks for and what it is allowed to
   see cannot come apart.

   Search is debounced. Each keystroke would otherwise be a round trip, and the
   answer to "raj" is thrown away the moment "rajesh" is typed. */

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 20;

function AssignedQueuePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  /* A dashboard tile (High Priority) links here with `?priority=high,urgent`
     rather than the page guessing what it meant — read once, on the URL this
     page was opened with, so the queue an agent lands on already matches the
     count the tile just showed them. There is no visible toggle for this yet
     (see the stub Filter button below), only the deep-link. */
  const priorityFilter = params.get('priority') ?? undefined;

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const [applications, setApplications] = useState([]);
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

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  /* Fetching is this screen synchronising itself with an external system — the
     API — which is what an effect is for. `cancelled` guards against a slower
     earlier request landing after a newer one and showing results for a search
     the agent has already moved on from. */
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
      .listMyQueue({ limit: PAGE_SIZE, search: debouncedQuery, priority: priorityFilter })
      .then((data) => {
        if (cancelled) return;

        setLoadError(null);

        setApplications(data.applications);
        setSummary(data.summary);
      })
      .catch((error) => {
        if (cancelled || silent) return;

        setLoadError(getErrorMessage(error));
        setApplications([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, reloadToken, priorityFilter]);

  /* The three cards, from the counts the API sends rather than from the rows on
     screen — the queue is paged and filtered, and a card counted from a page
     would drop every time a search narrowed it. */
  const cards = [
    {
      id: 'total-assigned',
      title: 'Total Assigned',
      value: summary?.totalAssigned ?? 0,
      note: 'All queued',
      tone: 'blue',
    },
    {
      id: 'high-priority',
      title: 'High Priority',
      value: summary?.highPriority ?? 0,
      note: 'Urgent action needed',
      tone: 'red',
    },
    {
      id: 'sla-breaching',
      title: 'Due Soon',
      value: summary?.slaRisk ?? 0,
      /* The window is the API's, not a figure written in here — the two would
         drift the first time somebody changed one of them. */
      note: `Within ${summary?.slaRiskHours ?? 24} hours`,
      tone: 'amber',
    },
  ];

  const pending = summary?.totalAssigned ?? 0;

  return (
    <DashboardLayout>
      <main className="queue-page">
        <section className="queue-page__header">
          <div>
            <h1 className="queue-page__title">Assigned Queue</h1>
            <p className="queue-page__subtitle">
              {loading && !summary
                ? 'Loading your queue…'
                : `${pending} application${pending === 1 ? '' : 's'} pending your action`}
              {/* The count above is the whole queue's — summary is never
                  filtered (see its own note above) — so a priority deep-link
                  says so, or the table below would look narrower than the
                  number just claimed. */}
              {priorityFilter ? ' · Showing high priority only' : null}
            </p>
          </div>

          <button className="queue-page__filter" type="button">
            <span className="queue-page__filter-icon" aria-hidden="true">
              ☰
            </span>
            Filter
          </button>
        </section>

        <section className="queue-stats" aria-label="Queue summary">
          {cards.map((card) => (
            <article key={card.id} className={`queue-stat queue-stat--${card.tone}`}>
              <div className="queue-stat__top">
                <p className="queue-stat__label">{card.title}</p>
                <span className="queue-stat__icon" aria-hidden="true">
                  •
                </span>
              </div>
              <p className="queue-stat__value">{card.value}</p>
              <p className="queue-stat__foot">{card.note}</p>
            </article>
          ))}
        </section>

        <section className="queue-toolbar" aria-label="Queue controls">
          <label className="queue-search" htmlFor="queue-search">
            <img src={searchIcon} alt="" width="13.12" height="13.12" />
            <input
              id="queue-search"
              type="search"
              placeholder="Search by application ID or citizen name"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <button className="queue-toolbar__button" type="button">
                        <img src={exportIcon} alt="" width="13.12" height="13.12" />
            
            Export
          </button>

          <button
            className="queue-toolbar__button queue-toolbar__button--muted"
            type="button"
            onClick={reload}
          >
            <img src={refreshIcon2} alt="" width="13.12" height="13.12" />
            Refresh
          </button>
        </section>

        <section className="table-shell" aria-label="Assigned queue table">
          <div className="queue-table__overflow">
            <div className="queue-table" role="table">
              <div className="queue-table__header" role="row">
                <div role="columnheader">Application ID</div>
                <div role="columnheader">Customer</div>
                <div role="columnheader">Department</div>
                <div role="columnheader">Service</div>
                <div role="columnheader">Priority</div>
                <div role="columnheader">Status</div>
                {/* Was "Details", which is not what the column has ever held —
                    it shows how long the application has been waiting. */}
                <div role="columnheader">Waiting</div>
                <div role="columnheader">Action</div>
              </div>

              {applications.map((row) => {
                const status = statusPill(row.status);
                const priority = priorityPill(row.effectivePriority ?? row.priority);
                /* A citizen who has not filled in their profile has no name
                   anywhere, and their mobile is who they are — a blank cell
                   would read as missing data rather than as an unfinished
                   profile. */
                const name = row.citizen?.fullName ?? row.citizen?.mobile ?? 'Unknown';

                return (
                  <div
                    className="queue-table__row cursor-pointer"
                    role="row"
                    key={row.id}
                    onClick={() => navigate(`/assigned-queue/${row.id}`)}
                  >
                    <div className="queue-table__cell queue-table__id" role="cell">
                      {row.applicationNumber}
                    </div>

                    <div className="queue-table__cell" role="cell">
                      <div className="queue-table__customer">
                        <span className="avatar" aria-hidden="true">
                          {initialsOf(row.citizen?.fullName)}
                        </span>
                        <span className="queue-table__name">{name}</span>
                      </div>
                    </div>

                    <div className="queue-table__cell queue-meta" role="cell">
                      {row.department?.name ?? '—'}
                    </div>

                    <div className="queue-table__cell queue-table__service" role="cell">
                      {row.service?.name ?? '—'}
                    </div>

                    <div className="queue-table__cell" role="cell">
                      <span className={`queue-pill queue-pill--${priority.tone}`}>
                        {priority.label}
                      </span>
                    </div>

                    <div className="queue-table__cell" role="cell">
                      <span className={`queue-pill queue-pill--${status.tone}`}>
                        <span className="queue-pill__dot" aria-hidden="true" />
                        {status.label}
                      </span>
                    </div>

                    <div className="queue-table__cell queue-table__time" role="cell">
                      {waitingFor(row.assignedAt)}
                    </div>

                    <div className="queue-table__cell" role="cell">
                      <button className="queue-action" type="button">
                        Review
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Three different empty tables — still loading, the request
                  failed, and genuinely nothing assigned — say three different
                  things, because what to do about each is different. */}
              {loading && applications.length === 0 && (
                <p className="queue-empty">Loading your queue…</p>
              )}

              {!loading && loadError && (
                <p className="queue-empty queue-empty--error" role="alert">
                  {loadError}
                  <button className="queue-action" type="button" onClick={reload}>
                    Try again
                  </button>
                </p>
              )}

              {!loading && !loadError && applications.length === 0 && (
                <p className="queue-empty">
                  {debouncedQuery
                    ? 'No application in your queue matches that search.'
                    : 'Nothing is assigned to you right now. New applications arrive here on their own.'}
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
}

export default AssignedQueuePage;
