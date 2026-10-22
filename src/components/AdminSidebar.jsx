import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function AdminSidebar({ activePath = '/dashboard', onNavigate }) {
  const { isAr, t } = useLanguage();
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('afiya_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('afiya_sidebar_collapsed', collapsed ? 'true' : 'false');
    document.body.classList.toggle('sidebar-collapsed', collapsed);
  }, [collapsed]);

  useEffect(() => {
    document.body.classList.toggle('sidebar-collapsed', collapsed);
  });

  const navigate = (path) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  const toggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`} id="appSidebar">
      <button
        type="button"
        className="sidebar-toggle-btn"
        onClick={toggleSidebar}
        title={collapsed ? t.expandSidebar : t.collapseSidebar}
        aria-label={collapsed ? t.expandSidebar : t.collapseSidebar}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="toggle-chevron"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      <div className="sidebar-header">
        <div
          className="afiya-sidebar-brand"
          onClick={collapsed ? toggleSidebar : undefined}
          style={{ cursor: collapsed ? 'pointer' : 'default' }}
        >
          <div className="afiya-collapsed-logo" title={isAr ? 'المساعد الصوتي الذكي' : 'AI Voice Agent'}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3C12 8 8 12 3 12C8 12 12 16 12 21C12 16 16 12 21 12C16 12 12 8 12 3Z" />
              <circle cx="5" cy="19" r="1.5" fill="#FFFFFF" />
              <path d="M19 4v3m-1.5-1.5h3" strokeWidth="1.8" />
            </svg>
          </div>
          <div className="brand-titles">
            <span className="brand-text">{isAr ? 'المساعد الصوتي الذكي' : 'AI VOICE AGENT'}</span>
            <span className="org-subname">{isAr ? 'عيادات عافية' : 'AFIYA CLINICS'}</span>
          </div>
        </div>
      </div>

      <div className="clinic-workspace-badge">
        <span className="workspace-label">{t.clinicWorkspace}</span>
        <strong className="workspace-name">{t.riyadhBranch}</strong>
      </div>

      <nav className="sidebar-nav">
        <a
          href="/dashboard"
          className={`nav-item-styled ${['/dashboard', '/tasks'].includes(activePath) ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
          data-tooltip={t.overview}
        >
          <div className="nav-item-icon">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
            </svg>
          </div>
          <div className="nav-item-text">
            <span className="nav-main-title">{t.overview}</span>
            <span className="nav-sub-title">{t.overviewSub}</span>
          </div>
        </a>

        <a
          href="/knowledge"
          className={`nav-item-styled ${activePath === '/knowledge' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); navigate('/knowledge'); }}
          data-tooltip={t.knowledge}
        >
          <div className="nav-item-icon">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <div className="nav-item-text">
            <span className="nav-main-title">{t.knowledge}</span>
            <span className="nav-sub-title">{t.knowledgeSub}</span>
          </div>
        </a>

        <a
          href="/voice"
          className={`nav-item-styled ${['/voice', '/voice-dialect'].includes(activePath) ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); navigate('/voice'); }}
          data-tooltip={t.voiceNav}
        >
          <div className="nav-item-icon">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </div>
          <div className="nav-item-text">
            <span className="nav-main-title">{t.voiceNav}</span>
            <span className="nav-sub-title">{isAr ? 'اللهجات ونبرة النطق' : 'Personas & Dialects'}</span>
          </div>
        </a>

        <a
          href="/organization"
          className={`nav-item-styled ${['/organization', '/privacy'].includes(activePath) ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); navigate('/organization'); }}
          data-tooltip={t.settings}
        >
          <div className="nav-item-icon">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </div>
          <div className="nav-item-text">
            <span className="nav-main-title">{t.settings}</span>
            <span className="nav-sub-title">{t.settingsSub}</span>
          </div>
        </a>
      </nav>

      <div className="sidebar-security-box" data-tooltip={t.patientDataSecure}>
        <div className="sec-box-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0D7C66" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </div>
        <strong className="sec-box-title">{t.patientDataSecure}</strong>
        <p className="sec-box-desc">{t.securityNotice}</p>
      </div>

      <div className="sidebar-signout-row" data-tooltip={t.patientApp}>
        <a href="/admin" className="signout-link-exact" onClick={(e) => { e.preventDefault(); navigate('/admin'); }}>
          <div className="signout-text">
            <strong>{t.patientApp}</strong>
            <span>{t.voiceInterface}</span>
          </div>
          <div className="signout-icon-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </div>
        </a>
      </div>
    </aside>
  );
}
