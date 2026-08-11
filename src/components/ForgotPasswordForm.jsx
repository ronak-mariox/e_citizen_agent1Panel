import { useId, useState } from 'react';
import { Link } from 'react-router-dom';

import arrowLeft from '../assets/icons/arrow-left.svg';
import keyIcon from '../assets/icons/key.svg';
import userIcon from '../assets/icons/user.svg';
import sendIcon from '../assets/icons/send.svg';

export function ForgotPasswordForm({ onSubmit }) {
  const fieldId = useId();

  const [identifier, setIdentifier] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = identifier.trim().length > 0 && !submitting;

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    if (!canSubmit) {
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit?.({ identifier: identifier.trim() });
    } catch (error) {
      setFormError(error?.message || 'Unable to send the code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-pane">
      <Link className="auth-back" to="/login">
        <img src={arrowLeft} alt="" width="13.12" height="13.12" />
        Back to Login
      </Link>

      <header className="auth-pane__head">
        <div className="auth-icon-badge auth-icon-badge--amber">
          <img src={keyIcon} alt="" width="22.494" height="22.494" />
        </div>
        <h1 className="auth-pane__title">Forgot password?</h1>
        <p className="auth-pane__subtitle">
          Enter your Employee ID or the email address on your record. We will send a one-time
          code to the mobile number on your staff record.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label className="field__label" htmlFor={fieldId}>
            Email or Employee ID
          </label>
          <div className="field__control">
            <img className="field__icon" src={userIcon} alt="" width="14.992" height="14.992" />
            <input
              id={fieldId}
              className="field__input"
              type="text"
              name="identifier"
              autoComplete="username"
              placeholder="Enter your email or employee ID"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
            />
          </div>
        </div>

        <button
          className="auth-submit"
          type="submit"
          disabled={!canSubmit}
          data-busy={submitting}
        >
          <img src={sendIcon} alt="" width="14.992" height="14.992" />
          {submitting ? 'Sending…' : 'Send OTP'}
        </button>

        {formError && (
          <p className="auth-alert" role="alert">
            {formError}
          </p>
        )}
      </form>

      <div className="info-note">
        <p className="info-note__title">Don&apos;t have access to that number?</p>
        <p className="info-note__text">
          Contact your department supervisor or IT helpdesk at <strong>1800-111-222</strong>{' '}
          (toll-free).
        </p>
      </div>
    </section>
  );
}

export default ForgotPasswordForm;
