import { useNavigate } from 'react-router-dom';

import arrowRight from '../../assets/icons/dashboard/arrow-right.svg';
import { initialsOf, priorityPill, statusPill } from '../../constants/queueStatus.js';

const DATE = { day: '2-digit', month: 'short', year: 'numeric' };

/** "21 Aug 2026", or a dash where there is no date to show. */
const shortDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-IN', DATE);
};

/**
 * What has moved most recently in this agent's queue.
 *
 * The rows are applications, not a separate activity log: the panel is asking
 * "what have I been working on", and the answer is the records themselves,
 * ordered by when they last changed.
 *
 * The pills reuse queueStatus.js — the same map the queue table and every other
 * screen reads. Its tones are `assigned | started | waiting | pending` and
 * `high | medium | low`, which are exactly the `status-badge--*` and
 * `priority-badge--*` modifiers this card's stylesheet defines, so the fifteen
 * statuses the API models collapse the same way here as everywhere else.
 *
 * @param {Array} rows Applications from GET /agent/dashboard.
 * @param {boolean} loading Whether the first read is still in flight.
 * @param {string|null} error What went wrong, if it did.
 */
export function RecentActivity({ rows = [], loading = false, error = null, onRetry }) {
  const navigate = useNavigate();

  return (
    <section className="dash-card activity">
      <div className="activity__head">
        <h2 className="dash-card__title">Recent Activity</h2>
        <button
          className="activity__view-all"
          type="button"
          onClick={() => navigate('/assigned-queue')}
        >
          View all
          <img src={arrowRight} alt="" width="11.247" height="11.247" />
        </button>
      </div>

      <div className="activity__list">
        {rows.map((row) => {
          const status = statusPill(row.status);
          const priority = priorityPill(row.priority);
          /* A citizen who has not filled in their profile has no name anywhere,
             and their mobile is who they are — the same fallback the queue
             table uses, so a row and the screen it opens name one person. */
          const name = row.citizen?.fullName ?? row.citizen?.mobile ?? 'Unknown';

          return (
            <button
              className="activity__row"
              type="button"
              key={row.id}
              onClick={() => navigate(`/assigned-queue/${row.id}`)}
            >
              <span className="avatar">{initialsOf(row.citizen?.fullName)}</span>

              <span className="activity__body">
                <span className="activity__name-row">
                  <span className="activity__name">{name}</span>
                  <span className={`priority-badge priority-badge--${priority.tone}`}>
                    {priority.label}
                  </span>
                </span>
                <span className="activity__meta">
                  {[row.applicationNumber, row.service?.name, row.department?.name]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </span>

              <span className="activity__side">
                <span className={`status-badge status-badge--${status.tone}`}>{status.label}</span>
                {/* When it last moved, which is what puts it at the top of
                    this list — not the day it was filed. */}
                <span className="activity__date">{shortDate(row.updatedAt)}</span>
              </span>
            </button>
          );
        })}

        {/* Three empty lists — still loading, the request failed, and a genuinely
            quiet queue — say three different things, because what to do about
            each is different. */}
        {loading && rows.length === 0 ? (
          <p className="dash-card__empty">Loading recent activity…</p>
        ) : null}

        {!loading && error ? (
          <p className="dash-card__empty dash-card__empty--error" role="alert">
            {error}
            {onRetry ? (
              <button className="activity__view-all" type="button" onClick={onRetry}>
                Try again
              </button>
            ) : null}
          </p>
        ) : null}

        {!loading && !error && rows.length === 0 ? (
          <p className="dash-card__empty">
            Nothing has moved yet. Applications appear here as they are assigned to you.
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default RecentActivity;
