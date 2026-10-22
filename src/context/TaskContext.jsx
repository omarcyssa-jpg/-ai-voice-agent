import React, { createContext, useContext, useState, useEffect } from 'react';

const TaskContext = createContext();

const INITIAL_TASKS = [
  {
    id: 'TSK-1048',
    customer: 'أحمد العتيبي',
    customerEn: 'Ahmad Al-Otaibi',
    phone: '050 123 4567',
    specialty: 'Dental',
    specialtyAr: 'طب الأسنان',
    preferred_date: 'غداً (الخميس)',
    preferred_time: '04:00 مساءً',
    time: 'منذ 5 دقائق',
    timeEn: '5 mins ago',
    status: 'New',
    priority: 'urgent',
    type: 'Appointment',
    channel: 'web',
    request: 'حجز موعد كشف أسنان عاجل بسبب ألم مستمر، يطلب الموعد غداً الساعة 4:00 عصراً.',
    requestEn: 'Urgent dental checkup appointment requested for tomorrow at 4:00 PM due to ongoing pain.',
    transcript: [
      { role: 'assistant', text: 'أهلاً بك في عيادات عافية، معك سارة المساعد الصوتي. كيف أقدر أساعدك اليوم؟', time: '10:42 ص' },
      { role: 'customer', text: 'يا هلا، حاب أحجز موعد كشف أسنان بكرة العصر الساعة 4.', time: '10:42 ص' },
      { role: 'assistant', text: 'أبشر، يسعدني ترتيب ذلك. فضلاً زودني باسمك الكريم ورقم الجوال لتأكيد الحجز.', time: '10:43 ص' },
      { role: 'customer', text: 'اسمي أحمد العتيبي، ورقم جوالي 0501234567.', time: '10:43 ص' },
      { role: 'assistant', text: 'شكراً لك يا أحمد. تم تسجيل طلبك لحجز موعد عيادة الأسنان غداً الساعة 4:00 عصراً. هل البيانات صحيحة لتأكيد الحجز؟', time: '10:43 ص' },
      { role: 'customer', text: 'نعم البيانات صحيحة، شكراً لك.', time: '10:44 ص' },
      { role: 'assistant', text: 'تم تأكيد طلبك بنجاح! سيتصل بك فريق الاستقبال للتأكيد النهائي.', time: '10:44 ص' }
    ]
  },
  {
    id: 'TSK-1047',
    customer: 'سارة القحطاني',
    customerEn: 'Sarah Al-Qahtani',
    phone: '055 842 0193',
    specialty: 'General',
    specialtyAr: 'الطب العام',
    preferred_date: 'اليوم',
    preferred_time: 'خلال ساعة',
    time: 'منذ 18 دقيقة',
    timeEn: '18 mins ago',
    status: 'In progress',
    priority: 'high',
    type: 'Callback',
    channel: 'web',
    request: 'طلب معاودة اتصال للتحقق من تغطية تأمين بوبا قبل الحضور للعيادة العامة.',
    requestEn: 'Callback request to verify Bupa insurance policy coverage before visit.',
    transcript: [
      { role: 'assistant', text: 'مرحباً بك في عيادات عافية. كيف يمكنني خدمتك؟', time: '10:29 ص' },
      { role: 'customer', text: 'أبغى أعرف هل تأمين بوبا الفئة الفضية يغطي كشف الطب العام اليوم؟', time: '10:30 ص' },
      { role: 'assistant', text: 'نعم، نعتمد بوبا العربية. هل ترغبين بتسجيل طلب معاودة اتصال لتأكيد الموافقة الفورية عبر رقم ملفك؟', time: '10:30 ص' },
      { role: 'customer', text: 'نعم يا ليت، اسمي سارة القحطاني وجوالي 0558420193.', time: '10:31 ص' }
    ]
  },
  {
    id: 'TSK-1046',
    customer: 'محمد الدوسري',
    customerEn: 'Mohammad Al-Dosari',
    phone: '053 691 2840',
    specialty: 'Cardiology',
    specialtyAr: 'عيادة القلب',
    preferred_date: 'السبت القادم',
    preferred_time: '10:00 صباحاً',
    time: 'منذ 42 دقيقة',
    timeEn: '42 mins ago',
    status: 'New',
    priority: 'urgent',
    type: 'Appointment',
    channel: 'web',
    request: 'استشارة قلبية لمتابعة ضغط الدم ومراجعة تخطيط القلب مع استشاري المركز.',
    requestEn: 'Cardiology consultation requested for Saturday morning ECG and blood pressure follow-up.',
    transcript: [
      { role: 'assistant', text: 'أهلاً بك في عيادات عافية، تفضل كيف أساعدك؟', time: '10:05 ص' },
      { role: 'customer', text: 'أريد حجز موعد مع طبيب القلب لمتابعة نتائج تخطيط القلب السبت القادم.', time: '10:06 ص' },
      { role: 'assistant', text: 'أهلاً بك أخي محمد، تم حجز موعد مبدئي السبت الساعة 10:00 ص لعيادة القلب.', time: '10:07 ص' }
    ]
  },
  {
    id: 'TSK-1045',
    customer: 'ريم الحربي',
    customerEn: 'Reem Al-Harbi',
    phone: '054 220 7631',
    specialty: 'Dermatology',
    specialtyAr: 'الجلدية والليزر',
    preferred_date: 'الأحد',
    preferred_time: '06:30 مساءً',
    time: 'منذ ساعتين',
    timeEn: '2 hours ago',
    status: 'Completed',
    priority: 'normal',
    type: 'Appointment',
    channel: 'web',
    request: 'جلسة نضارة وتقشير كربوني في عيادة الجلدية، تم تأكيد الحجز وإرسال تفاصيل الموعد عبر رسالة نصية.',
    requestEn: 'Dermatology session confirmed and SMS notification sent.',
    transcript: [
      { role: 'assistant', text: 'أهلاً بكِ في عيادات عافية. كيف نقدر نساعدك؟', time: '08:45 ص' },
      { role: 'customer', text: 'أريد حجز موعد استشارة جلدية الأحد مساءً.', time: '08:46 ص' },
      { role: 'assistant', text: 'تم تسجيل موعدك يوم الأحد 6:30 م في قسم الجلدية.', time: '08:47 ص' }
    ]
  },
  {
    id: 'TSK-1044',
    customer: 'خالد الغامدي',
    customerEn: 'Khalid Al-Ghamdi',
    phone: '050 317 9582',
    specialty: 'Pharmacy',
    specialtyAr: 'الصيدلية وصرف الأدوية',
    preferred_date: 'اليوم',
    preferred_time: 'فوري',
    time: 'منذ 3 ساعات',
    timeEn: '3 hours ago',
    status: 'Completed',
    priority: 'high',
    type: 'Callback',
    channel: 'web',
    request: 'طلب تكرار وصفة دواء مزمن معتمد وتوصيله للمنزل.',
    requestEn: 'Prescription refill request for chronic allergy medication.',
    transcript: [
      { role: 'assistant', text: 'مرحباً بك في عيادات عافية، معك المساعد الصوتي.', time: '07:30 ص' },
      { role: 'customer', text: 'أحتاج تجديد وصفة علاج الحساسية المزمنة المرسلة بالملف.', time: '07:31 ص' }
    ]
  }
];

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('afiya_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('afiya_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to persist tasks', e);
    }
  }, [tasks]);

  const addTask = (newTask) => {
    const taskWithId = {
      id: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
      time: 'الآن',
      timeEn: 'Just now',
      status: 'New',
      channel: 'web',
      priority: newTask.priority || 'urgent',
      type: newTask.type || 'Appointment',
      ...newTask,
    };
    setTasks((prev) => [taskWithId, ...prev]);
    return taskWithId;
  };

  const updateTaskStatus = (id, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  };

  const resetTasks = () => {
    setTasks(INITIAL_TASKS);
    localStorage.setItem('afiya_tasks', JSON.stringify(INITIAL_TASKS));
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTaskStatus, resetTasks }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within a TaskProvider');
  return ctx;
}
