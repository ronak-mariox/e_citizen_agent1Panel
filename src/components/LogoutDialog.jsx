import { createPortal } from 'react-dom';

import { AGENT } from '../constants/dashboard.js';
import logoutMark from '../assets/icons/dashboard/logout-confirm.svg';

/* Signing out is one click away from every screen and cannot be walked back
   without signing in again, so it is confirmed rather than done on the first
   click. Raised from both places that offer it — the sidebar and the settings
   rail — which is why it lives here rather than beside either one. */
export function LogoutDialog({ onCancel, onConfirm }) {
  // Portalled to the body: under 900px the sidebar is a transformed drawer, and
  // a transform makes its subtree the containing block for position:fixed — the
  // overlay would be trapped inside the 240px rail instead of covering the page.
  return createPortal(
    <div className="logout-modal" role="presentation" onClick={onCancel}>
      <div
        className="logout-modal__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="logout-modal__badge">
          <img src={logoutMark} alt="" width="26.239" height="26.239" />
        </span>

        <h2 className="logout-modal__title" id="logout-title">
          Confirm Logout
        </h2>
        <p className="logout-modal__body">
          Are you sure you want to log out of {AGENT.role} Portal? Any unsaved changes will be
          lost.
        </p>

        <div className="logout-modal__actions">
          <button className="logout-modal__cancel" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="logout-modal__confirm" type="button" onClick={onConfirm}>
            Yes, Logout
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default LogoutDialog;
