import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { timeAgo } from '../lib/utils';
import { Icons, Icon } from '../lib/icons';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, visitorRes, messagesRes] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getVisitorStats(),
          adminApi.getMessages({ limit: 5 }),
        ]);
        setStats(statsRes.data.data);
        setVisitors(visitorRes.data.data || []);
        setRecentMessages(messagesRes.data.data || []);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="page-header-left">
            <h1>Dashboard</h1>
            <p>Welcome back! Here's your portfolio overview.</p>
          </div>
        </div>
        <div className="stat-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="stat-card">
              <div className="stat-card-top">
                <div>
                  <div className="skeleton" style={{ width: 80, height: 12, marginBottom: 8 }} />
                  <div className="skeleton" style={{ width: 60, height: 28 }} />
                </div>
                <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <div className="page-header-left">
            <h1>Dashboard</h1>
            <p>Welcome back! Here's your portfolio overview.</p>
          </div>
        </div>
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <Icon path={Icons['alert-triangle']} size={48} />
          <h3 style={{ marginTop: 16, fontSize: 18, fontWeight: 600 }}>Unable to load dashboard</h3>
          <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>{error}</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  const totalVisitors = visitors.reduce((s, v) => s + (v.count || 0), 0);

  const statCards = [
    { label: 'Total Projects', value: stats?.projects?.total || 0, icon: Icons.folder, color: 'primary', change: `${stats?.projects?.active || 0} active`, trend: 'up', compare: 'from 0' },
    { label: 'Messages', value: stats?.messages?.total || 0, icon: Icons.mail, color: 'warning', change: `${stats?.messages?.unread || 0} unread`, trend: 'neutral', compare: 'needs review' },
    { label: 'Visitors', value: totalVisitors.toLocaleString() || '0', icon: Icons.users, color: 'primary', change: 'All time', trend: 'up', compare: 'total visits' },
    { label: 'Downloads', value: stats?.totalDownloads || 0, icon: Icons.download, color: 'success', change: 'Total', trend: 'neutral', compare: 'all time' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div>
      {/* Hero */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-left">
          <div className="dashboard-hero-greeting">{today}</div>
          <div className="dashboard-hero-title">{greeting}, <strong>Sisay</strong></div>
          <div className="dashboard-hero-sub">Here's what's happening with your portfolio today.</div>
        </div>
        <div className="dashboard-hero-right">
          <div className="dashboard-hero-stat">
            <div className="dashboard-hero-stat-value">{stats?.projects?.active || 0}</div>
            <div className="dashboard-hero-stat-label">Active Projects</div>
          </div>
          <div className="dashboard-hero-stat-divider" />
          <div className="dashboard-hero-stat">
            <div className="dashboard-hero-stat-value">{stats?.messages?.unread || 0}</div>
            <div className="dashboard-hero-stat-label">Unread Messages</div>
          </div>
          <div className="dashboard-hero-stat-divider" />
          <div className="dashboard-hero-stat">
            <div className="dashboard-hero-stat-value">{totalVisitors}</div>
            <div className="dashboard-hero-stat-label">Total Visitors</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {statCards.map((card, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-card-top">
              <div className="stat-card-body">
                <div className="stat-card-label">{card.label}</div>
                <div className="stat-card-value">{card.value}</div>
                <div className="stat-card-footer">
                  <span className={`stat-card-change ${card.trend}`}>
                    {card.trend === 'up' && <Icon path={Icons['arrow-up-right']} size={12} />}
                    {card.change}
                  </span>
                  <span className="stat-card-compare">{card.compare}</span>
                </div>
              </div>
              <div className={`stat-card-icon ${card.color}`}>
                <Icon path={card.icon} size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-header-left">
              <h4>Visitor Statistics</h4>
            </div>
            <div className="chart-tabs">
              <button className="chart-tab active">7 days</button>
              <button className="chart-tab">30 days</button>
              <button className="chart-tab">All time</button>
            </div>
          </div>
          <div className="chart-card-body">
            {visitors.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: '100%', paddingBottom: 20 }}>
                {visitors.map((v, i) => {
                  const maxVal = Math.max(...visitors.map((x) => x.count || 0), 1);
                  const h = Math.max(6, ((v.count || 0) / maxVal) * 220);
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 9, color: 'var(--text-tertiary)', fontWeight: 500 }}>{v.count || 0}</span>
                      <div
                        style={{
                          width: '100%', background: 'var(--primary)',
                          borderRadius: '4px 4px 0 0', height: h,
                          opacity: 0.6 + (i / visitors.length) * 0.4,
                          minHeight: 16, transition: 'height 0.3s, opacity 0.3s',
                          cursor: 'pointer',
                        }}
                        title={`${v.count} visits`}
                        onMouseEnter={(e) => { e.target.style.opacity = '1'; }}
                        onMouseLeave={(e) => { e.target.style.opacity = 0.6 + (i / visitors.length) * 0.4; }}
                      />
                      <span style={{ fontSize: 9, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{v.date || v.month || ''}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="placeholder-page" style={{ padding: 40 }}>
                <Icon path={Icons['bar-chart']} size={40} />
                <h3>No data yet</h3>
                <p>Visit your portfolio to start collecting analytics</p>
              </div>
            )}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-header-left">
              <h4>Recent Activity</h4>
            </div>
          </div>
          <div className="chart-card-body" style={{ height: 'auto', overflow: 'auto' }}>
            <div className="activity-list">
              {recentMessages.length > 0 ? recentMessages.slice(0, 6).map((msg, idx) => (
                <div key={idx} className="activity-item">
                  <div className={`activity-dot ${msg.isRead ? 'green' : 'orange'}`} />
                  <div className="activity-content">
                    <div className="activity-text">
                      Message from <strong>{msg.name}</strong> <span>{msg.subject || ''}</span>
                    </div>
                    <div className="activity-time">{timeAgo(msg.createdAt)}</div>
                  </div>
                </div>
              )) : (
                <div className="placeholder-page" style={{ padding: 30 }}>
                  <Icon path={Icons.activity} size={32} />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3>Quick Actions</h3>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'New Project', icon: Icons.plus, color: 'primary' },
              { label: 'View Messages', icon: Icons.mail, color: 'warning' },
              { label: 'Analytics', icon: Icons['bar-chart-3'], color: 'primary' },
              { label: 'SEO Settings', icon: Icons.search, color: 'success' },
            ].map((action, i) => (
              <button key={i} className={`btn btn-${action.color === 'primary' ? 'primary' : action.color === 'warning' ? 'warning' : 'outline'}`}>
                <Icon path={action.icon} size={16} />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
