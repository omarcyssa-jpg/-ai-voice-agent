import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const TaskContext = createContext();

export const SUPABASE_URL = 'https://bdbnenxbvbecotlocbmp.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkYm5lbnhidmJlY290bG9jYm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3MDE0NTgsImV4cCI6MjEwOTI3NzQ1OH0.oaHJc0Q6qoXtnHhG4ajBztHLmowklTGDoErtPT-lsIQ';

function formatTimeAgo(isoString) {
  if (!isoString) return 'منذ قليل';
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    const h = Math.floor(diffMins / 60);
    if (h < 24) return `منذ ${h} ساعة`;
    return `منذ ${Math.floor(h / 24)} يوم`;
  } catch {
    return 'منذ قليل';
  }
}

function formatTimeAgoEn(isoString) {
  if (!isoString) return 'Just now';
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const h = Math.floor(diffMins / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  } catch {
    return 'Just now';
  }
}

function safeParseTranscript(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

const SPECIALTY_MAP = {
  Dental: 'طب الأسنان',
  General: 'الطب العام',
  Cardiology: 'عيادة القلب',
  Dermatology: 'الجلدية والليزر',
  Pharmacy: 'الصيدلية',
  Cosmetic: 'عيادة التجميل'
};

function mapRow(row) {
  const transcript = safeParseTranscript(row.transcript);
  const specEn = row.specialty || 'General';
  const specAr = row.specialty_ar || SPECIALTY_MAP[specEn] || specEn;

  const finalTranscript =
    transcript.length > 0
      ? transcript
      : row.request
      ? [
          { role: 'assistant', text: 'أهلاً بك في عيادات عافية، معك سارة المساعد الصوتي. كيف أقدر أساعدك اليوم؟', time: '—' },
          { role: 'customer', text: row.request, time: '—' },
          { role: 'assistant', text: 'تم تسجيل طلبك بنجاح. سيتواصل معك فريق الاستقبال قريباً.', time: '—' }
        ]
      : [];

  return {
    id: row.id,
    customer: row.customer || 'مراجع عيادات عافية',
    customerEn: row.customer_en || row.customer || 'Patient',
    phone: row.phone || '—',
    specialty: specEn,
    specialtyAr: specAr,
    preferred_date: row.preferred_date || 'اليوم',
    preferred_time: row.preferred_time || '',
    status: row.status || 'New',
    priority: row.priority || 'normal',
    type: row.type || 'Appointment',
    channel: row.channel || 'web',
    request: row.request || 'طلب مسجل عبر المساعد الصوتي',
    requestEn: row.request_en || row.request || 'Voice request',
    transcript: finalTranscript,
    time: formatTimeAgo(row.created_at),
    timeEn: formatTimeAgoEn(row.created_at),
    created_at: row.created_at
  };
}

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('afiya_tasks_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const fetchTasksFromSupabase = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/tasks?select=*&order=created_at.desc`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const rows = await res.json();

      if (Array.isArray(rows) && rows.length > 0) {
        const liveTasks = rows.map(mapRow);
        setTasks(liveTasks);
        try { localStorage.setItem('afiya_tasks_v2', JSON.stringify(liveTasks)); } catch {}
        setLastSyncTime(new Date());
        return { success: true, count: liveTasks.length };
      }

      setTasks([]);
      return { success: true, count: 0 };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchTasksFromSupabase();
  }, [fetchTasksFromSupabase]);

  useEffect(() => {
    try {
      localStorage.setItem('afiya_tasks_v2', JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  const updateTaskStatus = async (id, newStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));

    try {
      await fetch(
        `${SUPABASE_URL}/rest/v1/tasks?id=eq.${encodeURIComponent(id)}`,
        {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        }
      );
    } catch (e) {
      console.warn('[TaskContext] PATCH status failed:', e.message);
    }
  };

  const addTask = (newTask) => {
    const task = {
      id: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
      time: 'الآن',
      timeEn: 'Just now',
      status: 'New',
      channel: 'web',
      priority: 'urgent',
      type: 'Appointment',
      transcript: [],
      ...newTask
    };
    setTasks(prev => [task, ...prev]);
    return task;
  };

  const resetTasks = () => {
    setTasks([]);
    try {
      localStorage.removeItem('afiya_tasks_v2');
    } catch {}
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      addTask,
      updateTaskStatus,
      resetTasks,
      fetchTasksFromSupabase,
      isSyncing,
      lastSyncTime
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within a TaskProvider');
  return ctx;
}
