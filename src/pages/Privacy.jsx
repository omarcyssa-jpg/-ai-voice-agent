import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

export default function Privacy({ onNavigate }) {
  const { isAr, t } = useLanguage();
  const [consent, setConsent] = useState(() => localStorage.getItem('afiya_privacy_consent') !== 'false');
  const [retention, setRetention] = useState(() => localStorage.getItem('afiya_privacy_retention') || '90');
  const [redact, setRedact] = useState(() => localStorage.getItem('afiya_privacy_redact') !== 'false');
  const [erasureValue, setErasureValue] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef(null);

  useEffect(() => {
    document.title = isAr
      ? 'الخصوصية وحماية البيانات — عيادات عافية'
      : 'Privacy & Data Protection — Afiya Clinics';
    document.body.classList.remove('login-body');
    document.body.classList.add('app-body');
    return () => clearTimeout(toastTimer.current);
  }, [isAr]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 3000);
  };

  const handleSave = () => {
    try {
      localStorage.setItem('afiya_privacy_consent', consent);
      localStorage.setItem('afiya_privacy_retention', retention);
      localStorage.setItem('afiya_privacy_redact', redact);
      showToast(isAr ? 'تم حفظ سياسات الخصوصية والأمان بنجاح!' : 'Privacy policy saved successfully!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleErasure = () => {
    const val = erasureValue.trim();
    if (!val) {
      alert(isAr ? 'فضلاً أدخل رقم الجوال أو الهوية الوطنية للمريض' : 'Please enter patient mobile or National ID');
      return;
    }
    if (confirm(isAr ? `هل أنت متأكد من رغبتك في حذف وحجب كافة التسجيلات والبيانات للمراجع (${val}) نهائياً؟` : `Purge all recordings and records for (${val})?`)) {
      setErasureValue('');
      showToast(isAr ? `تم حذف وحجب كافة سجلات المراجع (${val}) بنجاح.` : `Records for (${val}) permanently purged.`);
    }
  };

  const handleAddStaff = () => {
    const email = prompt(isAr ? 'أدخل البريد الإلكتروني لموظف العيادة المصرح له:' : 'Enter authorized clinic staff email:');
    if (email) {
      showToast(isAr ? `تم إرسال دعوة الانضمام والصلاحيات إلى ${email}` : `Invitation sent to ${email}`);
    }
  };

  return (
    <div className="app-layout">
      <AdminSidebar activePath="/organization" onNavigate={onNavigate} />

      <main className="app-main">
        <AdminHeader onNavigate={onNavigate} />

        <div className="page-content-exact">
          <div className="org-head-title-row">
            <span className="breadcrumb-mini">
              {isAr ? 'فرع الرياض · الحوكمة والامتثال لنظام PDPL' : 'Riyadh Branch · Governance & PDPL'}
            </span>
            <h1 className="overview-heading">{isAr ? 'الخصوصية وصلاحيات حماية البيانات' : 'Privacy & Data Protection Policies'}</h1>
            <p className="overview-subtext">
              {isAr
                ? 'إدارة تراخيص تسجيل المكالمات، فترات الاحتفاظ بالبيانات، تشفير السجلات الطبية، والامتثال للأنظمة السعودية.'
                : 'Manage call disclosure, retention schedules, PII redaction, and access controls.'}
            </p>
          </div>

          <div className="sub-nav-tabs">
            <a
              href="/organization"
              className="sub-tab"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/organization');
              }}
            >
              {isAr ? 'بيانات المنشأة والدوام' : 'Clinic Data'}
            </a>
            <a
              href="/voice"
              className="sub-tab"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/voice');
              }}
            >
              {isAr ? 'صوت ولهجة المساعد' : 'AI Voice & Dialect'}
            </a>
            <a
              href="/privacy"
              className="sub-tab active"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/privacy');
              }}
            >
              {isAr ? 'الخصوصية والأمان' : 'Privacy & permissions'}
            </a>
            <a
              href="/knowledge"
              className="sub-tab"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/knowledge');
              }}
            >
              {isAr ? 'قاعدة المعرفة' : 'FAQs'}
            </a>
          </div>

          <div className="org-two-col-grid">
            <div className="org-col">
              <div className="settings-card-exact">
                <div className="card-head-row">
                  <div>
                    <h3 className="card-title-exact">{isAr ? 'إشعار تسجيل المكالمة والموافقة' : 'Voice Recording Disclosure'}</h3>
                    <p className="card-desc-exact">
                      {isAr ? 'إعلام المراجع التلقائي بنظام الذكاء الاصطناعي وتسجيل المكالمة لضبط الجودة' : 'Automated disclosure before the voice assistant answers'}
                    </p>
                  </div>
                  <div className="card-head-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D7C66" strokeWidth="2">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    </svg>
                  </div>
                </div>

                <div className="form-group-exact">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label-exact" style={{ margin: 0 }}>
                      {isAr ? 'تشغيل رسالة التنبيه والموافقة قبل بدء المحادثة' : 'Play consent disclosure audio'}
                    </label>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <p style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '8px' }}>
                    {isAr
                      ? 'يوضح للمراجع أن المكالمة معالجة ومسجلة لخدمته وتأكيد حجزه وفق نظام حماية البيانات الشخصية السعودي.'
                      : 'Notifies caller that call is processed by AI and retained for quality assurance.'}
                  </p>
                </div>

                <div className="form-group-exact">
                  <label className="form-label-exact">{isAr ? 'نص رسالة الإشعار الصوتي:' : 'Consent Message Disclosure (Arabic):'}</label>
                  <textarea
                    className="form-input-exact"
                    rows={2}
                    dir="rtl"
                    defaultValue="تنويه: تجري هذه المحادثة عبر المساعد الذكي لعيادات عافية وقد تكون مسجلة لضبط الجودة وتأكيد المواعيد."
                  />
                </div>

                <div className="form-group-exact">
                  <label className="form-label-exact">{isAr ? 'مدة الاحتفاظ بالتسجيلات الصوتية الخام:' : 'Call Recording Retention Period:'}</label>
                  <select
                    className="form-input-exact"
                    value={retention}
                    onChange={(e) => setRetention(e.target.value)}
                  >
                    <option value="30">{isAr ? '30 يوماً (الحد الأدنى للحفظ)' : '30 Days (Minimal retention)'}</option>
                    <option value="90">{isAr ? '90 يوماً (موصى به للمراجعة والتأكيد)' : '90 Days (Recommended)'}</option>
                    <option value="180">{isAr ? '180 يوماً (نصف سنة)' : '180 Days (Half year)'}</option>
                    <option value="365">{isAr ? 'سنة واحدة (أرشيف الامتثال الطبي)' : '1 Year (Regulatory compliance)'}</option>
                  </select>
                  <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', display: 'block' }}>
                    {isAr
                      ? 'يتم إتلاف التسجيلات الصوتية الخام تلقائياً بعد انتهاء المدة المحددة، مع بقاء ملخص المهام المجهل تحليلياً.'
                      : 'Raw voice recordings are permanently deleted upon expiry.'}
                  </span>
                </div>
              </div>

              <div className="settings-card-exact">
                <div className="card-head-row">
                  <div>
                    <h3 className="card-title-exact">{isAr ? 'حجب البيانات الحساسة والتشفير' : 'Data Redaction & Encryption'}</h3>
                    <p className="card-desc-exact">
                      {isAr ? 'حماية أرقام الهويات الوطنية والبطاقات المصرفية' : 'Protect patient identifiable info'}
                    </p>
                  </div>
                  <div className="card-head-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D7C66" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                </div>

                <div className="form-group-exact">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block' }}>
                        {isAr ? 'الحجب التلقائي للهوية الوطنية والبيانات المالية' : 'Auto-redact National ID & Payment info'}
                      </strong>
                      <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                        {isAr ? 'استبدال أرقام الهوية السعودية بـ [محجوب] في التفريغ النصي' : 'Replaces 10-digit IDs with [REDACTED]'}
                      </span>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={redact} onChange={(e) => setRedact(e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="compliance-badge-grid" style={{ marginTop: '14px' }}>
                  <div className="compliance-item-card">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D7C66" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <div>
                      <strong>{isAr ? 'متوافق مع نظام PDPL السعودي' : 'Saudi PDPL Compliant'}</strong>
                      <p>{isAr ? 'استضافة البيانات محلياً داخل خوادم آمنة بالرياض' : 'Local Kingdom data residency'}</p>
                    </div>
                  </div>

                  <div className="compliance-item-card">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D7C66" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <div>
                      <strong>{isAr ? 'معايير الذكاء الاصطناعي الصحي' : 'Healthcare AI Standard'}</strong>
                      <p>{isAr ? 'فصل تام للمهام الإدارية عن الاستشارات السريرية' : 'Strict administrative segregation'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="org-col">
              <div className="settings-card-exact">
                <div className="card-head-row">
                  <div>
                    <h3 className="card-title-exact">{isAr ? 'فريق العيادة المصرح له والأدوار' : 'Authorized Staff & Roles'}</h3>
                    <p className="card-desc-exact">
                      {isAr ? 'إدارة صلاحيات الوصول لسجلات المرضى والمكالمات' : 'Access control for patient records'}
                    </p>
                  </div>
                  <div className="card-head-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D7C66" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                    </svg>
                  </div>
                </div>

                <table className="staff-permissions-table">
                  <thead>
                    <tr>
                      <th>{isAr ? 'المستخدم' : 'Member'}</th>
                      <th>{isAr ? 'الدور' : 'Role'}</th>
                      <th>{isAr ? 'نطاق الصلاحيات' : 'Scope'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong>{isAr ? 'نورة السالم' : 'Noura Al-Salem'}</strong><br />
                        <small style={{ color: '#94A3B8' }}>admin@afiya.clinic</small>
                      </td>
                      <td><span className="role-badge admin">{isAr ? 'مدير نظام' : 'Administrator'}</span></td>
                      <td style={{ color: '#475569' }}>{isAr ? 'تحكم كامل والإعدادات' : 'Full Control'}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>{isAr ? 'د. خالد المنصور' : 'Dr. Khalid Al-Mansour'}</strong><br />
                        <small style={{ color: '#94A3B8' }}>khalid.m@afiya.clinic</small>
                      </td>
                      <td><span className="role-badge doctor">{isAr ? 'المشرف الطبي' : 'Clinical Lead'}</span></td>
                      <td style={{ color: '#475569' }}>{isAr ? 'الفرز والمهام العاجلة' : 'Triage & Urgent'}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>{isAr ? 'ريم الحربي' : 'Reem Al-Harbi'}</strong><br />
                        <small style={{ color: '#94A3B8' }}>reem.reception@afiya.clinic</small>
                      </td>
                      <td><span className="role-badge reception">{isAr ? 'الاستقبال' : 'Reception'}</span></td>
                      <td style={{ color: '#475569' }}>{isAr ? 'المواعيد والمتابعة' : 'Appointments'}</td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ marginTop: '14px' }}>
                  <button type="button" className="btn-hours-action" onClick={handleAddStaff}>
                    + {isAr ? 'إضافة موظف مصرح له جديد' : 'Add new staff member'}
                  </button>
                </div>
              </div>

              <div className="settings-card-exact">
                <div className="card-head-row">
                  <div>
                    <h3 className="card-title-exact">{isAr ? 'حق الحذف ومحو السجلات (الامتثال)' : 'Right to Erasure & Audit'}</h3>
                    <p className="card-desc-exact">
                      {isAr ? 'تلبية طلبات المراجعين بمسح بياناتهم الصوتية نهائياً' : 'Patient data deletion compliance'}
                    </p>
                  </div>
                  <div className="card-head-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D7C66" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </div>
                </div>

                <div className="form-group-exact">
                  <label className="form-label-exact">{isAr ? 'طلب حذف بيانات مراجع (الحق في النسيان):' : 'Patient Erasure Request:'}</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-input-exact"
                      placeholder={isAr ? 'أدخل رقم جوال المريض أو هويته' : 'Enter mobile or National ID'}
                      value={erasureValue}
                      onChange={(e) => setErasureValue(e.target.value)}
                    />
                    <button type="button" className="btn btn-outline" style={{ whiteSpace: 'nowrap' }} onClick={handleErasure}>
                      {isAr ? 'مسح وحجب نهائي' : 'Purge Records'}
                    </button>
                  </div>
                </div>

                <div className="form-footer-actions">
                  <button type="button" className="btn btn-outline" onClick={() => showToast(isAr ? 'تم تصدير سجل الامتثال' : 'Exported audit log')}>
                    {isAr ? 'تصدير تقرير الامتثال PDF' : 'Export PDF Audit'}
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleSave}>
                    {isAr ? 'حفظ السياسات ✓' : 'Save Policies ✓'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="qa-toast" style={{ display: toastVisible ? 'flex' : 'none' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>{toastMsg}</span>
      </div>
    </div>
  );
}
