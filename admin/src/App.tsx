import React, { useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import PageBuilder from './pages/PageBuilder';
import ComponentBuilder from './pages/ComponentBuilder';
import ProjectsManagement from './pages/ProjectsManagement';
import SkillsManagement from './pages/SkillsManagement';
import ExperienceManagement from './pages/ExperienceManagement';
import EducationManagement from './pages/EducationManagement';
import CertificatesManagement from './pages/CertificatesManagement';
import BlogManagement from './pages/BlogManagement';
import ServicesManagement from './pages/ServicesManagement';
import TestimonialsManagement from './pages/TestimonialsManagement';
import MessagesManagement from './pages/MessagesManagement';
import MediaLibrary from './pages/MediaLibrary';
import AnalyticsPage from './pages/AnalyticsPage';
import SEOManagement from './pages/SEOManagement';
import ThemeCustomizer from './pages/ThemeCustomizer';
import ResumeManagement from './pages/ResumeManagement';
import SettingsPage from './pages/SettingsPage';
import ActivityLogs from './pages/ActivityLogs';
import BackupRestore from './pages/BackupRestore';
import ChangePassword from './pages/ChangePassword';
import HeroManagement from './pages/HeroManagement';
import AboutManagement from './pages/AboutManagement';
import ProfileManagement from './pages/ProfileManagement';
import UserManagement from './pages/UserManagement';
import NotificationsManagement from './pages/NotificationsManagement';
import PerformanceDashboard from './pages/PerformanceDashboard';
import AccessibilityChecker from './pages/AccessibilityChecker';
import SecurityCenter from './pages/SecurityCenter';
import TranslationManager from './pages/TranslationManager';
import AdminSearch from './pages/AdminSearch';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', section: 'Main' },
  { id: 'profile', label: 'Profile', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8z', section: 'Main' },
  { id: 'page-builder', label: 'Page Builder', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M12 18v-6 M9 15h6', section: 'Content' },
  { id: 'component-builder', label: 'Component Builder', icon: 'M4 7h3V4a2 2 0 012-2h2a2 2 0 012 2v3h3a2 2 0 012 2v2a2 2 0 01-2 2h-3v3a2 2 0 01-2 2H9a2 2 0 01-2-2v-3H4a2 2 0 01-2-2V9a2 2 0 012-2z', section: 'Content' },
  { id: 'projects', label: 'Projects', icon: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z M6 9h12 M6 13h8 M6 17h4', section: 'Content' },
  { id: 'skills', label: 'Skills', icon: 'M16 18l6-6-6-6 M8 6l-6 6 6 6', section: 'Content' },
  { id: 'services', label: 'Services', icon: 'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2', section: 'Content' },
  { id: 'experience', label: 'Experience', icon: 'M12 4v16M4 12h16', section: 'Content' },
  { id: 'education', label: 'Education', icon: 'M22 10l-10-5L2 10l10 5 10-5z M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5', section: 'Content' },
  { id: 'testimonials', label: 'Testimonials', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', section: 'Content' },
  { id: 'certificates', label: 'Certifications', icon: 'M8 21l4-2 4 2-1-4.36L19 12h-5l-2-5-2 5H5l4 4.64L8 21z', section: 'Content' },
  { id: 'hero', label: 'Hero Section', icon: 'M21 15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v3 M3 16l5-5 4 4 3-3 6 6', section: 'Content' },
  { id: 'about', label: 'About Section', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8z', section: 'Content' },
  { id: 'blog', label: 'Blog', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8', section: 'Communication' },
  { id: 'messages', label: 'Contact Messages', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', section: 'Communication' },
  { id: 'media', label: 'Media Library', icon: 'M21 15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h8 M15 18l-2-3-2 3 M17 3v6 M20 6h-6', section: 'Media' },
  { id: 'resume', label: 'Resume / CV', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M12 12a3 3 0 100-6 3 3 0 000 6z M8 20v-1a3 3 0 013-3h2a3 3 0 013 3v1', section: 'Media' },
  { id: 'analytics', label: 'Analytics', icon: 'M3 20h18M5 16l3-5 4 4 5-8 4 4', section: 'Data' },
  { id: 'seo', label: 'SEO', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z M10 3v4 M3 10h4', section: 'Data' },
  { id: 'theme', label: 'Theme Customizer', icon: 'M12 20a8 8 0 100-16 8 8 0 000 16z M12 8a4 4 0 100 8 4 4 0 000-8z M12 8V4 M12 20v-4', section: 'System' },
  { id: 'settings', label: 'Settings', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z', section: 'System' },
  { id: 'activity', label: 'Activity Logs', icon: 'M22 12h-4l-3 9L9 3l-3 9H2', section: 'System' },
  { id: 'backup', label: 'Backup & Restore', icon: 'M4 6c0 1.66 4 3 8 3s8-1.34 8-3 M4 12c0 1.66 4 3 8 3s8-1.34 8-3 M4 18c0 1.66 4 3 8 3s8-1.34 8-3 M4 6v12 M20 6v12', section: 'System' },
  { id: 'password', label: 'Change Password', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', section: 'System' },
  { id: 'users', label: 'User Management', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', section: 'System' },
  { id: 'notifications', label: 'Notifications', icon: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0', section: 'System' },
  { id: 'performance', label: 'Performance', icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', section: 'Data' },
  { id: 'accessibility', label: 'Accessibility', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M12 8v4 M12 16h.01', section: 'Data' },
  { id: 'security', label: 'Security Center', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', section: 'System' },
  { id: 'translations', label: 'Translations', icon: 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5', section: 'System' },
  { id: 'search', label: 'Search', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', section: 'Main' },
];

const pageLabels = {
  dashboard: 'Dashboard', profile: 'Profile', 'page-builder': 'Page Builder', 'component-builder': 'Component Builder',
  projects: 'Projects', skills: 'Skills', services: 'Services', experience: 'Experience',
  education: 'Education', testimonials: 'Testimonials', certificates: 'Certifications',
  hero: 'Hero Section', about: 'About Section', blog: 'Blog Posts', messages: 'Contact Messages',
  media: 'Media Library', resume: 'Resume / CV', analytics: 'Analytics', seo: 'SEO Management',
  theme: 'Theme Customizer', settings: 'Settings', activity: 'Activity Logs',
  backup: 'Backup & Restore', password: 'Change Password',
  users: 'User Management', notifications: 'Notifications',
  performance: 'Performance Dashboard', accessibility: 'Accessibility Checker',
  security: 'Security Center', translations: 'Translation Manager',
  search: 'Search',
};

function Icon({ path, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="admin-loading"><div className="spinner" /></div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
}

function Sidebar({ activePage, onNavigate, collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const sections = navItems.reduce((acc, item) => {
    const s = item.section || 'Main';
    if (!acc[s]) acc[s] = [];
    acc[s].push(item);
    return acc;
  }, {});

  return (
    <aside className={`admin-sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">P</div>
        <div className="sidebar-brand-text">
          <h3>Portfolio CMS</h3>
          <p>Admin Dashboard</p>
        </div>
      </div>
      <nav className="sidebar-nav">
        {Object.entries(sections).map(([section, items]) => (
          <div key={section} className="sidebar-section">
            <div className="sidebar-section-label">{section}</div>
            {items.map((item) => (
              <div
                key={item.id}
                className={`sidebar-nav-item${activePage === item.id ? ' active' : ''}`}
                onClick={() => onNavigate(item.id)}
                data-tooltip={collapsed ? item.label : undefined}
              >
                <Icon path={item.icon} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'Admin'}</div>
            <div className="sidebar-user-role">Administrator</div>
          </div>
        </div>
        <button className="sidebar-toggle" onClick={onToggle} data-tooltip={collapsed ? 'Expand' : 'Collapse'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={collapsed ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'} />
          </svg>
        </button>
      </div>
    </aside>
  );
}

function Topbar({ title, onNavigate }) {
  return (
    <header className="admin-topbar">
      <div className="topbar-left">
        <h2>{title}</h2>
      </div>
      <div className="topbar-right">
        <div className="topbar-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input
            type="text"
            placeholder="Search..."
            onFocus={() => onNavigate('search')}
            onClick={() => onNavigate('search')}
          />
        </div>
      </div>
    </header>
  );
}

function AdminRouter({ activePage, onNavigate }) {
  const components = {
    dashboard: <Dashboard />,
    profile: <ProfileManagement />,
    'page-builder': <PageBuilder />,
    'component-builder': <ComponentBuilder />,
    projects: <ProjectsManagement />,
    skills: <SkillsManagement />,
    services: <ServicesManagement />,
    experience: <ExperienceManagement />,
    education: <EducationManagement />,
    testimonials: <TestimonialsManagement />,
    certificates: <CertificatesManagement />,
    hero: <HeroManagement />,
    about: <AboutManagement />,
    blog: <BlogManagement />,
    messages: <MessagesManagement />,
    media: <MediaLibrary />,
    resume: <ResumeManagement />,
    analytics: <AnalyticsPage />,
    seo: <SEOManagement />,
    theme: <ThemeCustomizer />,
    settings: <SettingsPage onNavigate={onNavigate} />,
    activity: <ActivityLogs />,
    backup: <BackupRestore />,
    password: <ChangePassword />,
    users: <UserManagement />,
    notifications: <NotificationsManagement />,
    performance: <PerformanceDashboard />,
    accessibility: <AccessibilityChecker />,
    security: <SecurityCenter />,
    translations: <TranslationManager />,
    search: <AdminSearch />,
  };
  return components[activePage] || <Dashboard />;
}

function AdminLayout() {
  const [activePage, setActivePage] = useState(() => localStorage.getItem('admin_page') || 'dashboard');
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === 'true');
  const title = pageLabels[activePage] || 'Dashboard';

  const handleNavigate = useCallback((id) => {
    localStorage.setItem('admin_page', id);
    setActivePage(id);
  }, []);

  const handleToggle = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  }, []);

  return (
    <div className="admin-layout">
      <Sidebar activePage={activePage} onNavigate={handleNavigate} collapsed={collapsed} onToggle={handleToggle} />
      <div className="admin-main">
        <Topbar title={title} onNavigate={handleNavigate} />
        <div className="admin-content">
          <AdminRouter activePage={activePage} onNavigate={handleNavigate} />
        </div>
      </div>
    </div>
  );
}

function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/admin/*" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}

export default App;
