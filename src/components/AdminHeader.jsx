import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitch from './LanguageSwitch';

export default function AdminHeader({ onNavigate }) {
  const { t } = useLanguage();

  return (
    <header className="app-header-exact">
      <div className="header-user-section">
        <div className="user-avatar-exact">NS</div>
        <div className="user-details-exact">
          <span className="user-name-exact">{t.adminName}</span>
          <span className="user-role-exact">{t.administrator}</span>
        </div>
      </div>

      <div className="header-right-exact">
        <LanguageSwitch />

        <div className="header-notification-wrapper" style={{ margin: '0 10px' }}>
          <button className="header-bell-btn" title="Notifications" aria-label="Notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="bell-indicator-dot"></span>
          </button>
        </div>

        <span className="header-brand-link">{t.adminPortal}</span>
      </div>
    </header>
  );
}
