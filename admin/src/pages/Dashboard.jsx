import React, { useState, useEffect } from 'react';
import api from '../services/api';

const STAT_CARDS = [
  { key: 'totalVisitors', label: 'Total Visitors', icon: 'M17 20v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2 M7 4a4 4 0 100 8 4 4 0 000-8z M23 20v-2a4 4 0 00-3-3.87 M16 4a4 4 0 010 7.75', color: 'primary' },
  { key: 'onlineVisitors', label: 'Online Now', icon: 'M12 2a10 10 0 1010 10M12 2v4M12 2a10 10 0 00-10 10', color: 'success' },
  { key: 'totalProjects', label: 'Projects', icon: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z', color: 'warning' },
  { key: 'totalMessages', label: 'Messages', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', color: 'danger' },
  { key: 'totalBlogs', label: 'Blog Posts', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8', color: 'primary' },
  { key: 'totalSkills', label: 'Skills', icon: 'M16 18l6-6-6-6 M8 6l-6 6 6 6', color: 'success' },
  { key: 'totalDownloads', label: 'Resume Downloads', icon: 'M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2 M7 11l5 5 5-5 M12 4v12', color: 'warning' },
  { key: 'storageUsed', label: 'Storage Used', icon: 'M21 15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h8 M15 18l-2-3-2 3 M17 3v6 M20 6h-6', color: 'gray' },
];

const RECENT_ACTIVITY_TYPES = [
  { action: 'created', color: 'var(--success)' },
  { action: 'updated', color: 'var(--primary)' },
  { action: 'deleted', color: 'var(--danger)' },
  { action: 'uploaded', color: 'var(--warning)' },
  { action: 'login', color: 'var(--primary)' },
  { action: 'logout', color: 'var(--gray-500)' },
];

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    Promise.all([
      api.get('/analytics/dashboard').catch(() => ({ data: {} })),
      api.get('/activity-logs/recent').catch(() => ({ data: { data: [] } })),
      api.get('/notifications').catch(() => ({ data: { data: [], unreadCount: 0 } })),
    ]).then(([statsRes, activityRes, notifRes]) => {
      setStats(statsRes.data?.data || statsRes.data || {});
      setActivities(activityRes.data?.data || []);
      setNotifications(notifRes.data?.data || []);
    }).finally(() => setLoading(false));
  }, [timeRange]);

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getActivityColor = (action) => {
    const match = RECENT_ACTIVITY_TYPES.find(t => action?.includes(t.action));
    return match?.color || 'var(--gray-400)';
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <div>
        <div className="page-header"><div><h1>Dashboard</h1><p>Welcome to your portfolio CMS</p></div></div>
        <div className="stat-grid">
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-xl)' }} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-hero">
        <div className="dashboard-hero-left">
          <div className="dashboard-hero-greeting">Dashboard Overview</div>
          <div className="dashboard-hero-title">Welcome back, <strong>Admin</strong></div>
          <div className="dashboard-hero-sub">Here's what's happening with your portfolio today.</div>
        </div>
        <div className="dashboard-hero-right">
          <div className="dashboard-hero-stat">
            <div className="dashboard-hero-stat-value">{formatNumber(stats.onlineVisitors || stats.activeVisitors || 0)}</div>
            <div className="dashboard-hero-stat-label">Online Now</div>
          </div>
          <div className="dashboard-hero-stat-divider" />
          <div className="dashboard-hero-stat">
            <div className="dashboard-hero-stat-value">{formatNumber(stats.todayVisitors || 0)}</div>
            <div className="dashboard-hero-stat-label">Today</div>
          </div>
          <div className="dashboard-hero-stat-divider" />
          <div className="dashboard-hero-stat">
            <div className="dashboard-hero-stat-value">{notifications.length}</div>
            <div className="dashboard-hero-stat-label">Notifications</div>
          </div>
        </div>
      </div>

      <div className="stat-grid">
        {STAT_CARDS.map(card => (
          <div key={card.key} className="stat-card">
            <div className="stat-card-top">
              <div className="stat-card-body">
                <div className="stat-card-label">{card.label}</div>
                <div className="stat-card-value">{formatNumber(stats[card.key])}</div>
              </div>
              <div className={`stat-card-icon ${card.color}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={card.icon} />
                </svg>
              </div>
            </div>
            {stats[`${card.key}Change`] !== undefined && (
              <div className="stat-card-footer">
                <span className={`stat-card-change ${stats[`${card.key}Change`] >= 0 ? 'up' : 'down'}`}>
                  {stats[`${card.key}Change`] >= 0 ? '+' : ''}{stats[`${card.key}Change`]}%
                </span>
                <span className="stat-card-compare">vs last {timeRange}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="chart-card">
          <div className="chart-card-header">
            <h4>Recent Activity</h4>
          </div>
          <div className="activity-list">
            {activities.length === 0 && (
              <div className="flex items-center justify-center py-8 text-sm" style={{ color: 'var(--text-tertiary)' }}>No recent activity</div>
            )}
            {activities.slice(0, 10).map((act, i) => (
              <div key={act._id || i} className="activity-item">
                <div className="activity-dot" style={{ background: getActivityColor(act.action) }} />
                <div className="activity-content">
                  <div className="activity-text">
                    <span>{act.action?.replace(/\./g, ' ') || 'Unknown action'}</span>
                    {act.details?.name && <span> — {act.details.name}</span>}
                  </div>
                  <div className="activity-time">{formatTime(act.timestamp || act.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <h4>Quick Actions</h4>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Add Project', icon: 'M12 4v16M4 12h16', page: 'projects' },
              { label: 'View Messages', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', page: 'messages' },
              { label: 'Check Analytics', icon: 'M3 20h18M5 16l3-5 4 4 5-8 4 4', page: 'analytics' },
              { label: 'Update Profile', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8z', page: 'profile' },
              { label: 'Theme Settings', icon: 'M12 20a8 8 0 100-16 8 8 0 000-16z M12 8a4 4 0 100 8 4 4 0 000-8z', page: 'theme' },
              { label: 'SEO Settings', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', page: 'seo' },
            ].map((action, i) => (
              <button key={i} className="flex items-center gap-3 p-3 rounded-lg border text-sm font-medium transition-all"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--card)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={action.icon} /></svg>
                {action.label}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-card mt-6">
        <div className="chart-card-header">
          <h4>System Status</h4>
          <div className="chart-tabs">
            {['day', 'week', 'month'].map(r => (
              <button key={r} className={`chart-tab ${timeRange === r ? 'active' : ''}`} onClick={() => setTimeRange(r)}>{r.charAt(0).toUpperCase() + r.slice(1)}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'API Status', value: 'Operational', color: 'var(--success)' },
            { label: 'Database', value: 'Connected', color: 'var(--success)' },
            { label: 'Storage', value: `${stats.storageUsed || '0'} MB`, color: 'var(--primary)' },
            { label: 'Uptime', value: '99.9%', color: 'var(--success)' },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-lg text-center" style={{ background: 'var(--bg)' }}>
              <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>{item.label}</div>
              <div className="text-lg font-bold" style={{ color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
