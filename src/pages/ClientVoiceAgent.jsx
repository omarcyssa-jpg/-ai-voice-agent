import React, { useState, useEffect, useRef } from 'react';
import '../../client-voice.css';
import { useTasks } from '../context/TaskContext.jsx';

const I18N = {
  ar: {
    brandTitle: "المساعد الصوتي الذكي",
    brandSub: "عيادات عافية",
    adminLink: "تسجيل الدخول",
    secureBadge: "مساعد صوتي ذكي آمن · متوافق مع نظام حماية البيانات السعودي (PDPL)",
    dateDivider: "اليوم · 10:42 ص",
    aiSender: "سارة (المساعد الصوتي)",
    userName: "أحمد العتيبي",
    directContact: "طلب تواصل بشري مباشر",
    directContactNote: "هاتف الاستقبال المباشر: 011 234 5678",
    compliance: "مساعد إداري بالذكاء الاصطناعي — ليس بديلاً عن استشارة الطوارئ الطبية",

    consentTitle: "خصوصيتك تأتي في المقام الأول",
    consentSub: "الامتثال لنظام حماية البيانات الشخصية السعودي (PDPL)",
    consentBody: "بموافقتك، تقوم عيادات عافية بمعالجة صوتك، ونص المحادثة، وبيانات الاتصال لخدمتك وتنسيق حجزك فقط، وفقاً للأنظمة واللوائح السعودية لحماية البيانات.",
    consentBullets: [
      "تتم معالجة وتخزين بياناتك داخل خوادم آمنة في المملكة العربية السعودية.",
      "الوصول مقتصر حصرياً على موظفي الاستقبال والفريق الطبي المعني بالعيادة.",
      "يحق لك سحب الموافقة وطلب مسح سجل بياناتك الصوتية في أي وقت."
    ],
    privacyLink: "الاطلاع على سياسة الخصوصية المعتمدة ↗",
    agreeBtn: "أوافق ومتابعة المحادثة الصوتية",
    disagreeBtn: "غير موافق · مغادرة المحادثة",

    exitTitle: "تم إنهاء الجلسة الصوتية",
    exitDesc: "لقد اخترت عدم الموافقة على شروط الخصوصية. وفقاً لنظام حماية البيانات الشخصية السعودي (PDPL)، لم يتم تسجيل أي صوت ولم تُجمع أي بيانات.",
    restartBtn: "مراجعة الشروط والبدء من جديد",

    micDeniedTitle: "تعذر الوصول إلى الميكروفون",
    micDeniedDesc: "تعذر الوصول للميكروفون. يرجى تفعيل صلاحية الميكروفون من إعدادات المتصفح لمتابعة المحادثة الصوتية.",
    howToTitle: "كيفية تفعيل إذن الميكروفون",
    howToList: [
      "اضغط على رمز القفل أو الإعدادات بجانب عنوان المتصفح.",
      "اختر الميكروفون وحدد \"سماح\" (Allow).",
      "أعد تحميل الصفحة للبدء بالتحدث مباشرة."
    ],
    howToHint: "إعدادات المتصفح ← أذونات الموقع ← الميكروفون ← سماح",
    reloadBtn: "إعادة تحميل الصفحة",

    timeoutTitle: "انقطع الاتصال بالخادم الصوتي",
    timeoutDesc: "فُقد الاتصال بخدمة الصوت. يرجى المحاولة مجدداً لاستكمال محادثتك.",
    retryBtn: "إعادة الاتصال السريع",
    quickRetry: "جاري إعادة الاتصال...",
    timeoutNote: "تحقق من اتصال الإنترنت. سجل محادثتك وتفاصيل طلبك محفوظة بأمان.",

    aiMsg1: "أهلاً بك في عيادات عافية، معك سارة المساعد الصوتي. كيف أقدر أساعدك اليوم؟",
    userMsg: "يا هلا سارة، حاب أحجز موعد كشف أسنان بكرة العصر الساعة 4.",
    aiMsg2: "أبشر، يسعدني ترتيب ذلك. فضلاً زودني باسمك الكريم ورقم الجوال لتأكيد الحجز.",
    aiMsgConfirm: "شكراً لك يا أحمد. قمت بتسجيل طلبك لحجز موعد عيادة الأسنان غداً الساعة 4:00 عصراً. هل البيانات صحيحة لتأكيد الحجز؟",

    welcomeHeadlines: {
      'consent': "مرحباً بكم في عيادات عافية",
      'ready': "كيف نقدر نساعدك اليوم؟",
      'listening': "جاري الاستماع لطلبك الآن...",
      'processing': "جاري معالجة الصوت وتحليل الطلب...",
      'speaking': "سارة (المساعد الصوتي) تتحدث...",
      'mic-denied': "يلزم تفعيل الميكروفون",
      'timeout': "جاري استعادة الاتصال..."
    },
    welcomeSubtitle: "تحدث بصوتك باللهجة السعودية لحجز موعد، أو الاستفسار عن مواعيد العمل، أو طلب اتصال مباشر من الاستقبال.",

    actionHeadings: {
      'consent': "اضغط وتحدث",
      'ready': "اضغط مطولاً للتحدث (Push to Talk)",
      'listening': "جاري الاستماع إليك الآن...",
      'processing': "جاري المعالجة واستخراج الحقول...",
      'speaking': "مساعد عافية يجيب بصوته",
      'mic-denied': "فعل الميكروفون للبدء بالتحدث",
      'timeout': "أعد الاتصال للمتابعة"
    },
    actionSubtexts: {
      'consent': "تحدث بطبيعتك، نحن هنا لمساعدتك",
      'ready': "اضغط مع الاستمرار على زر الميكروفون أثناء التحدث، واتركه عند الانتهاء",
      'listening': "حرر الزر عند الانتهاء من التحدث لإرسال رسالتك",
      'processing': "نقوم بتحليل الصوت واستخراج اسم المراجع، الهاتف، والموعد...",
      'speaking': "يمكنك مقاطعة الرد في أي وقت بالنقر على الميكروفون",
      'mic-denied': "يلزم منح صلاحية استخدام الميكروفون للتعرف الصوتي",
      'timeout': "جاري استعادة الاتصال لاستكمال محادثتك الصوتية"
    },
    statusLines: {
      'consent': "• متصل · بانتظار موافقة الخصوصية",
      'ready': "• متصل · جاهز للاستماع والتحدث",
      'listening': "• جاري تسجيل دفق الصوت المباشر...",
      'processing': "• جاري تحويل الصوت إلى نص واستخلاص الحقول...",
      'speaking': "• جاري تشغيل الرد الصوتي الطبيعي...",
      'mic-denied': "الميكروفون غير متاح •",
      'timeout': "• انقطع الاتصال · الصوت متوقف مؤقتاً"
    }
  },
  en: {
    brandTitle: "AI VOICE AGENT",
    brandSub: "AFIYA CLINICS",
    adminLink: "Login",
    secureBadge: "Secure Voice Assistant · PDPL Compliant",
    dateDivider: "Today · 10:42 AM",
    aiSender: "Afiya Voice Assistant",
    userName: "Ahmad Al-Otaibi",
    directContact: "Request direct human contact",
    directContactNote: "Direct Reception Line: 011 234 5678",
    compliance: "Administrative AI assistant — Not a replacement for emergency medical care",

    consentTitle: "Your privacy is our priority",
    consentSub: "Saudi Personal Data Protection Law (PDPL) Compliance",
    consentBody: "With your consent, Afiya Clinics processes your voice, conversation text, and contact details solely to serve you and coordinate your appointment, in strict adherence to Saudi PDPL regulations.",
    consentBullets: [
      "Your voice is processed securely within the Kingdom of Saudi Arabia.",
      "Access is restricted to authorized clinic administrative personnel.",
      "You may withdraw consent and request data deletion at any time."
    ],
    privacyLink: "View Clinic Privacy Policy ↗",
    agreeBtn: "Agree & Continue to Voice",
    disagreeBtn: "Disagree · Exit Session",

    exitTitle: "Session Terminated",
    exitDesc: "You declined privacy consent. Under Saudi PDPL guidelines, no voice recording or personal data was processed.",
    restartBtn: "Review Consent & Start Over",

    micDeniedTitle: "Microphone Access Denied",
    micDeniedDesc: "Unable to access the microphone. Please enable permissions in your browser settings to continue.",
    howToTitle: "How to enable microphone",
    howToList: [
      "Click the lock/settings icon next to the browser URL.",
      "Set Microphone permissions to 'Allow'.",
      "Reload the page to start speaking."
    ],
    howToHint: "Browser Settings → Site Permissions → Microphone → Allow",
    reloadBtn: "Reload Page",

    timeoutTitle: "Connection Lost",
    timeoutDesc: "The connection to the voice server was lost. Please retry.",
    retryBtn: "Quick Reconnect",
    quickRetry: "Retrying connection...",
    timeoutNote: "Check your internet connection. Your conversation history is saved safely.",

    aiMsg1: "Hello! Welcome to Afiya Clinics. I am Sarah, your AI receptionist. How can I assist you today?",
    userMsg: "Hi Sarah, I would like to book a dental checkup appointment tomorrow at 4 PM.",
    aiMsg2: "I'd be glad to arrange that. Could you please provide your full name and mobile number to confirm?",
    aiMsgConfirm: "Thank you Ahmad. I have registered your request for a Dental Clinic appointment tomorrow at 4:00 PM. Did I get all details right?",

    welcomeHeadlines: {
      'consent': "Welcome to Afiya Clinics",
      'ready': "How can we assist you today?",
      'listening': "Listening to your request...",
      'processing': "Processing audio & slots...",
      'speaking': "Afiya Assistant speaking...",
      'mic-denied': "Microphone Access Required",
      'timeout': "Reconnecting..."
    },
    welcomeSubtitle: "Hold to speak in spoken Arabic or English to book appointments, ask about working hours, or request a callback.",

    actionHeadings: {
      'consent': "Push to Talk",
      'ready': "Press and Hold to Speak",
      'listening': "Listening to you now",
      'processing': "AI Processing & Understanding...",
      'speaking': "Afiya Assistant is responding",
      'mic-denied': "Enable Microphone Permission",
      'timeout': "Reconnecting..."
    },
    actionSubtexts: {
      'consent': "Speak naturally, we are here to help",
      'ready': "Press & hold the mic button while speaking, release when done",
      'listening': "Release the button when you finish speaking",
      'processing': "Running speech recognition & extracting appointment details...",
      'speaking': "Click the button to interrupt the response",
      'mic-denied': "Microphone permission is required for voice interaction",
      'timeout': "Trying to restore connection..."
    },
    statusLines: {
      'consent': "• Ready · Awaiting Privacy Consent",
      'ready': "• Online · Ready for Voice Input",
      'listening': "• Recording audio stream...",
      'processing': "• Transcribing speech & extracting entities...",
      'speaking': "• Playing AI response...",
      'mic-denied': "• Microphone unavailable",
      'timeout': "• Connection interrupted"
    }
  }
};

export default function ClientVoiceAgent({ onNavigate }) {
  const { addTask } = useTasks();

  const [lang, setLang] = useState(() => localStorage.getItem('afiya_lang') || 'ar');
  const [state, setState] = useState('consent');
  const [scenario, setScenario] = useState('appointment');
  const [taskConfirmed, setTaskConfirmed] = useState(false);
  const [createdTaskId, setCreatedTaskId] = useState(null);
  const [waveHeights, setWaveHeights] = useState(Array(18).fill(10));

  const [appointmentData, setAppointmentData] = useState({
    name: 'أحمد العتيبي',
    nameEn: 'Ahmad Al-Otaibi',
    phone: '050 123 4567',
    specialty: 'Dental',
    specialtyAr: 'عيادة طب الأسنان',
    date: 'غداً (الخميس)',
    dateEn: 'Tomorrow (Thursday)',
    time: '04:00 عصراً',
    timeEn: '04:00 PM',
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(appointmentData);
  const [clientToast, setClientToast] = useState('');
  const [clientToastVisible, setClientToastVisible] = useState(false);
  const toastRef = useRef(null);

  const showClientToast = (msg) => {
    setClientToast(msg);
    setClientToastVisible(true);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setClientToastVisible(false), 3000);
  };

  const waveTimer = useRef(null);
  const isMouseDown = useRef(false);

  const t = I18N[lang] || I18N.ar;
  const isAr = lang === 'ar';

  useEffect(() => {
    localStorage.setItem('afiya_lang', lang);
    document.documentElement.setAttribute('dir', isAr ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }, [lang, isAr]);

  useEffect(() => {
    if (state === 'listening' || state === 'speaking') {
      waveTimer.current = setInterval(() => {
        setWaveHeights(Array.from({ length: 18 }, () => Math.floor(Math.random() * 26) + 6));
      }, 100);
    } else {
      clearInterval(waveTimer.current);
    }
    return () => clearInterval(waveTimer.current);
  }, [state]);

  useEffect(() => {
    if (state === 'speaking' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      let speakText = t.aiMsgConfirm;

      if (scenario === 'emergency') {
        speakText = isAr
          ? 'سلامتك يا غالي. الأعراض التي ذكرتها كألم الصدر وضيق التنفس هي حالة طارئة حرجة. يمنع تقديم أي تشخيص ويجب عليك فوراً الاتصال بالإسعاف على الرقم 997 أو التوجه لأقرب طوارئ.'
          : 'Your symptoms indicate a severe medical emergency. Please call 997 or visit the nearest emergency room immediately.';
      } else if (scenario === 'hours') {
        speakText = isAr
          ? 'أهلاً بك، تستقبلكم عيادات عافية بالرياض من السبت إلى الخميس من 8 صباحاً وحتى 10 مساءً، والجمعة من 4 عصراً حتى 9 مساءً. وموقعنا على طريق الملك فهد بحي العليا.'
          : 'Afiya Clinics welcomes you Saturday to Thursday 8 AM to 10 PM, and Friday 4 PM to 9 PM. We are located on King Fahd Road, Al-Olayya, Riyadh.';
      } else if (scenario === 'callback') {
        speakText = isAr
          ? 'أعتذر منك عن أي تأخير يا أحمد. قمت بتسجيل طلب معاودة اتصال عاجل لرقمك وسيقوم فريق الاستقبال بالتواصل معك خلال 15 دقيقة.'
          : 'I apologize for the wait. I registered a high-priority callback for your number and our receptionist will call you within 15 minutes.';
      }

      const utter = new SpeechSynthesisUtterance(speakText);
      utter.lang = isAr ? 'ar-SA' : 'en-US';
      utter.rate = 1.0;
      utter.onend = () => {
        setState('ready');
      };
      window.speechSynthesis.speak(utter);
    } else if (state !== 'speaking' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [state, lang, scenario]);

  const handlePttDown = () => {
    if (state === 'mic-denied' || state === 'timeout' || state === 'consent') return;
    if (state === 'speaking') {
      window.speechSynthesis.cancel();
      setState('ready');
      return;
    }
    isMouseDown.current = true;
    setState('listening');
  };

  const handlePttUp = () => {
    if (!isMouseDown.current && state !== 'listening') return;
    isMouseDown.current = false;
    setState('processing');
    setTimeout(() => {
      setState('speaking');
    }, 1400);
  };

  const selectScenario = (sc) => {
    setScenario(sc);
    setTaskConfirmed(false);
    setCreatedTaskId(null);
    if (state === 'consent' || state === 'exit') {
      setState('ready');
    } else {
      setState('processing');
      setTimeout(() => setState('speaking'), 800);
    }
  };

  const handleConfirmTask = () => {
    const newTask = {
      customer: isAr ? appointmentData.name : appointmentData.nameEn,
      customerEn: appointmentData.nameEn,
      phone: appointmentData.phone,
      specialty: appointmentData.specialty,
      specialtyAr: appointmentData.specialtyAr,
      preferred_date: isAr ? appointmentData.date : appointmentData.dateEn,
      preferred_time: isAr ? appointmentData.time : appointmentData.timeEn,
      priority: 'urgent',
      type: 'Appointment',
      channel: 'web',
      request: isAr
        ? `حجز موعد كشف ${appointmentData.specialtyAr} - تم التأكيد عبر المساعد الصوتي.`
        : `Urgent ${appointmentData.specialty} checkup appointment confirmed via voice assistant.`,
      transcript: [
        { role: 'assistant', text: t.aiMsg1, time: '10:42 AM' },
        { role: 'customer', text: t.userMsg, time: '10:42 AM' },
        { role: 'assistant', text: t.aiMsg2, time: '10:43 AM' },
        { role: 'customer', text: isAr ? `اسمي ${appointmentData.name} وجوالي ${appointmentData.phone}.` : `My name is ${appointmentData.nameEn}, phone ${appointmentData.phone}.`, time: '10:43 AM' },
        { role: 'assistant', text: t.aiMsgConfirm, time: '10:43 AM' },
        { role: 'customer', text: isAr ? 'نعم البيانات صحيحة، أؤكد الحجز.' : 'Yes, details are correct, please confirm.', time: '10:44 AM' }
      ]
    };

    const created = addTask(newTask);
    setCreatedTaskId(created.id);
    setTaskConfirmed(true);

    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(
        isAr
          ? `شكراً لك ${appointmentData.name}، تم تأكيد طلبك برقم مرجعي ${created.id}. سيتواصل معك موظف الاستقبال لتأكيد الحجز النهائي.`
          : `Thank you, your appointment task has been registered with reference ${created.id}. Our team will call you shortly.`
      );
      utter.lang = isAr ? 'ar-SA' : 'en-US';
      window.speechSynthesis.speak(utter);
    }
  };

  return (
    <div className={`client-app-container ${isAr ? 'lang-ar' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
      <main className="app-device-frame">
        <nav className="client-header">
          <div className="client-brand">
            <div className="brand-text-col">
              <span className="brand-title">{t.brandTitle}</span>
              <span className="brand-sub">{t.brandSub}</span>
            </div>
            <div className="brand-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" />
                <circle cx="18" cy="6" r="2" fill="currentColor" />
              </svg>
            </div>
          </div>

          <div className="header-right-tools">
            <a
              href="/admin"
              className="client-admin-link"
              title="Open Clinic Admin Dashboard"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('/admin');
                }
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>{t.adminLink}</span>
            </a>

            <div className="lang-pill">
              <button
                type="button"
                className={`lang-pill-btn ${isAr ? 'active' : ''}`}
                onClick={() => setLang('ar')}
              >
                العربية
              </button>
              <button
                type="button"
                className={`lang-pill-btn ${!isAr ? 'active' : ''}`}
                onClick={() => setLang('en')}
              >
                English
              </button>
            </div>
          </div>
        </nav>

        <div className="client-content">
          <div className="security-pill-row">
            <span className="security-pill">
              <span className="security-dot"></span>
              <span>{t.secureBadge}</span>
            </span>
          </div>

          <h1 className="welcome-headline">{t.welcomeHeadlines[state] || t.welcomeHeadlines['ready']}</h1>
          <p className="welcome-subtitle">{t.welcomeSubtitle}</p>

          <div style={{ margin: '14px 0 18px', display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748B', width: '100%', textAlign: 'center', fontWeight: 600 }}>
              {isAr ? '⚡ تجربة السيناريوهات السريعة:' : '⚡ Quick Test Scenarios:'}
            </span>
            <button
              type="button"
              className={`tab-pill ${scenario === 'appointment' ? 'active' : ''}`}
              style={{ fontSize: '11.5px', padding: '5px 10px' }}
              onClick={() => selectScenario('appointment')}
            >
              {isAr ? 'حجز موعد أسنان' : 'Book Appointment'}
            </button>
            <button
              type="button"
              className={`tab-pill ${scenario === 'hours' ? 'active' : ''}`}
              style={{ fontSize: '11.5px', padding: '5px 10px' }}
              onClick={() => selectScenario('hours')}
            >
              {isAr ? 'مواعيد العمل والموقع' : 'Clinic Hours'}
            </button>
            <button
              type="button"
              className={`tab-pill ${scenario === 'callback' ? 'active' : ''}`}
              style={{ fontSize: '11.5px', padding: '5px 10px' }}
              onClick={() => selectScenario('callback')}
            >
              {isAr ? 'طلب معاودة اتصال' : 'Callback'}
            </button>
            <button
              type="button"
              className={`tab-pill ${scenario === 'emergency' ? 'active' : ''}`}
              style={{ fontSize: '11.5px', padding: '5px 10px', borderColor: '#FCA5A5', color: scenario === 'emergency' ? '#FFFFFF' : '#DC2626' }}
              onClick={() => selectScenario('emergency')}
            >
              {isAr ? 'تنبيه طوارئ' : 'Medical Emergency'}
            </button>
          </div>

          <div className="chat-scroll-area">
            <div className="date-badge-divider">
              <span>{t.dateDivider}</span>
            </div>

            <div className="bubble-wrap-ai">
              <span className="bubble-sender-ai">{t.aiSender}</span>
              <div className="bubble-card-ai">
                <p>{t.aiMsg1}</p>
                <span className="bubble-time-ai">10:42 AM</span>
              </div>
            </div>

            {scenario === 'appointment' && (
              <>
                <div className="bubble-wrap-user">
                  <span className="bubble-sender-user">{t.userName}</span>
                  <div className="bubble-card-user">
                    <p>{t.userMsg}</p>
                    <span className="bubble-time-user">10:42 AM</span>
                  </div>
                </div>

                <div className="bubble-wrap-ai">
                  <span className="bubble-sender-ai">{t.aiSender}</span>
                  <div className="bubble-card-ai">
                    <p>{t.aiMsg2}</p>
                    <span className="bubble-time-ai">10:43 AM</span>
                  </div>
                </div>

                <div className="bubble-wrap-user">
                  <span className="bubble-sender-user">{t.userName}</span>
                  <div className="bubble-card-user">
                    <p>{isAr ? `اسمي ${appointmentData.name}، جوالي ${appointmentData.phone}.` : `My name is ${appointmentData.nameEn}, phone ${appointmentData.phone}.`}</p>
                    <span className="bubble-time-user">10:43 AM</span>
                  </div>
                </div>

                <div className="bubble-wrap-ai">
                  <span className="bubble-sender-ai">{t.aiSender}</span>
                  <div className="bubble-card-ai">
                    <p>
                      {isAr
                        ? `شكراً لك يا ${appointmentData.name}. قمت بتسجيل طلبك لحجز موعد ${appointmentData.specialtyAr} يوم ${appointmentData.date} الساعة ${appointmentData.time}. هل البيانات صحيحة لتأكيد الحجز؟`
                        : `Thank you. I have registered your request for a ${appointmentData.specialty} appointment on ${appointmentData.date} at ${appointmentData.time}. Did I get all details right?`}
                    </p>
                    <span className="bubble-time-ai">10:43 AM</span>
                  </div>
                </div>

                {!taskConfirmed ? (
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: '2px solid #0D7C66',
                      borderRadius: '16px',
                      padding: '16px 18px',
                      margin: '14px 0',
                      boxShadow: '0 10px 25px -5px rgba(13, 124, 102, 0.15)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '18px' }}>📋</span>
                      <strong style={{ fontSize: '14px', color: '#0F172A' }}>
                        {isAr ? 'تأكيد بيانات الموعد قبل التسجيل' : 'Verify Details Before Confirmation'}
                      </strong>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12.5px', marginBottom: '14px' }}>
                      <div style={{ background: '#F8FAFC', padding: '8px 10px', borderRadius: '8px' }}>
                        <span style={{ color: '#64748B', display: 'block' }}>{isAr ? 'اسم المراجع:' : 'Patient Name:'}</span>
                        <strong style={{ color: '#0F172A' }}>{isAr ? appointmentData.name : (appointmentData.nameEn || appointmentData.name)}</strong>
                      </div>
                      <div style={{ background: '#F8FAFC', padding: '8px 10px', borderRadius: '8px' }}>
                        <span style={{ color: '#64748B', display: 'block' }}>{isAr ? 'رقم الجوال:' : 'Mobile:'}</span>
                        <strong style={{ color: '#0F172A' }}>{appointmentData.phone}</strong>
                      </div>
                      <div style={{ background: '#F8FAFC', padding: '8px 10px', borderRadius: '8px' }}>
                        <span style={{ color: '#64748B', display: 'block' }}>{isAr ? 'العيادة المطلوبة:' : 'Specialty:'}</span>
                        <strong style={{ color: '#0D7C66' }}>{isAr ? (appointmentData.specialtyAr || appointmentData.specialty) : appointmentData.specialty}</strong>
                      </div>
                      <div style={{ background: '#F8FAFC', padding: '8px 10px', borderRadius: '8px' }}>
                        <span style={{ color: '#64748B', display: 'block' }}>{isAr ? 'الموعد المفضل:' : 'Preferred Slot:'}</span>
                        <strong style={{ color: '#0D7C66' }}>{appointmentData.date} - {appointmentData.time}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        style={{
                          flex: 1,
                          background: '#0D7C66',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                        onClick={handleConfirmTask}
                      >
                        <span>✓</span>
                        <span>{isAr ? 'نعم البيانات صحيحة، أؤكد الطلب' : 'Yes, Confirm & Create Task'}</span>
                      </button>

                      <button
                        type="button"
                        style={{
                          background: '#F1F5F9',
                          color: '#475569',
                          border: '1px solid #CBD5E1',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          fontWeight: 600,
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setEditForm({ ...appointmentData });
                          setEditModalOpen(true);
                        }}
                      >
                        {isAr ? '✎ تعديل الموعد' : '✎ Edit Details'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      background: '#ECFDF5',
                      border: '1.5px solid #10B981',
                      borderRadius: '16px',
                      padding: '16px',
                      margin: '14px 0',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ color: '#059669', fontSize: '24px', marginBottom: '4px' }}>✓</div>
                    <strong style={{ color: '#065F46', fontSize: '15px', display: 'block', marginBottom: '4px' }}>
                      {isAr ? `تم تأكيد حجزك بنجاح! رقم المهمة: #${createdTaskId}` : `Appointment Confirmed! Task #${createdTaskId}`}
                    </strong>
                    <p style={{ color: '#047857', fontSize: '12.5px', margin: '0 0 14px' }}>
                      {isAr
                        ? `تم تسجيل موعدك في ${appointmentData.specialtyAr} يوم ${appointmentData.date} الساعة ${appointmentData.time}. سيتواصل معك فريق الاستقبال على جوالك لتأكيد الحضور.`
                        : `Your appointment is reserved for ${appointmentData.specialty} on ${appointmentData.date} at ${appointmentData.time}.`}
                    </p>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        style={{
                          background: '#0D7C66',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setEditForm({ ...appointmentData });
                          setEditModalOpen(true);
                        }}
                      >
                        {isAr ? '✎ تعديل تفاصيل الموعد' : '✎ Edit Appointment'}
                      </button>

                      <button
                        type="button"
                        style={{
                          background: '#F1F5F9',
                          color: '#334155',
                          border: '1px solid #CBD5E1',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setTaskConfirmed(false);
                          setState('ready');
                        }}
                      >
                        {isAr ? '🔄 حجز موعد جديد' : '🔄 Book Another'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {scenario === 'hours' && (
              <>
                <div className="bubble-wrap-user">
                  <span className="bubble-sender-user">{t.userName}</span>
                  <div className="bubble-card-user">
                    <p>{isAr ? 'متى تفتحون العيادة في الرياض؟ ووين موقعكم بالضبط؟' : 'What are your working hours and exact location in Riyadh?'}</p>
                    <span className="bubble-time-user">10:42 AM</span>
                  </div>
                </div>

                <div className="bubble-wrap-ai">
                  <span className="bubble-sender-ai">{t.aiSender}</span>
                  <div className="bubble-card-ai">
                    <p>
                      {isAr
                        ? 'تستقبلكم عيادات عافية فرع الرياض من السبت إلى الخميس من 8:00 صباحاً حتى 10:00 مساءً، والجمعة من 4:00 عصراً حتى 9:00 مساءً. وموقعنا على طريق الملك فهد - حي العليا.'
                        : 'Afiya Clinics Riyadh branch is open Saturday to Thursday 8:00 AM – 10:00 PM, and Friday 4:00 PM – 9:00 PM. We are on King Fahd Rd, Al-Olayya.'}
                    </p>
                    <span className="bubble-time-ai">10:43 AM</span>
                  </div>
                </div>
              </>
            )}

            {scenario === 'callback' && (
              <>
                <div className="bubble-wrap-user">
                  <span className="bubble-sender-user">{t.userName}</span>
                  <div className="bubble-card-user">
                    <p>{isAr ? 'عندي استفسار عن تأمين بوبا وابي أحد يكلمني من الاستقبال.' : 'I need info about Bupa insurance and want receptionist to call me back.'}</p>
                    <span className="bubble-time-user">10:42 AM</span>
                  </div>
                </div>

                <div className="bubble-wrap-ai">
                  <span className="bubble-sender-ai">{t.aiSender}</span>
                  <div className="bubble-card-ai">
                    <p>
                      {isAr
                        ? 'أبشر، تم تسجيل طلبك لمعاودة الاتصال برقم الأولوية العالية. سيتواصل معك أحد الزملاء في الاستقبال على رقم جوالك خلال 15 دقيقة.'
                        : 'Understood. A high-priority callback ticket has been placed. Our team will contact you within 15 minutes.'}
                    </p>
                    <span className="bubble-time-ai">10:43 AM</span>
                  </div>
                </div>
              </>
            )}

            {scenario === 'emergency' && (
              <>
                <div className="bubble-wrap-user">
                  <span className="bubble-sender-user">{t.userName}</span>
                  <div className="bubble-card-user" style={{ background: '#FEE2E2', borderColor: '#FCA5A5' }}>
                    <p>{isAr ? 'عندي ألم شديد في الصدر وضيق تنفس، ماذا أعمل؟' : 'I have severe chest pain and shortness of breath, what should I do?'}</p>
                    <span className="bubble-time-user">10:42 AM</span>
                  </div>
                </div>

                <div className="emergency-guardrail-card">
                  <div className="emergency-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    <span>{isAr ? 'تنبيه طبي عاجل' : 'Emergency Medical Notice'}</span>
                  </div>
                  <p className="emergency-body">
                    {isAr
                      ? 'كمساعد صوتي إداري، يمنع منعاً باتاً تقديم أي تشخيص أو توجيه طبي. الأعراض التي ذكرتها (ألم الصدر وضيق التنفس) هي حالة طارئة تستدعي التوجه فوراً لأقرب طوارئ أو الاتصال بالإسعاف.'
                      : 'As an administrative assistant, diagnosis or medical triage is strictly prohibited. Your symptoms may indicate an emergency requiring immediate care.'}
                  </p>
                  <a href="tel:997" className="btn-call-ambulance">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    <span>{isAr ? 'الاتصال بالإسعاف فوراً (الهلال الأحمر 997)' : 'Call Ambulance (997)'}</span>
                  </a>
                </div>
              </>
            )}

            {state === 'mic-denied' && (
              <div>
                <div className="state-alert-card error">
                  <div className="alert-icon-wrap">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                      <line x1="12" y1="19" x2="12" y2="23"></line>
                      <line x1="8" y1="23" x2="16" y2="23"></line>
                    </svg>
                  </div>
                  <div className="alert-text-wrap">
                    <strong className="alert-title-strong">{t.micDeniedTitle}</strong>
                    <p className="alert-desc-sub">{t.micDeniedDesc}</p>
                  </div>
                </div>

                <div className="instructions-card">
                  <h3 className="instructions-title">{t.howToTitle}</h3>
                  <ol className="instructions-list">
                    {t.howToList.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                  <span className="instructions-hint">{t.howToHint}</span>
                  <button type="button" className="btn-reload-page" onClick={() => setState('ready')}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                    <span>{t.reloadBtn}</span>
                  </button>
                </div>
              </div>
            )}

            {state === 'timeout' && (
              <div>
                <div className="timeout-card-block">
                  <div className="timeout-head">
                    <div className="alert-text-wrap">
                      <strong className="alert-title-strong">{t.timeoutTitle}</strong>
                      <p className="alert-desc-sub">{t.timeoutDesc}</p>
                    </div>
                  </div>
                  <button type="button" className="btn-retry-conn" onClick={() => { setState('processing'); setTimeout(() => setState('ready'), 1000); }}>
                    <span>{t.retryBtn}</span>
                  </button>
                </div>
                <p className="timeout-footnote">{t.timeoutNote}</p>
              </div>
            )}
          </div>
        </div>

        <footer className="client-footer-control">
          <div className={`voice-status-line ${state === 'timeout' || state === 'mic-denied' ? 'disconnected' : ''}`}>
            <span className="dot"></span>
            <span>{t.statusLines[state] || t.statusLines['ready']}</span>
          </div>

          {(state === 'listening' || state === 'speaking') && (
            <div className="waveform-bars-wrap">
              {waveHeights.map((h, i) => (
                <span
                  key={i}
                  className={`wave-bar ${state === 'speaking' ? 'speaking' : ''}`}
                  style={{ height: `${h}px` }}
                ></span>
              ))}
            </div>
          )}

          {state === 'processing' && <div className="spinner-ring"></div>}

          <div className="mic-btn-container">
            {state === 'listening' && (
              <>
                <div className="mic-ripple-ring"></div>
                <div className="mic-ripple-ring" style={{ animationDelay: '0.5s' }}></div>
              </>
            )}

            <button
              type="button"
              className={`mic-circle-btn ${state === 'mic-denied' || state === 'timeout' ? 'disabled' : ''} ${state === 'processing' ? 'processing' : ''}`}
              onMouseDown={handlePttDown}
              onMouseUp={handlePttUp}
              onTouchStart={handlePttDown}
              onTouchEnd={handlePttUp}
              onClick={() => {
                if (state === 'ready') {
                  handlePttDown();
                  setTimeout(() => handlePttUp(), 3000);
                } else if (state === 'listening') {
                  handlePttUp();
                } else if (state === 'speaking') {
                  window.speechSynthesis.cancel();
                  setState('ready');
                }
              }}
              title={isAr ? 'اضغط مطولاً للتحدث' : 'Hold to speak'}
            >
              {state === 'speaking' ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                </svg>
              ) : state === 'mic-denied' || state === 'timeout' ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.2">
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                  <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              )}
            </button>
          </div>

          <h3 className="voice-action-heading">{t.actionHeadings[state] || t.actionHeadings['ready']}</h3>
          <p className="voice-action-subtext">{t.actionSubtexts[state] || t.actionSubtexts['ready']}</p>

          <a href="tel:0112345678" className="btn-direct-contact">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span>{t.directContact}</span>
          </a>
          <span className="direct-contact-note">{t.directContactNote}</span>

          <div className="compliance-footer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            <span>{t.compliance}</span>
          </div>
        </footer>

        {state === 'consent' && (
          <div className="consent-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="consent-modal-title">
            <div className="consent-modal-card">
              <div className="consent-header-top">
                <div className="consent-shield-badge">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                </div>
                <div className="consent-pdpl-pill">
                  <span className="pdpl-dot"></span>
                  <span>{isAr ? 'نظام حماية البيانات السعودي (PDPL)' : 'Saudi PDPL Compliant'}</span>
                </div>
              </div>

              <h2 id="consent-modal-title" className="consent-title">{t.consentTitle}</h2>
              <p className="consent-sub">{t.consentSub}</p>
              <p className="consent-body">{t.consentBody}</p>

              <div className="consent-bullets-list">
                {t.consentBullets.map((b, i) => (
                  <div key={i} className="consent-bullet-item">
                    <div className="consent-bullet-icon-box">
                      {i === 0 ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                          <line x1="6" y1="6" x2="6.01" y2="6"></line>
                          <line x1="6" y1="18" x2="6.01" y2="18"></line>
                        </svg>
                      ) : i === 1 ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                          <polyline points="9 12 11 14 15 10"></polyline>
                        </svg>
                      )}
                    </div>
                    <span className="consent-bullet-text">{b}</span>
                  </div>
                ))}
              </div>

              <div className="consent-actions-group">
                <button
                  type="button"
                  id="btn-agree-voice"
                  className="btn-consent-agree"
                  onClick={() => setState('ready')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="22" />
                  </svg>
                  <span>{t.agreeBtn}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isAr ? 'rotate(180deg)' : 'none', opacity: 0.85, marginInlineStart: 'auto' }}>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>

                <button
                  type="button"
                  id="btn-disagree-voice"
                  className="btn-consent-disagree"
                  onClick={() => setState('exit')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>{t.disagreeBtn}</span>
                </button>
              </div>

              <div className="consent-footer-link">
                <a
                  href="/privacy"
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      onNavigate('/privacy');
                    }
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <span>{t.privacyLink}</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {state === 'exit' && (
          <div className="consent-modal-backdrop" role="dialog" aria-modal="true">
            <div className="consent-modal-card exit-modal-card">
              <div className="exit-icon-wrap">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              </div>
              <h2 className="consent-title" style={{ textAlign: 'center' }}>{t.exitTitle}</h2>
              <p className="consent-body" style={{ textAlign: 'center', margin: '10px 0 20px', color: '#64748B' }}>{t.exitDesc}</p>
              <div className="consent-actions-group">
                <button
                  type="button"
                  className="btn-restart-consent"
                  onClick={() => setState('consent')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                  </svg>
                  <span>{t.restartBtn}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {editModalOpen && (
          <div
            className="consent-modal-backdrop"
            style={{ zIndex: 1200 }}
            onClick={() => setEditModalOpen(false)}
          >
            <div
              className="consent-modal-card"
              style={{ maxWidth: '440px', textAlign: isAr ? 'right' : 'left' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: 700 }}>
                  {isAr ? 'تعديل تفاصيل الموعد' : 'Edit Appointment Details'}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748B' }}
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setAppointmentData({ ...editForm });
                  setEditModalOpen(false);
                  showClientToast(isAr ? 'تم تحديث تفاصيل موعدك بنجاح!' : 'Appointment details updated!');
                }}
              >
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    {isAr ? 'اسم المراجع:' : 'Patient Name:'}
                  </label>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value, nameEn: e.target.value })}
                    required
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    {isAr ? 'رقم الجوال:' : 'Mobile Number:'}
                  </label>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    required
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    {isAr ? 'العيادة / التخصص:' : 'Clinic Specialty:'}
                  </label>
                  <select
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                    value={editForm.specialty}
                    onChange={(e) => {
                      const spec = e.target.value;
                      const specAr = spec === 'Dental' ? 'عيادة طب الأسنان'
                        : spec === 'General' ? 'الطب العام'
                          : spec === 'Cardiology' ? 'عيادة القلب'
                            : spec === 'Dermatology' ? 'الجلدية والليزر' : 'الصيدلية';
                      setEditForm({ ...editForm, specialty: spec, specialtyAr: specAr });
                    }}
                  >
                    <option value="Dental">{isAr ? 'عيادة طب الأسنان' : 'Dental Clinic'}</option>
                    <option value="General">{isAr ? 'الطب العام' : 'General Practice'}</option>
                    <option value="Cardiology">{isAr ? 'عيادة القلب' : 'Cardiology'}</option>
                    <option value="Dermatology">{isAr ? 'الجلدية والليزر' : 'Dermatology'}</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      {isAr ? 'اليوم المفضل:' : 'Preferred Day:'}
                    </label>
                    <select
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px' }}
                      value={editForm.date}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    >
                      <option value="اليوم">{isAr ? 'اليوم' : 'Today'}</option>
                      <option value="غداً (الخميس)">{isAr ? 'غداً (الخميس)' : 'Tomorrow (Thursday)'}</option>
                      <option value="السبت القادم">{isAr ? 'السبت القادم' : 'Next Saturday'}</option>
                      <option value="الأحد القادم">{isAr ? 'الأحد القادم' : 'Next Sunday'}</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      {isAr ? 'الوقت المفضل:' : 'Preferred Time:'}
                    </label>
                    <select
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px' }}
                      value={editForm.time}
                      onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                    >
                      <option value="10:00 صباحاً">10:00 AM</option>
                      <option value="11:30 صباحاً">11:30 AM</option>
                      <option value="02:00 مساءً">02:00 PM</option>
                      <option value="04:00 عصراً">04:00 PM</option>
                      <option value="06:30 مساءً">06:30 PM</option>
                      <option value="08:00 مساءً">08:00 PM</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '8px 14px', borderRadius: '8px', fontSize: '12.5px', cursor: 'pointer' }}
                    onClick={() => setEditModalOpen(false)}
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    style={{ background: '#0D7C66', color: '#FFFFFF', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {isAr ? '✓ حفظ وتطبيق التعديل' : '✓ Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="qa-toast" style={{ display: clientToastVisible ? 'flex' : 'none' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{clientToast}</span>
        </div>
      </main>
    </div>
  );
}
