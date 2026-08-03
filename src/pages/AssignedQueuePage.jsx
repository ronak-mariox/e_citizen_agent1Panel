import { useNavigate } from 'react-router-dom';

import DashboardLayout from '../layouts/DashboardLayout.jsx';
import searchIcon from '../assets/icons/dashboard/search.svg';
import refreshIcon from '../assets/icons/dashboard/refresh.svg';
import { SUMMARY_CARDS, QUEUE_ROWS } from '../constants/queueData.js';

function AssignedQueuePage() {
  const navigate = useNavigate();
  return (
    <DashboardLayout>
      <main className="queue-page">
        <section className="queue-page__header">
          <div>
            <h1 className="queue-page__title">Assigned Queue</h1>
            <p className="queue-page__subtitle">2 applications pending your action</p>
          </div>

          <button className="queue-page__filter" type="button">
            <span className="queue-page__filter-icon" aria-hidden="true">
              ☰
            </span>
            Filter
          </button>
        </section>

        <section className="queue-stats" aria-label="Queue summary">
          {SUMMARY_CARDS.map((card) => (
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
            <input id="queue-search" type="search" placeholder="Search…" />
          </label>

          <button className="queue-toolbar__button" type="button">
            Export
          </button>

          <button className="queue-toolbar__button queue-toolbar__button--muted" type="button">
            <img src={refreshIcon} alt="" width="13.12" height="13.12" />
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
                <div role="columnheader">Details</div>
                <div role="columnheader">Action</div>
              </div>

              {QUEUE_ROWS.map((row) => (
                <div className="queue-table__row" role="row" key={row.id}>
                  <div className="queue-table__cell queue-table__id" role="cell">
                    {row.id}
                  </div>

                  <div className="queue-table__cell" role="cell">
                    <div className="queue-table__customer">
                      <span className="avatar" aria-hidden="true">
                        {row.initials}
                      </span>
                      <span className="queue-table__name">{row.name}</span>
                    </div>
                  </div>

                  <div className="queue-table__cell queue-meta" role="cell">
                    {row.department}
                  </div>

                  <div className="queue-table__cell queue-table__service" role="cell">
                    {row.service}
                  </div>

                  <div className="queue-table__cell" role="cell">
                    <span className={`queue-pill queue-pill--${row.priorityTone}`}>{row.priority}</span>
                  </div>

                  <div className="queue-table__cell" role="cell">
                    <span className={`queue-pill queue-pill--${row.statusTone}`}>
                      <span className="queue-pill__dot" aria-hidden="true" />
                      {row.status}
                    </span>
                  </div>

                  <div className="queue-table__cell queue-table__time" role="cell">
                    {row.time}
                  </div>

                  <div className="queue-table__cell" role="cell">
                    <button
                      className="queue-action"
                      type="button"
                      onClick={() => navigate(`/assigned-queue/${row.id}`)}
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
}

export default AssignedQueuePage;
