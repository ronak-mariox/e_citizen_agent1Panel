import { useId, useState } from 'react';

import { MIN_PASSWORD_LENGTH, PASSWORD_FIELDS } from '../../constants/settings.js';

const EMPTY_FORM = { current: '', next: '', confirm: '' };

export function PasswordPanel() {
  const fieldPrefix = useId();
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function handleChange(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function validate() {
    const next = {};

    if (!values.current) {
      next.current = 'Enter your current password.';
    }

    if (values.next.length < MIN_PASSWORD_LENGTH) {
      next.next = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }

    if (values.confirm !== values.next) {
      next.confirm = 'Passwords do not match.';
    }

    return next;
  }

  // TODO: post to the agent password endpoint once the API is available.
  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSaving(true);
    console.info('password change requested');
    setValues(EMPTY_FORM);
    setSaving(false);
  }

  return (
    <section className="settings-card">
      <div className="settings-column">
        <h2 className="settings-card__title">Change Password</h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="settings-stack">
            {PASSWORD_FIELDS.map((field) => {
              const fieldId = `${fieldPrefix}-${field.name}`;
              const error = errors[field.name];

              return (
                <div className="settings-field" key={field.name}>
                  <label className="settings-field__label" htmlFor={fieldId}>
                    {field.label}
                  </label>
                  <input
                    id={fieldId}
                    className="settings-field__input"
                    type="password"
                    name={field.name}
                    autoComplete={field.autoComplete}
                    placeholder="••••••••"
                    value={values[field.name]}
                    onChange={(event) => handleChange(field.name, event.target.value)}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${fieldId}-error` : undefined}
                  />
                  {error && (
                    <p className="settings-field__error" id={`${fieldId}-error`}>
                      {error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <button className="settings-save settings-save--wide" type="submit" disabled={saving}>
            {saving ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default PasswordPanel;
