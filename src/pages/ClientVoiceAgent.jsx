import React, { useState, useEffect, useRef } from 'react';
import '../../client-voice.css';
import { useTasks } from '../context/TaskContext.jsx';
import { getVoiceAgentT } from '../i18n/voiceAgentTranslations';

const N8N_WEBHOOK_URL = 'https://omargoood4.app.n8n.cloud/webhook/voice-agent';
const N8N_TEST_WEBHOOK_URL = 'http://localhost:5678/webhook-test/voice-agent';

export default function ClientVoiceAgent({ onNavigate }) {
  const { addTask } = useTasks();

  const [lang, setLang] = useState(() => localStorage.getItem('afiya_lang') || 'ar');
  const [state, setState] = useState('consent');
  const [waveHeights, setWaveHeights] = useState(Array(18).fill(10));
  const [liveMessages, setLiveMessages] = useState([]);
  const [clientToast, setClientToast] = useState('');
  const [clientToastVisible, setClientToastVisible] = useState(false);

  const toastRef = useRef(null);
  const waveTimer = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const mediaStreamRef = useRef(null);
  const activeAudioRef = useRef(null);
  const activeBlobUrlRef = useRef(null);
  const audioContextRef = useRef(null);
  const activeSourceNodeRef = useRef(null);
  const recordingStartTimeRef = useRef(0);
  const isHoldingRef = useRef(false);
  const chatScrollRef = useRef(null);

  const showClientToast = (msg) => {
    setClientToast(msg);
    setClientToastVisible(true);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setClientToastVisible(false), 3000);
  };

  const t = getVoiceAgentT(lang);
  const ui = t.ui;
  const isAr = lang === 'ar';

  useEffect(() => {
    localStorage.setItem('afiya_lang', lang);
    document.documentElement.setAttribute('dir', isAr ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }, [lang, isAr]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [liveMessages, state]);

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

  const stopActiveAudio = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current = null;
    }
    if (activeSourceNodeRef.current) {
      try { activeSourceNodeRef.current.stop(); } catch (e) { }
      activeSourceNodeRef.current = null;
    }
    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const createWavHeader = (dataLength, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) => {
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);

    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    return new Uint8Array(buffer);
  };

  const decodeAudioPayload = (rawPayload, sampleRate = 24000) => {
    if (!rawPayload || typeof rawPayload !== 'string') return null;

    const cleanStr = rawPayload
      .replace(/^data:audio\/[^;]+;base64,/, '')
      .replace(/[\r\n\s]+/g, '');

    let binaryStr;
    try {
      if (!cleanStr || cleanStr.length < 100 || cleanStr.startsWith('=') || cleanStr.includes('$(')) {
        return null;
      }
      binaryStr = window.atob(cleanStr);
    } catch {
      return null;
    }

    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryStr.charCodeAt(i);

    const isRiffWav = bytes.length > 12 &&
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x41 && bytes[10] === 0x56 && bytes[11] === 0x45;

    if (isRiffWav) {
      try {
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const chunkSize = view.getUint32(4, true);
        const dataChunkSize = view.byteLength >= 44 ? view.getUint32(40, true) : 0;
        if (dataChunkSize === 0 || chunkSize === 0 || dataChunkSize > bytes.length) {
          view.setUint32(4, bytes.length - 8, true);
          view.setUint32(40, bytes.length - 44, true);
        }
      } catch {}
      return { blob: new Blob([bytes], { type: 'audio/wav' }), mime: 'audio/wav', rawBytes: bytes };
    }

    const wavHeader = createWavHeader(bytes.length, sampleRate, 1, 16);
    const fullWav = new Uint8Array(wavHeader.length + bytes.length);
    fullWav.set(wavHeader, 0);
    fullWav.set(bytes, wavHeader.length);

    return {
      blob: new Blob([fullWav], { type: 'audio/wav' }),
      mime: 'audio/wav',
      rawBytes: bytes,
      isSynthesizedPcm: true
    };
  };

  const playAiVoiceReply = async (audioData) => {
    stopActiveAudio();

    if (!audioData) {
      showClientToast(ui.noAudioReceived);
      setState('ready');
      return;
    }

    try {
      if (typeof audioData === 'string' && (audioData.startsWith('http://') || audioData.startsWith('https://'))) {
        const audio = new Audio(audioData);
        activeAudioRef.current = audio;
        audio.onplay = () => setState('speaking');
        audio.onended = () => { setState('ready'); activeAudioRef.current = null; };
        audio.onerror = () => {
          showClientToast(ui.failedPlayUrl);
          setState('ready');
        };
        await audio.play();
        return;
      }

      const decoded = decodeAudioPayload(audioData, 24000);
      if (!decoded || !decoded.blob) throw new Error('Failed to parse audio payload');

      const blobUrl = URL.createObjectURL(decoded.blob);
      activeBlobUrlRef.current = blobUrl;

      const audio = new Audio(blobUrl);
      activeAudioRef.current = audio;

      audio.onplay = () => setState('speaking');
      audio.onended = () => {
        setState('ready');
        activeAudioRef.current = null;
        if (activeBlobUrlRef.current) {
          URL.revokeObjectURL(activeBlobUrlRef.current);
          activeBlobUrlRef.current = null;
        }
      };

      audio.onerror = async () => {
        await playViaWebAudioContext(decoded.rawBytes);
      };

      try {
        await audio.play();
      } catch {
        await playViaWebAudioContext(decoded.rawBytes);
      }
    } catch {
      showClientToast(ui.failedPlayGemini);
      setState('ready');
    }
  };

  const playViaWebAudioContext = async (rawBytes) => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') await ctx.resume();

      try {
        const audioBuffer = await ctx.decodeAudioData(rawBytes.buffer.slice(0));
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        activeSourceNodeRef.current = source;
        setState('speaking');
        source.onended = () => { setState('ready'); activeSourceNodeRef.current = null; };
        source.start(0);
        return;
      } catch {
        const numSamples = Math.floor(rawBytes.length / 2);
        const int16 = new Int16Array(rawBytes.buffer, rawBytes.byteOffset, numSamples);
        const pcmBuffer = ctx.createBuffer(1, numSamples, 24000);
        const channel = pcmBuffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) channel[i] = int16[i] / 32768.0;
        const pcmSource = ctx.createBufferSource();
        pcmSource.buffer = pcmBuffer;
        pcmSource.connect(ctx.destination);
        activeSourceNodeRef.current = pcmSource;
        setState('speaking');
        pcmSource.onended = () => { setState('ready'); activeSourceNodeRef.current = null; };
        pcmSource.start(0);
        return;
      }
    } catch {
      showClientToast(ui.directAudioError);
      setState('ready');
    }
  };

  const sendVoiceToN8n = async (audioBlob) => {
    if (!audioBlob || audioBlob.size < 800) {
      showClientToast(ui.recordingTooShort);
      setState('ready');
      return;
    }

    const timeString = new Date().toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' });

    setLiveMessages((prev) => [
      ...prev,
      { id: `usr-${Date.now()}`, role: 'user', text: ui.userVoiceSent, time: timeString }
    ]);

    setState('processing');
    const formData = new FormData();
    formData.append('data', audioBlob, 'speech.webm');
    formData.append('file', audioBlob, 'speech.webm');
    formData.append('lang', lang);

    const endpoints = [N8N_TEST_WEBHOOK_URL, N8N_WEBHOOK_URL];
    let data = null;

    for (const url of endpoints) {
      try {
        const response = await fetch(url, { method: 'POST', body: formData });
        if (response.ok) {
          data = await response.json().catch(() => null);
          if (data) break;
        }
      } catch {}
    }

    if (data) {
      const replyText = data.replyText || '';
      const validAudio = data.audio || null;

      const isUnevaluated = typeof validAudio === 'string' && (validAudio.startsWith('=') || validAudio.includes('{{') || validAudio.includes('$('));
      if (isUnevaluated) {
        showClientToast(isAr ? 'تنبيه n8n: غيّر وضع الـ Webhook إلى Expression أو First Incoming Item' : 'n8n notice: switch Respond to Webhook to Expression mode');
        setState('ready');
        return;
      }

      if (replyText) {
        setLiveMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            text: replyText,
            time: new Date().toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }

      if (data.task) {
        const tsk = data.task;
        addTask({
          id: tsk.task_code || `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
          customer: tsk.customer_name || (isAr ? 'مراجع عيادات عافية' : 'Clinic Patient'),
          customerEn: tsk.customer_name_en || (isAr ? 'Clinic Patient' : tsk.customer_name),
          phone: tsk.phone || '—',
          specialty: tsk.specialty || 'General',
          preferred_date: tsk.preferred_date || (isAr ? 'اليوم' : 'Today'),
          preferred_time: tsk.preferred_time || '',
          status: 'New',
          priority: 'urgent',
          type: 'Appointment',
          channel: 'web',
          request: tsk.request_details || replyText
        });
        showClientToast(isAr ? 'تم تسجيل وتوثيق موعدك في النظام بنجاح' : 'Appointment successfully registered');
      }

      if (!validAudio) {
        showClientToast(ui.noAudioFromServer);
        setState('ready');
      } else {
        playAiVoiceReply(validAudio);
      }
    } else {
      showClientToast(ui.n8nConnectionFailed);
      setState('ready');
    }
  };

  const startRecording = async () => {
    if (state === 'mic-denied' || state === 'timeout' || state === 'consent') return;
    stopActiveAudio();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start();
      recordingStartTimeRef.current = Date.now();
      setState('listening');
    } catch {
      setState('mic-denied');
    }
  };

  const stopRecording = () => {
    if (state !== 'listening') return;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorderRef.current.mimeType || 'audio/webm'
        });
        sendVoiceToN8n(audioBlob);
      };
      mediaRecorderRef.current.stop();
    } else {
      setState('ready');
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const handleMicButtonClick = () => {
    if (state === 'ready') startRecording();
    else if (state === 'listening') stopRecording();
    else if (state === 'speaking') { stopActiveAudio(); setState('ready'); }
  };

  const handleMicMouseDown = () => {
    if (state === 'ready') {
      isHoldingRef.current = true;
      startRecording();
    }
  };

  const handleMicMouseUp = () => {
    if (isHoldingRef.current && state === 'listening') {
      const duration = Date.now() - recordingStartTimeRef.current;
      isHoldingRef.current = false;
      if (duration > 600) stopRecording();
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
                if (onNavigate) { e.preventDefault(); onNavigate('/admin'); }
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>{t.adminLink}</span>
            </a>

            <div className="lang-pill">
              <button type="button" className={`lang-pill-btn ${isAr ? 'active' : ''}`} onClick={() => setLang('ar')}>العربية</button>
              <button type="button" className={`lang-pill-btn ${!isAr ? 'active' : ''}`} onClick={() => setLang('en')}>English</button>
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

          <div className="chat-scroll-area" ref={chatScrollRef}>
            <div className="date-badge-divider">
              <span>{t.dateDivider}</span>
            </div>

            {liveMessages.length > 0 ? (
              <>
                {liveMessages.map((msg) => (
                  <div key={msg.id} className={msg.role === 'user' ? 'bubble-wrap-user' : 'bubble-wrap-ai'}>
                    <span className={msg.role === 'user' ? 'bubble-sender-user' : 'bubble-sender-ai'}>
                      {msg.role === 'user' ? ui.you : t.aiSender}
                    </span>
                    <div className={msg.role === 'user' ? 'bubble-card-user' : 'bubble-card-ai'}>
                      <p>{msg.text}</p>
                      <span className={msg.role === 'user' ? 'bubble-time-user' : 'bubble-time-ai'}>{msg.time}</span>
                    </div>
                  </div>
                ))}
                {state === 'processing' && (
                  <div className="bubble-wrap-ai">
                    <span className="bubble-sender-ai">{t.aiSender}</span>
                    <div className="bubble-card-ai" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 14px' }}>
                      <span className="spinner-ring" style={{ width: '14px', height: '14px', borderWidth: '2px', margin: 0 }}></span>
                      <p style={{ margin: 0, fontSize: '13px', color: '#0D7C66', fontWeight: 600 }}>
                        {ui.processingAudioMsg}
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bubble-wrap-ai">
                <span className="bubble-sender-ai">{t.aiSender}</span>
                <div className="bubble-card-ai">
                  <p>
                    {isAr
                      ? 'أهلاً بك في عيادات عافية، معك المساعد الصوتي الذكي. اضغط على زر الميكروفون وتفضل بالحديث لحجز موعدك أو الاستفسار عن خدماتنا.'
                      : 'Welcome to Afiya Clinics! I am your AI Voice Assistant. Press the microphone button and speak to book an appointment or inquire about our services.'}
                  </p>
                  <span className="bubble-time-ai">
                    {new Date().toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
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
                    {t.howToList.map((step, idx) => (<li key={idx}>{step}</li>))}
                  </ol>
                  <span className="instructions-hint">{t.howToHint}</span>
                  <button type="button" className="btn-reload-page" onClick={() => setState('ready')}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                      <polyline points="23 4 23 10 17 10"></polyline>
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                    </svg>
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
                  <button
                    type="button"
                    className="btn-retry-conn"
                    onClick={() => { setState('processing'); setTimeout(() => setState('ready'), 1000); }}
                  >
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
                <span key={i} className={`wave-bar ${state === 'speaking' ? 'speaking' : ''}`} style={{ height: `${h}px` }}></span>
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
              onMouseDown={handleMicMouseDown}
              onMouseUp={handleMicMouseUp}
              onTouchStart={handleMicMouseDown}
              onTouchEnd={handleMicMouseUp}
              onClick={handleMicButtonClick}
              title={ui.micButtonTitle}
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
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
                <button type="button" id="btn-agree-voice" className="btn-consent-agree" onClick={() => setState('ready')}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="22" />
                  </svg>
                  <span>{t.agreeBtn}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: isAr ? 'rotate(180deg)' : 'none', opacity: 0.85, marginInlineStart: 'auto' }}>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>

                <button type="button" id="btn-disagree-voice" className="btn-consent-disagree" onClick={() => setState('exit')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>{t.disagreeBtn}</span>
                </button>
              </div>

              <div className="consent-footer-link">
                <a href="/privacy" onClick={(e) => { if (onNavigate) { e.preventDefault(); onNavigate('/privacy'); } }}>
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
                <button type="button" className="btn-restart-consent" onClick={() => setState('consent')}>
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
