import { useId, useState } from 'react';

import { AGENT } from '../../constants/dashboard.js';
import { AGENT_PROFILE, PROFILE_FIELDS } from '../../constants/settings.js';

export function ProfilePanel() {
  const fieldPrefix = useId();
  const [values, setValues] = useState(AGENT_PROFILE);
  const [saving, setSaving] = useState(false);

  function handleChange(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  // TODO: persist the profile once the agent settings API is available.
  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    console.info('profile save requested', values);
    setSaving(false);
  }

  return (
    <section className="settings-card">
      <h2 className="settings-card__title">Profile Information</h2>

      <div className="settings-identity">
        <span className="settings-identity__avatar">{AGENT.initials}</span>
        <div>
          <p className="settings-identity__name">{values.fullName}</p>
          <p className="settings-identity__meta">{`${AGENT.role} · ${values.employeeId}`}</p>
          <button className="settings-identity__photo" type="button">
            Change Photo
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="settings-grid">
          {PROFILE_FIELDS.map((field) => (
            <div className="settings-field" key={field.name}>
              <label className="settings-field__label" htmlFor={`${fieldPrefix}-${field.name}`}>
                {field.label}
              </label>
              <input
                id={`${fieldPrefix}-${field.name}`}
                className="settings-field__input"
                type={field.type}
                name={field.name}
                autoComplete={field.autoComplete}
                value={values[field.name]}
                onChange={(event) => handleChange(field.name, event.target.value)}
              />
            </div>
          ))}
        </div>

        <button className="settings-save" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </section>
  );
}

export default ProfilePanel;
