import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext.jsx';
import ApplicationDetailsPage from './pages/ApplicationDetailsPage.jsx';
import './styles/global.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <MemoryRouter initialEntries={['/assigned-queue/APP-2024-00418']}>
        <Routes>
          <Route path="/assigned-queue/:applicationId" element={<ApplicationDetailsPage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  </StrictMode>
);
