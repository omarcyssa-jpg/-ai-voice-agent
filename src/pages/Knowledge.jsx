import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { knowledgeService } from '../services/supabase';

const DEFAULT_FAQS = [
  {
    id: 1,
    questionAr: "ما هي أوقات عمل عيادات عافية وموقعكم؟",
    answerAr: "تستقبلكم عيادات عافية فرع الرياض من السبت إلى الخميس من 8:00 صباحاً حتى 10:00 مساءً، والجمعة من 4:00 عصراً حتى 9:00 مساءً. موقعنا: طريق الملك فهد - حي العليا.",
    questionEn: "What are Afiya Clinics operating hours and location?",
    answerEn: "Afiya Clinics Riyadh branch is open Saturday to Thursday from 8:00 AM to 10:00 PM, and Friday from 4:00 PM to 9:00 PM. Location: King Fahd Rd, Al-Olayya, Riyadh.",
    category: "مواعيد العمل",
    categoryEn: "Operations",
    enabled: true
  },
  {
    id: 2,
    questionAr: "ما هي شركات التأمين الطبي المعتمدة لديكم؟",
    answerAr: "نعتمد بوبا العربية، التعاونية، ميدغلف، ملاذ، والراجحي تكافل، مع موافقة فورية وتغطية مباشرة للوثائق المعتمدة.",
    questionEn: "Which medical insurance providers are approved?",
    answerEn: "We accept Bupa Arabia, Tawuniya, Medgulf, Malath, and Al-Rajhi Takaful with immediate digital approvals.",
    category: "التأمين",
    categoryEn: "Insurance",
    enabled: true
  },
  {
    id: 3,
    questionAr: "هل يستطيع المساعد الصوتي حجز موعد عاجل في نفس اليوم؟",
    answerAr: "نعم، يرتبط المساعد الصوتي مباشرة بجدول مواعيد الأطباء ويؤكد الحجوزات الفورية في حال توفر خانات شاغرة، مع إرسال تأكيد SMS فوري.",
    questionEn: "Can the AI voice assistant book same-day appointments?",
    answerEn: "Yes, the AI voice assistant connects to real-time clinician schedules and can book urgent same-day slots with instant SMS confirmation.",
    category: "الحجوزات",
    categoryEn: "Appointments",
    enabled: true
  },
  {
    id: 4,
    questionAr: "ما هي باقات وخدمات عيادات الأسنان المتوفرة؟",
    answerAr: "نقدم في قسم الأسنان: كشف وتنظيف الأسنان الدوري، علاج العصب، زراعة الأسنان الألمانية والسويسرية، تقويم الأسنان الشفاف والتقليدي، وتبييض الأسنان بالليزر وقوالب الزيركون.",
    questionEn: "What dental services and packages are available?",
    answerEn: "We provide comprehensive dental care including routine checkups, root canal, German & Swiss dental implants, clear aligners, and laser teeth whitening.",
    category: "الخدمات والعيادات",
    categoryEn: "Services",
    enabled: true
  },
  {
    id: 5,
    questionAr: "ما هي خدمات عيادة الجلدية والتجميل والليزر؟",
    answerAr: "تتوفر جلسات إزالة الشعر بالليزر بأحدث أجهزة دويتو وجنتل ليز، جلسات نضارة الهايدرافيشل، حقن الفيلر والبوتوكس، والتقشير الكربوني وعلاج التصبغات.",
    questionEn: "What dermatology and laser aesthetics services do you offer?",
    answerEn: "We offer laser hair removal with Duetto & GentleLase, HydraFacial sessions, Botox & fillers, carbon laser peeling, and hyperpigmentation treatment.",
    category: "الخدمات والعيادات",
    categoryEn: "Services",
    enabled: true
  },
  {
    id: 6,
    questionAr: "ما هي سياسة إلغاء أو إعادة جدولة المواعيد؟",
    answerAr: "يمكن إلغاء أو تعديل الموعد عبر المساعد الصوتي أو الاستقبال حتى ساعتين قبل الموعد المحدد بدون أي رسوم إلغاء.",
    questionEn: "What is your cancellation and rescheduling policy?",
    answerEn: "Appointments can be rescheduled or cancelled via the AI agent or reception up to 2 hours before the scheduled time with zero fees.",
    category: "السياسات",
    categoryEn: "Policies",
    enabled: true
  }
];

function mapRowToFaq(row) {
  return {
    id: row.id,
    questionAr: row.question_ar || '',
    answerAr: row.answer_ar || '',
    questionEn: row.question_en || '',
    answerEn: row.answer_en || '',
    category: row.category || 'مواعيد العمل',
    categoryEn: row.category_en || 'Operations',
    enabled: row.enabled !== false,
  };
}

export default function Knowledge({ onNavigate }) {
  const { isAr, t } = useLanguage();

  const [faqs, setFaqs] = useState(() => {
    try {
      const saved = localStorage.getItem('afiya_faqs_v2');
      return saved ? JSON.parse(saved) : DEFAULT_FAQS;
    } catch {
      return DEFAULT_FAQS;
    }
  });

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  const [qAr, setQAr] = useState('');
  const [aAr, setAAr] = useState('');
  const [qEn, setQEn] = useState('');
  const [aEn, setAEn] = useState('');
  const [cat, setCat] = useState('مواعيد العمل');

  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef(null);

  useEffect(() => {
    document.title = isAr
      ? 'إدارة قاعدة المعرفة والخدمات — عيادات عافية'
      : 'Knowledge Base & Services — Afiya Clinics';
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

  const saveFaqsToStorage = (updated) => {
    setFaqs(updated);
    try {
      localStorage.setItem('afiya_faqs_v2', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const loadFaqsFromSupabase = useCallback(async (isManual = false) => {
    setIsSyncing(true);
    try {
      const res = await knowledgeService.getFaqs();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const liveFaqs = res.data.map(mapRowToFaq);
        saveFaqsToStorage(liveFaqs);
        setIsCloudSynced(true);
        if (isManual) {
          showToast(isAr ? `تمت المزامنة بنجاح! (${liveFaqs.length} سؤال وخدمة مسجلة)` : `Synced ${liveFaqs.length} entries from Supabase!`);
        }
      } else {
        setIsCloudSynced(false);
        if (isManual) {
          showToast(isAr ? 'تم الاتصال، لم يتم العثور على سجلات جديدة في السحابة.' : 'No rows found in Supabase.');
        }
      }
    } catch (e) {
      setIsCloudSynced(false);
      if (isManual) {
        showToast(isAr ? 'تعذر الاتصال بالسحابة، تم الحفاظ على البيانات المحلية.' : 'Failed to reach Supabase.');
      }
    } finally {
      setIsSyncing(false);
    }
  }, [isAr]);

  useEffect(() => {
    loadFaqsFromSupabase(false);
  }, [loadFaqsFromSupabase]);

  const openAddModal = () => {
    setEditingFaq(null);
    setQAr('');
    setAAr('');
    setQEn('');
    setAEn('');
    setCat('الخدمات والعيادات');
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingFaq(item);
    setQAr(item.questionAr);
    setAAr(item.answerAr);
    setQEn(item.questionEn);
    setAEn(item.answerEn);
    setCat(item.category);
    setModalOpen(true);
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!qAr.trim() || !aAr.trim()) {
      alert(isAr ? 'فضلاً أدخل السؤال والإجابة المعتمدة بالعربية على الأقل' : 'Please provide Arabic question and answer');
      return;
    }

    if (editingFaq) {
      const updated = faqs.map((f) =>
        f.id === editingFaq.id
          ? {
              ...f,
              questionAr: qAr,
              answerAr: aAr,
              questionEn: qEn || qAr,
              answerEn: aEn || aAr,
              category: cat,
            }
          : f
      );
      saveFaqsToStorage(updated);
      showToast(isAr ? 'تم تعديل الإجابة المعتمدة وحفظها!' : 'FAQ entry updated!');

      try {
        await knowledgeService.updateFaq(editingFaq.id, {
          questionAr: qAr,
          answerAr: aAr,
          questionEn: qEn || qAr,
          answerEn: aEn || aAr,
          category: cat
        });
      } catch (err) {
        console.warn('Supabase update failed:', err);
      }
    } else {
      const tempId = Date.now();
      const newFaq = {
        id: tempId,
        questionAr: qAr,
        answerAr: aAr,
        questionEn: qEn || qAr,
        answerEn: aEn || aAr,
        category: cat,
        enabled: true,
      };
      const updated = [newFaq, ...faqs];
      saveFaqsToStorage(updated);
      showToast(isAr ? 'تمت إضافة الإجابة وحفظها في قاعدة المعرفة!' : 'New approved answer added!');

      try {
        const res = await knowledgeService.createFaq(newFaq);
        if (res.success && Array.isArray(res.data) && res.data[0]?.id) {
          const realId = res.data[0].id;
          saveFaqsToStorage(updated.map(f => f.id === tempId ? { ...f, id: realId } : f));
        }
      } catch (err) {
        console.warn('Supabase insert failed:', err);
      }
    }
    setModalOpen(false);
  };

  const toggleStatus = async (id) => {
    const item = faqs.find((f) => f.id === id);
    if (!item) return;
    const newStatus = !item.enabled;

    const updated = faqs.map((f) =>
      f.id === id ? { ...f, enabled: newStatus } : f
    );
    saveFaqsToStorage(updated);

    showToast(
      isAr
        ? `تم ${newStatus ? 'تفعيل' : 'تعطيل'} الإجابة في المساعد الصوتي`
        : `Answer ${newStatus ? 'enabled' : 'disabled'}`
    );

    try {
      await knowledgeService.updateFaq(id, { enabled: newStatus });
    } catch (e) {
      console.warn('Supabase toggle failed:', e);
    }
  };

  const handleDelete = async (id) => {
    if (confirm(isAr ? 'هل أنت متأكد من حذف هذه الإجابة المعتمدة من قاعدة المعرفة؟' : 'Are you sure you want to delete this FAQ?')) {
      const updated = faqs.filter((f) => f.id !== id);
      saveFaqsToStorage(updated);
      showToast(isAr ? 'تم حذف السؤال من قاعدة المعرفة' : 'FAQ deleted');

      try {
        await knowledgeService.deleteFaq(id);
      } catch (e) {
        console.warn('Supabase delete failed:', e);
      }
    }
  };

  const categories = ['All', 'مواعيد العمل', 'الخدمات والعيادات', 'التأمين', 'الحجوزات', 'السياسات'];

  const filteredFaqs = faqs.filter((f) => {
    const matchesCat = activeTab === 'All' || f.category === activeTab;
    const s = search.toLowerCase().trim();
    if (!s) return matchesCat;

    const matchesSearch =
      f.questionAr?.toLowerCase().includes(s) ||
      f.answerAr?.toLowerCase().includes(s) ||
      f.questionEn?.toLowerCase().includes(s) ||
      f.answerEn?.toLowerCase().includes(s);

    return matchesCat && matchesSearch;
  });

  return (
    <div className="app-layout">
      <AdminSidebar activePath="/knowledge" onNavigate={onNavigate} />

      <main className="app-main">
        <AdminHeader onNavigate={onNavigate} />

        <div className="page-content-exact">
          <div className="overview-top-row">
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                className="btn-update-data"
                onClick={openAddModal}
                style={{ background: '#0D7C66', color: '#FFFFFF', borderColor: '#0D7C66' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>{isAr ? '+ إضافة إجابة أو خدمة جديدة' : '+ Add Answer / Service'}</span>
              </button>

              <button
                type="button"
                className="btn-update-data"
                onClick={() => loadFaqsFromSupabase(true)}
                disabled={isSyncing}
                title={isAr ? 'تحديث ومزامنة البيانات من قاعدة بيانات Supabase' : 'Sync from Supabase'}
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
            </div>

            <div className="overview-title-block">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: isAr ? 'flex-end' : 'flex-start' }}>
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
                  {isCloudSynced ? (isAr ? 'قاعدة البيانات متصلة' : 'Cloud Connected') : (isAr ? 'قيد المزامنة' : 'Local / Syncing')}
                </span>
                <h1 className="overview-heading" style={{ margin: 0 }}>
                  {isAr ? 'قاعدة المعرفة والخدمات المعتمدة' : 'Knowledge Base & Services'}
                </h1>
              </div>
              <p className="overview-subtext">
                {isAr
                  ? 'إدارة الأسئلة الشائعة والخدمات الطبية التي يستند عليها المساعد الصوتي لتقديم إجابات موثوقة ومطابقة لبيانات المنشأة.'
                  : 'Approved questions, clinical services and answers queried by the AI receptionist.'}
              </p>
            </div>
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
              className="sub-tab active"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/knowledge');
              }}
            >
              {isAr ? 'قاعدة المعرفة والخدمات' : 'Knowledge & Services'}
            </a>
          </div>

          <div className="tasks-main-card">
            <div className="tasks-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div className="kn-search-input-wrap" style={{ width: '320px' }}>
                <input
                  type="text"
                  placeholder={isAr ? 'بحث في الأسئلة أو الخدمات أو الأجوبة...' : 'Search answers, services...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <svg className="search-icon-right" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`tab-pill ${activeTab === c ? 'active' : ''}`}
                    onClick={() => setActiveTab(c)}
                  >
                    {c === 'All' ? (isAr ? 'كافة التصنيفات' : 'All Categories') : c}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filteredFaqs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                    {isAr ? 'لا توجد إجابات معتمدة مطابقة لخيارات البحث.' : 'No matching knowledge base entries.'}
                  </div>
                ) : (
                  filteredFaqs.map((item) => (
                    <div
                      key={item.id}
                      className="settings-card-exact"
                      style={{
                        marginBottom: 0,
                        padding: '18px 20px',
                        borderLeft: isAr ? 'none' : item.enabled ? '4px solid #0D7C66' : '4px solid #CBD5E1',
                        borderRight: isAr ? item.enabled ? '4px solid #0D7C66' : '4px solid #CBD5E1' : 'none',
                        opacity: item.enabled ? 1 : 0.65
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <strong style={{ fontSize: '15px', color: '#0F172A', display: 'block', marginBottom: '2px' }}>
                            {isAr ? item.questionAr : (item.questionEn || item.questionAr)}
                          </strong>
                          {isAr && item.questionEn && (
                            <small style={{ color: '#64748B', display: 'block' }}>{item.questionEn}</small>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className="cat-tag-pill">{item.category}</span>

                          <label className="toggle-switch" title={item.enabled ? 'Enabled' : 'Disabled'}>
                            <input
                              type="checkbox"
                              checked={item.enabled}
                              onChange={() => toggleStatus(item.id)}
                            />
                            <span className="toggle-slider"></span>
                          </label>

                          <button
                            type="button"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0D7C66', fontWeight: 600, fontSize: '12.5px' }}
                            onClick={() => openEditModal(item)}
                          >
                            ✎ {isAr ? 'تعديل' : 'Edit'}
                          </button>

                          <button
                            type="button"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontWeight: 600, fontSize: '12.5px' }}
                            onClick={() => handleDelete(item.id)}
                          >
                            🗑 {isAr ? 'حذف' : 'Delete'}
                          </button>
                        </div>
                      </div>

                      <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6, margin: '6px 0 0' }}>
                        {isAr ? item.answerAr : (item.answerEn || item.answerAr)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {modalOpen && (
        <div className="drawer-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setModalOpen(false)}>
          <div
            className="settings-card-exact"
            style={{ width: '90%', maxWidth: '580px', margin: 0, padding: '24px', background: '#FFFFFF', borderRadius: '16px', zIndex: 1100 }}
            onClick={(e) => e.stopPropagation()}
            dir={isAr ? 'rtl' : 'ltr'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#0F172A' }}>
                {editingFaq
                  ? (isAr ? 'تعديل الإجابة أو الخدمة' : 'Edit Answer / Service')
                  : (isAr ? 'إضافة إجابة أو خدمة معتمدة جديدة' : 'Add New Answer / Service')}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748B' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  {isAr ? 'السؤال أو اسم الخدمة بالعربية:' : 'Question or Service in Arabic:'}
                </label>
                <input
                  type="text"
                  className="form-input-exact"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  value={qAr}
                  onChange={(e) => setQAr(e.target.value)}
                  placeholder={isAr ? 'مثال: ما هي أوقات دوام عيادة الأسنان؟ أو خدمات الليزر' : 'e.g. What are dental clinic hours?'}
                  required
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  {isAr ? 'الإجابة المعتمدة أو تفاصيل الخدمة بالعربية:' : 'Approved Answer / Service Details in Arabic:'}
                </label>
                <textarea
                  className="form-input-exact"
                  rows={3}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  value={aAr}
                  onChange={(e) => setAAr(e.target.value)}
                  placeholder={isAr ? 'الإجابة الدقيقة والصريحة التي ينطق بها المساعد الصوتي للمراجع...' : 'Approved response string...'}
                  required
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  {isAr ? 'السؤال بالإنجليزية (اختياري):' : 'Question in English:'}
                </label>
                <input
                  type="text"
                  className="form-input-exact"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  value={qEn}
                  onChange={(e) => setQEn(e.target.value)}
                  placeholder="e.g. Do you accept Bupa insurance?"
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  {isAr ? 'الإجابة بالإنجليزية:' : 'Answer in English:'}
                </label>
                <textarea
                  className="form-input-exact"
                  rows={2}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  value={aEn}
                  onChange={(e) => setAEn(e.target.value)}
                  placeholder="English answer string..."
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  {isAr ? 'التصنيف:' : 'Category:'}
                </label>
                <select
                  className="form-input-exact"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  value={cat}
                  onChange={(e) => setCat(e.target.value)}
                >
                  <option value="الخدمات والعيادات">{isAr ? 'الخدمات والعيادات' : 'Services & Clinics'}</option>
                  <option value="مواعيد العمل">{isAr ? 'مواعيد العمل' : 'Operations'}</option>
                  <option value="التأمين">{isAr ? 'التأمين الطبي' : 'Insurance'}</option>
                  <option value="الحجوزات">{isAr ? 'الحجوزات والأطباء' : 'Appointments'}</option>
                  <option value="السياسات">{isAr ? 'السياسات والأسعار' : 'Policies'}</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                  onClick={() => setModalOpen(false)}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  style={{ background: '#0D7C66', color: '#FFFFFF', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {isAr ? 'حفظ وتطبيق في المساعد الصوتي' : 'Save & Publish to Voice AI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="qa-toast" style={{ display: toastVisible ? 'flex' : 'none' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>{toastMsg}</span>
      </div>
    </div>
  );
}
