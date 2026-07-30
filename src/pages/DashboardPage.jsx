import DashboardLayout from '../layouts/DashboardLayout.jsx';
import StatCard from '../components/dashboard/StatCard.jsx';
import TrendChart from '../components/dashboard/TrendChart.jsx';
import DonutChart from '../components/dashboard/DonutChart.jsx';
import RecentActivity from '../components/dashboard/RecentActivity.jsx';
import refreshIcon from '../assets/icons/dashboard/refresh.svg';
import { AGENT, STAT_CARDS } from '../constants/dashboard.js';

function greeting(hour = new Date().getHours()) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardPage() {
  const firstName = AGENT.name.split(' ')[0];

  // TODO: refetch the dashboard payload once the agent API is available.
  function handleRefresh() {
    console.info('dashboard refresh requested');
  }

  return (
    <DashboardLayout>
      <main className="dash-page">
        <div className="dash-page__head">
          <div>
            <h1 className="dash-page__title">{`${greeting()}, ${firstName} 👋`}</h1>
            <p className="dash-page__subtitle">Here is your operational overview for today</p>
          </div>
          <button className="dash-page__refresh" type="button" onClick={handleRefresh}>
            <img src={refreshIcon} alt="" width="13.12" height="13.12" />
            Refresh
          </button>
        </div>

        <div className="stat-grid">
          {STAT_CARDS.map((card) => (
            <StatCard key={card.id} {...card} />
          ))}
        </div>

        <div className="chart-row">
          <section className="dash-card chart-card">
            <h2 className="dash-card__title">Verification Trend</h2>
            <p className="dash-card__subtitle">Monthly assigned vs completed</p>
            <TrendChart />
          </section>

          <section className="dash-card chart-card">
            <h2 className="dash-card__title">Status Distribution</h2>
            <p className="dash-card__subtitle dash-card__subtitle--spaced">Current applications</p>
            <DonutChart />
          </section>
        </div>

        <RecentActivity />
      </main>
    </DashboardLayout>
  );
}

export default DashboardPage;
