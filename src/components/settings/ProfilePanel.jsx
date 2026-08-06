import { useEffect, useId, useRef, useState } from 'react';

import { useAuth } from '../../context/AuthContext.jsx';
import * as profileApi from '../../api/profile.js';
import { getErrorMessage } from '../../api/client.js';
import { PROFILE_FIELDS } from '../../constants/settings.js';
import { agentProfileFrom, assetUrl, initialsOf } from '../../utils/format.js';

/* Matches the server's limit and accepted types, so a file that is going to be
   refused is refused here — before it is uploaded and after the agent has
   waited for it. */
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/* The signed-in agent's own record.
 *
 * Read from the session rather than a constant, so it is this agent's details
 * and not a sample. Every text field is display-only: an agent account is opened
 * and scoped by an administrator, and no endpoint exists for an agent to change
 * their own name, number or posting. The mobile number should stay that way even
 * once one does — it is where a password-reset code is delivered, so editing it
 * from inside a live session would be a way to take an account over.
 *
 * The photo is the exception, and it is genuinely the agent's own. Picking one
 * uploads it immediately rather than waiting for a Save button: there is nothing
 * else on this screen to save alongside it, and a picture that appears the
 * moment it is chosen is its own confirmation. */

export function ProfilePanel() {
  const fieldPrefix = useId();
  const photoInputRef = useRef(null);
  const { user, applyUserPatch } = useAuth();

  const values = agentProfileFrom(user);

  // Shown while the upload is in flight, so the new picture appears at once
  // instead of after the round trip. Cleared when the saved one takes over.
  const [preview, setPreview] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [busy, setBusy] = useState(false);

  const photoUrl = preview || assetUrl(user?.photo);

  // The preview is an object URL, so it has to be released when it is replaced.
  useEffect(() => {
    if (!preview) return undefined;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    // Reset immediately, or choosing the same file twice fires no change event
    // — which is exactly what someone does after a failed upload.
    event.target.value = '';
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setPhotoError('Please choose a JPG, PNG or WebP image.');
      return;
    }

    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError('Image must be 5MB or smaller.');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPhotoError('');
    setPreview(localPreview);
    setBusy(true);

    try {
      const photo = await profileApi.uploadPhoto(file);

      // Fold it into the session so the shell's avatar follows, then drop the
      // local preview — the saved file is the one to show from here on.
      applyUserPatch({ photo });
      setPreview('');
    } catch (error) {
      setPhotoError(getErrorMessage(error));
      setPreview('');
    } finally {
      setBusy(false);
    }
  }

  async function handlePhotoRemove() {
    setPhotoError('');
    setBusy(true);

    try {
      await profileApi.removePhoto();
      applyUserPatch({ photo: null });
      setPreview('');
    } catch (error) {
      setPhotoError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="settings-card">
      <h2 className="settings-card__title">Profile Information</h2>

      <div className="settings-identity">
        {photoUrl ? (
          <img
            className="settings-identity__photo-preview"
            src={photoUrl}
            alt=""
            data-busy={busy || undefined}
          />
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
            // Narrower than image/*, matching what the server accepts — the
            // picker should not offer a HEIC that is going to be refused.
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
          />
          <div className="settings-identity__actions">
            <button
              className="settings-identity__photo"
              type="button"
              disabled={busy}
              onClick={() => photoInputRef.current?.click()}
            >
              {busy ? 'Uploading…' : photoUrl ? 'Change Photo' : 'Upload Photo'}
            </button>
            {/* Only when there is a saved one to remove — an upload in flight
                has nothing on the server to delete yet. */}
            {user?.photo && !busy ? (
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
