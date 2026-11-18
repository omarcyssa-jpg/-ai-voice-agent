import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { clinicSettingsService } from '../services/supabase';

const timeSlots = [
  '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM',
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM',
  '09:00 PM', '09:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM',
];

const defaultSchedule = [
  { id: 'sat', dayAr: 'السبت', dayEn: 'Saturday', open: '09:00 AM', close: '09:00 PM', isOpen: true },
  { id: 'sun', dayAr: 'الأحد', dayEn: 'Sunday', open: '09:00 AM', close: '09:00 PM', isOpen: true },
  { id: 'mon', dayAr: 'الاثنين', dayEn: 'Monday', open: '09:00 AM', close: '09:00 PM', isOpen: true },
  { id: 'tue', dayAr: 'الثلاثاء', dayEn: 'Tuesday', open: '09:00 AM', close: '09:00 PM', isOpen: true },
  { id: 'wed', dayAr: 'الأربعاء', dayEn: 'Wednesday', open: '09:00 AM', close: '09:00 PM', isOpen: true },
  { id: 'thu', dayAr: 'الخميس', dayEn: 'Thursday', open: '09:00 AM', close: '09:00 PM', isOpen: true },
  { id: 'fri', dayAr: 'الجمعة', dayEn: 'Friday', open: '04:00 PM', close: '09:00 PM', isOpen: false },
];

function loadSchedule() {
  try {
    const saved = localStorage.getItem('afiya_schedule_v2');
    return saved ? JSON.parse(saved) : defaultSchedule;
  } catch {
    return defaultSchedule;
  }
}

export default function Organization({ onNavigate }) {
  const { isAr, t } = useLanguage();
  const [schedule, setSchedule] = useState(loadSchedule);
  const [clinicNameAr, setClinicNameAr] = useState(() => localStorage.getItem('afiya_clinic_name_ar') || 'عيادات عافية - فرع الرياض');
  const [clinicNameEn, setClinicNameEn] = useState(() => localStorage.getItem('afiya_clinic_name_en') || 'Afiya Clinics - Riyadh Branch');
  const [addressAr, setAddressAr] = useState(() => localStorage.getItem('afiya_address_ar') || 'طريق الملك فهد - حي العليا، الرياض');
  const [addressEn, setAddressEn] = useState(() => localStorage.getItem('afiya_address_en') || 'King Fahd Rd, Al-Olayya, Riyadh');
  const [primaryPhone, setPrimaryPhone] = useState(() => localStorage.getItem('afiya_primary_phone') || '011 234 5678');
  const [backupPhone, setBackupPhone] = useState(() => localStorage.getItem('afiya_backup_phone') || '');
  const [welcomeEn, setWelcomeEn] = useState(() => localStorage.getItem('afiya_welcome_en') || "Hello, I'm Afiya's assistant. How can I help you today?");
  const [welcomeAr, setWelcomeAr] = useState(() => localStorage.getItem('afiya_welcome_ar') || "أهلاً بك في عيادات عافية، معك المساعد الصوتي. كيف أقدر أساعدك اليوم؟");
  const [emergencyEn, setEmergencyEn] = useState(() => localStorage.getItem('afiya_emergency_en') || "For a medical emergency, contact local emergency services immediately (997) or go to the nearest emergency department. This assistant does not provide diagnosis or treatment.");
  const [emergencyAr, setEmergencyAr] = useState(() => localStorage.getItem('afiya_emergency_ar') || "في الحالات الطارئة، يرجى الاتصال بالإسعاف فوراً (997) أو التوجه لأقرب طوارئ. المساعد الصوتي مخصص للخدمات الإدارية وحجز المواعيد فقط ولا يقدم تشخيصاً طبياً.");

  const [isSyncing, setIsSyncing] = useState(false);
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef(null);

  useEffect(() => {
    document.title = isAr
      ? 'إعدادات المنشأة وساعات العمل — عيادات عافية'
      : 'Organization Settings — Afiya Clinics';
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

  const loadSettingsFromSupabase = useCallback(async (isManual = false) => {
    setIsSyncing(true);
    try {
      const res = await clinicSettingsService.getSettings();
      if (res.success && res.data) {
        const d = res.data;
        if (d.clinicNameAr) setClinicNameAr(d.clinicNameAr);
        if (d.clinicNameEn) setClinicNameEn(d.clinicNameEn);
        if (d.addressAr) setAddressAr(d.addressAr);
        if (d.addressEn) setAddressEn(d.addressEn);
        if (d.primaryPhone) setPrimaryPhone(d.primaryPhone);
        if (d.backupPhone !== undefined) setBackupPhone(d.backupPhone);
        if (d.welcomeAr) setWelcomeAr(d.welcomeAr);
        if (d.welcomeEn) setWelcomeEn(d.welcomeEn);
        if (d.emergencyAr) setEmergencyAr(d.emergencyAr);
        if (d.emergencyEn) setEmergencyEn(d.emergencyEn);
        if (Array.isArray(d.schedule) && d.schedule.length > 0) {
          setSchedule(d.schedule);
          localStorage.setItem('afiya_schedule_v2', JSON.stringify(d.schedule));
        }

        setIsCloudSynced(true);
        if (isManual) {
          showToast(isAr ? 'تم جلب وتحديث بيانات المنشأة ومواعيد العمل من السحابة بنجاح!' : 'Clinic settings synced from Supabase!');
        }
      } else {
        setIsCloudSynced(false);
        if (isManual) {
          showToast(isAr ? 'لم يتم العثور على سجل مسبق، تم الحفاظ على الإعدادات المحلية.' : 'No settings in cloud.');
        }
      }
    } catch (e) {
      setIsCloudSynced(false);
      if (isManual) {
        showToast(isAr ? 'تعذر الاتصال بالسحابة.' : 'Cloud connection failed.');
      }
    } finally {
      setIsSyncing(false);
    }
  }, [isAr]);

  useEffect(() => {
    loadSettingsFromSupabase(false);
  }, [loadSettingsFromSupabase]);

  const updateDay = (index, changes) => {
    setSchedule((prev) => prev.map((d, i) => (i === index ? { ...d, ...changes } : d)));
  };

  const handleCopyWeekdays = () => {
    setSchedule((prev) => {
      const sat = prev[0];
      return prev.map((d, i) => (i >= 1 && i <= 5 ? { ...d, open: sat.open, close: sat.close, isOpen: sat.isOpen } : d));
    });
    showToast(isAr ? 'تم نسخ مواعيد يوم السبت لباقي أيام الأسبوع' : 'Saturday hours copied to Sun–Thu');
  };

  const handleResetDefaults = () => {
    setSchedule(defaultSchedule);
    showToast(isAr ? 'تمت استعادة المواعيد الافتراضية للعيادة' : 'Reset to default clinic hours');
  };

  const handleSave = async () => {
    try {
      localStorage.setItem('afiya_schedule_v2', JSON.stringify(schedule));
      localStorage.setItem('afiya_clinic_name_ar', clinicNameAr);
      localStorage.setItem('afiya_clinic_name_en', clinicNameEn);
      localStorage.setItem('afiya_address_ar', addressAr);
      localStorage.setItem('afiya_address_en', addressEn);
      localStorage.setItem('afiya_primary_phone', primaryPhone);
      localStorage.setItem('afiya_backup_phone', backupPhone);
      localStorage.setItem('afiya_welcome_en', welcomeEn);
      localStorage.setItem('afiya_welcome_ar', welcomeAr);
      localStorage.setItem('afiya_emergency_en', emergencyEn);
      localStorage.setItem('afiya_emergency_ar', emergencyAr);

      showToast(isAr ? 'جاري حفظ البيانات في قاعدة بيانات Supabase...' : 'Saving to Supabase...');

      const payload = {
        clinicNameAr,
        clinicNameEn,
        primaryPhone,
        backupPhone,
        addressAr,
        addressEn,
        welcomeAr,
        welcomeEn,
        emergencyAr,
        emergencyEn,
        schedule
      };

      const res = await clinicSettingsService.saveSettings(payload);

      if (res.success) {
        setIsCloudSynced(true);
        showToast(isAr ? 'تم حفظ ومزامنة إعدادات المنشأة وساعات العمل بنجاح!' : 'Clinic settings saved & synced to Supabase!');
      } else {
        showToast(isAr ? 'تم الحفظ محلياً (تنبيه في مزامنة السحابة)' : 'Saved locally');
      }
    } catch (e) {
      console.error(e);
      showToast(isAr ? 'تم الحفظ محلياً' : 'Saved locally');
    }
  };

  const handleCancel = () => {
    setSchedule(loadSchedule());
    showToast(isAr ? 'تم إلغاء التعديلات غير المحفوظة' : 'Changes cancelled');
  };

  return (
    <div className="app-layout">
      <AdminSidebar activePath="/organization" onNavigate={onNavigate} />

      <main className="app-main">
        <AdminHeader onNavigate={onNavigate} />

        <div className="page-content-exact">
          <div className="org-head-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="breadcrumb-mini" style={{ margin: 0 }}>
                  {isAr ? 'فرع الرياض · إدارة العمليات والمنشأة' : 'Riyadh Branch · Operations'}
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '20px',
                    background: isCloudSynced ? '#DCFCE7' : '#FEF3C7',
                    color: isCloudSynced ? '#15803D' : '#B45309'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isCloudSynced ? '#16A34A' : '#D97706' }}></span>
                  {isCloudSynced ? (isAr ? 'متزامن مع السحابة' : 'Cloud Synced') : (isAr ? 'محلي / غير متزامن' : 'Local')}
                </span>
              </div>
              <h1 className="overview-heading">{isAr ? 'إعدادات المنشأة وساعات العمل والبيانات' : 'Organization Settings & Working Hours'}</h1>
              <p className="overview-subtext">
                {isAr
                  ? 'إدارة مواعيد دوام العيادات، أرقام التواصل والتحويل، ورسائل الاستقبال والطوارئ المعتمدة للمساعد الصوتي.'
                  : 'Manage operating hours, contact numbers, and approved reception & emergency messages.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                className="btn-update-data"
                onClick={() => loadSettingsFromSupabase(true)}
                disabled={isSyncing}
                title={isAr ? 'تحديث ومزامنة الإعدادات من Supabase' : 'Sync settings from Supabase'}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }}
                >
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-1.42"></path>
                </svg>
                <span>{isSyncing ? (isAr ? 'جاري المزامنة...' : 'Syncing...') : (isAr ? 'مزامنة مع السحابة' : 'Sync Cloud')}</span>
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}
              >
                {isAr ? 'حفظ التعديلات ✓' : 'Save Changes ✓'}
              </button>
            </div>
          </div>

          <div className="sub-nav-tabs">
            <a
              href="/organization"
              className="sub-tab active"
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
              className="sub-tab"
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
              {isAr ? 'قاعدة المعرفة والخدمات' : 'Knowledge & Services'}
            </a>
          </div>

          <div className="org-two-col-grid">
            <div className="org-col">
              {/* بطاقة بيانات المنشأة الأساسية */}
              <div className="settings-card-exact">
                <div className="card-head-row">
                  <div>
                    <h3 className="card-title-exact">{isAr ? 'بيانات وهوية المنشأة' : 'Clinic Profile & Identity'}</h3>
                    <p className="card-desc-exact">
                      {isAr ? 'اسم المنشأة المعتمد والعنوان الجغرافي الذي يستخدمه المساعد الصوتي في إرشاد المراجعين' : 'Official clinic name and physical location'}
                    </p>
                  </div>
                  <div className="card-head-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D7C66" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                  </div>
                </div>

                <div className="form-group-exact">
                  <label className="form-label-exact">{isAr ? 'اسم المنشأة بالعربية:' : 'Clinic Name (Arabic):'}</label>
                  <input
                    type="text"
                    className="form-input-exact"
                    value={clinicNameAr}
                    onChange={(e) => setClinicNameAr(e.target.value)}
                  />
                </div>

                <div className="form-group-exact">
                  <label className="form-label-exact">{isAr ? 'اسم المنشأة بالإنجليزية:' : 'Clinic Name (English):'}</label>
                  <input
                    type="text"
                    className="form-input-exact"
                    value={clinicNameEn}
                    onChange={(e) => setClinicNameEn(e.target.value)}
                  />
                </div>

                <div className="form-group-exact">
                  <label className="form-label-exact">{isAr ? 'العنوان والموقع (بالعربية):' : 'Location Address (Arabic):'}</label>
                  <input
                    type="text"
                    className="form-input-exact"
                    value={addressAr}
                    onChange={(e) => setAddressAr(e.target.value)}
                  />
                </div>
              </div>

              {/* بطاقة ساعات دوام العيادات */}
              <div className="settings-card-exact">
                <div className="card-head-row">
                  <div>
                    <h3 className="card-title-exact">{isAr ? 'ساعات دوام العيادات' : 'Clinic Working Hours'}</h3>
                    <p className="card-desc-exact">
                      {isAr ? 'جدول المواعيد الأسبوعي الرسمي المعتمد في الرد الصوتي وحجز المواعيد' : 'Weekly operating schedule referenced by the voice assistant'}
                    </p>
                  </div>
                  <div className="card-head-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D7C66" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                </div>

                <div className="hours-quick-bar">
                  <button type="button" className="btn-hours-action" onClick={handleCopyWeekdays}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>{isAr ? 'نسخ ساعات السبت إلى الأحد–الخميس' : 'Copy Saturday to Sun–Thu'}</span>
                  </button>

                  <button type="button" className="btn-hours-action" onClick={handleResetDefaults}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="1 4 1 10 7 10"></polyline>
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                    </svg>
                    <span>{isAr ? 'الدوام القياسي (9 ص – 9 م)' : 'Standard Hours (9 AM – 9 PM)'}</span>
                  </button>
                </div>

                <div className="hours-table-wrap">
                  <div className="hours-header-row">
                    <span>{isAr ? 'الإغلاق' : 'Close'}</span>
                    <span>{isAr ? 'الافتتاح' : 'Open'}</span>
                    <span>{isAr ? 'اليوم / الحالة' : 'Day / Status'}</span>
                  </div>

                  <div>
                    {schedule.map((item, index) => (
                      <div key={item.id} className={`hours-day-row ${item.isOpen ? '' : 'is-closed'}`}>
                        <select
                          className="time-select close-select"
                          value={item.close}
                          onChange={(e) => updateDay(index, { close: e.target.value })}
                        >
                          {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>

                        <select
                          className="time-select open-select"
                          value={item.open}
                          onChange={(e) => updateDay(index, { open: e.target.value })}
                        >
                          {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>

                        <span className="closed-indicator">{isAr ? 'مغلق' : 'Closed'}</span>

                        <div className="day-toggle-cell">
                          <span style={{ fontWeight: 600 }}>{isAr ? item.dayAr : item.dayEn}</span>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={item.isOpen}
                              onChange={(e) => updateDay(index, { isOpen: e.target.checked })}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="hours-footnote">
                  {isAr
                    ? 'يستند المساعد الصوتي على هذا الجدول للإجابة الفورية وتحديد فترات العمل المتاحة.'
                    : 'The voice agent strictly uses these hours when answering customer queries.'}
                </div>
              </div>
            </div>

            <div className="org-col">
              {/* بطاقة أرقام الاتصال والتحويل */}
              <div className="settings-card-exact">
                <div className="card-head-row">
                  <div>
                    <h3 className="card-title-exact">{isAr ? 'أرقام الاتصال والتحويل المباشر' : 'Escalation Phone Numbers'}</h3>
                    <p className="card-desc-exact">
                      {isAr ? 'أرقام الاستقبال التي يحول إليها المساعد الصوتي عند طلب التحدث مع موظف' : 'Numbers used when callers request direct staff contact'}
                    </p>
                  </div>
                  <div className="card-head-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D7C66" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                </div>

                <div className="form-group-exact">
                  <label className="form-label-exact">{isAr ? 'هاتف الاستقبال المباشر:' : 'Primary Reception Line:'}</label>
                  <input
                    type="text"
                    className="form-input-exact"
                    value={primaryPhone}
                    onChange={(e) => setPrimaryPhone(e.target.value)}
                  />
                </div>

                <div className="form-group-exact">
                  <label className="form-label-exact">{isAr ? 'رقم الطوارئ أو المناوبة البديل (اختياري):' : 'Backup Contact Number (Optional):'}</label>
                  <input
                    type="text"
                    className="form-input-exact"
                    placeholder={isAr ? 'مثال: 0501234567' : 'e.g. 0501234567'}
                    value={backupPhone}
                    onChange={(e) => setBackupPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* بطاقة رسالة الترحيب الأولى */}
              <div className="settings-card-exact">
                <div className="card-head-row">
                  <div>
                    <h3 className="card-title-exact">{isAr ? 'رسالة الترحيب الأولى' : 'Welcome Message Script'}</h3>
                    <p className="card-desc-exact">
                      {isAr ? 'العبارة الافتتاحية التي يبدأ بها المساعد الصوتي عند استقبال المتصل' : 'Opening greeting voiced by the AI receptionist at call start'}
                    </p>
                  </div>
                  <div className="card-head-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D7C66" strokeWidth="2">
                      <path d="M12 2v20M17 5v14M7 8v8M2 11v2M22 11v2" />
                    </svg>
                  </div>
                </div>

                <div className="form-group-exact">
                  <label className="form-label-exact">{isAr ? 'النص باللغة العربية (الأساسي):' : 'Arabic Greeting (Primary):'}</label>
                  <textarea
                    className="form-input-exact"
                    rows={3}
                    dir="rtl"
                    value={welcomeAr}
                    onChange={(e) => setWelcomeAr(e.target.value)}
                  />
                </div>

                <div className="form-group-exact">
                  <label className="form-label-exact">{isAr ? 'النص باللغة الإنجليزية (البديل):' : 'English Greeting (Fallback):'}</label>
                  <textarea
                    className="form-input-exact"
                    rows={2}
                    value={welcomeEn}
                    onChange={(e) => setWelcomeEn(e.target.value)}
                  />
                </div>
              </div>

              {/* بطاقة رسالة الطوارئ وإخلاء المسؤولية */}
              <div className="settings-card-exact">
                <div className="card-head-row">
                  <div>
                    <h3 className="card-title-exact">{isAr ? 'رسالة الطوارئ وإخلاء المسؤولية' : 'Emergency Medical Disclaimer'}</h3>
                    <p className="card-desc-exact">
                      {isAr ? 'الرد الفوري الصارم عند ذكر أعراض حرجة كألم الصدر أو ضيق التنفس' : 'Immediate safeguard response triggered on acute symptoms'}
                    </p>
                  </div>
                  <div className="card-head-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                </div>

                <div className="emergency-banner-styled">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  <span>
                    {isAr
                      ? 'يمنع المساعد الصوتي منعاً باتاً من تقديم استشارات أو تشخيصات طبية ويحيل الحالات الحرجة للإسعاف.'
                      : 'The assistant is administrative only. Clinical emergencies are directed to local emergency services.'}
                  </span>
                </div>

                <div className="form-group-exact">
                  <label className="form-label-exact">{isAr ? 'نص التحذير وتوجيه الطوارئ (بالعربية):' : 'Emergency Directive (Arabic):'}</label>
                  <textarea
                    className="form-input-exact"
                    rows={3}
                    dir="rtl"
                    value={emergencyAr}
                    onChange={(e) => setEmergencyAr(e.target.value)}
                  />
                </div>

                <div className="form-group-exact">
                  <label className="form-label-exact">{isAr ? 'نص التحذير بالإنجليزية:' : 'Emergency Directive (English):'}</label>
                  <textarea
                    className="form-input-exact"
                    rows={2}
                    value={emergencyEn}
                    onChange={(e) => setEmergencyEn(e.target.value)}
                  />
                </div>

                <div className="form-footer-actions">
                  <button type="button" className="btn btn-outline" onClick={handleCancel}>
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleSave}>
                    {isAr ? 'حفظ التعديلات ✓' : 'Save Changes ✓'}
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
