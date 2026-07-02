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
import MessagesManagement from './pages/MessagesManagement';
import MediaLibrary from './pages/MediaLibrary';
import AnalyticsPage from './pages/AnalyticsPage';
import SEOManagement from './pages/SEOManagement';
import SettingsPage from './pages/SettingsPage';
import ProfileManagement from './pages/ProfileManagement';
import AppearancePage from './pages/AppearancePage';
import HeroManagement from './pages/HeroManagement';
import AboutManagement from './pages/AboutManagement';
import ServicesManagement from './pages/ServicesManagement';
import TestimonialsManagement from './pages/TestimonialsManagement';
import NavbarManagement from './pages/NavbarManagement';
import FooterManagement from './pages/FooterManagement';
import LayoutManager from './pages/LayoutManager';
import { AutoSaveProvider } from './components/AutoSaveProvider';
import AutoSaveIndicator from './components/AutoSaveIndicator';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import ThemeLivePreview from './components/ThemeLivePreview';
import './styles/properties-panel.css';
import './styles/enhanced-table.css';
import './styles/analytics.css';
import './styles/component-builder.css';
import PageStub from './pages/PageStub';

const navSections = [
  { section: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', children: [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
  ]},
  { section: 'Pages', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6', children: [
    { id: 'page-builder', label: 'All Pages', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6' },
  ]},
  { section: 'Components', icon: 'M4 7h3V4a2 2 0 012-2h2a2 2 0 012 2v3h3a2 2 0 012 2v2a2 2 0 01-2 2h-3v3a2 2 0 01-2 2H9a2 2 0 01-2-2v-3H4a2 2 0 01-2-2V9a2 2 0 012-2z', children: [
    { id: 'component-builder', label: 'All Components', icon: 'M4 7h3V4a2 2 0 012-2h2a2 2 0 012 2v3h3a2 2 0 012 2v2a2 2 0 01-2 2h-3v3a2 2 0 01-2 2H9a2 2 0 01-2-2v-3H4a2 2 0 01-2-2V9a2 2 0 012-2z' },
  ]},
  { section: 'Content', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z M4 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z M14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z', children: [
    { id: 'hero', label: 'Hero Section', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z' },
    { id: 'about', label: 'About Section', icon: 'M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M8 3a4 4 0 100 8 4 4 0 000-8z' },
    { id: 'services', label: 'Services', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
    { id: 'testimonials', label: 'Testimonials', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  ]},
  { section: 'Projects', icon: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z', children: [
    { id: 'projects', label: 'All Projects', icon: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z' },
  ]},
  { section: 'Skills', icon: 'M16 18l6-6-6-6 M8 6l-6 6 6 6', children: [
    { id: 'skills', label: 'All Skills', icon: 'M16 18l6-6-6-6 M8 6l-6 6 6 6' },
  ]},
  { section: 'Experience', icon: 'M12 4v16M4 12h16', children: [
    { id: 'experience', label: 'All Experience', icon: 'M12 4v16M4 12h16' },
  ]},
  { section: 'Education', icon: 'M22 10l-10-5L2 10l10 5 10-5z M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5', children: [
    { id: 'education', label: 'All Education', icon: 'M22 10l-10-5L2 10l10 5 10-5z M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5' },
  ]},
  { section: 'Certificates', icon: 'M8 21l4-2 4 2-1-4.36L19 12h-5l-2-5-2 5H5l4 4.64L8 21z', children: [
    { id: 'certificates', label: 'All Certificates', icon: 'M8 21l4-2 4 2-1-4.36L19 12h-5l-2-5-2 5H5l4 4.64L8 21z' },
  ]},
  { section: 'Blog', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6', children: [
    { id: 'blog', label: 'All Posts', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6' },
  ]},
  { section: 'Media', icon: 'M21 15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h8 M15 18l-2-3-2 3 M17 3v6 M20 6h-6', children: [
    { id: 'media', label: 'Media Library', icon: 'M21 15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h8 M15 18l-2-3-2 3 M17 3v6 M20 6h-6' },
  ]},
  { section: 'Messages', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', children: [
    { id: 'messages', label: 'Contact Messages', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
  ]},
  { section: 'Analytics', icon: 'M3 20h18M5 16l3-5 4 4 5-8 4 4', children: [
    { id: 'analytics', label: 'Overview', icon: 'M3 20h18M5 16l3-5 4 4 5-8 4 4' },
    { id: 'analytics-live', label: 'Live Visitors', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.4 6.4a9 9 0 000 11.2M21.6 6.4a9 9 0 010 11.2' },
    { id: 'analytics-map', label: 'Visitor Map', icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 7a3 3 0 100 6 3 3 0 000-6z' },
    { id: 'analytics-traffic', label: 'Traffic Sources', icon: 'M12 20V10M18 20V4M6 20v-4' },
    { id: 'analytics-reports', label: 'Reports', icon: 'M3 20h18M5 16l3-5 4 4 5-8 4 4' },
  ]},
  { section: 'Appearance', icon: 'M12 20a8 8 0 100-16 8 8 0 000 16z M12 8a4 4 0 100 8 4 4 0 000-8z M12 8V4 M12 20v-4', children: [
    { id: 'appearance', label: 'Design Settings', icon: 'M12 20a8 8 0 100-16 8 8 0 000 16z M12 8a4 4 0 100 8 4 4 0 000-8z M12 8V4 M12 20v-4' },
  ]},
  { section: 'Layout', icon: 'M4 2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z', children: [
    { id: 'navigation', label: 'Navbar Management', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
    { id: 'footer', label: 'Footer Management', icon: 'M4 16h16M4 20h16M4 2h16v12H4z' },
  ]},
  { section: 'SEO', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z M10 3v4 M3 10h4', children: [
    { id: 'seo', label: 'SEO Manager', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z M10 3v4 M3 10h4' },
  ]},
  { section: 'Settings', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6z', children: [
    { id: 'settings', label: 'General Settings', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6z' },
    { id: 'settings-contact', label: 'Contact Info', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { id: 'settings-social', label: 'Social Media', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8z' },
    { id: 'backup', label: 'Backup & Restore', icon: 'M4 6c0 1.66 4 3 8 3s8-1.34 8-3 M4 12c0 1.66 4 3 8 3s8-1.34 8-3 M4 18c0 1.66 4 3 8 3s8-1.34 8-3 M4 6v12 M20 6v12' },
    { id: 'settings-integrations', label: 'Integrations', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  ]},
  { section: 'Profile', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8z', children: [
    { id: 'profile', label: 'My Profile', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8z' },
  ]},
];

const allNavItems = navSections.flatMap(s => s.children);

const pageLabels = {
  dashboard: 'Dashboard',
  'page-builder': 'All Pages',
  'component-builder': 'All Components',
  projects: 'All Projects',
  skills: 'All Skills',
  experience: 'All Experience',
  education: 'All Education',
  certificates: 'All Certificates',
  blog: 'All Posts',
  media: 'Media Library',
  messages: 'Contact Messages',
  analytics: 'Analytics Overview',
  'analytics-live': 'Live Visitors',
  'analytics-map': 'Visitor Map',
  'analytics-traffic': 'Traffic Sources',
  'analytics-reports': 'Reports',
  appearance: 'Design Settings',
  seo: 'SEO Manager',
  settings: 'General Settings',
  'settings-contact': 'Contact Info',
  'settings-social': 'Social Media',
  backup: 'Backup & Restore',
  'settings-integrations': 'Integrations',
  hero: 'Hero Section',
  about: 'About Section',
  services: 'Services',
  testimonials: 'Testimonials',
  navigation: 'Navbar Management',
  footer: 'Footer Management',
  profile: 'My Profile',
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
  const [expanded, setExpanded] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sidebar_expanded') || '{}');
    } catch {
      return {};
    }
  });

  const toggleSection = useCallback((section) => {
    setExpanded(prev => {
      const next = { ...prev, [section]: !prev[section] };
      localStorage.setItem('sidebar_expanded', JSON.stringify(next));
      return next;
    });
  }, []);

  const isExpanded = (section) => {
    if (expanded[section] === undefined) return true;
    return expanded[section];
  };

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
          {navSections.map(({ section, icon, children }) => {
            const open = isExpanded(section);
            const hasActive = children.some(c => c.id === activePage);
            return (
              <div key={section} className="sidebar-section">
                <div
                  className={`sidebar-section-header${hasActive ? ' active' : ''}`}
                  onClick={() => { if (!collapsed) toggleSection(section); }}
                  data-tooltip={collapsed ? section : undefined}
                >
                  <Icon path={icon} />
                  {!collapsed && (
                    <>
                      <span>{section}</span>
                      <svg
                        className={`sidebar-chevron${open ? ' open' : ''}`}
                        width="14" height="14" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </>
                  )}
                </div>
                {!collapsed && open && children.map(child => (
                  <div
                    key={child.id}
                    className={`sidebar-nav-item sidebar-nav-child${activePage === child.id ? ' active' : ''}`}
                    onClick={() => { onNavigate(child.id); onMobileClose(); }}
                    data-tooltip={child.label}
                  >
                    <Icon path={child.icon} size={14} />
                    <span>{child.label}</span>
                  </div>
                ))}
              </div>
            );
          })}
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

  const items = allNavItems.filter(i =>
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
    'page-builder': <PageBuilder />,
    'component-builder': <ComponentBuilder />,
    projects: <ProjectsManagement />,
    skills: <SkillsManagement />,
    experience: <ExperienceManagement />,
    education: <EducationManagement />,
    certificates: <CertificatesManagement />,
    blog: <BlogManagement />,
    messages: <MessagesManagement />,
    media: <MediaLibrary />,
    analytics: <AnalyticsPage />,
    'analytics-live': <AnalyticsPage />,
    'analytics-map': <AnalyticsPage />,
    'analytics-traffic': <AnalyticsPage />,
    'analytics-reports': <AnalyticsPage />,
    appearance: <AppearancePage />,
    seo: <SEOManagement />,
    settings: <SettingsPage onNavigate={onNavigate} />,
    'settings-contact': <SettingsPage onNavigate={onNavigate} />,
    'settings-social': <SettingsPage onNavigate={onNavigate} />,
    backup: <SettingsPage onNavigate={onNavigate} />,
    'settings-integrations': <SettingsPage onNavigate={onNavigate} />,
    hero: <HeroManagement />,
    about: <AboutManagement />,
    services: <ServicesManagement />,
    testimonials: <TestimonialsManagement />,
    navigation: <NavbarManagement />,
    footer: <FooterManagement />,
    profile: <ProfileManagement />,
  };
  const page = components[activePage];
  if (page) return page;
  return <PageStub title={pageLabels[activePage] || activePage} />;
}

function AdminLayout() {
  const [activePage, setActivePage] = useState(() => localStorage.getItem('admin_page') || 'dashboard');
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === 'true');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [themePreviewOpen, setThemePreviewOpen] = useState(false);
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
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setCmdOpen(true);
      }
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.target.closest('input,textarea,select')) {
        e.preventDefault();
        setShortcutsOpen(true);
      }
      if (e.key === 'Escape') {
        setCmdOpen(false);
        setPanelOpen(false);
        setShortcutsOpen(false);
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
          onOpenThemePreview={() => setThemePreviewOpen(true)}
        />
        <div className="admin-content">
          <AutoSaveProvider onSave={() => Promise.resolve()}>
            <AdminRouter activePage={activePage} onNavigate={handleNavigate} />
            <div className="auto-save-bar">
              <AutoSaveIndicator status="saved" />
            </div>
          </AutoSaveProvider>
        </div>
      </div>
      <RightPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onNavigate={handleNavigate} />
      <KeyboardShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <ThemeLivePreview open={themePreviewOpen} onClose={() => setThemePreviewOpen(false)} onSave={(theme) => {
        console.log('Theme saved:', theme);
        setThemePreviewOpen(false);
      }} />
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
