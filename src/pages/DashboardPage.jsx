import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DashboardLayout from '../layouts/DashboardLayout.jsx';
import StatCard from '../components/dashboard/StatCard.jsx';
import TrendChart from '../components/dashboard/TrendChart.jsx';
import DonutChart from '../components/dashboard/DonutChart.jsx';
import RecentActivity from '../components/dashboard/RecentActivity.jsx';
import refreshIcon from '../assets/icons/dashboard/refresh.svg';
import * as dashboardApi from '../api/dashboard.js';
import { getErrorMessage } from '../api/client.js';
import { useLiveRefresh } from '../hooks/useLiveRefresh.js';
import { useAuth } from '../context/AuthContext.jsx';
import { toStatCards } from '../constants/dashboard.js';

function greeting(hour = new Date().getHours()) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState(null);
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

  /* One call for the whole screen — the tiles, both charts and the activity
     list are all slices of the same read, so they can never show figures taken
     at different moments. */
  useEffect(() => {
    let cancelled = false;

    const silent = silentRef.current;
    silentRef.current = false;

    if (!silent) {
      // The spinner has to appear when the request starts, not when it finishes.
      setLoading(true);
      setLoadError(null);
    }

    dashboardApi
      .getMyDashboard()
      .then((payload) => {
        if (cancelled) return;

        setData(payload);
        setLoadError(null);
      })
      .catch((error) => {
        if (!cancelled && !silent) setLoadError(getErrorMessage(error));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  /* Whoever is signed in, not the name the design was drawn with. Falls back to
     the greeting alone rather than to somebody else's first name. */
  const firstName = user?.fullName?.trim().split(/\s+/)[0];

  /* Tiles are drawn on the first paint whether or not the figures have landed —
     zeroes that fill in, rather than a screen that appears empty and then jumps.
     The cards are the design's; only their numbers are waiting. */
  const cards = toStatCards(data?.stats);

  /* Every tile names a real destination now (constants/dashboard.js) — this
     is only the last step, turning `to`/`query` into an actual navigation,
     so a tile is never wired to more than the one thing it already is: where
     it goes. */
  const openStat = (card) => {
    if (!card.to) return;

    const search = card.query ? `?${new URLSearchParams(card.query).toString()}` : '';
    navigate(`${card.to}${search}`);
  };

  return (
    <DashboardLayout>
      <main className="dash-page">
        <div className="dash-page__head">
          <div>
            <h1 className="dash-page__title">
              {firstName ? `${greeting()}, ${firstName} 👋` : `${greeting()} 👋`}
            </h1>
            <p className="dash-page__subtitle">
              {loadError
                ? 'Your overview could not be loaded'
                : 'Here is your operational overview for today'}
            </p>
          </div>
          <button
            className="dash-page__refresh"
            type="button"
            onClick={reload}
            disabled={loading}
          >
            <img src={refreshIcon} alt="" width="13.12" height="13.12" />
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {/* One line for a failure that took the whole screen with it. The cards
            below stay on screen showing zeroes rather than vanishing — a
            dashboard that disappears on a dropped connection tells the agent
            less than one that says so and keeps its shape. */}
        {!loading && loadError ? (
          <p className="dash-page__error" role="alert">
            {loadError}
            <button className="dash-page__retry" type="button" onClick={reload}>
              Try again
            </button>
          </p>
        ) : null}

        <div className="stat-grid">
          {cards.map((card) => (
            <StatCard key={card.id} {...card} onClick={() => openStat(card)} />
          ))}
        </div>

        <div className="chart-row">
          <section className="dash-card chart-card">
            <h2 className="dash-card__title">Verification Trend</h2>
            <p className="dash-card__subtitle">Monthly assigned vs completed</p>
            <TrendChart data={data?.trend ?? []} />
          </section>

          <section className="dash-card chart-card">
            <h2 className="dash-card__title">Status Distribution</h2>
            <p className="dash-card__subtitle dash-card__subtitle--spaced">Current applications</p>
            <DonutChart data={data?.distribution ?? []} />
          </section>
        </div>

        <RecentActivity
          rows={data?.recent ?? []}
          loading={loading}
          error={loadError}
          onRetry={reload}
        />
      </main>
    </DashboardLayout>
  );
}

export default DashboardPage;
