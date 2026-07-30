import arrowRight from '../../assets/icons/dashboard/arrow-right.svg';
import {
  PRIORITY_MODIFIER,
  RECENT_ACTIVITY,
  STATUS_MODIFIER,
} from '../../constants/dashboard.js';

export function RecentActivity() {
  return (
    <section className="dash-card activity">
      <div className="activity__head">
        <h2 className="dash-card__title">Recent Activity</h2>
        <button className="activity__view-all" type="button">
          View all
          <img src={arrowRight} alt="" width="11.247" height="11.247" />
        </button>
      </div>

      <div className="activity__list">
        {RECENT_ACTIVITY.map((item) => (
          <button className="activity__row" type="button" key={item.id}>
            <span className="avatar">{item.initials}</span>

            <span className="activity__body">
              <span className="activity__name-row">
                <span className="activity__name">{item.name}</span>
                <span className={`priority-badge priority-badge--${PRIORITY_MODIFIER[item.priority]}`}>
                  {item.priority}
                </span>
              </span>
              <span className="activity__meta">{item.meta}</span>
            </span>

            <span className="activity__side">
              <span className={`status-badge status-badge--${STATUS_MODIFIER[item.status]}`}>
                {item.status}
              </span>
              <span className="activity__date">{item.date}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default RecentActivity;
