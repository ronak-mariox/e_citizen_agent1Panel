import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DashboardLayout from '../layouts/DashboardLayout.jsx';
import { COMPLETED_ROWS, COMPLETED_STATS } from '../constants/queueData.js';
import exportIcon from '../assets/icons/completed/export.svg';
import statClosed from '../assets/icons/completed/stat-total.svg';
import statApproved from '../assets/icons/completed/stat-approved.svg';
import statRejected from '../assets/icons/completed/stat-rejected.svg';
import statTat from '../assets/icons/completed/stat-tat.svg';
import decisionApproved from '../assets/icons/completed/decision-approved.svg';
import decisionRejected from '../assets/icons/completed/decision-rejected.svg';
import rowView from '../assets/icons/completed/row-view.svg';
import rowDownload from '../assets/icons/completed/row-download.svg';
import rowPrint from '../assets/icons/completed/row-print.svg';
import '../styles/completed.css';

const STAT_ICON = {
  closed: statClosed,
  approved: statApproved,
  rejected: statRejected,
  tat: statTat,
};

const DECISION_ICON = {
  Approved: decisionApproved,
  Rejected: decisionRejected,
};

const DECISION_TONE = {
  Approved: 'approved',
  Rejected: 'rejected',
};

/* Per-row actions, in the order they are drawn. */
const ROW_ACTIONS = [
  { id: 'view', icon: rowView, label: 'View application' },
  { id: 'download', icon: rowDownload, label: 'Download certificate' },
  { id: 'print', icon: rowPrint, label: 'Print certificate' },
];

const TABS = ['All', 'Approved', 'Rejected'];

function CompletedApplicationsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('All');

  const rows = tab === 'All' ? COMPLETED_ROWS : COMPLETED_ROWS.filter((row) => row.decision === tab);

  const countFor = (name) =>
    name === 'All'
      ? COMPLETED_ROWS.length
      : COMPLETED_ROWS.filter((row) => row.decision === name).length;

  return (
    <DashboardLayout>
      <main className="queue-page completed-page">
        <section className="queue-page__header">
          <div>
            <h1 className="queue-page__title">Completed Applications</h1>
            <p className="queue-page__subtitle">{COMPLETED_ROWS.length} applications closed</p>
          </div>

          <button className="cp-export" type="button">
            <img src={exportIcon} alt="" width="13.12" height="13.12" />
            Export Report
          </button>
        </section>

        <section className="cp-stats" aria-label="Closure summary">
          {COMPLETED_STATS.map((stat) => (
            <article className={`cp-stat cp-stat--${stat.tone}`} key={stat.id}>
              <div className="cp-stat__top">
                <p className="cp-stat__label">{stat.label}</p>
                <img src={STAT_ICON[stat.tone]} alt="" width="14.992" height="14.992" />
              </div>
              <p className="cp-stat__value">{stat.value}</p>
              <p className="cp-stat__note">{stat.note}</p>
            </article>
          ))}
        </section>

        <section className="cp-tabs" role="group" aria-label="Filter by decision">
          {TABS.map((name) => (
            <button
              className={`cp-tab ${tab === name ? 'cp-tab--active' : ''}`}
              type="button"
              key={name}
              aria-pressed={tab === name}
              onClick={() => setTab(name)}
            >
              {name} ({countFor(name)})
            </button>
          ))}
        </section>

        <section className="cp-table-shell" aria-label="Completed applications table">
          <div className="cp-table__overflow">
            <div className="cp-table" role="table">
              <div className="cp-table__header" role="row">
                <div role="columnheader">Application ID</div>
                <div role="columnheader">Customer</div>
                <div role="columnheader">Service</div>
                <div role="columnheader">Department</div>
                <div role="columnheader">Applied</div>
                <div role="columnheader">Closed Date</div>
                <div role="columnheader">Decision</div>
                <div role="columnheader">Action</div>
              </div>

              {rows.map((row) => (
                <div className="cp-table__row" role="row" key={row.id}>
                  <div className="cp-table__cell cp-table__id" role="cell">
                    {row.id}
                  </div>

                  <div className="cp-table__cell" role="cell">
                    <span className="cp-customer">
                      <span className="cp-customer__avatar" aria-hidden="true">
                        {row.initials}
                      </span>
                      <span className="cp-customer__name">{row.name}</span>
                    </span>
                  </div>

                  <div className="cp-table__cell" role="cell">
                    {row.service}
                  </div>

                  <div className="cp-table__cell cp-table__muted" role="cell">
                    {row.department}
                  </div>

                  <div className="cp-table__cell cp-table__muted" role="cell">
                    {row.appliedDate}
                  </div>

                  <div className="cp-table__cell cp-table__muted" role="cell">
                    {row.closedDate}
                  </div>

                  <div className="cp-table__cell" role="cell">
                    <span className={`cp-decision cp-decision--${DECISION_TONE[row.decision]}`}>
                      <img
                        src={DECISION_ICON[row.decision]}
                        alt=""
                        width="11.247"
                        height="11.247"
                      />
                      {row.decision}
                    </span>
                  </div>

                  <div className="cp-table__cell cp-table__actions" role="cell">
                    {ROW_ACTIONS.map((action) => (
                      <button
                        className="cp-row-action"
                        type="button"
                        key={action.id}
                        aria-label={`${action.label} ${row.id}`}
                        onClick={
                          action.id === 'view'
                            ? () => navigate(`/assigned-queue/${row.id}`)
                            : undefined
                        }
                      >
                        <img src={action.icon} alt="" width="13.12" height="13.12" />
                      </button>
                    ))}
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

export default CompletedApplicationsPage;
