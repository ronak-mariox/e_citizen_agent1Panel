import { useEffect, useId, useRef, useState } from 'react';

import { useAuth } from '../../context/AuthContext.jsx';
import * as profileApi from '../../api/profile.js';
import { getErrorMessage } from '../../api/client.js';
import { useLiveRefresh } from '../../hooks/useLiveRefresh.js';
import { ADDRESS_FIELDS, EMPTY_ADDRESS, PROFILE_FIELDS } from '../../constants/settings.js';
import { agentProfileFrom, assetUrl, initialsOf } from '../../utils/format.js';

/* Matches the server's limit and accepted types, so a file that is going to be
   refused is refused here — before it is uploaded and after the agent has
   waited for it. */
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/* The signed-in agent's own record.
 *
 * Most of the grid is read from the session and stays display-only: an agent
 * account is opened and scoped by an administrator, and there is still no
 * endpoint for an agent to change their employee ID, posting or status. Mobile
 * stays read-only for a sharper reason — it is where a password-reset code is
 * delivered, so editing it from inside a live session would be a way to take
 * an account over.
 *
 * Full Name and Address are the two genuine exceptions, saved together through
 * PATCH /profile/me — the record behind them (AgentProfile) is fetched
 * separately from the session, since the session only carries the login
 * account. Both are backend/src/models/common_schema.js's own field names
 * (`fullName`, `currentAddress`), not a shape invented here.
 *
 * The photo is a third exception, and it is genuinely the agent's own. Picking
 * one uploads it immediately rather than waiting for a Save button: there is
 * nothing else on this screen to save alongside it, and a picture that appears
 * the moment it is chosen is its own confirmation. */

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

  /* The record Full Name and Address actually live on — AgentProfile, fetched
     on its own because the session only carries the login account (Agent).
     `fullName` seeds from the session immediately so the field is not empty
     while this is still in flight; the two stay in step regardless, since a
     save mirrors the new name back onto the session's own account. */
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState('');

  const [fullName, setFullName] = useState(values.fullName);
  const [address, setAddress] = useState(EMPTY_ADDRESS);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    profileApi
      .getMyProfile()
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        setFullName(data.fullName ?? '');
        setAddress({ ...EMPTY_ADDRESS, ...data.currentAddress });
      })
      .catch((error) => {
        if (!cancelled) setProfileError(getErrorMessage(error));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const isDirty =
    profile != null &&
    (fullName !== (profile.fullName ?? '') ||
      ADDRESS_FIELDS.some((field) => address[field.name] !== (profile.currentAddress?.[field.name] ?? '')));

  /* Bumped by every save, so a live refetch that started before one does not
     land over what the save stored. */
  const saveSeq = useRef(0);

  /* Live: the record changed elsewhere (an administrator editing it). Taken in
     only while nothing here is unsaved, and a field typed into while the
     refetch was out keeps what was typed. */
  useLiveRefresh(async () => {
    if (saving || isDirty) return;

    const seq = saveSeq.current;
    const before = { fullName, address };

    try {
      const data = await profileApi.getMyProfile();
      if (seq !== saveSeq.current) return;

      setProfile(data);
      setProfileError('');
      setFullName((current) => (current === before.fullName ? (data.fullName ?? '') : current));
      setAddress((current) =>
        current === before.address ? { ...EMPTY_ADDRESS, ...data.currentAddress } : current
      );
    } catch {
      // Keeps what is on screen; the next change or focus asks again.
    }
  }, ['agents']);

  function handleAddressChange(name, value) {
    setSaved(false);
    setAddress((current) => ({ ...current, [name]: value }));
  }

  async function handleSave(event) {
    event.preventDefault();
    saveSeq.current += 1;
    setSaving(true);
    setSaveError('');
    setSaved(false);

    try {
      // Every address field is optional, but the backend's own pincode regex
      // only skips a field it never received — an empty string still has to
      // match six digits and would fail the whole save over a field nobody
      // touched yet. Sending only what was actually filled in avoids that.
      const currentAddress = Object.fromEntries(
        Object.entries(address).filter(([, value]) => value.trim() !== '')
      );

      const updated = await profileApi.updateMyProfile({ fullName, currentAddress });
      setProfile(updated);
      setFullName(updated.fullName ?? '');
      setAddress({ ...EMPTY_ADDRESS, ...updated.currentAddress });
      // The header and sidebar identity read the session, not this panel — a
      // renamed agent should see their new name everywhere at once, the same
      // way a new photo already does below.
      applyUserPatch({ fullName: updated.fullName });
      setSaved(true);
    } catch (error) {
      setSaveError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  /* The services this posting covers. Fetched rather than read off the session:
     the account is serialised on every sign-in, and carrying a list of services
     on all of them would cost a join per request for something only this tab
     reads. Null until it lands, which is how the section tells "loading" from
     "genuinely none". */
  const [scope, setScope] = useState(null);
  const [scopeError, setScopeError] = useState('');

  useEffect(() => {
    let cancelled = false;

    profileApi
      .getMyServices()
      .then((data) => {
        if (!cancelled) setScope(data);
      })
      .catch((error) => {
        if (!cancelled) setScopeError(getErrorMessage(error));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // The posting's services follow an administrator's change without a reload.
  useLiveRefresh(() => {
    profileApi
      .getMyServices()
      .then((data) => {
        setScope(data);
        setScopeError('');
      })
      .catch(() => {
        // Keeps the list already shown.
      });
  }, ['agents', 'catalog']);

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

      <form onSubmit={handleSave}>
        <div className="settings-grid">
          {PROFILE_FIELDS.map((field) => {
            const fieldId = `${fieldPrefix}-${field.name}`;
            const isEditable = Boolean(field.editable);

            return (
              <div className="settings-field" key={field.name}>
                <label className="settings-field__label" htmlFor={fieldId}>
                  {field.label}
                </label>
                {/* `readOnly` rather than `disabled` on the fields that stay
                    that way: the value still has to be selectable and
                    copyable — an agent reading their employee ID back to a
                    helpdesk needs to be able to copy it. */}
                <input
                  id={fieldId}
                  className="settings-field__input"
                  type={field.type}
                  name={field.name}
                  readOnly={!isEditable}
                  autoComplete={field.autoComplete}
                  value={isEditable ? fullName : values[field.name]}
                  onChange={
                    isEditable
                      ? (event) => {
                          setSaved(false);
                          setFullName(event.target.value);
                        }
                      : undefined
                  }
                />
              </div>
            );
          })}
        </div>

        {/* Where the agent currently lives — the other half of what this form
            saves, below the grid so both read as one screen rather than two. */}
        <div className="settings-scope">
          <h3 className="settings-scope__title">Address</h3>

          <div className="settings-grid">
            {ADDRESS_FIELDS.map((field) => {
              const fieldId = `${fieldPrefix}-address-${field.name}`;

              return (
                <div className="settings-field" key={field.name}>
                  <label className="settings-field__label" htmlFor={fieldId}>
                    {field.label}
                  </label>
                  <input
                    id={fieldId}
                    className="settings-field__input"
                    type={field.type}
                    name={field.name}
                    autoComplete={field.autoComplete}
                    placeholder={field.name === 'pincode' ? '6-digit pincode' : undefined}
                    value={address[field.name]}
                    onChange={(event) => handleAddressChange(field.name, event.target.value)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <button className="settings-save" type="submit" disabled={!isDirty || saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>

        {profileError && <p className="settings-field__error">{profileError}</p>}
        {saveError && (
          <p className="settings-field__error" role="alert">
            {saveError}
          </p>
        )}
        {saved && !isDirty && <p className="settings-field__success">Saved.</p>}
      </form>

      {/* What this posting covers. Read-only like everything above it — an
          admin decides which services an agent handles, and there is no
          endpoint for an agent to widen their own. */}
      <div className="settings-scope">
        <h3 className="settings-scope__title">Assigned Services</h3>

        {scopeError ? (
          <p className="settings-identity__error">{scopeError}</p>
        ) : !scope ? (
          <p className="settings-scope__note">Loading your assigned services…</p>
        ) : (
          <>
            <p className="settings-scope__note">
              {/* An empty list on the account means "everything this department
                  offers", so the sentence has to say which case this is — a
                  bare list of three would otherwise read as a limit. */}
              {scope.handlesAllDepartmentServices
                ? `You are not limited to particular services, so you handle everything ${
                    scope.department?.name ?? 'your department'
                  } offers.`
                : `You handle ${scope.services.length} of ${
                    scope.department?.name ?? 'your department'
                  }'s services.`}
            </p>

            {scope.services.length === 0 ? (
              <p className="settings-scope__note">
                No services are listed against your posting yet. Your administrator sets these.
              </p>
            ) : (
              <ul className="settings-scope__list">
                {scope.services.map((service) => (
                  <li className="settings-scope__item" key={service.id}>
                    <span className="settings-scope__name">{service.name}</span>

                    {/* A service you are scoped to can still be closed to new
                        applications, which is worth seeing here — it explains a
                        queue that is quieter than expected. */}
                    {!service.isAcceptingApplications || service.status !== 'active' ? (
                      <span className="settings-scope__flag">Not accepting applications</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <p className="settings-note">
        Your mobile number, posting and assigned services are set by your administrator — contact
        them to change those. You can update your name and address above, and your password under
        the Password tab.
      </p>
    </section>
  );
}

export default ProfilePanel;
