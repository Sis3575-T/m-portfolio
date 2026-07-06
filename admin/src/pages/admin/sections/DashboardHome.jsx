import { useState, useEffect } from 'react';
import { getProjects, getSkills, getMessages, getBlogs } from '../../../services/api';

const DashboardHome = () => {
  const [stats, setStats] = useState({ projects: 0, skills: 0, messages: 0, unread: 0, blogs: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [p, s, m, b] = await Promise.all([
          getProjects('?visible=all'),
          getSkills(true),
          getMessages('?limit=1'),
          getBlogs('?limit=1'),
        ]);
        setStats({
          projects: p.count || 0,
          skills: s.data?.length || 0,
          messages: m.total || 0,
          unread: m.unreadCount || 0,
          blogs: b.total || 0,
        });
      } catch {}
    };
    load();
  }, []);

  const cards = [
    { icon: '🚀', label: 'Projects', value: stats.projects, color: '#eef2ff', iconColor: '#6366f1' },
    { icon: '⚡', label: 'Skills', value: stats.skills, color: '#ecfdf5', iconColor: '#059669' },
    { icon: '✉️', label: 'Messages', value: stats.messages, color: '#fffbeb', iconColor: '#d97706', badge: stats.unread },
    { icon: '📝', label: 'Blog Posts', value: stats.blogs, color: '#fdf4ff', iconColor: '#9333ea' },
  ];

  return (
    <div>
      <div className="admin-stats">
        {cards.map((c, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-card-icon" style={{ background: c.color }}>
              <span style={{ fontSize: '1.3rem' }}>{c.icon}</span>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <p className="stat-card-n">{c.value}</p>
                {c.badge > 0 && <span className="sidebar-badge">{c.badge}</span>}
              </div>
              <p className="stat-card-l">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Quick Actions</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { label: '+ Add Project', section: 'projects', icon: '🚀' },
            { label: '+ Add Skill', section: 'skills', icon: '⚡' },
            { label: '+ Add Certificate', section: 'certificates', icon: '🏆' },
            { label: '+ Write Blog Post', section: 'blog', icon: '📝' },
            { label: '📩 View Messages', section: 'messages', icon: '✉️' },
            { label: '⚙️ Site Settings', section: 'settings', icon: '⚙️' },
          ].map((a, i) => (
            <button
              key={i}
              className="btn-admin btn-admin-secondary"
              style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
              onClick={() => window.dispatchEvent(new CustomEvent('admin-navigate', { detail: a.section }))}
            >
              {a.icon} {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-card">
        <h3 className="admin-card-title" style={{ marginBottom: '1rem' }}>Portfolio Live</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Your portfolio is deployed and accessible at:
        </p>
        <a
          href={import.meta.env.VITE_SITE_URL || 'https://portfolio2-khxf.vercel.app'}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-admin btn-admin-primary"
        >
          🌐 View Live Portfolio
        </a>
      </div>
    </div>
  );
};

export default DashboardHome;
