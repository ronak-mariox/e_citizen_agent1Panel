import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DashboardLayout from '../layouts/DashboardLayout.jsx';
import SettingsNav from '../components/settings/SettingsNav.jsx';
import ProfilePanel from '../components/settings/ProfilePanel.jsx';
import PasswordPanel from '../components/settings/PasswordPanel.jsx';
import SecurityPanel from '../components/settings/SecurityPanel.jsx';
import { DEFAULT_SETTINGS_TAB } from '../constants/settings.js';
import '../styles/settings.css';

const PANELS = {
  profile: ProfilePanel,
  password: PasswordPanel,
  security: SecurityPanel,
};

export function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(DEFAULT_SETTINGS_TAB);
  const Panel = PANELS[activeTab];

  return (
    <DashboardLayout>
      <main className="dash-page">
        <h1 className="dash-page__title">Settings</h1>

        <div className="settings-body">
          <SettingsNav
            activeTab={activeTab}
            onSelect={setActiveTab}
            onLogout={() => navigate('/login')}
          />

          <Panel />
        </div>
      </main>
    </DashboardLayout>
  );
}

export default SettingsPage;
