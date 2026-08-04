import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DashboardLayout from '../layouts/DashboardLayout.jsx';
import { NOTIFICATIONS, NOTIFICATION_TYPES } from '../constants/notifications.js';
import typeAssignment from '../assets/icons/notifications/type-assignment.svg';
import typeVerification from '../assets/icons/notifications/type-verification.svg';
import typeCustomer from '../assets/icons/notifications/type-customer.svg';
import typeSla from '../assets/icons/notifications/type-sla.svg';
import typeSystem from '../assets/icons/notifications/type-system.svg';
import '../styles/notifications.css';

const TYPE_ICON = {
  assignment: typeAssignment,
  verification: typeVerification,
  customer: typeCustomer,
  sla: typeSla,
  system: typeSystem,
};

const TYPE_BY_ID = Object.fromEntries(NOTIFICATION_TYPES.map((type) => [type.id, type]));

function NotificationsPage() {
  const navigate = useNavigate();
  // Read state is per session, like the other mocked screens in this panel.
  const [readIds, setReadIds] = useState([]);
  const [filter, setFilter] = useState('all');

  const rows = useMemo(
    () =>
      NOTIFICATIONS.map((item) => ({
        ...item,
        unread: item.unread && !readIds.includes(item.id),
      })),
    [readIds]
  );

  const unreadCount = rows.filter((row) => row.unread).length;
  // A chip counts what is still unread in its own type, so it clears as rows do.
  const unreadFor = (typeId) => rows.filter((row) => row.type === typeId && row.unread).length;

  const visible = filter === 'all' ? rows : rows.filter((row) => row.type === filter);

  const markAllRead = () => setReadIds(NOTIFICATIONS.map((item) => item.id));

  const openRow = (row) => {
    setReadIds((current) => (current.includes(row.id) ? current : [...current, row.id]));
    if (row.link) navigate(row.link);
  };

  return (
    <DashboardLayout>
      <main className="queue-page notifications-page">
        <section className="queue-page__header">
          <div>
            <h1 className="queue-page__title">Notification Center</h1>
            <p className="queue-page__subtitle">{unreadCount} unread notifications</p>
          </div>

          <button className="ntf-mark-all" type="button" onClick={markAllRead}>
            Mark all read
          </button>
        </section>

        <section className="ntf-filters" role="group" aria-label="Filter notifications">
          <button
            className={`ntf-filter ${filter === 'all' ? 'ntf-filter--active' : ''}`}
            type="button"
            aria-pressed={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            All
            {unreadCount > 0 && <span className="ntf-filter__count">{unreadCount}</span>}
          </button>

          {NOTIFICATION_TYPES.map((type) => {
            const count = unreadFor(type.id);

            return (
              <button
                className={`ntf-filter ${filter === type.id ? 'ntf-filter--active' : ''}`}
                type="button"
                key={type.id}
                aria-pressed={filter === type.id}
                onClick={() => setFilter(type.id)}
              >
                {type.label}
                {count > 0 && <span className="ntf-filter__count">{count}</span>}
              </button>
            );
          })}
        </section>

        <section className="ntf-list" aria-label="Notifications">
          {visible.map((row) => {
            const type = TYPE_BY_ID[row.type];

            return (
              <article
                className={`ntf-card ${row.unread ? 'ntf-card--unread' : ''}`}
                key={row.id}
              >
                <span className={`ntf-card__badge ntf-card__badge--${type.tone}`}>
                  <img src={TYPE_ICON[type.tone]} alt="" width="14.992" height="14.992" />
                </span>

                <div className="ntf-card__body">
                  <div className="ntf-card__top">
                    <div className="ntf-card__copy">
                      <h2 className="ntf-card__title">{row.title}</h2>
                      <p className="ntf-card__text">{row.body}</p>
                    </div>

                    <div className="ntf-card__meta">
                      <span className="ntf-card__time">{row.time}</span>
                      {row.unread && <span className="ntf-card__dot" aria-label="Unread" />}
                    </div>
                  </div>

                  <div className="ntf-card__foot">
                    <span className="ntf-card__chip">{type.label}</span>
                    <button
                      className="ntf-card__link"
                      type="button"
                      onClick={() => openRow(row)}
                    >
                      View details
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </DashboardLayout>
  );
}

export default NotificationsPage;
