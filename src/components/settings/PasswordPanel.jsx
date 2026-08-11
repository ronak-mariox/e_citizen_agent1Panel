import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { changePassword } from '../../api/auth.js';
import { getErrorMessage } from '../../api/client.js';
import { MIN_PASSWORD_LENGTH, PASSWORD_FIELDS } from '../../constants/settings.js';
import { useAuth } from '../../context/AuthContext.jsx';

const EMPTY_FORM = { current: '', next: '', confirm: '' };

export function PasswordPanel() {
  const fieldPrefix = useId();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

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

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSaving(true);

    try {
      await changePassword({ currentPassword: values.current, newPassword: values.next });
      setValues(EMPTY_FORM);

      // The backend revokes every refresh token on a password change, so this
      // session is already dead — sign out cleanly rather than let the next
      // call fail with a confusing 401.
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
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
                    placeholder={`Enter your ${field.label.toLowerCase()}`}
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

          {formError && (
            <p className="settings-field__error" role="alert">
              {formError}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

export default PasswordPanel;
