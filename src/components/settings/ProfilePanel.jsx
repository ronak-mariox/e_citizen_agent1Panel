import { useEffect, useId, useRef, useState } from 'react';

import { useAuth } from '../../context/AuthContext.jsx';
import { PROFILE_FIELDS } from '../../constants/settings.js';
import { agentProfileFrom, initialsOf } from '../../utils/format.js';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/* The signed-in agent's own record.
 *
 * Read from the session rather than a constant, so it is this agent's details
 * and not a sample. Every field is display-only: an agent account is opened and
 * scoped by an administrator, and no endpoint exists for an agent to change
 * their own name, number or posting. The mobile number should stay that way
 * even once one does — it is where a password-reset code is delivered, so
 * editing it from inside a live session would be a way to take an account over.
 *
 * The photo is the exception, and it is a real one: it belongs to AgentProfile
 * rather than to the account, and is the agent's to set. It has no upload
 * endpoint yet, so the picker still stops at a local preview. */

export function ProfilePanel() {
  const fieldPrefix = useId();
  const photoInputRef = useRef(null);
  const { user } = useAuth();

  const values = agentProfileFrom(user);

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoError, setPhotoError] = useState('');

  // The preview is an object URL, so it has to be released when it is replaced.
  useEffect(() => {
    if (!photoPreview) return undefined;
    return () => URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please choose an image file.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError('Image must be 5MB or smaller.');
      event.target.value = '';
      return;
    }

    setPhotoError('');
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function handlePhotoRemove() {
    setPhoto(null);
    setPhotoPreview('');
    setPhotoError('');
    if (photoInputRef.current) photoInputRef.current.value = '';
  }

  return (
    <section className="settings-card">
      <h2 className="settings-card__title">Profile Information</h2>

      <div className="settings-identity">
        {photoPreview ? (
          <img className="settings-identity__photo-preview" src={photoPreview} alt="Profile" />
        ) : (
          <span className="settings-identity__avatar">{initialsOf(values.fullName)}</span>
        )}
        <div>
          <p className="settings-identity__name">{values.fullName || 'Loading…'}</p>
          <p className="settings-identity__meta">
            {[values.level, values.employeeId].filter(Boolean).join(' · ')}
          </p>
          <input
            ref={photoInputRef}
            className="settings-identity__file"
            id={`${fieldPrefix}-photo`}
            type="file"
            name="photo"
            accept="image/*"
            onChange={handlePhotoChange}
          />
          <div className="settings-identity__actions">
            <button
              className="settings-identity__photo"
              type="button"
              onClick={() => photoInputRef.current?.click()}
            >
              Change Photo
            </button>
            {photo ? (
              <button className="settings-identity__photo" type="button" onClick={handlePhotoRemove}>
                Remove
              </button>
            ) : null}
          </div>
          {photoError ? <p className="settings-identity__error">{photoError}</p> : null}
        </div>
      </div>

      <div className="settings-grid">
        {PROFILE_FIELDS.map((field) => (
          <div className="settings-field" key={field.name}>
            <label className="settings-field__label" htmlFor={`${fieldPrefix}-${field.name}`}>
              {field.label}
            </label>
            {/* `readOnly` rather than `disabled`: the value still has to be
                selectable and copyable — an agent reading their employee ID
                back to a helpdesk needs to be able to copy it. */}
            <input
              id={`${fieldPrefix}-${field.name}`}
              className="settings-field__input"
              type={field.type}
              name={field.name}
              readOnly
              autoComplete={field.autoComplete}
              value={values[field.name]}
            />
          </div>
        ))}
      </div>

      <p className="settings-note">
        These details are held on your staff account and are maintained by your administrator.
        Contact them to correct your name, mobile number or posting. You can change your password
        under the Password tab.
      </p>
    </section>
  );
}

export default ProfilePanel;
