import trendUp from '../../assets/icons/dashboard/trend-up.svg';
import trendDown from '../../assets/icons/dashboard/trend-down.svg';

export function StatCard({ icon, accent, value, title, subtitle, trend }) {
  return (
    <button className="stat-card" type="button">
      <span className="stat-card__top">
        <span className="stat-card__icon" style={{ backgroundColor: accent }}>
          <img src={icon} alt="" width="18.749" height="18.749" />
        </span>
        {trend && (
          <span className={`stat-card__trend stat-card__trend--${trend.direction}`}>
            <img
              src={trend.direction === 'up' ? trendUp : trendDown}
              alt=""
              width="11.247"
              height="11.247"
            />
            {trend.value}
          </span>
        )}
      </span>
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{title}</span>
      <span className="stat-card__hint">{subtitle}</span>
    </button>
  );
}

export default StatCard;
