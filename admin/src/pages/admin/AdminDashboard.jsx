import { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getUnreadCount } from '../../services/api';
import Toast from './components/Toast';
import './AdminDashboard.css';

const DashboardHome   = lazy(() => import('./sections/DashboardHome'));
const ProjectsManager = lazy(() => import('./sections/ProjectsManager'));
const SkillsManager   = lazy(() => import('./sections/SkillsManager'));
const MessagesManager = lazy(() => import('./sections/MessagesManager'));
const BlogManager     = lazy(() => import('./sections/BlogManager'));
const SettingsManager = lazy(() => import('./sections/SettingsManager'));

const GenericManager = ({ title, icon }) => (
  <div className="admin-card">
    <div className="admin-card-header">
      <h3 className="admin-card-title">{icon} {title}</h3>
    </div>
    <div className="admin-empty">
      <div className="admin-empty-icon">{icon}</div>
      <h4>{title} Management</h4>
      <p>Connect your backend API to manage {title.toLowerCase()} content.</p>
    </div>
  </div>
);

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠', section: 'main' },
  { id: 'projects', label: 'Projects', icon: '🚀', section: 'content' },
  { id: 'skills', label: 'Skills', icon: '⚡', section: 'content' },
  { id: 'experience', label: 'Experience', icon: '💼', section: 'content' },
  { id: 'education', label: 'Education', icon: '🎓', section: 'content' },
  { id: 'certificates', label: 'Certificates', icon: '🏆', section: 'content' },
  { id: 'services', label: 'Services', icon: '🛠️', section: 'content' },
  { id: 'testimonials', label: 'Testimonials', icon: '⭐', section: 'content' },
  { id: 'blog', label: 'Blog', icon: '📝', section: 'content' },
  { id: 'messages', label: 'Messages', icon: '✉️', section: 'inbox', badge: true },
  { id: 'settings', label: 'Settings', icon: '⚙️', section: 'system' },
];

const SECTIONS = { main: 'Main', content: 'Content', inbox: 'Inbox', system: 'System' };

const AdminDashboard = () => {
  const [active, setActive] = useState('dashboard');
  const [unread, setUnread] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getUnreadCount().then(r => setUnread(r.count)).catch(() => {});
    const interval = setInterval(() => {
      getUnreadCount().then(r => setUnread(r.count)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => setActive(e.detail);
    window.addEventListener('admin-navigate', handler);
    return () => window.removeEventListener('admin-navigate', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  const renderSection = () => {
    const load = <div className="admin-loading"><div className="admin-spinner" /></div>;
    switch (active) {
      case 'dashboard':   return <Suspense fallback={load}><DashboardHome /></Suspense>;
      case 'projects':    return <Suspense fallback={load}><ProjectsManager /></Suspense>;
      case 'skills':      return <Suspense fallback={load}><SkillsManager /></Suspense>;
      case 'messages':    return <Suspense fallback={load}><MessagesManager /></Suspense>;
      case 'blog':        return <Suspense fallback={load}><BlogManager /></Suspense>;
      case 'settings':    return <Suspense fallback={load}><SettingsManager /></Suspense>;
      case 'experience':  return <GenericManager title="Experience" icon="💼" />;
      case 'education':   return <GenericManager title="Education" icon="🎓" />;
      case 'certificates':return <GenericManager title="Certificates" icon="🏆" />;
      case 'services':    return <GenericManager title="Services" icon="🛠️" />;
      case 'testimonials':return <GenericManager title="Testimonials" icon="⭐" />;
      default:            return <DashboardHome />;
    }
  };

  const sectionGroups = Object.entries(SECTIONS);
  const titles = { dashboard: 'Dashboard', projects: 'Projects', skills: 'Skills', experience: 'Experience', education: 'Education', certificates: 'Certificates', services: 'Services', testimonials: 'Testimonials', blog: 'Blog', messages: 'Messages', settings: 'Settings' };

  return (
    <div className="admin">
      <Toast />

      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        <a href="/" className="sidebar-logo">
          <div className="sidebar-logo-mark">ST</div>
          <div>
            <p className="sidebar-logo-text">Portfolio Admin</p>
            <p className="sidebar-logo-sub">Management Dashboard</p>
          </div>
        </a>

        <nav className="sidebar-nav">
          {sectionGroups.map(([key, label]) => {
            const items = NAV.filter(n => n.section === key);
            if (!items.length) return null;
            return (
              <div key={key}>
                <p className="sidebar-section-label">{label}</p>
                {items.map(item => (
                  <a
                    key={item.id}
                    href="#"
                    className={`sidebar-link${active === item.id ? ' active' : ''}`}
                    onClick={e => { e.preventDefault(); setActive(item.id); setSidebarOpen(false); if (item.id === 'messages') setUnread(0); }}
                  >
                    <span className="sidebar-link-icon">{item.icon}</span>
                    {item.label}
                    {item.badge && unread > 0 && <span className="sidebar-badge">{unread}</span>}
                  </a>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{user?.name?.[0] || 'A'}</div>
            <div>
              <p className="sidebar-user-name">{user?.name}</p>
              <p className="sidebar-user-role">Administrator</p>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <p className="admin-topbar-title">{titles[active] || 'Dashboard'}</p>
            <p className="admin-topbar-sub">Manage your portfolio content</p>
          </div>
          <div className="admin-topbar-right">
            <a href={import.meta.env.VITE_SITE_URL || 'http://localhost:5173'} target="_blank" rel="noopener noreferrer" className="admin-view-site">
              🌐 View Site
            </a>
            <button
              style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem' }}
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(v => !v)}
            >
              ☰
            </button>
          </div>
        </div>

        <div className="admin-content">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
