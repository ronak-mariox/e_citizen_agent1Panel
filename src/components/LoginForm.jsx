import { useId, useState } from 'react';
import { Link } from 'react-router-dom';

import badgeFile from '../assets/icons/badge-file.svg';
import userIcon from '../assets/icons/user.svg';
import lockIcon from '../assets/icons/lock.svg';
import eyeIcon from '../assets/icons/eye.svg';
import eyeOffIcon from '../assets/icons/eye-off.svg';
import shieldCheck from '../assets/icons/shield-check.svg';

const MIN_PASSWORD_LENGTH = 4;

export function LoginForm({ onSubmit }) {
  const employeeFieldId = useId();
  const passwordFieldId = useId();

  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const next = {};

    if (!employeeId.trim()) {
      next.employeeId = 'Employee ID is required.';
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      next.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
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

    setSubmitting(true);

    try {
      await onSubmit?.({ employeeId: employeeId.trim(), password, remember });
    } catch (error) {
      setFormError(error?.message || 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-pane">
      <header className="auth-pane__head auth-pane__head--login">
        <p className="auth-badge">
          <img src={badgeFile} alt="" width="13.12" height="13.12" />
          Agent 1 — Field Verification Portal
        </p>
        <h1 className="auth-pane__title">Welcome back</h1>
        <p className="auth-pane__subtitle">
          Sign in with your employee credentials to continue
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label className="field__label" htmlFor={employeeFieldId}>
            Employee ID
          </label>
          <div className="field__control">
            <img className="field__icon" src={userIcon} alt="" width="14.992" height="14.992" />
            <input
              id={employeeFieldId}
              className="field__input"
              type="text"
              name="employeeId"
              autoComplete="username"
              placeholder="ECZ-A1-0042"
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
              aria-invalid={Boolean(errors.employeeId)}
              aria-describedby={errors.employeeId ? `${employeeFieldId}-error` : undefined}
            />
          </div>
          {errors.employeeId && (
            <p className="field__error" id={`${employeeFieldId}-error`}>
              {errors.employeeId}
            </p>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor={passwordFieldId}>
            Password
          </label>
          <div className="field__control">
            <img className="field__icon" src={lockIcon} alt="" width="14.992" height="14.992" />
            <input
              id={passwordFieldId}
              className="field__input field__input--with-action"
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? `${passwordFieldId}-error` : undefined}
            />
            <button
              className="field__toggle"
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <img
                src={showPassword ? eyeOffIcon : eyeIcon}
                alt=""
                width="14.992"
                height="14.992"
              />
            </button>
          </div>
          {errors.password && (
            <p className="field__error" id={`${passwordFieldId}-error`}>
              {errors.password}
            </p>
          )}
        </div>

        <div className="auth-form__options">
          <label className="checkbox">
            <input
              className="checkbox__box"
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            Remember me
          </label>
          <Link className="link-button" to="/forgot-password">
            Forgot password?
          </Link>
        </div>

        <button
          className="auth-submit"
          type="submit"
          disabled={submitting}
          data-busy={submitting}
        >
          <img src={shieldCheck} alt="" width="14.992" height="14.992" />
          {submitting ? 'Signing In…' : 'Sign In Securely'}
        </button>

        {formError && (
          <p className="auth-alert" role="alert">
            {formError}
          </p>
        )}
      </form>

      <div className="demo-note">
        <p className="demo-note__title">Demo credentials</p>
        <p className="demo-note__row">
          Employee ID: <code>ECZ-A1-0042</code>
        </p>
        <p className="demo-note__row">
          Password: <code>any 4+ characters</code>
        </p>
      </div>

      <p className="auth-support">
        Having trouble? Contact IT support at <strong>helpdesk@ecitizen.gov.in</strong>
      </p>
    </section>
  );
}

export default LoginForm;
