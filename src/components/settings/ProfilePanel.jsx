import { useEffect, useId, useRef, useState } from 'react';

import { AGENT } from '../../constants/dashboard.js';
import { AGENT_PROFILE, PROFILE_FIELDS } from '../../constants/settings.js';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export function ProfilePanel() {
  const fieldPrefix = useId();
  const photoInputRef = useRef(null);
  const [values, setValues] = useState(AGENT_PROFILE);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [saving, setSaving] = useState(false);

  // The preview is an object URL, so it has to be released when it is replaced.
  useEffect(() => {
    if (!photoPreview) return undefined;
    return () => URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  function handleChange(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
  }

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

  // TODO: persist the profile once the agent settings API is available.
  async function handleSubmit(event) {
    event.preventDefault();

    const formdata = new FormData();
    if(!values && !photo) return null;
    formdata.set("fullname" , values.fullName);
    formdata.set("email" , values.email)
    
    setSaving(true);
    console.info('profile save requested', values, photo);
    setSaving(false);
  }

  return (
    <section className="settings-card">
      <h2 className="settings-card__title">Profile Information</h2>

      <div className="settings-identity">
        {photoPreview ? (
          <img className="settings-identity__photo-preview" src={photoPreview} alt="Profile" />
        ) : (
          <span className="settings-identity__avatar">{AGENT.initials}</span>
        )}
        <div>
          <p className="settings-identity__name">{values.fullName}</p>
          <p className="settings-identity__meta">{`${AGENT.role} · ${values.employeeId}`}</p>
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
                disabled={!field.editable}
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
