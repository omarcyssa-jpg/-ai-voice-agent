import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitch from './LanguageSwitch';
import { authService } from '../services/supabase';

export default function AdminHeader({ onNavigate }) {
  const { t, isAr } = useLanguage();
  const currentUser = authService.getCurrentUser();

  const displayName = isAr
    ? currentUser?.full_name || t.adminName
    : currentUser?.full_name_en || currentUser?.full_name || 'Dr. Noura Al-Subaie';

  const displayRole = isAr
    ? currentUser?.role || t.administrator
    : currentUser?.role_en || currentUser?.role || 'Medical Director';

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('') || 'NS';

  const handleLogout = (e) => {
    e.preventDefault();
    if (confirm(isAr ? 'هل ترغب بتسجيل الخروج من لوحة الإدارة؟' : 'Do you want to log out of the admin portal?')) {
      authService.logout();
      if (onNavigate) {
        onNavigate('/login');
      } else {
        window.location.href = '/login';
      }
    }
  };

  return (
    <header className="app-header-exact">
      <div className="header-user-section">
        <div className="user-avatar-exact" title={displayName}>
          {initials}
        </div>
        <div className="user-details-exact">
          <span className="user-name-exact">{displayName}</span>
          <span className="user-role-exact">{displayRole}</span>
        </div>
      </div>

      <div className="header-right-exact">
        <LanguageSwitch />

        <div className="header-notification-wrapper" style={{ margin: '0 8px' }}>
          <button className="header-bell-btn" title="Notifications" aria-label="Notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="bell-indicator-dot"></span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          title={isAr ? 'تسجيل الخروج' : 'Log out'}
          style={{
            background: 'transparent',
            border: '1px solid #CBD5E1',
            borderRadius: '8px',
            padding: '5px 10px',
            color: '#64748B',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
            marginInlineEnd: '10px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#EF4444';
            e.currentTarget.style.borderColor = '#FCA5A5';
            e.currentTarget.style.background = '#FEE2E2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#64748B';
            e.currentTarget.style.borderColor = '#CBD5E1';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>{isAr ? 'تسجيل الخروج' : 'Log out'}</span>
        </button>

        <span className="header-brand-link">{t.adminPortal}</span>
      </div>
    </header>
  );
}
