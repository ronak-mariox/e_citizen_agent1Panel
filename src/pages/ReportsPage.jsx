import DashboardLayout from '../layouts/DashboardLayout.jsx';
import WorkBarChart from '../components/reports/WorkBarChart.jsx';
import ActivityLineChart from '../components/reports/ActivityLineChart.jsx';
import StatusDonut from '../components/reports/StatusDonut.jsx';
import { AGENT } from '../constants/dashboard.js';
import { DEPARTMENT_LOAD, REPORT_KPIS } from '../constants/reports.js';
import downloadIcon from '../assets/icons/reports/export-download.svg';
import kpiTime from '../assets/icons/reports/kpi-time.svg';
import kpiApproval from '../assets/icons/reports/kpi-approval.svg';
import kpiQuery from '../assets/icons/reports/kpi-query.svg';
import kpiRejection from '../assets/icons/reports/kpi-rejection.svg';
import '../styles/reports.css';

const KPI_ICON = {
  time: kpiTime,
  approval: kpiApproval,
  query: kpiQuery,
  rejection: kpiRejection,
};

/* Bars are drawn against the busiest department rather than a fixed scale. */
const BUSIEST = Math.max(...DEPARTMENT_LOAD.map((row) => row.value));

function ReportsPage() {
  return (
    <DashboardLayout>
      <main className="queue-page reports-page">
        <section className="queue-page__header">
          <div>
            <h1 className="queue-page__title">Reports &amp; Analytics</h1>
            <p className="queue-page__subtitle">
              Performance overview — {AGENT.name} · {AGENT.role}
            </p>
          </div>

          <div className="rp-actions">
            {/* The design draws this control empty, so it ships as the plain
                bordered field it is until its options are specified. */}
            <div className="rp-period" aria-hidden="true" />

            <button className="rp-export" type="button">
              <img src={downloadIcon} alt="" width="13.12" height="13.12" />
              PDF
            </button>

            <button className="rp-export" type="button">
              <img src={downloadIcon} alt="" width="13.12" height="13.12" />
              Excel
            </button>
          </div>
        </section>

        <section className="rp-kpis" aria-label="Performance summary">
          {REPORT_KPIS.map((kpi) => (
            <article className={`rp-kpi rp-kpi--${kpi.tone}`} key={kpi.id}>
              <div className="rp-kpi__top">
                <img src={KPI_ICON[kpi.tone]} alt="" width="14.992" height="14.992" />
                <p className="rp-kpi__label">{kpi.label}</p>
              </div>
              <p className="rp-kpi__value">{kpi.value}</p>
            </article>
          ))}
        </section>

        <section className="rp-row">
          <article className="rp-card">
            <h2 className="rp-card__title">Monthly Work Summary</h2>
            <p className="rp-card__note">Assigned, completed, forwarded</p>
            <WorkBarChart />
          </article>

          <article className="rp-card">
            <h2 className="rp-card__title">Daily Activity — This Week</h2>
            <p className="rp-card__note">Verified vs pending per day</p>
            <ActivityLineChart />
          </article>
        </section>

        <section className="rp-row">
          <article className="rp-card">
            <h2 className="rp-card__title">Pending Cases by Department</h2>

            <ul className="rp-depts">
              {DEPARTMENT_LOAD.map((row) => (
                <li className="rp-dept" key={row.id}>
                  <div className="rp-dept__top">
                    <span className="rp-dept__label">{row.label}</span>
                    <span className="rp-dept__value">{row.value}</span>
                  </div>
                  <span className="rp-dept__track">
                    <span
                      className="rp-dept__fill"
                      style={{
                        width: `${(row.value / BUSIEST) * 100}%`,
                        backgroundColor: row.color,
                      }}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rp-card">
            <h2 className="rp-card__title">Status Distribution</h2>
            <div className="rp-donut-shell">
              <StatusDonut />
            </div>
          </article>
        </section>
      </main>
    </DashboardLayout>
  );
}

export default ReportsPage;
