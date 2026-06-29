import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  { id: 'messages', label: 'Messages', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', section: 'Communication' },
  { id: 'media', label: 'Media Library', icon: 'M21 15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h8 M15 18l-2-3-2 3 M17 3v6 M20 6h-6', section: 'Media' },
  { id: 'resume', label: 'Resume / CV', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M12 12a3 3 0 100-6 3 3 0 000 6z M8 20v-1a3 3 0 013-3h2a3 3 0 013 3v1', section: 'Media' },
  { id: 'analytics', label: 'Analytics', icon: 'M3 20h18M5 16l3-5 4 4 5-8 4 4', section: 'Data' },
  { id: 'seo', label: 'SEO', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z M10 3v4 M3 10h4', section: 'Data' },
  { id: 'theme', label: 'Theme', icon: 'M12 20a8 8 0 100-16 8 8 0 000 16z M12 8a4 4 0 100 8 4 4 0 000-8z M12 8V4 M12 20v-4', section: 'System' },
  { id: 'settings', label: 'Settings', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z', section: 'System' },
  { id: 'activity', label: 'Activity Logs', icon: 'M22 12h-4l-3 9L9 3l-3 9H2', section: 'System' },
  { id: 'backup', label: 'Backup & Restore', icon: 'M4 6c0 1.66 4 3 8 3s8-1.34 8-3 M4 12c0 1.66 4 3 8 3s8-1.34 8-3 M4 18c0 1.66 4 3 8 3s8-1.34 8-3 M4 6v12 M20 6v12', section: 'System' },
  { id: 'password', label: 'Change Password', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', section: 'System' },
];

const pageLabels = {
  dashboard: 'Dashboard', profile: 'Profile', 'page-builder': 'Page Builder', 'component-builder': 'Component Builder',
  projects: 'Projects', skills: 'Skills', services: 'Services', experience: 'Experience',
  education: 'Education', testimonials: 'Testimonials', certificates: 'Certifications',
  hero: 'Hero Section', about: 'About Section', blog: 'Blog Posts', messages: 'Contact Messages',
  media: 'Media Library', resume: 'Resume / CV', analytics: 'Analytics', seo: 'SEO Management',
  theme: 'Theme Customizer', settings: 'Settings', activity: 'Activity Logs',
  backup: 'Backup & Restore', password: 'Change Password',
};

function Icon({ path, size = 18, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={path} />
    </svg>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
}

function Sidebar({ activePage, onNavigate, collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();
  const sections = navItems.reduce((acc, item) => {
    const s = item.section || 'Main';
    if (!acc[s]) acc[s] = [];
    acc[s].push(item);
    return acc;
  }, {});

  return (
    <>
      {mobileOpen && <div className="right-panel-overlay open" onClick={onMobileClose} />}
      <aside className={`admin-sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">P</div>
          <div className="sidebar-brand-text">
            <h3>Portfolio CMS</h3>
            <p>Admin Dashboard</p>
          </div>
        </div>

        <div className="sidebar-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input type="text" placeholder="Search..." readOnly />
        </div>

        <nav className="sidebar-nav">
          {Object.entries(sections).map(([section, items]) => (
            <div key={section} className="sidebar-section">
              <div className="sidebar-section-label">{section}</div>
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`sidebar-nav-item${activePage === item.id ? ' active' : ''}`}
                  onClick={() => { onNavigate(item.id); onMobileClose(); }}
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
    </>
  );
}

function Topbar({ title, activePage, onToggleMobile, onOpenCmd, onTogglePanel }) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="admin-topbar">
      <div className="topbar-left">
        <button className="btn btn-ghost btn-icon" onClick={onToggleMobile} style={{ display: 'none' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>
        <div className="topbar-breadcrumb">
          <a onClick={() => {}}>Dashboard</a>
          {activePage !== 'dashboard' && <><span>/</span><span>{title}</span></>}
        </div>
      </div>

      <div className="topbar-center">
        <div className="topbar-global-search" onClick={onOpenCmd}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input type="text" placeholder="Search anything..." readOnly />
          <div className="topbar-search-shortcut">
            <kbd>Ctrl</kbd> <kbd>K</kbd>
          </div>
        </div>
      </div>

      <div className="topbar-right">
        <button className="topbar-btn" data-tooltip="Notifications" onClick={onTogglePanel}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0"/></svg>
          <span className="notif-dot" />
        </button>
        <button className="topbar-btn" data-tooltip="Quick Actions" onClick={onOpenCmd}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20a8 8 0 100-16 8 8 0 000 16z M12 8v4l3 3"/></svg>
        </button>

        <div style={{ position: 'relative' }} ref={profileRef}>
          <div className="topbar-profile" onClick={() => setProfileOpen(!profileOpen)}>
            <div className="topbar-profile-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</div>
            <div className="topbar-profile-info">
              <div className="topbar-profile-name">{user?.name || 'Admin'}</div>
              <div className="topbar-profile-email">{user?.email || 'admin@portfolio.com'}</div>
            </div>
          </div>
          {profileOpen && (
            <div className="dropdown-menu" style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 220, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 6, boxShadow: 'var(--shadow-lg)' }}>
              <div className="dropdown-item" onClick={() => { setProfileOpen(false); }}>Profile</div>
              <div className="dropdown-item" onClick={() => { setProfileOpen(false); }}>Settings</div>
              <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
              <div className="dropdown-item" style={{ color: 'var(--danger)' }} onClick={() => { logout(); setProfileOpen(false); }}>Sign out</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function RightPanel({ open, onClose }) {
  return (
    <>
      <div className={`right-panel-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`right-panel${open ? ' open' : ''}`}>
        <div className="right-panel-header">
          <h3>Activity Panel</h3>
          <button className="right-panel-close" onClick={onClose}>&times;</button>
        </div>
        <div className="right-panel-body">
          <div className="right-panel-section">
            <div className="right-panel-section-title">Live Visitors</div>
            <div className="right-panel-item">
              <div className="right-panel-dot online" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>2 active visitors</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>On your portfolio site</div>
              </div>
            </div>
          </div>

          <div className="right-panel-section">
            <div className="right-panel-section-title">Recent Activity</div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="right-panel-item">
                <div className="right-panel-dot" style={{ background: 'var(--primary)' }} />
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>Dashboard updated</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>A few minutes ago</div>
                </div>
              </div>
            ))}
          </div>

          <div className="right-panel-section">
            <div className="right-panel-section-title">System Status</div>
            <div className="right-panel-item">
              <div className="right-panel-dot online" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>All Systems Normal</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>100% uptime</div>
              </div>
            </div>
          </div>

          <div className="right-panel-section">
            <div className="right-panel-section-title">Upcoming Tasks</div>
            {['Review messages', 'Update projects', 'Check analytics'].map((task, i) => (
              <div key={i} className="right-panel-item">
                <div className="right-panel-dot" style={{ background: 'var(--warning)' }} />
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>{task}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Today</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function CommandPalette({ open, onClose, onNavigate }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
    if (!open) setQuery('');
  }, [open]);

  const items = navItems.filter(i =>
    !query || i.label.toLowerCase().includes(query.toLowerCase()) || i.id.includes(query.toLowerCase())
  );

  if (!open) return null;

  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div className="cmd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input ref={inputRef} type="text" placeholder="Search pages and actions..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <div style={{ display: 'flex', gap: 2 }}>
            <kbd style={{ padding: '2px 6px', background: 'var(--gray-100)', borderRadius: 4, fontSize: 11, color: 'var(--gray-500)', fontFamily: 'var(--font)', fontWeight: 600 }}>ESC</kbd>
          </div>
        </div>
        <div className="cmd-results">
          {items.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>No results found</div>
          )}
          {items.length > 0 && (
            <div className="cmd-group-label">Pages</div>
          )}
          {items.map((item) => (
            <div key={item.id} className="cmd-item" onClick={() => { onNavigate(item.id); onClose(); }}>
              <div className="cmd-item-left">
                <Icon path={item.icon} />
                <span>{item.label}</span>
              </div>
              <div className="cmd-item-shortcut">
                <kbd>Enter</kbd>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
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
  };
  return components[activePage] || <Dashboard />;
}

function AdminLayout() {
  const [activePage, setActivePage] = useState(() => localStorage.getItem('admin_page') || 'dashboard');
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === 'true');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setCmdOpen(false);
        setPanelOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="admin-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        collapsed={collapsed}
        onToggle={handleToggle}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="admin-main">
        <Topbar
          title={title}
          activePage={activePage}
          onToggleMobile={() => setMobileOpen(!mobileOpen)}
          onOpenCmd={() => setCmdOpen(true)}
          onTogglePanel={() => setPanelOpen(!panelOpen)}
        />
        <div className="admin-content">
          <AdminRouter activePage={activePage} onNavigate={handleNavigate} />
        </div>
      </div>
      <RightPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onNavigate={handleNavigate} />
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
