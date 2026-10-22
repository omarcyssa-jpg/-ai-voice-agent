import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitch({ className = '' }) {
  const { lang, setLang } = useLanguage();

  return (
    <div className={`lang-switch-pill header-lang ${className}`}>
      <button
        type="button"
        className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
        onClick={() => setLang('en')}
        title="Switch to English (LTR)"
      >
        English
      </button>
      <button
        type="button"
        className={`lang-btn ${lang === 'ar' ? 'active' : ''}`}
        onClick={() => setLang('ar')}
        title="التحويل للعربية (RTL)"
      >
        العربية
      </button>
    </div>
  );
}
