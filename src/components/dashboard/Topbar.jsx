import chevronLeft from '../../assets/icons/dashboard/chevron-left.svg';
import chevronDown from '../../assets/icons/dashboard/chevron-down.svg';
import searchIcon from '../../assets/icons/dashboard/search.svg';
import calendarIcon from '../../assets/icons/dashboard/calendar.svg';
import bellIcon from '../../assets/icons/dashboard/bell.svg';
import { AGENT } from '../../constants/dashboard.js';

const DATE_FORMAT = {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
};

function formatToday() {
  // "Fri, 10 Jul, 2026" — en-GB gives "Fri, 10 Jul 2026", so the year is split out.
  const parts = new Intl.DateTimeFormat('en-GB', DATE_FORMAT).formatToParts(new Date());
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${lookup.weekday}, ${lookup.day} ${lookup.month}, ${lookup.year}`;
}

export function Topbar({ onToggleSidebar }) {
  return (
    <header className="topbar">
      <button
        className="topbar__toggle"
        type="button"
        onClick={onToggleSidebar}
        aria-label="Toggle navigation"
      >
        <img src={chevronLeft} alt="" width="14.992" height="14.992" />
      </button>

      <div className="topbar__search">
        <img src={searchIcon} alt="" width="13.12" height="13.12" />
        <input type="search" placeholder="Search applications, customers…" aria-label="Search" />
      </div>

      <div className="topbar__right">
        <p className="topbar__date">
          <img src={calendarIcon} alt="" width="13.12" height="13.12" />
          {formatToday()}
        </p>

        <button className="topbar__bell" type="button" aria-label="Notifications">
          <img src={bellIcon} alt="" width="14.992" height="14.992" />
        </button>

        <button className="topbar__user" type="button">
          <span className="avatar">{AGENT.initials}</span>
          <span className="topbar__identity">
            <span className="topbar__username">{AGENT.name}</span>
            <span className="topbar__role">{AGENT.role}</span>
          </span>
          <img src={chevronDown} alt="" width="11.247" height="11.247" />
        </button>
      </div>
    </header>
  );
}

export default Topbar;
