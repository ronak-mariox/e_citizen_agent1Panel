import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DashboardLayout from '../layouts/DashboardLayout.jsx';
import * as queueApi from '../api/queue.js';
import { getErrorMessage } from '../api/client.js';
import { useLiveRefresh } from '../hooks/useLiveRefresh.js';
import { initialsOf } from '../constants/queueStatus.js';
import { assetUrl } from '../utils/format.js';
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

/* What each tab asks the server for.

   "Completed" here means completed *by this officer*, which is not the same as
   finished: an application handed to Agent 2 is still in progress, but there is
   nothing further Agent 1 will do to it. So the approved side lists the ones
   they passed on as well as the ones Agent 2 has since seen through — a
   forwarded application is on this screen and on Forwarded at the same time,
   deliberately, because the two answer different questions.

   Filtered on the server rather than by narrowing a fetched page here: the list
   is paged, so a client-side filter would hide rows on another page. */
const HANDED_ON = ['pending_submission', 'submitted_to_department', 'in_progress'];
const APPROVED = [...HANDED_ON, 'completed'];

const TAB_STATUSES = {
  All: [...APPROVED, 'rejected'],
  Approved: APPROVED,
  Rejected: ['rejected'],
};

/* The status a row ended at -> the word the decision pill shows. Everything the
   officer passed on reads as approved, because that is the decision they took;
   what Agent 2 does with it afterwards is the Forwarded screen's business. */
const DECISION_OF = Object.fromEntries([
  ...APPROVED.map((status) => [status, 'Approved']),
  ['rejected', 'Rejected'],
]);

const DATE = { day: '2-digit', month: 'short', year: 'numeric' };

/** "21 Aug 2026", or a dash where there is no date to show. */
const shortDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-IN', DATE);
};

const PAGE_SIZE = 20;

function CompletedApplicationsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('All');

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
      .listMyQueue({ limit: PAGE_SIZE, status: TAB_STATUSES[tab] })
      .then((data) => {
        if (cancelled) return;

        setLoadError(null);

        setRows(data.applications);
        setSummary(data.summary?.completed ?? null);
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
  }, [tab, reloadToken]);

  /* The four cards and the tab counts, from the totals the API sends rather
     than from the rows on screen — the table is paged and filtered, and a count
     taken from it would drop every time a tab narrowed it. */
  const stats = [
    {
      id: 'closed',
      tone: 'closed',
      label: 'Total Closed',
      value: summary?.totalClosed ?? 0,
      note: 'All time',
    },
    {
      id: 'approved',
      tone: 'approved',
      label: 'Approved',
      value: summary?.approved ?? 0,
      note: 'Successfully verified',
    },
    {
      id: 'rejected',
      tone: 'rejected',
      label: 'Rejected',
      value: summary?.rejected ?? 0,
      note: 'Not eligible',
    },
    {
      id: 'tat',
      tone: 'tat',
      label: 'Avg TAT',
      /* Filed to closed, measured by the server over every closed application.
         A dash while nothing has closed yet — an average of nothing is not
         zero days. */
      value: summary?.averageTatDays == null ? '—' : `${summary.averageTatDays} days`,
      note: 'Turnaround time',
    },
  ];

  const countFor = (name) =>
    name === 'All' ? summary?.totalClosed ?? 0 : stats.find((one) => one.label === name)?.value ?? 0;

  return (
    <DashboardLayout>
      <main className="queue-page completed-page">
        <section className="queue-page__header">
          <div>
            <h1 className="queue-page__title">Completed Applications</h1>
            <p className="queue-page__subtitle">
              {loading && !summary
                ? 'Loading closed applications…'
                : `${summary?.totalClosed ?? 0} application${
                    (summary?.totalClosed ?? 0) === 1 ? '' : 's'
                  } closed`}
            </p>
          </div>

          <button className="cp-export" type="button">
            <img src={exportIcon} alt="" width="13.12" height="13.12" />
            Export Report
          </button>
        </section>

        <section className="cp-stats" aria-label="Closure summary">
          {stats.map((stat) => (
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

              {rows.map((row) => {
                /* The verdict as recorded, falling back to the status it closed
                   at. An application completed before decisions were stored has
                   no `decision` on it, and it is still an approved one. */
                /* The verdict as recorded, falling back to the status it ended
                   at for an application decided before decisions were stored. */
                const decision = row.decision?.outcome
                  ? row.decision.outcome === 'approved'
                    ? 'Approved'
                    : 'Rejected'
                  : DECISION_OF[row.status] ?? 'Approved';
                const name = row.citizen?.fullName ?? row.citizen?.mobile ?? 'Unknown';

                return (
                  <div className="cp-table__row" role="row" key={row.id}>
                    <div className="cp-table__cell cp-table__id" role="cell">
                      {row.applicationNumber}
                    </div>

                    <div className="cp-table__cell" role="cell">
                      <span className="cp-customer">
                        <span className="cp-customer__avatar" aria-hidden="true">
                          {initialsOf(row.citizen?.fullName)}
                        </span>
                        <span className="cp-customer__name">{name}</span>
                      </span>
                    </div>

                    <div className="cp-table__cell" role="cell">
                      {row.service?.name ?? '—'}
                    </div>

                    <div className="cp-table__cell cp-table__muted" role="cell">
                      {row.department?.name ?? '—'}
                    </div>

                    <div className="cp-table__cell cp-table__muted" role="cell">
                      {shortDate(row.submittedAt)}
                    </div>

                    <div className="cp-table__cell cp-table__muted" role="cell">
                      {/* When the officer finished with it: the day it closed, or
                          the day they handed it on. A forwarded application has
                          no closing date and would otherwise show a dash in the
                          one column that is meant to say when it left them. */}
                      {shortDate(row.completedAt ?? row.forwardedAt)}
                    </div>

                    <div className="cp-table__cell" role="cell">
                      <span className={`cp-decision cp-decision--${DECISION_TONE[decision]}`}>
                        <img
                          src={DECISION_ICON[decision]}
                          alt=""
                          width="11.247"
                          height="11.247"
                        />
                        {decision}
                      </span>
                    </div>

                    <div className="cp-table__cell cp-table__actions" role="cell">
                      {(() => {
                        /* The certificate only exists once the case is
                           closed with one attached — most "Rejected" rows
                           and the odd older "Approved" one predating this
                           field have none, which is what leaves Download and
                           Print disabled rather than broken. */
                        const certificateUrl = row.completionCertificate?.url
                          ? assetUrl(row.completionCertificate.url)
                          : null;

                        return ROW_ACTIONS.map((action) => {
                          if (action.id === 'view') {
                            return (
                              <button
                                className="cp-row-action"
                                type="button"
                                key={action.id}
                                aria-label={`${action.label} ${row.applicationNumber}`}
                                onClick={() => navigate(`/assigned-queue/${row.id}`)}
                              >
                                <img src={action.icon} alt="" width="13.12" height="13.12" />
                              </button>
                            );
                          }

                          if (action.id === 'download') {
                            return certificateUrl ? (
                              <a
                                className="cp-row-action"
                                key={action.id}
                                href={certificateUrl}
                                download={row.completionCertificate?.originalName ?? true}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`${action.label} ${row.applicationNumber}`}
                              >
                                <img src={action.icon} alt="" width="13.12" height="13.12" />
                              </a>
                            ) : (
                              <button
                                className="cp-row-action"
                                type="button"
                                key={action.id}
                                disabled
                                aria-label={`No certificate to download for ${row.applicationNumber}`}
                              >
                                <img src={action.icon} alt="" width="13.12" height="13.12" />
                              </button>
                            );
                          }

                          /* Print: opened in its own tab rather than
                             window.print()'d directly — the certificate is a
                             PDF the browser renders on its own, with its own
                             print control, and that is the one every citizen
                             already gets handed a copy of at the counter. */
                          return certificateUrl ? (
                            <a
                              className="cp-row-action"
                              key={action.id}
                              href={certificateUrl}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`${action.label} ${row.applicationNumber}`}
                            >
                              <img src={action.icon} alt="" width="13.12" height="13.12" />
                            </a>
                          ) : (
                            <button
                              className="cp-row-action"
                              type="button"
                              key={action.id}
                              disabled
                              aria-label={`No certificate to print for ${row.applicationNumber}`}
                            >
                              <img src={action.icon} alt="" width="13.12" height="13.12" />
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>
                );
              })}

              {/* Still loading, the request failed, and genuinely nothing closed
                  yet say three different things. */}
              {loading && rows.length === 0 && (
                <p className="queue-empty">Loading closed applications…</p>
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
                  {tab === 'All'
                    ? 'Nothing you have handled has closed yet. An application lands here once it is approved and paid for, or rejected.'
                    : `No ${tab.toLowerCase()} applications yet.`}
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
}

export default CompletedApplicationsPage;
