import { ACTIVE_SESSIONS, SECURITY_OPTIONS } from '../../constants/settings.js';

export function SecurityPanel() {
  // TODO: revoke through the session API once it is available.
  function handleRevoke() {
    console.info('revoke other sessions requested');
  }

  return (
    <section className="settings-card">
      <h2 className="settings-card__title">Security Settings</h2>

      <div className="settings-options">
        {SECURITY_OPTIONS.map((option) => (
          <div className="settings-option" key={option.id}>
            <div>
              <p className="settings-option__title">{option.title}</p>
              <p className="settings-option__desc">{option.description}</p>
            </div>
            <span
              className={
                option.enabled
                  ? 'settings-pill settings-pill--on'
                  : 'settings-pill settings-pill--off'
              }
            >
              {option.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        ))}
      </div>

      <div className="settings-sessions">
        <p className="settings-sessions__title">{ACTIVE_SESSIONS.title}</p>
        <p className="settings-sessions__summary">{ACTIVE_SESSIONS.summary}</p>
        <button className="settings-sessions__action" type="button" onClick={handleRevoke}>
          {ACTIVE_SESSIONS.action}
        </button>
      </div>
    </section>
  );
}

export default SecurityPanel;
