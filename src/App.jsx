import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { TaskProvider } from './context/TaskContext.jsx';
import ClientVoiceAgent from './pages/ClientVoiceAgent.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Knowledge from './pages/Knowledge.jsx';
import Organization from './pages/Organization.jsx';
import Privacy from './pages/Privacy.jsx';
import VoiceDialect from './pages/VoiceDialect.jsx';

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to) => {
    window.history.pushState({}, '', to);
    setCurrentPath(to);
    window.scrollTo(0, 0);
  };

  const renderView = () => {
    switch (currentPath) {
      case '/login':
      case '/admin':
        return <Login onNavigate={navigate} />;
      case '/dashboard':
      case '/tasks':
        return <Dashboard onNavigate={navigate} />;
      case '/knowledge':
        return <Knowledge onNavigate={navigate} />;
      case '/organization':
        return <Organization onNavigate={navigate} />;
      case '/privacy':
        return <Privacy onNavigate={navigate} />;
      case '/voice':
      case '/voice-dialect':
        return <VoiceDialect onNavigate={navigate} />;
      case '/':
      default:
        return <ClientVoiceAgent onNavigate={navigate} />;
    }
  };

  return (
    <LanguageProvider>
      <TaskProvider>
        <div className="afiya-app-root">
          {renderView()}
        </div>
      </TaskProvider>
    </LanguageProvider>
  );
}


