import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DashboardLayout from '../layouts/DashboardLayout.jsx';
import * as queueApi from '../api/queue.js';
import { getErrorMessage } from '../api/client.js';
import { useLiveRefresh } from '../hooks/useLiveRefresh.js';
import { initialsOf, priorityPill } from '../constants/queueStatus.js';
import { FORWARD_TRACK_STEPS } from '../constants/queueData.js';
import statTotal from '../assets/icons/forwarded/stat-total.svg';
import statApproved from '../assets/icons/forwarded/stat-approved.svg';
import statPending from '../assets/icons/forwarded/stat-pending.svg';
import rowView from '../assets/icons/forwarded/row-view.svg';
import rowTrack from '../assets/icons/forwarded/row-track.svg';
import rowRecall from '../assets/icons/forwarded/row-recall.svg';
import stepDone from '../assets/icons/forwarded/step-done.svg';
import stepPending from '../assets/icons/forwarded/step-pending.svg';
import '../styles/forwarded.css';

const STAT_ICON = {
  total: statTotal,
  approved: statApproved,
  pending: statPending,
};

/* The hand-off tracker Track opens under a row. A step is done while its index
   is inside the row's stage; the connector after it turns green with it. */
function TrackStrip({ stage }) {
  return (
    <div className="fw-track" role="list" aria-label="Hand-off progress">
      {FORWARD_TRACK_STEPS.map((step, index) => {
        const done = index < stage;

        return (
          <div className="fw-track__step" role="listitem" key={step}>
            <span className={`fw-track__mark ${done ? 'fw-track__mark--done' : ''}`}>
              <img
                src={done ? stepDone : stepPending}
                alt=""
                width="11.247"
                height="11.247"
              />
            </span>
            <span className="fw-track__label">{step}</span>

            {index < FORWARD_TRACK_STEPS.length - 1 && (
              <span
                className={`fw-track__link ${done ? 'fw-track__link--done' : ''}`}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* Everything Agent 1 has handed on, whatever Agent 2 has done with it since.

   Three statuses because the hand-off is one moment and what follows it is
   several: `pending_submission` is waiting at Agent 2, and the other two are
   Agent 2 having moved it along. All three belong on this screen — it is the
   record of what left this desk, not a queue of work. */
const FORWARDED = ['pending_submission', 'submitted_to_department', 'in_progress'];

/* How far along the hand-off tracker a row sits. Agent 2's own workflow is not
   built yet, so only the first three steps can be reached honestly: an
   application that has left here is at Forwarded A2, and one Agent 2 has picked
   up is under their review. Nothing claims a final approval nobody has made. */
const TRACK_STAGE = {
  pending_submission: 3,
  submitted_to_department: 4,
  in_progress: 4,
};

/* What Agent 2 has done with it, as the row's own badge reads. */
const A2_STATUS = {
  pending_submission: { label: 'Forwarded', tone: 'forwarded' },
  submitted_to_department: { label: 'With Agent 2', tone: 'forwarded' },
  in_progress: { label: 'In Progress', tone: 'forwarded' },
};

const DATE = { day: '2-digit', month: 'short', year: 'numeric' };

const shortDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-IN', DATE);
};

const PAGE_SIZE = 20;

function ForwardedPage() {
  const navigate = useNavigate();
  // Only one row shows its tracker at a time, as drawn.
  const [trackedId, setTrackedId] = useState(null);

  const [rows, setRows] = useState([]);
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

  useEffect(() => {
    let cancelled = false;

    const silent = silentRef.current;
    silentRef.current = false;

    if (!silent) {
      // The message has to change when the request starts, not when it finishes.
      setLoading(true);
      setLoadError(null);
    }

    queueApi
      .listMyQueue({ limit: PAGE_SIZE, status: FORWARDED })
      .then((data) => {
        if (cancelled) return;

        setLoadError(null);

        setRows(data.applications);
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

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  /* The three cards. Counted from the rows on this screen rather than from a
     summary block: unlike the other queues this list is not filtered — every
     forwarded application is on it — so the two cannot disagree. */
  const stats = [
    {
      id: 'total',
      tone: 'total',
      label: 'Total Forwarded',
      value: total,
      note: 'All time',
    },
    {
      id: 'approved',
      tone: 'approved',
      label: 'Picked up by A2',
      value: rows.filter((row) => row.status !== 'pending_submission').length,
      note: 'Agent 2 has started',
    },
    {
      id: 'pending',
      tone: 'pending',
      label: 'Pending at A2',
      value: rows.filter((row) => row.status === 'pending_submission').length,
      note: 'Awaiting A2 decision',
    },
  ];

  return (
    <DashboardLayout>
      <main className="queue-page forwarded-page">
        <header>
          <h1 className="queue-page__title">Forwarded to Agent 2</h1>
          <p className="queue-page__subtitle">
            {loading && rows.length === 0
              ? 'Loading forwarded applications…'
              : `${total} application${total === 1 ? '' : 's'} handed over for final review`}
          </p>
        </header>

        <section className="fw-stats" aria-label="Hand-off summary">
          {stats.map((stat) => (
            <article className={`fw-stat fw-stat--${stat.tone}`} key={stat.id}>
              <div className="fw-stat__top">
                <p className="fw-stat__label">{stat.label}</p>
                <img src={STAT_ICON[stat.tone]} alt="" width="14.992" height="14.992" />
              </div>
              <p className="fw-stat__value">{stat.value}</p>
              <p className="fw-stat__note">{stat.note}</p>
            </article>
          ))}
        </section>

        <section className="fw-list" aria-label="Forwarded applications">
          {rows.map((row) => {
            const status = A2_STATUS[row.status] ?? { label: 'Forwarded', tone: 'forwarded' };
            const priority = priorityPill(row.effectivePriority ?? row.priority);
            const name = row.citizen?.fullName ?? row.citizen?.mobile ?? 'Unknown';

            return (
            <article className="fw-card" key={row.id}>
              <span className="fw-card__avatar" aria-hidden="true">
                {initialsOf(row.citizen?.fullName)}
              </span>

              <div className="fw-card__body">
                <div className="fw-card__identity">
                  <h2 className="fw-card__name">{name}</h2>
                  <span className={`fw-status fw-status--${status.tone}`}>
                    <span className="fw-status__dot" aria-hidden="true" />
                    {status.label}
                  </span>
                  <span className={`fw-priority fw-priority--${priority.tone}`}>
                    {priority.label}
                  </span>
                </div>

                <p className="fw-card__meta">
                  {row.applicationNumber} · {row.service?.name ?? '—'} ·{' '}
                  {row.department?.name ?? '—'}
                </p>

                <div className="fw-card__stats">
                  <span>Applied: {shortDate(row.submittedAt)}</span>
                  <span className="fw-card__forwarded">
                    Forwarded: {shortDate(row.forwardedAt)}
                  </span>
                  {/* Nobody is assigned at Agent 2 yet — that queue has not been
                      built — so this says where it went rather than naming an
                      officer who has not been chosen. */}
                  <span className="fw-card__agent">→ Agent 2</span>
                </div>

                {trackedId === row.id && <TrackStrip stage={TRACK_STAGE[row.status] ?? 3} />}
              </div>

              <div className="fw-card__actions">
                <button
                  className="fw-action fw-action--view"
                  type="button"
                  onClick={() => navigate(`/assigned-queue/${row.id}`)}
                >
                  <img src={rowView} alt="" width="11.247" height="11.247" />
                  View
                </button>
                <button
                  className="fw-action fw-action--outline"
                  type="button"
                  aria-expanded={trackedId === row.id}
                  onClick={() =>
                    setTrackedId((current) => (current === row.id ? null : row.id))
                  }
                >
                  <img src={rowTrack} alt="" width="11.247" height="11.247" />
                  Track
                </button>
                <button className="fw-action fw-action--outline" type="button">
                  <img src={rowRecall} alt="" width="11.247" height="11.247" />
                  Recall
                </button>
              </div>
            </article>
            );
          })}

          {/* Still loading, the request failed, and nothing handed on yet say
              three different things. */}
          {loading && rows.length === 0 && (
            <p className="queue-empty">Loading forwarded applications…</p>
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
              Nothing has been handed on yet. An application arrives here once you approve it
              and its fee has been paid.
            </p>
          )}
        </section>
      </main>
    </DashboardLayout>
  );
}

export default ForwardedPage;
