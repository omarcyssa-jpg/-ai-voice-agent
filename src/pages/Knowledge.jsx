import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

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
    questionAr: "ما هي سياسة إلغاء أو إعادة جدولة المواعيد؟",
    answerAr: "يمكن إلغاء أو تعديل الموعد عبر المساعد الصوتي أو الاستقبال حتى ساعتين قبل الموعد المحدد بدون أي رسوم إلغاء.",
    questionEn: "What is your cancellation and rescheduling policy?",
    answerEn: "Appointments can be rescheduled or cancelled via the AI agent or reception up to 2 hours before the scheduled time with zero fees.",
    category: "السياسات",
    categoryEn: "Policies",
    enabled: true
  }
];

export default function Knowledge({ onNavigate }) {
  const { isAr, t } = useLanguage();

  const [faqs, setFaqs] = useState(() => {
    try {
      const saved = localStorage.getItem('afiya_faqs');
      return saved ? JSON.parse(saved) : DEFAULT_FAQS;
    } catch {
      return DEFAULT_FAQS;
    }
  });

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);

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
      ? 'إدارة قاعدة المعرفة والأجوبة المعتمدة — عيادات عافية'
      : 'Knowledge Base — Afiya Clinics';
    document.body.classList.remove('login-body');
    document.body.classList.add('app-body');
    return () => clearTimeout(toastTimer.current);
  }, [isAr]);

  const saveFaqsToStorage = (updated) => {
    setFaqs(updated);
    try {
      localStorage.setItem('afiya_faqs', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 3000);
  };

  const openAddModal = () => {
    setEditingFaq(null);
    setQAr('');
    setAAr('');
    setQEn('');
    setAEn('');
    setCat(isAr ? 'مواعيد العمل' : 'Operations');
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

  const handleSaveModal = (e) => {
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
      showToast(isAr ? 'تم تعديل الإجابة المعتمدة بنجاح!' : 'FAQ entry updated successfully!');
    } else {
      const newFaq = {
        id: Date.now(),
        questionAr: qAr,
        answerAr: aAr,
        questionEn: qEn || qAr,
        answerEn: aEn || aAr,
        category: cat,
        enabled: true,
      };
      const updated = [newFaq, ...faqs];
      saveFaqsToStorage(updated);
      showToast(isAr ? 'تمت إضافة الإجابة المعتمدة بنجاح!' : 'New approved answer added!');
    }
    setModalOpen(false);
  };

  const toggleStatus = (id) => {
    const updated = faqs.map((f) =>
      f.id === id ? { ...f, enabled: !f.enabled } : f
    );
    saveFaqsToStorage(updated);
    const item = updated.find((f) => f.id === id);
    showToast(
      isAr
        ? `تم ${item.enabled ? 'تفعيل' : 'تعطيل'} الإجابة في المساعد الصوتي`
        : `Answer ${item.enabled ? 'enabled' : 'disabled'}`
    );
  };

  const handleDelete = (id) => {
    if (confirm(isAr ? 'هل أنت متأكد من حذف هذه الإجابة المعتمدة؟' : 'Are you sure you want to delete this FAQ?')) {
      const updated = faqs.filter((f) => f.id !== id);
      saveFaqsToStorage(updated);
      showToast(isAr ? 'تم حذف السؤال من قاعدة المعرفة' : 'FAQ deleted');
    }
  };

  const categories = ['All', 'مواعيد العمل', 'التأمين', 'الحجوزات', 'السياسات'];

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
              <span>{isAr ? '+ إضافة إجابة معتمدة جديدة' : '+ Add Approved Answer'}</span>
            </button>

            <div className="overview-title-block">
              <h1 className="overview-heading">
                {isAr ? 'قاعدة المعرفة والأجوبة المعتمدة' : 'AI Knowledge Base Management'}
              </h1>
              <p className="overview-subtext">
                {isAr
                  ? 'إدارة الأسئلة والإجابات المعتمدة رسمياً التي يستند عليها المساعد الصوتي لتقديم معلومات دقيقة وموثوقة للمراجعين.'
                  : 'Approved answers queried by the AI receptionist with strict factual accuracy.'}
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
              {isAr ? 'قاعدة المعرفة' : 'FAQs'}
            </a>
          </div>

          <div className="tasks-main-card">
            <div className="tasks-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div className="kn-search-input-wrap" style={{ width: '320px' }}>
                <input
                  type="text"
                  placeholder={isAr ? 'بحث في الأسئلة أو الأجوبة المعتمدة...' : 'Search approved answers...'}
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
                            {isAr ? item.questionAr : item.questionEn}
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
                        {isAr ? item.answerAr : item.answerEn}
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
                  ? (isAr ? 'تعديل الإجابة المعتمدة' : 'Edit Approved Answer')
                  : (isAr ? 'إضافة إجابة معتمدة جديدة' : 'Add New Approved Answer')}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748B' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  {isAr ? 'السؤال بالعربية:' : 'Question in Arabic:'}
                </label>
                <input
                  type="text"
                  className="form-input-exact"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  value={qAr}
                  onChange={(e) => setQAr(e.target.value)}
                  placeholder={isAr ? 'مثال: ما هي أوقات دوام عيادة الأسنان؟' : 'e.g. What are dental clinic hours?'}
                  required
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  {isAr ? 'الإجابة المعتمدة للذكاء الاصطناعي بالعربية:' : 'Approved Answer in Arabic:'}
                </label>
                <textarea
                  className="form-input-exact"
                  rows={3}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  value={aAr}
                  onChange={(e) => setAAr(e.target.value)}
                  placeholder={isAr ? 'الإجابة الدقيقة والصريحة التي ينطق بها المساعد...' : 'Approved response string...'}
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
                  {isAr ? 'حفظ وتطبيق في الذكاء الاصطناعي' : 'Save & Publish to AI'}
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
