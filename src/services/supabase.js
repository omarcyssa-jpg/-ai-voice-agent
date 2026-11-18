export const SUPABASE_URL = 'https://bdbnenxbvbecotlocbmp.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkYm5lbnhidmJlY290bG9jYm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3MDE0NTgsImV4cCI6MjEwOTI3NzQ1OH0.oaHJc0Q6qoXtnHhG4ajBztHLmowklTGDoErtPT-lsIQ';

const REST_URL = `${SUPABASE_URL}/rest/v1`;

const DEFAULT_HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

async function apiRequest(endpoint, options = {}) {
  const url = `${REST_URL}/${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...DEFAULT_HEADERS,
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      let errorText = '';
      try {
        const errJson = await response.json();
        errorText = errJson.message || errJson.error || JSON.stringify(errJson);
      } catch {
        errorText = `HTTP ${response.status} ${response.statusText}`;
      }
      return { success: false, status: response.status, error: errorText };
    }

    if (response.status === 204) {
      return { success: true, status: 204, data: null };
    }

    const data = await response.json();
    return { success: true, status: response.status, data };
  } catch (err) {
    return { success: false, status: 0, error: err.message || 'Network connection failed' };
  }
}

export const authService = {
  SESSION_KEY: 'afiya_admin_session',

  async login(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    const res = await apiRequest(`admin_users?email=ilike.${encodeURIComponent(cleanEmail)}&select=*&limit=1`);

    if (!res.success) {
      return { success: false, error: res.error || 'تعذر الاتصال بقاعدة البيانات' };
    }

    const users = res.data;
    if (!Array.isArray(users) || users.length === 0) {
      return { success: false, error: 'البريد الإلكتروني غير مسجل في النظام' };
    }

    const user = users[0];

    if (user.is_active === false) {
      return { success: false, error: 'هذا الحساب معطل مؤقتاً، يرجى مراجعة إدارة العيادة' };
    }

    if (user.password !== cleanPass) {
      return { success: false, error: 'كلمة المرور غير صحيحة، يرجى المحاولة مجدداً' };
    }

    try {
      await apiRequest(`admin_users?id=eq.${encodeURIComponent(user.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ last_login: new Date().toISOString() }),
      });
    } catch {}

    const sessionData = {
      id: user.id,
      email: user.email,
      full_name: user.full_name || 'مدير النظام',
      full_name_en: user.full_name_en || 'System Administrator',
      role: user.role || 'مسؤول النظام',
      role_en: user.role_en || 'System Admin',
      logged_at: new Date().toISOString()
    };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));

    return { success: true, user: sessionData };
  },

  getCurrentUser() {
    try {
      const saved = localStorage.getItem(this.SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!this.getCurrentUser();
  },

  logout() {
    localStorage.removeItem(this.SESSION_KEY);
  }
};

export const knowledgeService = {
  async getFaqs() {
    return await apiRequest('knowledge_base?select=*&order=id.asc');
  },

  async createFaq(faq) {
    const payload = {
      question_ar: faq.questionAr,
      answer_ar: faq.answerAr,
      question_en: faq.questionEn || faq.questionAr,
      answer_en: faq.answerEn || faq.answerAr,
      category: faq.category || 'مواعيد العمل',
      category_en: faq.categoryEn || 'Operations',
      enabled: faq.enabled !== undefined ? faq.enabled : true,
    };

    return await apiRequest('knowledge_base', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(payload),
    });
  },

  async updateFaq(id, faq) {
    const payload = {};
    if (faq.questionAr !== undefined) payload.question_ar = faq.questionAr;
    if (faq.answerAr !== undefined) payload.answer_ar = faq.answerAr;
    if (faq.questionEn !== undefined) payload.question_en = faq.questionEn;
    if (faq.answerEn !== undefined) payload.answer_en = faq.answerEn;
    if (faq.category !== undefined) payload.category = faq.category;
    if (faq.categoryEn !== undefined) payload.category_en = faq.categoryEn;
    if (faq.enabled !== undefined) payload.enabled = faq.enabled;

    return await apiRequest(`knowledge_base?id=eq.${id}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(payload),
    });
  },

  async toggleEnabled(id, currentEnabled) {
    return this.updateFaq(id, { enabled: !currentEnabled });
  },

  async deleteFaq(id) {
    return await apiRequest(`knowledge_base?id=eq.${id}`, {
      method: 'DELETE',
    });
  }
};

export const voiceSettingsService = {
  SETTINGS_ID: 'current_settings',

  async getSettings() {
    const res = await apiRequest(`voice_settings?id=eq.${this.SETTINGS_ID}&select=*&limit=1`);
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      const row = res.data[0];
      return {
        success: true,
        data: {
          voiceId: row.voice_id || 'sarah',
          dialectId: row.dialect_id || 'najdi',
          speed: row.speed || '1.0',
          pitch: row.pitch || 'normal',
          strictness: row.strictness || 'strict',
          englishFallback: row.english_fallback !== undefined ? row.english_fallback : true,
          bargeIn: row.barge_in !== undefined ? row.barge_in : true,
          customPrompt: row.custom_prompt || '',
          updatedAt: row.updated_at
        }
      };
    }
    return res;
  },

  async saveSettings(settings) {
    const payload = {
      id: this.SETTINGS_ID,
      voice_id: settings.voiceId,
      dialect_id: settings.dialectId,
      speed: settings.speed,
      pitch: settings.pitch,
      strictness: settings.strictness,
      english_fallback: settings.englishFallback,
      barge_in: settings.bargeIn,
      custom_prompt: settings.customPrompt || '',
      updated_at: new Date().toISOString()
    };

    return await apiRequest('voice_settings', {
      method: 'POST',
      headers: {
        Prefer: 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(payload),
    });
  }
};

export const clinicSettingsService = {
  CLINIC_ID: 'riyadh_branch',

  async getSettings() {
    const res = await apiRequest(`clinic_settings?id=eq.${this.CLINIC_ID}&select=*&limit=1`);
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      const row = res.data[0];
      return {
        success: true,
        data: {
          clinicNameAr: row.clinic_name_ar || 'عيادات عافية - فرع الرياض',
          clinicNameEn: row.clinic_name_en || 'Afiya Clinics - Riyadh Branch',
          primaryPhone: row.primary_phone || '011 234 5678',
          backupPhone: row.backup_phone || '',
          addressAr: row.address_ar || 'طريق الملك فهد - حي العليا، الرياض',
          addressEn: row.address_en || 'King Fahd Rd, Al-Olayya, Riyadh',
          welcomeAr: row.welcome_ar || 'أهلاً بك في عيادات عافية، معك المساعد الصوتي. كيف أقدر أساعدك اليوم؟',
          welcomeEn: row.welcome_en || "Hello, I'm Afiya's assistant. How can I help you today?",
          emergencyAr: row.emergency_ar || 'في الحالات الطارئة، يرجى الاتصال بالإسعاف فوراً (997) أو التوجه لأقرب طوارئ. المساعد الصوتي مخصص للخدمات الإدارية وحجز المواعيد فقط ولا يقدم تشخيصاً طبياً.',
          emergencyEn: row.emergency_en || 'For a medical emergency, contact local emergency services immediately (997). This assistant is for administrative services only.',
          schedule: row.schedule || [],
          updatedAt: row.updated_at
        }
      };
    }
    return res;
  },

  async saveSettings(settings) {
    const payload = {
      id: this.CLINIC_ID,
      clinic_name_ar: settings.clinicNameAr || 'عيادات عافية - فرع الرياض',
      clinic_name_en: settings.clinicNameEn || 'Afiya Clinics - Riyadh Branch',
      primary_phone: settings.primaryPhone,
      backup_phone: settings.backupPhone || '',
      address_ar: settings.addressAr || 'طريق الملك فهد - حي العليا، الرياض',
      address_en: settings.addressEn || 'King Fahd Rd, Al-Olayya, Riyadh',
      welcome_ar: settings.welcomeAr,
      welcome_en: settings.welcomeEn,
      emergency_ar: settings.emergencyAr,
      emergency_en: settings.emergencyEn,
      schedule: settings.schedule,
      updated_at: new Date().toISOString()
    };

    return await apiRequest('clinic_settings', {
      method: 'POST',
      headers: {
        Prefer: 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(payload),
    });
  }
};
