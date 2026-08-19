import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import eyeIcon from '../../assets/icons/eye.svg';
import eyeOffIcon from '../../assets/icons/eye-off.svg';
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

  /* Per field, not one switch for all three. Revealing the new password to
     check a typo should not also expose the current one to the room. */
  const [revealed, setRevealed] = useState({});

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  function handleChange(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function toggleReveal(name) {
    setRevealed((current) => ({ ...current, [name]: !current[name] }));
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
              const isRevealed = Boolean(revealed[field.name]);

              return (
                <div className="settings-field" key={field.name}>
                  <label className="settings-field__label" htmlFor={fieldId}>
                    {field.label}
                  </label>

                  <div className="settings-field__control">
                    <input
                      id={fieldId}
                      className="settings-field__input settings-field__input--with-action"
                      type={isRevealed ? 'text' : 'password'}
                      name={field.name}
                      autoComplete={field.autoComplete}
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      value={values[field.name]}
                      onChange={(event) => handleChange(field.name, event.target.value)}
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? `${fieldId}-error` : undefined}
                    />

                    {/* type="button", or it would submit the form. */}
                    <button
                      className="settings-field__toggle"
                      type="button"
                      onClick={() => toggleReveal(field.name)}
                      aria-label={`${isRevealed ? 'Hide' : 'Show'} ${field.label.toLowerCase()}`}
                      aria-pressed={isRevealed}
                    >
                      <img
                        src={isRevealed ? eyeOffIcon : eyeIcon}
                        alt=""
                        width="13.12"
                        height="13.12"
                      />
                    </button>
                  </div>

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
