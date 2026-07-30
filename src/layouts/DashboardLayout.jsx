import { useState } from 'react';

import Sidebar from '../components/dashboard/Sidebar.jsx';
import Topbar from '../components/dashboard/Topbar.jsx';
import '../styles/dashboard.css';

export function DashboardLayout({ children }) {
  // One flag, opposite effect per breakpoint: above 900px it collapses the
  // docked sidebar, below it opens the drawer. Both start from "not toggled".
  const [navToggled, setNavToggled] = useState(false);

  return (
    <div className={navToggled ? 'dash dash--nav-toggled' : 'dash'}>
      <Sidebar />
      <button
        className="dash__scrim"
        type="button"
        aria-label="Close navigation"
        onClick={() => setNavToggled(false)}
      />
      <div className="dash__main">
        <Topbar onToggleSidebar={() => setNavToggled((toggled) => !toggled)} />
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;
