import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DashboardLayout from '../layouts/DashboardLayout.jsx';
import * as notificationsApi from '../api/notifications.js';
import { getErrorMessage } from '../api/client.js';
import { useLiveRefresh } from '../hooks/useLiveRefresh.js';
import { NOTIFICATION_TYPES } from '../constants/notifications.js';
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

/* The backend's own NOTIFICATION_TYPE enum is bigger than this panel's filter
   chips — some values exist only for other panels. Falling back rather than
   trusting every row to match one of ours is what keeps a type this screen
   was not built to categorize from taking the whole page down instead of
   just showing generically. */
const UNKNOWN_TYPE = { label: 'Notification', tone: 'system' };

/**
 * "5m ago", "3h ago", "Yesterday" — what the row says under its body.
 *
 * Rendered here rather than sent by the API, which carries the stamp itself: a
 * relative age computed on the server would be wrong the moment the page had
 * been open for a minute, and this screen is one somebody leaves open.
 */
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const ageOf = (value) => {
  const at = value ? new Date(value) : null;

  if (!at || Number.isNaN(at.getTime())) return '';

  const gap = Math.max(0, Date.now() - at.getTime());

  if (gap < MINUTE) return 'Just now';
  if (gap < HOUR) return `${Math.floor(gap / MINUTE)}m ago`;
  if (gap < DAY) return `${Math.floor(gap / HOUR)}h ago`;
  if (gap < 2 * DAY) return 'Yesterday';
  if (gap < 7 * DAY) return `${Math.floor(gap / DAY)}d ago`;

  return at.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const PAGE_SIZE = 30;

function NotificationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const [rows, setRows] = useState([]);
  const [unread, setUnread] = useState(null);
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
  }, ['notifications']);

  /* Fetched per chip rather than filtered here: the list is paged, and a
     client-side filter would hide rows that were simply on another page. */
  useEffect(() => {
    let cancelled = false;

    const silent = silentRef.current;
    silentRef.current = false;

    if (!silent) {
      // The message has to change when the request starts, not when it finishes.
      setLoading(true);
      setLoadError(null);
    }

    notificationsApi
      .listMyNotifications({ limit: PAGE_SIZE, type: filter })
      .then((data) => {
        if (cancelled) return;

        setLoadError(null);

        setRows(data.notifications);
        setUnread(data.unread);
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
  }, [filter, reloadToken]);

  const unreadCount = unread?.total ?? 0;
  // A chip counts what is still unread in its own type, so it clears as rows do.
  const unreadFor = (typeId) => unread?.[typeId] ?? 0;

  const visible = rows;

  /* Marked on the server, then reflected here — the rows are already in hand, so
     redrawing them costs nothing and a refetch would only make the list jump. */
  const markAllRead = async () => {
    try {
      setUnread(await notificationsApi.markNotificationsRead());
      setRows((current) => current.map((row) => ({ ...row, unread: false })));
    } catch (error) {
      setLoadError(getErrorMessage(error));
    }
  };

  const openRow = (row) => {
    /* Navigating away is the point of the row, so it is not held up by the
       request that marks it read — that lands on its own, and a failed one
       leaves the row unread, which is the truthful outcome. */
    if (row.unread) {
      notificationsApi
        .markNotificationsRead(row.id)
        .then(setUnread)
        .catch(() => {});

      setRows((current) =>
        current.map((one) => (one.id === row.id ? { ...one, unread: false } : one))
      );
    }

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
            const type = TYPE_BY_ID[row.type] ?? UNKNOWN_TYPE;

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
                      {/* Computed here from the stamp the API sent — see
                          ageOf. A server-rendered age goes stale on a screen
                          somebody leaves open. */}
                      <span className="ntf-card__time">{ageOf(row.at)}</span>
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

          {/* Still loading, the request failed, and a genuinely quiet centre say
              three different things. */}
          {loading && rows.length === 0 && (
            <p className="queue-empty">Loading notifications…</p>
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
              {filter === 'all'
                ? 'Nothing to catch up on. You will be told here when work is assigned to you or an applicant replies.'
                : 'Nothing under this heading yet.'}
            </p>
          )}
        </section>
      </main>
    </DashboardLayout>
  );
}

export default NotificationsPage;
