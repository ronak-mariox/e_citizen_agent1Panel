import { LOGOUT_ICON, SETTINGS_TABS } from '../../constants/settings.js';

export function SettingsNav({ activeTab, onSelect, onLogout }) {
  return (
    <div className="settings-nav">
      {SETTINGS_TABS.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            className={isActive ? 'settings-tab settings-tab--active' : 'settings-tab'}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onSelect(tab.id)}
          >
            <img
              className="settings-tab__icon"
              src={tab.icon}
              alt=""
              width="14.992"
              height="14.992"
            />
            {tab.label}
          </button>
        );
      })}

      <div className="settings-nav__foot">
        <button className="settings-tab settings-tab--logout" type="button" onClick={onLogout}>
          <img
            className="settings-tab__icon"
            src={LOGOUT_ICON}
            alt=""
            width="14.992"
            height="14.992"
          />
          Logout
        </button>
      </div>
    </div>
  );
}

export default SettingsNav;
