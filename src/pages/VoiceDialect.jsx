import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

const VOICE_PERSONAS = [
  {
    id: 'sarah',
    nameAr: 'سارة (Sarah)',
    nameEn: 'Sarah',
    genderAr: 'نسائي',
    genderEn: 'Female',
    descAr: 'صوت سعودي طبيعي، دافئ، نبرة ترحيبية احترافية ومريحة للمراجعين.',
    descEn: 'Natural Saudi female tone, warm and welcoming, ideal for healthcare reception.',
    badgeAr: 'الموصى به للعيادة',
    badgeEn: 'Recommended'
  },
  {
    id: 'faisal',
    nameAr: 'فيصل (Faisal)',
    nameEn: 'Faisal',
    genderAr: 'رجالي',
    genderEn: 'Male',
    descAr: 'صوت رجالي وقور، هادئ ومتزن، ممتاز للمعلومات الإدارية والتأمين.',
    descEn: 'Calm and steady male voice, suitable for administrative clarity and insurance guidance.',
    badgeAr: 'رسمي',
    badgeEn: 'Formal'
  },
  {
    id: 'noura',
    nameAr: 'نورة (Noura)',
    nameEn: 'Noura',
    genderAr: 'نسائي',
    genderEn: 'Female',
    descAr: 'نبرة حيوية، لطيفة وسريعة البديهة، مناسبة للمواعيد وحجوزات الأسنان.',
    descEn: 'Energetic and empathetic tone, fast paced for quick appointment booking.',
    badgeAr: 'سريع التجاوب',
    badgeEn: 'Dynamic'
  },
  {
    id: 'sultan',
    nameAr: 'سلطان (Sultan)',
    nameEn: 'Sultan',
    genderAr: 'رجالي',
    genderEn: 'Male',
    descAr: 'نبرة عميقة ورزينة، تعطي طابعاً رسمياً وموثوقاً لخدمات الطوارئ والشكاوى.',
    descEn: 'Deep authoritative voice, ideal for escalation handling and official notifications.',
    badgeAr: 'وقور',
    badgeEn: 'Executive'
  },
  {
    id: 'reem',
    nameAr: 'ريم (Reem)',
    nameEn: 'Reem',
    genderAr: 'نسائي',
    genderEn: 'Female',
    descAr: 'نبرة هادئة ورقيقة، ممتازة لعيادات الأطفال، طب الأسرة والاستشارات العامة.',
    descEn: 'Gentle and soothing tone, ideal for pediatrics and family medicine.',
    badgeAr: 'لطيف',
    badgeEn: 'Gentle'
  },
  {
    id: 'abdulmohsen',
    nameAr: 'عبدالمحسن (Abdulmohsen)',
    nameEn: 'Abdulmohsen',
    genderAr: 'رجالي',
    genderEn: 'Male',
    descAr: 'صوت واثق ومتمكن، مناسب للعيادات التخصصية ومتابعة تقارير الفحوصات.',
    descEn: 'Confident and clear tone, suitable for specialty clinics and test results.',
    badgeAr: 'تخصصي',
    badgeEn: 'Specialist'
  }
];

const DIALECTS = [
  {
    id: 'najdi',
    titleAr: 'اللهجة النجدية (الرياض والمنطقة الوسطى)',
    titleEn: 'Najdi Dialect (Riyadh & Central Region)',
    descAr: 'تستخدم العبارات الشائعة مثل (يا هلا، أبشر، يسعدني أخدمك، سم طال عمرك) لتعزيز الألفة مع المراجعين.',
    descEn: 'Warm conversational phrasing suited for central Saudi patients.',
    sampleAr: 'أهلاً بك في عيادات عافية بالرياض، معك سارة. كيف أقدر أساعدك اليوم؟ أبشر نسجل لك الموعد الحين.',
    sampleEn: 'Welcome to Afiya Clinics Riyadh, this is Sarah. How can I help you today?'
  },
  {
    id: 'msa',
    titleAr: 'اللغة العربية الفصحى المعاصرة (Modern Standard Arabic)',
    titleEn: 'Modern Standard Arabic (MSA)',
    descAr: 'لغة عربية سليمة وواضحة بدون أي تحيز إقليمي، مثالية لكافة الجنسيات والمقيمين.',
    descEn: 'Clear and universally understood Arabic phrasing across all patient demographics.',
    sampleAr: 'مرحباً بكم في عيادات عافية. يسعدنا استقبال استفساراتكم وحجز مواعيدكم الطبية بكل يسر وسهولة.',
    sampleEn: 'Welcome to Afiya Clinics. We are pleased to assist with your medical inquiries and bookings.'
  },
  {
    id: 'hejazi',
    titleAr: 'اللهجة الحجازية (مكة، جدة والمنطقة الغربية)',
    titleEn: 'Hejazi Dialect (Western Region)',
    descAr: 'أسلوب ترحيبي عذب وألفاظ دافئة (يا هلا وسهلا، من عيوني، كيف نقدر نخدمك اليوم).',
    descEn: 'Friendly western Saudi expressions providing an approachable, polite greeting.',
    sampleAr: 'يا هلا وسهلا بكم في عيادات عافية. نورتنا والله، تفضل آمرني كيف أقدر أساعدك الحين؟',
    sampleEn: 'A warm welcome to Afiya Clinics. Please tell me how we can assist you right away.'
  },
  {
    id: 'gulf',
    titleAr: 'اللهجة الخليجية العامة (Gulf Regional Dialect)',
    titleEn: 'General Gulf Dialect',
    descAr: 'مصطلحات مشتركة ومفهومة على نطاق دول مجلس التعاون الخليجي.',
    descEn: 'Broad Gulf regional accent widely recognized across GCC callers.',
    sampleAr: 'مرحباً فيك بعيادات عافية. تفضل شو نقدر نخدمك فيه اليوم بخصوص مواعيد الأطباء؟',
    sampleEn: 'Welcome to Afiya Clinics. How may we assist you regarding doctor schedules today?'
  },
  {
    id: 'southern',
    titleAr: 'اللهجة الجنوبية (عسير، الباحة وجازان)',
    titleEn: 'Southern Saudi Dialect',
    descAr: 'مفردات أصيلة بأسلوب ترحيبي مضياف (مرحباً هيل، جعل ربي يسعدك، حاضرين لخدمتكم).',
    descEn: 'Traditional and warm southern hospitality phrasing.',
    sampleAr: 'مرحبا ألوف في عيادات عافية، سم أمرني وش تبي من خدمات ومواعيد وحنا بالخدمة.',
    sampleEn: 'A hearty welcome to Afiya Clinics, please let us know how we can serve your healthcare needs.'
  },
  {
    id: 'eastern',
    titleAr: 'اللهجة الشرقية (الدمام، الخبر والأحساء)',
    titleEn: 'Eastern Province Dialect',
    descAr: 'أسلوب هادئ ولطيف يجمع بين المفردات المحلية والخليجية المألوفة.',
    descEn: 'Calm and pleasant tone bridging eastern Saudi and Gulf vernacular.',
    sampleAr: 'يا هلا فيكم بعيادات عافية، حياكم الله. كيف نقدر نساعدك بترتيب موعدك اليوم؟',
    sampleEn: 'Welcome to Afiya Clinics, we are ready to coordinate your clinical appointments today.'
  }
];

export default function VoiceDialect({ onNavigate }) {
  const { isAr, t } = useLanguage();

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('afiya_voice_settings');
      return saved
        ? JSON.parse(saved)
        : {
            voiceId: 'sarah',
            dialectId: 'najdi',
            speed: '1.0',
            pitch: 'normal',
            strictness: 'strict',
            englishFallback: true,
            bargeIn: true
          };
    } catch {
      return {
        voiceId: 'sarah',
        dialectId: 'najdi',
        speed: '1.0',
        pitch: 'normal',
        strictness: 'strict',
        englishFallback: true,
        bargeIn: true
      };
    }
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef(null);

  useEffect(() => {
    document.title = isAr
      ? 'صوت ولهجة المساعد — عيادات عافية'
      : 'AI Voice & Dialect — Afiya Clinics';
    document.body.classList.remove('login-body');
    document.body.classList.add('app-body');
    return () => {
      clearTimeout(toastTimer.current);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isAr]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 3000);
  };

  const handleSave = () => {
    try {
      localStorage.setItem('afiya_voice_settings', JSON.stringify(settings));
      showToast(isAr ? 'تم حفظ إعدادات الصوت واللهجة بنجاح!' : 'Voice and dialect settings saved successfully!');
    } catch (e) {
      console.error(e);
    }
  };

  const playPreview = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (isPlaying) {
        setIsPlaying(false);
        return;
      }

      const currentDialect = DIALECTS.find((d) => d.id === settings.dialectId) || DIALECTS[0];
      const textToSpeak = isAr ? currentDialect.sampleAr : currentDialect.sampleEn;

      const utter = new SpeechSynthesisUtterance(textToSpeak);
      utter.lang = isAr ? 'ar-SA' : 'en-US';
      utter.rate = parseFloat(settings.speed) || 1.0;
      utter.pitch = settings.pitch === 'high' ? 1.2 : settings.pitch === 'low' ? 0.8 : 1.0;

      utter.onstart = () => setIsPlaying(true);
      utter.onend = () => setIsPlaying(false);
      utter.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utter);
    } else {
      showToast(isAr ? 'المتصفح لا يدعم محاكي النطق الصوتي المباشر' : 'Browser does not support audio synthesis');
    }
  };

  const currentDialectObj = DIALECTS.find((d) => d.id === settings.dialectId) || DIALECTS[0];

  return (
    <div className="app-layout">
      <AdminSidebar activePath="/voice" onNavigate={onNavigate} />

      <main className="app-main">
        <AdminHeader onNavigate={onNavigate} />

        <div className="page-content-exact">
          <div className="org-head-title-row">
            <span className="breadcrumb-mini">
              {isAr ? 'الإعدادات العامة · صوت ولهجة المساعد' : 'Settings · AI Speech & Tone'}
            </span>
            <h1 className="overview-heading">{isAr ? 'صوت ولهجة المساعد الذكي' : 'AI Voice & Dialect Configuration'}</h1>
            <p className="overview-subtext">
              {isAr
                ? 'تخصيص الهوية الصوتية لعيادات عافية، اختيار اللهجة الإقليمية المناسبة (لغة عربية فصحى أو لهجات سعودية وخليجية)، وضبط نبرة وسرعة التفاعل الصوتي.'
                : 'Configure persona voices, Saudi regional dialects, speech pacing, and factual guardrails.'}
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
              className="sub-tab active"
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
              {isAr ? 'قاعدة المعرفة' : 'FAQs'}
            </a>
          </div>

          <div className="org-two-col-grid">
            <div className="org-col">
              <div className="settings-card-exact">
                <div className="card-header-icon-row">
                  <div className="card-icon-pill">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D7C66" strokeWidth="2">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                      <line x1="12" y1="19" x2="12" y2="23"></line>
                      <line x1="8" y1="23" x2="16" y2="23"></line>
                    </svg>
                  </div>
                  <div>
                    <h3 className="card-main-title">{isAr ? 'الشخصيات الصوتية للمساعد' : 'Voice Personas'}</h3>
                    <p className="card-sub-desc">
                      {isAr ? 'اختر الشخصية المناسبة التي تمثل عيادات عافية في استقبال المراجعين.' : 'Select the primary voice identity for clinical interactions.'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginTop: '16px' }}>
                  {VOICE_PERSONAS.map((p) => {
                    const isSelected = settings.voiceId === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSettings({ ...settings, voiceId: p.id })}
                        style={{
                          border: isSelected ? '2px solid #0D7C66' : '1px solid #E2E8F0',
                          background: isSelected ? '#F0FDF4' : '#FFFFFF',
                          borderRadius: '12px',
                          padding: '14px 16px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '50%',
                              background: isSelected ? '#0D7C66' : '#F1F5F9',
                              color: isSelected ? '#FFFFFF' : '#475569',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '15px'
                            }}
                          >
                            {p.id === 'sarah' ? 'س' : p.id === 'faisal' ? 'ف' : p.id === 'noura' ? 'ن' : p.id === 'sultan' ? 'س' : p.id === 'reem' ? 'ر' : 'ع'}
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                              <strong style={{ fontSize: '14.5px', color: '#0F172A' }}>
                                {isAr ? p.nameAr : p.nameEn}
                              </strong>
                              <span
                                style={{
                                  fontSize: '11px',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  background: isSelected ? '#D1FAE5' : '#F1F5F9',
                                  color: isSelected ? '#065F46' : '#64748B',
                                  fontWeight: 600
                                }}
                              >
                                {isAr ? p.genderAr : p.genderEn}
                              </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B', lineHeight: 1.4 }}>
                              {isAr ? p.descAr : p.descEn}
                            </p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', minWidth: '90px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: isSelected ? '#0D7C66' : '#94A3B8',
                              background: isSelected ? '#E6FFFA' : 'transparent',
                              padding: '2px 8px',
                              borderRadius: '12px'
                            }}
                          >
                            {isAr ? p.badgeAr : p.badgeEn}
                          </span>
                          <input
                            type="radio"
                            name="personaVoice"
                            checked={isSelected}
                            onChange={() => setSettings({ ...settings, voiceId: p.id })}
                            style={{ accentColor: '#0D7C66', width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="settings-card-exact">
                <div className="card-header-icon-row">
                  <div className="card-icon-pill">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D7C66" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="card-main-title">{isAr ? 'سرعة ونبرة النطق الصوتي' : 'Pacing & Pitch Controls'}</h3>
                    <p className="card-sub-desc">
                      {isAr ? 'تحكم بسرعة القراءة ونبرة صوت المساعد لتناسب راحة المراجعين.' : 'Fine-tune speech rate, pitch variations, and interruption tolerance.'}
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                        {isAr ? 'سرعة النطق (Speed Rate):' : 'Speech Rate:'}
                      </label>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0D7C66' }}>{settings.speed}x</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['0.8', '0.9', '1.0', '1.1', '1.2'].map((spd) => (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => setSettings({ ...settings, speed: spd })}
                          style={{
                            flex: 1,
                            padding: '6px 0',
                            borderRadius: '8px',
                            border: settings.speed === spd ? '2px solid #0D7C66' : '1px solid #CBD5E1',
                            background: settings.speed === spd ? '#E6FFFA' : '#FFFFFF',
                            color: settings.speed === spd ? '#0D7C66' : '#475569',
                            fontWeight: 700,
                            fontSize: '12.5px',
                            cursor: 'pointer'
                          }}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      {isAr ? 'نبرة الصوت (Pitch Tone):' : 'Pitch Tone:'}
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[
                        { id: 'low', ar: 'منخفضة وقورة', en: 'Low' },
                        { id: 'normal', ar: 'طبيعية متزنة', en: 'Normal' },
                        { id: 'high', ar: 'مرتفعة واضحة', en: 'High' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSettings({ ...settings, pitch: item.id })}
                          style={{
                            flex: 1,
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: settings.pitch === item.id ? '2px solid #0D7C66' : '1px solid #CBD5E1',
                            background: settings.pitch === item.id ? '#E6FFFA' : '#FFFFFF',
                            color: settings.pitch === item.id ? '#0D7C66' : '#475569',
                            fontWeight: 700,
                            fontSize: '12.5px',
                            cursor: 'pointer'
                          }}
                        >
                          {isAr ? item.ar : item.en}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="org-col">
              <div className="settings-card-exact">
                <div className="card-header-icon-row">
                  <div className="card-icon-pill">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D7C66" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="card-main-title">{isAr ? 'اللهجات المعتمدة للمساعد' : 'Supported Dialects'}</h3>
                    <p className="card-sub-desc">
                      {isAr ? 'اختر اللهجة التي يعتمدها المساعد الصوتي للرد على المراجعين.' : 'Select the primary Arabic dialect used for speech understanding & generation.'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginTop: '16px' }}>
                  {DIALECTS.map((d) => {
                    const isSelected = settings.dialectId === d.id;
                    return (
                      <div
                        key={d.id}
                        onClick={() => setSettings({ ...settings, dialectId: d.id })}
                        style={{
                          border: isSelected ? '2px solid #0D7C66' : '1px solid #E2E8F0',
                          background: isSelected ? '#F0FDF4' : '#FFFFFF',
                          borderRadius: '12px',
                          padding: '12px 14px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <strong style={{ fontSize: '13.5px', color: '#0F172A' }}>
                            {isAr ? d.titleAr : d.titleEn}
                          </strong>
                          <input
                            type="radio"
                            name="dialect"
                            checked={isSelected}
                            onChange={() => setSettings({ ...settings, dialectId: d.id })}
                            style={{ accentColor: '#0D7C66', width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                        </div>
                        <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#64748B', lineHeight: 1.4 }}>
                          {isAr ? d.descAr : d.descEn}
                        </p>
                        <div style={{ background: '#F8FAFC', padding: '6px 10px', borderRadius: '6px', fontSize: '11.5px', color: '#0D7C66', border: '1px dashed #CBD5E1' }}>
                          💬 <em>"{isAr ? d.sampleAr : d.sampleEn}"</em>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="settings-card-exact">
                <div className="card-header-icon-row">
                  <div className="card-icon-pill">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D7C66" strokeWidth="2">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                  <div>
                    <h3 className="card-main-title">{isAr ? 'تجربة ونطق اللهجة المحددة' : 'Live Voice Preview'}</h3>
                    <p className="card-sub-desc">
                      {isAr ? 'استمع إلى عينة نطق حية للهجة والشخصية المختارة عبر محرك الصوت.' : 'Test real-time speech synthesis with chosen persona and dialect sample.'}
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '11.5px', color: '#64748B', display: 'block' }}>
                        {isAr ? 'اللهجة الحالية المختارة:' : 'Selected Dialect:'}
                      </span>
                      <strong style={{ fontSize: '13.5px', color: '#0D7C66' }}>
                        {isAr ? currentDialectObj.titleAr : currentDialectObj.titleEn}
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={playPreview}
                      style={{
                        background: isPlaying ? '#EF4444' : '#0D7C66',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(13, 124, 102, 0.25)'
                      }}
                    >
                      {isPlaying ? (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16"></rect>
                            <rect x="14" y="4" width="4" height="16"></rect>
                          </svg>
                          <span>{isAr ? 'إيقاف الصوت' : 'Stop Audio'}</span>
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                          <span>{isAr ? 'استماع للعينة المباشرة' : 'Play Audio Preview'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div style={{ padding: '10px 14px', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px', color: '#1E293B', lineHeight: 1.6 }}>
                    "{isAr ? currentDialectObj.sampleAr : currentDialectObj.sampleEn}"
                  </div>
                </div>

                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px', cursor: 'pointer' }}>
                    <div style={{ paddingInlineEnd: '10px' }}>
                      <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block' }}>
                        {isAr ? 'السماح بمقاطعة الرد الصوتي (Barge-in)' : 'Allow Barge-in Interruption'}
                      </strong>
                      <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                        {isAr ? 'يتوقف المساعد الصوتي فوراً عند بدء المراجع بالحديث أثناء الرد.' : 'Immediately cuts off AI speech when caller begins speaking.'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.bargeIn}
                      onChange={(e) => setSettings({ ...settings, bargeIn: e.target.checked })}
                      style={{ accentColor: '#0D7C66', width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px', cursor: 'pointer' }}>
                    <div style={{ paddingInlineEnd: '10px' }}>
                      <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block' }}>
                        {isAr ? 'التبديل التلقائي للإنجليزية عند الحاجة' : 'Automatic English Fallback'}
                      </strong>
                      <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                        {isAr ? 'يتعرف المساعد على حديث المتحدث بالإنجليزية ويجيب بالإنجليزية تلقائياً.' : 'Switches dialect context if patient initiates call in English.'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.englishFallback}
                      onChange={(e) => setSettings({ ...settings, englishFallback: e.target.checked })}
                      style={{ accentColor: '#0D7C66', width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </label>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleSave}
                    style={{
                      background: '#0D7C66',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '12px 28px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '13.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(13, 124, 102, 0.3)'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>{isAr ? 'حفظ إعدادات الصوت واللهجة' : 'Save Voice Settings'}</span>
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
