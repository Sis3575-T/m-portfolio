import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import ProjectDetail from './pages/ProjectDetail';
import BlogPost from './pages/BlogPost';
import SearchPage from './pages/SearchPage';
import NotFound from './pages/NotFound';
import NavbarShowcase from './pages/NavbarShowcase';
import Terminal from './components/Terminal';
import CommandPalette from './components/CommandPalette';
import CursorInteraction from './components/CursorInteraction';
import ScrollProgress from './components/common/ScrollProgress';
import LoadingScreen from './components/common/Loader';
import { useTheme } from './context/ThemeContext';
import { I18nProvider, useI18n } from './utils/i18n.jsx';

function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();
  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-none cursor-pointer shadow-lg transition-all hover:scale-110"
      style={{
        background: 'var(--primary-color)',
        color: '#fff',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
      title={t('language.switch')}
    >
      {language === 'en' ? t('language.am') : t('language.en')}
    </button>
  );
}

function AppContent() {
  const [showTerminal, setShowTerminal] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const { toggleTheme } = useTheme();
  const location = useLocation();
  const isShowcase = location.pathname === '/navbar-showcase';

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowPalette(p => !p);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        toggleTheme();
      }
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        setShowPalette(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [toggleTheme]);

  if (isShowcase) {
    return (
      <div className="min-h-screen flex flex-col">
        <LoadingScreen />
        <Routes>
          <Route path="/navbar-showcase" element={<NavbarShowcase />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <CursorInteraction />
      <LoadingScreen />
      <ScrollProgress />
      <Header onToggleTerminal={() => setShowTerminal(prev => !prev)} />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/navbar-showcase" element={<NavbarShowcase />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <LanguageSwitcher />
      <AnimatePresence>
        {showTerminal && <Terminal onClose={() => setShowTerminal(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showPalette && <CommandPalette onClose={() => setShowPalette(false)} />}
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}

export default App;