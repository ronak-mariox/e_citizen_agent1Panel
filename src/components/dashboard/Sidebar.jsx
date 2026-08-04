import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import LogoutDialog from '../LogoutDialog.jsx';
import navLogo from '../../assets/icons/dashboard/nav-logo.svg';
import navLogout from '../../assets/icons/dashboard/nav-logout.svg';
import { NAV_ITEMS } from '../../constants/dashboard.js';
import { useAuth } from '../../context/AuthContext.jsx';

export function Sidebar() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  // Revokes the refresh token server-side and clears the cookie, so the
  // session is gone rather than just hidden.
  async function handleLogout() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__head">
        <div className="sidebar__mark">
          <img src={navLogo} alt="" width="14.992" height="14.992" />
        </div>
        <div>
          <p className="sidebar__name">eCitizen</p>
          <p className="sidebar__portal">Agent 1 Portal</p>
        </div>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link'
            }
          >
            <img src={item.icon} alt="" width="14.992" height="14.992" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__foot">
        <button
          className="sidebar__logout"
          type="button"
          onClick={() => setConfirmingLogout(true)}
        >
          <img src={navLogout} alt="" width="14.992" height="14.992" />
          Logout
        </button>
      </div>

      {confirmingLogout && (
        <LogoutDialog onCancel={() => setConfirmingLogout(false)} onConfirm={handleLogout} />
      )}
    </aside>
  );
}

export default Sidebar;
