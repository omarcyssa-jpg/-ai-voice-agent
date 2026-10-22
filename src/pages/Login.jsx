import { useEffect, useState } from 'react';

const T = {
  ar: {
    head: 'تسجيل الدخول',
    sub1: 'سجل الدخول إلى مساحة عمل العيادة',
    sub2: 'أدخل بيانات حسابك للوصول إلى لوحة تحكم الإدارة.',
    email: 'عنوان البريد الإلكتروني',
    password: 'كلمة المرور',
    forgot: 'نسيت كلمة المرور؟',
    remember: 'تذكرني',
    signIn: 'تسجيل الدخول',
    portal: 'بوابة إدارة العيادة',
    headline: ['تبدأ الرعاية بمحادثة،', 'والإدارة أصبحت', 'أكثر وضوحاً.'],
    p1: 'مكان واحد لمتابعة طلبات العملاء، وإدارة ردود المساعد الصوتي، وضبط إعدادات عيادات عافية.',
    p2: 'مساحة عمل واضحة وآمنة لفريق عيادتك الطبي.',
    secTitle: 'دخول آمن للمشرفين المعتمدين فقط',
    secDesc: 'استخدم حساب العمل المعتمد الخاص بك. لا تشارك بيانات تسجيل الدخول مع الآخرين.',
    footerCopy: '© 2026 عيادات عافية · الخصوصية · الدعم الفني · للاستخدام الإداري فقط',
  },
  en: {
    head: 'Sign in',
    sub1: 'Sign in to your clinic workspace',
    sub2: 'Enter your account details to access the admin dashboard.',
    email: 'Email address',
    password: 'Password',
    forgot: 'Forgot password?',
    remember: 'Remember me',
    signIn: 'Sign in',
    portal: 'Clinic admin portal',
    headline: ['Care starts with a', 'conversation, and', 'management just got clearer.'],
    p1: 'One place to track customer requests, manage voice assistant responses, and configure Afiya Clinics settings.',
    p2: 'A clear, secure workspace for your clinic team.',
    secTitle: 'Secure access for authorized admins only',
    secDesc: 'Use your approved work account. Do not share login details with others.',
    footerCopy: '© 2026 Afiya Clinics · Privacy · Technical support · For administrative use only',
  },
};

export default function Login({ onNavigate }) {
  const [lang, setLang] = useState(() => localStorage.getItem('afiya_lang') || 'ar');
  const [showPassword, setShowPassword] = useState(false);
  const t = T[lang] || T.ar;
  const isAr = lang === 'ar';

  useEffect(() => {
    document.title = isAr ? 'تسجيل الدخول — عيادات عافية' : 'Admin Login — Afiya Clinics';
    document.body.className = 'login-body';
  }, [isAr]);

  useEffect(() => {
    document.body.classList.toggle('lang-ar', isAr);
    document.documentElement.setAttribute('dir', isAr ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('afiya_lang', lang);
  }, [lang, isAr]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('/dashboard');
    } else {
      window.location.href = '/dashboard';
    }
  };

  const goToClient = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('/');
    } else {
      window.location.href = '/';
    }
  };

  return (
    <>
      <header className="login-top-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a href="/" onClick={goToClient} style={{ color: '#0D7C66', textDecoration: 'none', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', background: '#E8F6F3', padding: '6px 12px', borderRadius: '8px' }}>
            <span>←</span> {isAr ? 'تطبيق المراجع الصوتي' : 'Client Voice UI'}
          </a>
          <div className="lang-switch-pill" id="loginLangSwitcher">
            <button type="button" className={`lang-btn${isAr ? ' active' : ''}`} onClick={() => setLang('ar')}>العربية</button>
            <button type="button" className={`lang-btn${!isAr ? ' active' : ''}`} onClick={() => setLang('en')}>English</button>
          </div>
        </div>

        <div className="afiya-brand-header">
          <div className="afiya-brand-text">
            <span className="brand-name-main">{isAr ? 'المساعد الصوتي الذكي' : 'AI VOICE AGENT'}</span>
            <span className="brand-name-sub">{isAr ? 'عيادات عافية' : 'Afiya Clinics'}</span>
          </div>
          <img src="/assets/logo.png" alt="Afiya Clinics Logo" className="afiya-logo-img" />
        </div>
      </header>

      <main className="login-page-container">
        <div className="login-grid-exact">
          <div className="login-card-exact">
            <div className="login-lock-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0D7C66" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            <h1 className="login-heading-exact" id="loginHeadText">{t.head}</h1>
            <p className="login-sub1" id="loginSub1Text">{t.sub1}</p>
            <p className="login-sub2" id="loginSub2Text">{t.sub2}</p>

            <form id="loginForm" className="login-form-exact" onSubmit={handleSubmit}>
              <div className="form-group-exact">
                <label htmlFor="loginEmail" className="form-label-exact" id="lblEmailText">{t.email}</label>
                <input type="email" id="loginEmail" className="form-input-exact" defaultValue="admin@afiya.clinic" placeholder="admin@afiya.clinic" required />
              </div>

              <div className="form-group-exact">
                <label htmlFor="loginPassword" className="form-label-exact" id="lblPasswordText">{t.password}</label>
                <div className="input-password-wrap">
                  <button type="button" className="eye-toggle-btn" id="passwordToggle" title="Toggle password visibility" onClick={() => setShowPassword((s) => !s)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <input type={showPassword ? 'text' : 'password'} id="loginPassword" className="form-input-exact password-field" defaultValue="••••••••••••" placeholder="Enter password" required />
                </div>
              </div>

              <div className="form-row-actions">
                <a href="#forgot" className="forgot-link-exact" id="linkForgot">{t.forgot}</a>
                <label className="remember-label-exact" id="lblRememberWrap">
                  <span id="lblRemember">{t.remember}</span>
                  <input type="checkbox" id="rememberMe" defaultChecked />
                  <span className="custom-chk-exact"></span>
                </label>
              </div>

              <button type="submit" className="btn-signin-exact" id="btnSignIn">
                <span id="btnSignInText">{t.signIn}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </form>
          </div>

          <div className="login-info-exact">
            <div className="admin-portal-pill">
              <span id="pillPortalText">{t.portal}</span>
              <span className="green-dot">•</span>
            </div>

            <h2 className="hero-headline-exact" id="heroHeadlineText">
              {t.headline[0]}<br />
              {t.headline[1]}<br />
              {t.headline[2]}
            </h2>

            <p className="hero-p1-exact" id="heroP1Text">{t.p1}</p>
            <p className="hero-p2-exact" id="heroP2Text">{t.p2}</p>

            <div className="security-card-exact">
              <div className="sec-text-group">
                <strong className="sec-title" id="secTitleText">{t.secTitle}</strong>
                <p className="sec-desc" id="secDescText">{t.secDesc}</p>
              </div>
              <div className="sec-shield-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0D7C66" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="login-footer-exact">
        <div className="footer-copy-exact">{t.footerCopy}</div>
      </footer>
    </>
  );
}
