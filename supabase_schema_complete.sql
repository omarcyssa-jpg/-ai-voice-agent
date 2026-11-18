CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(50) PRIMARY KEY,
    customer VARCHAR(150) NOT NULL,
    customer_en VARCHAR(150),
    phone VARCHAR(30),
    specialty VARCHAR(100) DEFAULT 'Dental',
    specialty_ar VARCHAR(100) DEFAULT 'طب الأسنان',
    preferred_date VARCHAR(100),
    preferred_time VARCHAR(100),
    status VARCHAR(50) DEFAULT 'New',
    priority VARCHAR(50) DEFAULT 'urgent',
    type VARCHAR(50) DEFAULT 'Appointment',
    channel VARCHAR(50) DEFAULT 'web',
    request TEXT,
    request_en TEXT,
    transcript JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_phone ON tasks (phone);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on tasks" ON tasks;
DROP POLICY IF EXISTS "Allow public read access" ON tasks;
CREATE POLICY "Allow public read access on tasks" ON tasks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access on tasks" ON tasks;
DROP POLICY IF EXISTS "Allow public insert access" ON tasks;
CREATE POLICY "Allow public insert access on tasks" ON tasks FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access on tasks" ON tasks;
DROP POLICY IF EXISTS "Allow public update access" ON tasks;
CREATE POLICY "Allow public update access on tasks" ON tasks FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete access on tasks" ON tasks;
CREATE POLICY "Allow public delete access on tasks" ON tasks FOR DELETE USING (true);

CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL DEFAULT 'مدير النظام',
    full_name_en VARCHAR(150) DEFAULT 'System Administrator',
    role VARCHAR(100) DEFAULT 'المدير الطبي والتشغيلي',
    role_en VARCHAR(100) DEFAULT 'Medical & Operations Director',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users (email);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on admin_users" ON admin_users;
CREATE POLICY "Allow public read access on admin_users" ON admin_users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access on admin_users" ON admin_users;
CREATE POLICY "Allow public insert access on admin_users" ON admin_users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access on admin_users" ON admin_users;
CREATE POLICY "Allow public update access on admin_users" ON admin_users FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete access on admin_users" ON admin_users;
CREATE POLICY "Allow public delete access on admin_users" ON admin_users FOR DELETE USING (true);

INSERT INTO admin_users (email, password, full_name, full_name_en, role, role_en)
VALUES (
    'admin@afiya.clinic',
    'Admin@123456',
    'د. نورة السبيعي',
    'Dr. Noura Al-Subaie',
    'المدير الطبي والتشغيلي',
    'Medical & Operations Director'
)
ON CONFLICT (email) DO UPDATE 
SET password = EXCLUDED.password,
    full_name = EXCLUDED.full_name,
    full_name_en = EXCLUDED.full_name_en,
    role = EXCLUDED.role,
    role_en = EXCLUDED.role_en;

CREATE TABLE IF NOT EXISTS knowledge_base (
    id BIGSERIAL PRIMARY KEY,
    question_ar TEXT NOT NULL,
    answer_ar TEXT NOT NULL,
    question_en TEXT,
    answer_en TEXT,
    category VARCHAR(100) DEFAULT 'مواعيد العمل',
    category_en VARCHAR(100) DEFAULT 'Operations',
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_knowledge_question_ar UNIQUE (question_ar)
);

CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge_base (category);
CREATE INDEX IF NOT EXISTS idx_knowledge_enabled ON knowledge_base (enabled);

ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on knowledge_base" ON knowledge_base;
CREATE POLICY "Allow public read access on knowledge_base" ON knowledge_base FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access on knowledge_base" ON knowledge_base;
CREATE POLICY "Allow public insert access on knowledge_base" ON knowledge_base FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access on knowledge_base" ON knowledge_base;
CREATE POLICY "Allow public update access on knowledge_base" ON knowledge_base FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete access on knowledge_base" ON knowledge_base;
CREATE POLICY "Allow public delete access on knowledge_base" ON knowledge_base FOR DELETE USING (true);

INSERT INTO knowledge_base (question_ar, answer_ar, question_en, answer_en, category, category_en, enabled)
VALUES
(
    'ما هي أوقات عمل عيادات عافية وموقعكم؟',
    'تستقبلكم عيادات عافية فرع الرياض من السبت إلى الخميس من 8:00 صباحاً حتى 10:00 مساءً، والجمعة من 4:00 عصراً حتى 9:00 مساءً. موقعنا: طريق الملك فهد - حي العليا.',
    'What are Afiya Clinics operating hours and location?',
    'Afiya Clinics Riyadh branch is open Saturday to Thursday from 8:00 AM to 10:00 PM, and Friday from 4:00 PM to 9:00 PM. Location: King Fahd Rd, Al-Olayya, Riyadh.',
    'مواعيد العمل', 'Operations', true
),
(
    'ما هي باقات وخدمات عيادات الأسنان المتوفرة؟',
    'نقدم في قسم الأسنان: كشف وتنظيف الأسنان الدوري، علاج العصب، زراعة الأسنان الألمانية والسويسرية، تقويم الأسنان الشفاف والتقليدي، وتبييض الأسنان بالليزر وقوالب الزيركون.',
    'What dental services and packages are available?',
    'We provide comprehensive dental care including routine checkups, root canal, German & Swiss dental implants, clear aligners, and laser teeth whitening.',
    'الخدمات والعيادات', 'Services', true
),
(
    'ما هي خدمات عيادة الجلدية والتجميل والليزر؟',
    'تتوفر جلسات إزالة الشعر بالليزر بأحدث أجهزة دويتو وجنتل ليز، جلسات نضارة الهايدرافيشل، حقن الفيلر والبوتوكس، والتقشير الكربوني وعلاج التصبغات.',
    'What dermatology and laser aesthetics services do you offer?',
    'We offer laser hair removal with Duetto & GentleLase, HydraFacial sessions, Botox & fillers, carbon laser peeling, and hyperpigmentation treatment.',
    'الخدمات والعيادات', 'Services', true
),
(
    'ما هي شركات التأمين الطبي المعتمدة لديكم؟',
    'نعتمد بوبا العربية، التعاونية، ميدغلف، ملاذ، والراجحي تكافل، مع موافقة فورية وتغطية مباشرة للوثائق المعتمدة.',
    'Which medical insurance providers are approved?',
    'We accept Bupa Arabia, Tawuniya, Medgulf, Malath, and Al-Rajhi Takaful with immediate digital approvals.',
    'التأمين', 'Insurance', true
),
(
    'هل يستطيع المساعد الصوتي حجز موعد عاجل في نفس اليوم؟',
    'نعم، يرتبط المساعد الصوتي مباشرة بجدول مواعيد الأطباء ويؤكد الحجوزات الفورية في حال توفر خانات شاغرة، مع إرسال تأكيد SMS فوري.',
    'Can the AI voice assistant book same-day appointments?',
    'Yes, the AI voice assistant connects to real-time clinician schedules and can book urgent same-day slots with instant SMS confirmation.',
    'الحجوزات', 'Appointments', true
),
(
    'ما هي سياسة إلغاء أو إعادة جدولة المواعيد؟',
    'يمكن إلغاء أو تعديل الموعد عبر المساعد الصوتي أو الاستقبال حتى ساعتين قبل الموعد المحدد بدون أي رسوم إلغاء.',
    'What is your cancellation and rescheduling policy?',
    'Appointments can be rescheduled or cancelled via the AI agent or reception up to 2 hours before the scheduled time with zero fees.',
    'السياسات', 'Policies', true
)
ON CONFLICT (question_ar) DO UPDATE
SET answer_ar = EXCLUDED.answer_ar,
    question_en = EXCLUDED.question_en,
    answer_en = EXCLUDED.answer_en,
    category = EXCLUDED.category,
    category_en = EXCLUDED.category_en,
    enabled = EXCLUDED.enabled;

CREATE TABLE IF NOT EXISTS voice_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'current_settings',
    voice_id VARCHAR(50) DEFAULT 'sarah',
    dialect_id VARCHAR(50) DEFAULT 'najdi',
    speed VARCHAR(20) DEFAULT '1.0',
    pitch VARCHAR(20) DEFAULT 'normal',
    strictness VARCHAR(50) DEFAULT 'strict',
    english_fallback BOOLEAN DEFAULT true,
    barge_in BOOLEAN DEFAULT true,
    custom_prompt TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE voice_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on voice_settings" ON voice_settings;
CREATE POLICY "Allow public read access on voice_settings" ON voice_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access on voice_settings" ON voice_settings;
CREATE POLICY "Allow public insert access on voice_settings" ON voice_settings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access on voice_settings" ON voice_settings;
CREATE POLICY "Allow public update access on voice_settings" ON voice_settings FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete access on voice_settings" ON voice_settings;
CREATE POLICY "Allow public delete access on voice_settings" ON voice_settings FOR DELETE USING (true);

INSERT INTO voice_settings (id, voice_id, dialect_id, speed, pitch, strictness, english_fallback, barge_in)
VALUES ('current_settings', 'sarah', 'najdi', '1.0', 'normal', 'strict', true, true)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS clinic_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'riyadh_branch',
    clinic_name_ar VARCHAR(200) DEFAULT 'عيادات عافية - فرع الرياض',
    clinic_name_en VARCHAR(200) DEFAULT 'Afiya Clinics - Riyadh Branch',
    primary_phone VARCHAR(50) DEFAULT '011 234 5678',
    backup_phone VARCHAR(50) DEFAULT '055 123 4567',
    address_ar TEXT DEFAULT 'طريق الملك فهد - حي العليا، الرياض',
    address_en TEXT DEFAULT 'King Fahd Rd, Al-Olayya, Riyadh',
    welcome_ar TEXT DEFAULT 'أهلاً بك في عيادات عافية، معك المساعد الصوتي. كيف أقدر أساعدك اليوم؟',
    welcome_en TEXT DEFAULT 'Hello, I''m Afiya''s voice assistant. How can I help you today?',
    emergency_ar TEXT DEFAULT 'في الحالات الطارئة، يرجى الاتصال بالإسعاف فوراً (997) أو التوجه لأقرب طوارئ. المساعد الصوتي مخصص للخدمات الإدارية وحجز المواعيد فقط ولا يقدم تشخيصاً طبياً.',
    emergency_en TEXT DEFAULT 'For medical emergencies, call 997 immediately. This voice assistant is for administrative bookings only.',
    schedule JSONB DEFAULT '[
      {"id":"sat","dayAr":"السبت","dayEn":"Saturday","open":"09:00 AM","close":"09:00 PM","isOpen":true},
      {"id":"sun","dayAr":"الأحد","dayEn":"Sunday","open":"09:00 AM","close":"09:00 PM","isOpen":true},
      {"id":"mon","dayAr":"الاثنين","dayEn":"Monday","open":"09:00 AM","close":"09:00 PM","isOpen":true},
      {"id":"tue","dayAr":"الثلاثاء","dayEn":"Tuesday","open":"09:00 AM","close":"09:00 PM","isOpen":true},
      {"id":"wed","dayAr":"الأربعاء","dayEn":"Wednesday","open":"09:00 AM","close":"09:00 PM","isOpen":true},
      {"id":"thu","dayAr":"الخميس","dayEn":"Thursday","open":"09:00 AM","close":"09:00 PM","isOpen":true},
      {"id":"fri","dayAr":"الجمعة","dayEn":"Friday","open":"04:00 PM","close":"09:00 PM","isOpen":false}
    ]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on clinic_settings" ON clinic_settings;
CREATE POLICY "Allow public read access on clinic_settings" ON clinic_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access on clinic_settings" ON clinic_settings;
CREATE POLICY "Allow public insert access on clinic_settings" ON clinic_settings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access on clinic_settings" ON clinic_settings;
CREATE POLICY "Allow public update access on clinic_settings" ON clinic_settings FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete access on clinic_settings" ON clinic_settings;
CREATE POLICY "Allow public delete access on clinic_settings" ON clinic_settings FOR DELETE USING (true);

INSERT INTO clinic_settings (id, clinic_name_ar, primary_phone, backup_phone)
VALUES ('riyadh_branch', 'عيادات عافية - فرع الرياض', '011 234 5678', '055 123 4567')
ON CONFLICT (id) DO UPDATE
SET clinic_name_ar = EXCLUDED.clinic_name_ar,
    primary_phone = EXCLUDED.primary_phone,
    backup_phone = EXCLUDED.backup_phone;
