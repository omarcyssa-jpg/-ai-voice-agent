import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTasks } from '../context/TaskContext';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

const STATUS_CLASS = {
  New: 'pill-new',
  'In progress': 'pill-progress',
  Completed: 'pill-completed',
  Cancelled: 'pill-cancelled',
};

const WAVE_HEIGHTS = [8, 14, 22, 34, 18, 12, 28, 38, 26, 14, 30, 40, 32, 20, 10, 18, 36, 28, 16, 24, 38, 32, 14, 26, 38, 22, 12, 32, 40, 30];

function drawWaveform(canvas, isPlaying = false) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 30; i++) {
    const x = i * 10;
    const h = isPlaying ? Math.floor(Math.random() * 28) + 8 : WAVE_HEIGHTS[i % WAVE_HEIGHTS.length];
    const y = (40 - h) / 2;
    ctx.fillStyle = i < 14 ? '#0D7C66' : '#CBD5E1';
    ctx.fillRect(x, y, 4, h);
  }
}

export default function Dashboard({ onNavigate }) {
  const { lang, isAr, t } = useLanguage();
  const { tasks, updateTaskStatus, resetTasks } = useTasks();

  const [filter, setFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [backdropVisible, setBackdropVisible] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const canvasRef = useRef(null);
  const playTimer = useRef(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    document.title = isAr
      ? 'لوحة الإدارة والمهام الصوتية — عيادات عافية'
      : 'Overview & Tasks — Afiya Clinics | AI Voice Agent';
    document.body.classList.remove('login-body');
    document.body.classList.add('app-body');
    return () => {
      clearInterval(playTimer.current);
      clearTimeout(toastTimer.current);
    };
  }, [isAr]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 3000);
  };

  const kpiNew = tasks.filter((x) => x.status === 'New').length;
  const kpiProgress = tasks.filter((x) => x.status === 'In progress').length;
  const kpiCompleted = tasks.filter((x) => x.status === 'Completed').length;
  const kpiUrgent = tasks.filter((x) => x.priority === 'urgent' && x.status !== 'Completed').length;

  const filterTabs = isAr
    ? [
        { key: 'All', label: 'الكل' },
        { key: 'New', label: `جديد (${kpiNew})` },
        { key: 'In progress', label: `قيد المتابعة (${kpiProgress})` },
        { key: 'Completed', label: `مكتمل (${kpiCompleted})` },
        { key: 'Cancelled', label: 'ملغي' }
      ]
    : [
        { key: 'All', label: 'All' },
        { key: 'New', label: `New (${kpiNew})` },
        { key: 'In progress', label: `In progress (${kpiProgress})` },
        { key: 'Completed', label: `Completed (${kpiCompleted})` },
        { key: 'Cancelled', label: 'Cancelled' }
      ];

  const filteredTasks = tasks.filter((r) => {
    const matchesFilter = filter === 'All' || r.status === filter;
    const matchesDept = deptFilter === 'All' || r.specialty === deptFilter || r.specialtyAr === deptFilter;
    const s = search.toLowerCase();
    const matchesSearch =
      !s ||
      r.customer?.toLowerCase().includes(s) ||
      r.customerEn?.toLowerCase().includes(s) ||
      r.phone?.includes(s) ||
      r.id?.toLowerCase().includes(s) ||
      r.request?.toLowerCase().includes(s);

    return matchesFilter && matchesDept && matchesSearch;
  });

  const openDrawer = (task) => {
    setSelectedTask(task);
    setBackdropVisible(true);
    setTimeout(() => setDrawerOpen(true), 10);
    setTimeout(() => drawWaveform(canvasRef.current, false), 50);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setIsPlayingAudio(false);
    clearInterval(playTimer.current);
    setTimeout(() => {
      setBackdropVisible(false);
      setSelectedTask(null);
    }, 300);
  };

  const toggleAudioPlay = () => {
    const next = !isPlayingAudio;
    setIsPlayingAudio(next);
    if (next) {
      playTimer.current = setInterval(() => {
        drawWaveform(canvasRef.current, true);
      }, 120);
      showToast(isAr ? 'جاري تشغيل التسجيل الصوتي للمكالمة...' : 'Playing call voice recording...');
    } else {
      clearInterval(playTimer.current);
      drawWaveform(canvasRef.current, false);
    }
  };

  const handleStatusChange = (taskId, newStatus) => {
    updateTaskStatus(taskId, newStatus);
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask((prev) => ({ ...prev, status: newStatus }));
    }
    const statusLabel = isAr
      ? newStatus === 'In progress' ? 'قيد المتابعة' : newStatus === 'Completed' ? 'مكتمل' : newStatus === 'Cancelled' ? 'ملغي' : 'جديد'
      : newStatus;
    showToast(isAr ? `تم تحديث حالة المهمة #${taskId} إلى: ${statusLabel}` : `Task #${taskId} updated to ${statusLabel}`);
  };

  return (
    <>
      <div className="app-layout">
        <AdminSidebar activePath="/dashboard" onNavigate={onNavigate} />

        <main className="app-main">
          <AdminHeader onNavigate={onNavigate} />

          <div className="page-content-exact">
            <div className="overview-top-row">
              <button
                type="button"
                className="btn-update-data"
                id="btnUpdateData"
                onClick={() => {
                  showToast(isAr ? 'تم تحديث البيانات وتزامن مهام الصوت بنجاح!' : 'Data synced and updated with voice channel!');
                }}
              >
                <span>{isAr ? 'تحديث ومزامنة البيانات' : 'Sync Voice Tasks'}</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-1.42"></path>
                </svg>
              </button>

              <div className="overview-title-block">
                <h1 className="overview-heading">
                  {isAr ? 'لوحة إدارة المهام والمواعيد الصوتية' : 'AI Voice Tasks & Operations Dashboard'}
                </h1>
                <p className="overview-subtext">
                  {isAr
                    ? 'متابعة حية وفورية للمهام والمواعيد الواردة عبر المساعد الصوتي لعيادات عافية'
                    : 'Real-time action hub for incoming patient appointments and callback requests'}
                </p>
              </div>
            </div>

            <div className="overview-kpi-grid">
              <div className="overview-kpi-card" onClick={() => setFilter('New')} style={{ cursor: 'pointer' }}>
                <div className="kpi-card-inner">
                  <div className="kpi-icon-circ mint-circ">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D7C66" strokeWidth="2.3">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <div className="kpi-text-meta">
                    <strong className="kpi-label-text">{isAr ? 'مهام جديدة للمراجعة' : 'New Incoming Tasks'}</strong>
                    <span className="kpi-sub-text">{isAr ? 'تتطلب تأكيد أو اتصال' : 'Awaiting review'} •</span>
                  </div>
                </div>
                <div className="kpi-big-num" style={{ color: '#0D7C66' }}>{`0${kpiNew}`}</div>
              </div>

              <div className="overview-kpi-card" onClick={() => setFilter('In progress')} style={{ cursor: 'pointer' }}>
                <div className="kpi-card-inner">
                  <div className="kpi-icon-circ" style={{ background: '#FEF3C7', color: '#D97706' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.3">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <div className="kpi-text-meta">
                    <strong className="kpi-label-text">{isAr ? 'قيد المتابعة والتنفيذ' : 'In Progress'}</strong>
                    <span className="kpi-sub-text">{isAr ? 'يقوم الفريق بالتواصل' : 'Handled by staff'} •</span>
                  </div>
                </div>
                <div className="kpi-big-num" style={{ color: '#D97706' }}>{`0${kpiProgress}`}</div>
              </div>

              <div className="overview-kpi-card" onClick={() => setFilter('Completed')} style={{ cursor: 'pointer' }}>
                <div className="kpi-card-inner">
                  <div className="kpi-icon-circ" style={{ background: '#DCFCE7', color: '#16A34A' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.3">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="9 12 11 14 15 10"></polyline>
                    </svg>
                  </div>
                  <div className="kpi-text-meta">
                    <strong className="kpi-label-text">{isAr ? 'تم إنجازها اليوم' : 'Completed Tasks'}</strong>
                    <span className="kpi-sub-text">{isAr ? 'تم حجز الموعد وتأكيده' : 'Resolved & confirmed'} •</span>
                  </div>
                </div>
                <div className="kpi-big-num" style={{ color: '#16A34A' }}>{kpiCompleted}</div>
              </div>

              <div className="overview-kpi-card" style={{ borderLeft: isAr ? 'none' : '4px solid #EF4444', borderRight: isAr ? '4px solid #EF4444' : 'none' }}>
                <div className="kpi-card-inner">
                  <div className="kpi-icon-circ" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.3">
                      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <div className="kpi-text-meta">
                    <strong className="kpi-label-text">{isAr ? 'فرز عاجل وطارئ' : 'Urgent Triage'}</strong>
                    <span className="kpi-sub-text">{isAr ? 'أولوية قصوى' : 'Immediate callback'} •</span>
                  </div>
                </div>
                <div className="kpi-big-num" style={{ color: '#DC2626' }}>{`0${kpiUrgent}`}</div>
              </div>
            </div>

            <div className="requests-card-exact">
              <div className="requests-head-bar">
                <div className="req-left-count">
                  <span>{isAr ? `${filteredTasks.length} مهمة مطابقة` : `${filteredTasks.length} matching tasks`}</span>
                  <span className="cat-tag-pill" style={{ marginInlineStart: '8px' }}>
                    {isAr ? 'قناة الصوت: الموقع الإلكتروني' : 'Channel: Web Voice'}
                  </span>
                </div>

                <div className="req-right-title">
                  <h2 className="req-title-text">{isAr ? 'قائمة المهام والطلبات الواردة' : 'Incoming Task Stream'}</h2>
                </div>
              </div>

              <div className="requests-filter-row" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="filter-tabs-exact">
                  {filterTabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      className={`tab-pill${filter === tab.key ? ' active' : ''}`}
                      onClick={() => setFilter(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select
                    className="form-input-exact"
                    style={{ padding: '7px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                  >
                    <option value="All">{isAr ? 'كافة الأقسام' : 'All Departments'}</option>
                    <option value="Dental">{isAr ? 'طب الأسنان' : 'Dental'}</option>
                    <option value="General">{isAr ? 'الطب العام' : 'General Practice'}</option>
                    <option value="Cardiology">{isAr ? 'عيادة القلب' : 'Cardiology'}</option>
                    <option value="Dermatology">{isAr ? 'الجلدية' : 'Dermatology'}</option>
                    <option value="Pharmacy">{isAr ? 'الصيدلية' : 'Pharmacy'}</option>
                  </select>

                  <div className="search-box-exact" style={{ width: '280px' }}>
                    <input
                      type="text"
                      placeholder={isAr ? 'بحث بالاسم، الجوال، أو الطلب...' : 'Search by name, phone or slot...'}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="requests-table-exact">
                  <thead>
                    <tr>
                      <th style={{ width: '130px' }}>{isAr ? 'الإجراء' : 'Action'}</th>
                      <th style={{ width: '110px' }}>{isAr ? 'الأولوية' : 'Priority'}</th>
                      <th style={{ width: '110px' }}>{isAr ? 'الحالة' : 'Status'}</th>
                      <th style={{ width: '110px' }}>{isAr ? 'النوع' : 'Type'}</th>
                      <th>{isAr ? 'المستخرج الصوتي وتفاصيل الطلب' : 'Extracted Request Details'}</th>
                      <th style={{ width: '140px' }}>{isAr ? 'القسم / العيادة' : 'Department'}</th>
                      <th style={{ width: '170px' }}>{isAr ? 'المراجع والهاتف' : 'Patient & Contact'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                          {isAr ? 'لا توجد مهام مطابقة لخيارات البحث الحالية.' : 'No matching tasks found.'}
                        </td>
                      </tr>
                    ) : (
                      filteredTasks.map((row) => {
                        const isDone = row.status === 'Completed';
                        return (
                          <tr key={row.id}>
                            <td>
                              <button
                                type="button"
                                className="btn-view-link"
                                onClick={() => openDrawer(row)}
                                title={isAr ? 'عرض التفاصيل والتفريغ الصوتي' : 'View Details & Transcript'}
                              >
                                <span>{isAr ? 'التفاصيل' : 'View'}</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <line x1="5" y1="12" x2="19" y2="12"></line>
                                  <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                              </button>
                            </td>

                            <td>
                              <span className={`priority-tag ${isDone ? 'done' : row.priority || 'normal'}`}>
                                {row.priority === 'urgent' ? '🔴 عاجل' : row.priority === 'high' ? '🟡 هام' : '🔵 عادي'}
                              </span>
                            </td>

                            <td>
                              <span className={`req-status-pill ${STATUS_CLASS[row.status] || 'pill-new'}`}>
                                {row.status === 'New'
                                  ? (isAr ? 'جديد •' : 'New •')
                                  : row.status === 'In progress'
                                  ? (isAr ? 'قيد المتابعة •' : 'In Progress •')
                                  : row.status === 'Completed'
                                  ? (isAr ? 'مكتمل ✓' : 'Completed ✓')
                                  : (isAr ? 'ملغي •' : 'Cancelled •')}
                              </span>
                            </td>

                            <td>
                              <span className="cat-tag-pill">
                                {row.type === 'Appointment' ? (isAr ? 'حجز موعد' : 'Appointment') : (isAr ? 'معاودة اتصال' : 'Callback')}
                              </span>
                            </td>

                            <td>
                              <div style={{ textAlign: isAr ? 'right' : 'left' }}>
                                <p style={{ margin: '0 0 4px', color: '#0F172A', fontWeight: 600, fontSize: '13px' }}>
                                  {isAr ? row.request : row.requestEn || row.request}
                                </p>
                                {row.preferred_date && (
                                  <small style={{ color: '#0D7C66', fontWeight: 600 }}>
                                    📅 {row.preferred_date} - {row.preferred_time}
                                  </small>
                                )}
                              </div>
                            </td>

                            <td>
                              <strong style={{ fontSize: '12.5px', color: '#334155' }}>
                                {isAr ? (row.specialtyAr || row.specialty) : row.specialty}
                              </strong>
                            </td>

                            <td>
                              <div className="req-customer-cell">
                                <div className="cust-info">
                                  <strong className="cust-name">{isAr ? row.customer : (row.customerEn || row.customer)}</strong>
                                  <span className="cust-id">{row.phone}</span>
                                  <small style={{ color: '#94A3B8', fontSize: '11px' }}>{isAr ? row.time : (row.timeEn || row.time)}</small>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="requests-footer-exact" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="showing-text-exact">
                  {isAr ? `عرض ${filteredTasks.length} من إجمالي ${tasks.length} مهمة مسجلة` : `Showing ${filteredTasks.length} of ${tasks.length} tasks`}
                </span>
                <button
                  type="button"
                  style={{ background: 'transparent', border: 'none', color: '#64748B', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={resetTasks}
                >
                  {isAr ? 'إعادة ضبط البيانات التجريبية الافتراضية' : 'Reset Demo Data'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <div
        className="drawer-backdrop"
        id="drawerBackdrop"
        style={{ display: backdropVisible ? 'block' : 'none' }}
        onClick={closeDrawer}
      ></div>

      <aside className={`task-detail-drawer${drawerOpen ? ' open' : ''}`} id="taskDrawer" dir={isAr ? 'rtl' : 'ltr'}>
        {selectedTask && (
          <>
            <div className="drawer-header">
              <div className="drawer-title-group">
                <div className="drawer-badge-row">
                  <span className="drawer-call-id" id="drawerTaskId">#{selectedTask.id}</span>
                  <span className={`status-pill ${STATUS_CLASS[selectedTask.status] || 'completed'}`}>
                    {selectedTask.status} •
                  </span>
                  <span className="cat-tag-pill" style={{ marginInlineStart: '6px' }}>
                    {selectedTask.channel === 'web' ? (isAr ? 'الموقع الإلكتروني' : 'Web Voice') : (isAr ? 'الهاتف' : 'Phone')}
                  </span>
                </div>
                <h3 className="drawer-patient-name">{isAr ? selectedTask.customer : (selectedTask.customerEn || selectedTask.customer)}</h3>
                <span className="drawer-patient-phone">📞 {selectedTask.phone}</span>
              </div>

              <button className="drawer-close-btn" id="btnCloseDrawer" title="Close Drawer" onClick={closeDrawer}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="drawer-body">
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>
                  {isAr ? 'تحديث حالة المهمة:' : 'Update Task Status:'}
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: '1px solid #CBD5E1',
                      background: selectedTask.status === 'New' ? '#E2E8F0' : '#FFFFFF',
                      color: '#0F172A'
                    }}
                    onClick={() => handleStatusChange(selectedTask.id, 'New')}
                  >
                    {isAr ? 'جديد' : 'New'}
                  </button>

                  <button
                    type="button"
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: '1px solid #FCD34D',
                      background: selectedTask.status === 'In progress' ? '#FEF3C7' : '#FFFFFF',
                      color: '#D97706'
                    }}
                    onClick={() => handleStatusChange(selectedTask.id, 'In progress')}
                  >
                    {isAr ? 'قيد المتابعة' : 'In progress'}
                  </button>

                  <button
                    type="button"
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: '1px solid #86EFAC',
                      background: selectedTask.status === 'Completed' ? '#DCFCE7' : '#FFFFFF',
                      color: '#16A34A'
                    }}
                    onClick={() => handleStatusChange(selectedTask.id, 'Completed')}
                  >
                    {isAr ? '✓ تم الإنجاز' : '✓ Completed'}
                  </button>

                  <button
                    type="button"
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: '1px solid #FCA5A5',
                      background: selectedTask.status === 'Cancelled' ? '#FEE2E2' : '#FFFFFF',
                      color: '#DC2626'
                    }}
                    onClick={() => handleStatusChange(selectedTask.id, 'Cancelled')}
                  >
                    {isAr ? 'إلغاء' : 'Cancelled'}
                  </button>
                </div>
              </div>

              <div className="drawer-card audio-player-card">
                <div className="audio-card-head">
                  <span className="audio-label">{isAr ? 'تسجيل المكالمة الصوتية' : 'Call Audio Recording'}</span>
                  <div className="speed-chips">
                    <button className="speed-chip active">1.0x</button>
                    <button className="speed-chip">1.25x</button>
                  </div>
                </div>

                <div className="audio-waveform-row">
                  <button
                    type="button"
                    className="btn-play-call"
                    onClick={toggleAudioPlay}
                    title={isPlayingAudio ? 'Pause' : 'Play'}
                    style={{ background: isPlayingAudio ? '#0B6855' : '#0D7C66' }}
                  >
                    {isPlayingAudio ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16"></rect>
                        <rect x="14" y="4" width="4" height="16"></rect>
                      </svg>
                    ) : (
                      <svg className="play-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    )}
                  </button>
                  <div className="waveform-container">
                    <canvas id="callWaveformCanvas" ref={canvasRef} width="300" height="40"></canvas>
                  </div>
                </div>

                <div className="audio-time-row">
                  <span>{isPlayingAudio ? '00:15' : '00:00'}</span>
                  <span>01:30</span>
                </div>
              </div>

              <div className="drawer-card">
                <div className="ai-intel-header">
                  <span className="intel-badge">{isAr ? 'بيانات مستخلصة آلياً' : 'AI STRUCTURED EXTRACTION'}</span>
                  <span className="sentiment-pill positive">{isAr ? 'تم التحقق من الموعد' : 'Verified Slot'}</span>
                </div>
                <div className="intel-item">
                  <span className="intel-label">{isAr ? 'القسم / التخصص:' : 'Specialty:'}</span>
                  <strong className="intel-value">{isAr ? (selectedTask.specialtyAr || selectedTask.specialty) : selectedTask.specialty}</strong>
                </div>
                <div className="intel-item">
                  <span className="intel-label">{isAr ? 'الموعد المفضل:' : 'Preferred Slot:'}</span>
                  <strong className="intel-value" style={{ color: '#0D7C66' }}>
                    {selectedTask.preferred_date ? `${selectedTask.preferred_date} - ${selectedTask.preferred_time}` : (isAr ? 'معاودة اتصال عاجلة' : 'Immediate Callback')}
                  </strong>
                </div>
                <div className="intel-item">
                  <span className="intel-label">{isAr ? 'قناة المحادثة:' : 'Channel Tag:'}</span>
                  <strong className="intel-value">{selectedTask.channel === 'web' ? (isAr ? 'الموقع الإلكتروني' : 'Web Voice') : (isAr ? 'الهاتف' : 'Phone')}</strong>
                </div>
                <div className="intel-item">
                  <span className="intel-label">{isAr ? 'ملخص الطلب:' : 'Request Summary:'}</span>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#1E293B', lineHeight: 1.5 }}>
                    {isAr ? selectedTask.request : (selectedTask.requestEn || selectedTask.request)}
                  </p>
                </div>
              </div>

              <div className="drawer-card transcript-card">
                <div className="transcript-head">
                  <div className="transcript-title-wrap">
                    <div className="transcript-badge-row">
                      <span className="transcript-icon-badge">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </span>
                      <h4 className="transcript-heading">
                        {isAr ? 'تفريغ المحادثة الصوتية' : 'Full Dialogue Transcript'}
                      </h4>
                    </div>
                    <span className="transcript-sub-meta">
                      {selectedTask.transcript?.length || 0} {isAr ? 'رسائل صوتية مسجلة ومفرغة آلياً' : 'voice messages recorded & transcribed'}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn-copy-transcript"
                    onClick={() => {
                      if (selectedTask.transcript && selectedTask.transcript.length > 0) {
                        const fullText = selectedTask.transcript
                          .map(m => `[${m.time || ''}] ${m.role === 'assistant' ? (isAr ? 'سارة (المساعد الصوتي)' : 'Sarah (AI)') : (isAr ? selectedTask.customer : selectedTask.customerEn || 'Patient')}:\n${m.text}`)
                          .join('\n\n');
                        navigator.clipboard?.writeText(fullText);
                        showToast(isAr ? 'تم نسخ نص المحادثة بالكامل!' : 'Transcript copied to clipboard!');
                      }
                    }}
                    title={isAr ? 'نسخ نص المحادثة' : 'Copy transcript'}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>{isAr ? 'نسخ التفريغ' : 'Copy'}</span>
                  </button>
                </div>

                <div className="transcript-messages">
                  {selectedTask.transcript && selectedTask.transcript.length > 0 ? (
                    selectedTask.transcript.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`chat-bubble-wrap ${msg.role === 'assistant' ? 'ai' : 'user'}`}
                      >
                        <div
                          className={`bubble-avatar ${msg.role === 'assistant' ? 'ai' : 'user'}`}
                          title={msg.role === 'assistant' ? (isAr ? 'المساعد الصوتي' : 'AI Assistant') : (isAr ? 'المراجع' : 'Patient')}
                        >
                          {msg.role === 'assistant' ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                              <line x1="12" y1="19" x2="12" y2="22"/>
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                          )}
                        </div>

                        <div className="bubble-body">
                          <div className="bubble-meta">
                            <span className="bubble-author-name">
                              {msg.role === 'assistant'
                                ? (isAr ? 'سارة (المساعد الصوتي)' : 'Sarah (AI Voice)')
                                : (isAr ? selectedTask.customer : (selectedTask.customerEn || selectedTask.customer || 'Patient'))}
                            </span>
                            <span className={`bubble-role-pill ${msg.role === 'assistant' ? 'ai' : 'user'}`}>
                              {msg.role === 'assistant' ? (isAr ? 'ذكاء اصطناعي' : 'AI Agent') : (isAr ? 'المراجع' : 'Patient')}
                            </span>
                            <span className="bubble-timestamp">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                              </svg>
                              <span>{msg.time || (isAr ? '10:42 ص' : '10:42 AM')}</span>
                            </span>
                          </div>

                          <div className="bubble-text">
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="transcript-empty-state">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      <p>{isAr ? 'لا يوجد تفريغ محفوظ لهذه المحادثة.' : 'No transcript recorded for this session.'}</p>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <a
                  href={`tel:${selectedTask.phone}`}
                  className="btn-direct-contact"
                  style={{ width: '100%', justifyContent: 'center', textAlign: 'center', display: 'flex' }}
                  onClick={() => showToast(isAr ? `جاري الاتصال بـ ${selectedTask.customer}...` : `Dialing ${selectedTask.phone}...`)}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <span>{isAr ? `الاتصال الفوري بالمراجع (${selectedTask.phone})` : `Call Patient (${selectedTask.phone})`}</span>
                </a>
              </div>
            </div>
          </>
        )}
      </aside>

      <div className="qa-toast" id="tasksToast" style={{ display: toastVisible ? 'flex' : 'none' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span id="tasksToastMsg">{toastMsg}</span>
      </div>
    </>
  );
}
