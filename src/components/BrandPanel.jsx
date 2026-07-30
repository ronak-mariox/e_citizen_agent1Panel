import logoShield from '../assets/icons/logo-shield.svg';
import statFile from '../assets/icons/stat-file.svg';
import statClock from '../assets/icons/stat-clock.svg';
import statCheck from '../assets/icons/stat-check.svg';
import statBuilding from '../assets/icons/stat-building.svg';

const STATS = [
  { icon: statFile, value: '12,400+', label: 'Applications Processed' },
  { icon: statClock, value: '3.2 days', label: 'Avg Resolution Time' },
  { icon: statCheck, value: '87%', label: 'Approval Rate' },
  { icon: statBuilding, value: '14', label: 'Departments Covered' },
];

export function BrandPanel() {
  return (
    <aside className="brand-panel">
      <span className="brand-panel__blob brand-panel__blob--one" aria-hidden="true" />
      <span className="brand-panel__blob brand-panel__blob--two" aria-hidden="true" />
      <span className="brand-panel__blob brand-panel__blob--three" aria-hidden="true" />

      <div className="brand-panel__brand">
        <div className="brand-panel__mark">
          <img src={logoShield} alt="" width="18.749" height="18.749" />
        </div>
        <div>
          <p className="brand-panel__name">eCitizen Portal</p>
          <p className="brand-panel__org">Government of India · Agent 1 — Field Verification</p>
        </div>
      </div>

      <h2 className="brand-panel__headline">Streamline citizen service delivery.</h2>

      <p className="brand-panel__copy">
        Verify documents, manage applications, and ensure timely resolution for every citizen
        request — all in one secure workspace.
      </p>

      <div className="brand-panel__stats">
        {STATS.map((stat) => (
          <div className="stat-tile" key={stat.label}>
            <img className="stat-tile__icon" src={stat.icon} alt="" width="14.992" height="14.992" />
            <p className="stat-tile__value">{stat.value}</p>
            <p className="stat-tile__label">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="brand-panel__footer">
        <p className="brand-panel__ministry">Ministry of Electronics &amp; Information Technology</p>
        <p className="brand-panel__notice">Secure · Authenticated · Government Use Only</p>
      </div>
    </aside>
  );
}

export default BrandPanel;
