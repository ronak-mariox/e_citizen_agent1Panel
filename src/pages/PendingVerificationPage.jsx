import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DashboardLayout from '../layouts/DashboardLayout.jsx';
import { PENDING_STATS, QUEUE_ROWS } from '../constants/queueData.js';
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

/* Applications waiting on this agent's document review. A row that is waiting
   on the citizen sits under its own section, so it is not listed here. */
const PENDING_ROWS = QUEUE_ROWS.filter((row) => row.statusTone !== 'waiting');

function PendingVerificationPage() {
  const navigate = useNavigate();
  const [view, setView] = useState('list');
  const [query, setQuery] = useState('');

  const term = query.trim().toLowerCase();
  const rows = term
    ? PENDING_ROWS.filter((row) =>
        [row.id, row.name, row.department, row.service].some((field) =>
          field.toLowerCase().includes(term)
        )
      )
    : PENDING_ROWS;

  return (
    <DashboardLayout>
      <main className="queue-page pending-page">
        <section className="pv-header">
          <div>
            <h1 className="queue-page__title">Pending Verification</h1>
            <p className="pv-header__subtitle">
              {PENDING_ROWS.length} applications require document verification
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
          {PENDING_STATS.map((stat) => (
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

          <button className="pv-toolbar__button" type="button">
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
                const started = row.verificationProgress > 0;

                return (
                  <div className="pv-table__row cursor-pointer" role="row" key={row.id}
                    onClick={() => navigate(`/assigned-queue/${row.id}`)}

                  >
                    <div className="pv-table__cell pv-table__id" role="cell">
                      {row.id}
                    </div>

                    <div className="pv-table__cell" role="cell">
                      <span className="pv-customer">
                        <span className="pv-customer__avatar" aria-hidden="true">
                          {row.initials}
                        </span>
                        <span className="pv-customer__name">{row.name}</span>
                      </span>
                    </div>

                    <div className="pv-table__cell pv-table__muted" role="cell">
                      {row.department}
                    </div>

                    <div className="pv-table__cell" role="cell">
                      {row.service}
                    </div>

                    <div className="pv-table__cell" role="cell">
                      <span className={`pv-priority pv-priority--${row.priorityTone}`}>
                        {row.priority}
                      </span>
                    </div>

                    <div className="pv-table__cell" role="cell">
                      <span className={`pv-status pv-status--${row.statusTone}`}>
                        <span className="pv-status__dot" aria-hidden="true" />
                        {row.status}
                      </span>
                    </div>

                    <div className="pv-table__cell pv-details" role="cell">
                      <span className="pv-progress">
                        <span className="pv-progress__track">
                          <span
                            className="pv-progress__fill"
                            style={{ width: `${Math.max(row.verificationProgress, 5)}%` }}
                          />
                        </span>
                        <span className="pv-progress__value">{row.verificationProgress}%</span>
                      </span>

                      <button
                        className={`pv-row-action ${started ? 'pv-row-action--resume' : ''}`}
                        type="button"
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
            </div>
          </div>

          <div className="pv-table__footer">
            <p className="pv-table__count">
              Showing {rows.length} of {PENDING_ROWS.length} applications
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
