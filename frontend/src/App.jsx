import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PortfolioProvider } from './context/PortfolioContext';
import { ThemeProvider } from './context/ThemeContext';
import LoadingSkeleton from './components/LoadingSkeleton';
import AdminPage from './pages/AdminPage';
import AnalyticsTracker from './components/common/AnalyticsTracker';
import './pages/Admin.css';

const HomePage = lazy(() => import('./pages/HomePage'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const BlogList = lazy(() => import('./pages/BlogList'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const Gallery = lazy(() => import('./pages/Gallery'));
const NotFound = lazy(() => import('./pages/NotFound'));

function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className="scroll-progress"
      style={{ width: `${progress}%` }}
    />
  );
}

function LoadingFallback() {
  return (
    <div className="page">
      <div className="navbar-placeholder" />
      <div className="container" style={{ padding: '4rem 0' }}>
        <LoadingSkeleton variant="card" count={4} />
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <PortfolioProvider>
        <AnalyticsTracker />
        <ScrollProgress />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </PortfolioProvider>
    </ThemeProvider>
  );
}

export default App;
