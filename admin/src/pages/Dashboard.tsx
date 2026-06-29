import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { timeAgo } from '../lib/utils';
import { Icons, Icon } from '../lib/icons';

export default function Dashboard() {
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
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (error) return <div className="placeholder-page"><p>{error}</p></div>;

  const totalVisitors = visitors.reduce((s, v) => s + (v.count || 0), 0);

  const statCards = [
    { label: 'Total Projects', value: stats?.projects?.total || 0, iconPath: Icons.folder, color: 'blue', change: `${stats?.projects?.active || 0} active` },
    { label: 'Skills', value: stats?.skills || 0, iconPath: Icons.code, color: 'purple', change: 'Across categories' },
    { label: 'Certificates', value: stats?.certificates || 0, iconPath: Icons.award, color: 'orange', change: 'Verified credentials' },
    { label: 'Experience', value: stats?.experiences || 0, iconPath: Icons.briefcase, color: 'accent', change: 'Work history' },
    { label: 'Blog Posts', value: stats?.blogs?.total || 0, iconPath: Icons['file-text'], color: 'green', change: `${stats?.blogs?.published || 0} published` },
    { label: 'Messages', value: stats?.messages?.total || 0, iconPath: Icons.mail, color: 'red', change: `${stats?.messages?.unread || 0} unread` },
    { label: 'Visitors', value: totalVisitors.toLocaleString() || '0', iconPath: Icons.users, color: 'blue', change: 'All time' },
    { label: 'Resume Downloads', value: stats?.downloads || 0, iconPath: Icons.download, color: 'purple', change: 'Total downloads' },
  ];

  const recentActivities = [
    ...recentMessages.slice(0, 3).map((m) => ({
      text: 'Message from',
      highlight: m.name,
      time: timeAgo(m.createdAt),
      color: 'blue',
    })),
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Welcome back! Here's your portfolio overview.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={() => window.location.reload()}>
            Refresh
          </button>
        </div>
      </div>

      <div className="stat-grid">
        {statCards.map((card, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-card-top">
              <div>
                <div className="stat-card-label">{card.label}</div>
                <div className="stat-card-value">{card.value}</div>
              </div>
              <div className={`stat-card-icon ${card.color}`}>
                <Icon path={card.iconPath} size={20} />
              </div>
            </div>
            <div className="stat-card-change up">
              <Icon path={Icons['arrow-up-right']} size={12} />
              {card.change}
            </div>
          </div>
        ))}
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-card-header">
            <h4>Visitor Statistics</h4>
            <span style={{ fontSize: 12, color: 'var(--text-light)' }}>Monthly</span>
          </div>
          <div className="chart-card-body">
            {visitors.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: '100%', width: '100%' }}>
                {visitors.map((v, i) => {
                  const maxVal = Math.max(...visitors.map((x) => x.count || 0), 1);
                  const h = Math.max(4, ((v.count || 0) / maxVal) * 220);
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <div style={{ width: '100%', background: 'var(--accent)', borderRadius: '3px 3px 0 0', height: h, opacity: 0.7 + (i / visitors.length) * 0.3, transition: 'height 0.3s' }} title={`${v.count} visits`} />
                      <span style={{ fontSize: 8, color: 'var(--text-light)', whiteSpace: 'nowrap' }}>{v.date || v.month || ''}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="placeholder-page" style={{ padding: 40 }}>
                <Icon path={Icons['bar-chart']} size={32} />
                <p>No visitor data yet — visit your portfolio to start tracking</p>
              </div>
            )}
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-card-header">
            <h4>Recent Activity</h4>
          </div>
          <div className="activity-list" style={{ height: 260, overflow: 'auto' }}>
            {recentActivities.length > 0 ? recentActivities.map((item, idx) => (
              <div key={idx} className="activity-item">
                <div className="activity-item-left">
                  <div className={`activity-dot ${item.color}`} />
                  <span className="activity-text">
                    {item.text} <strong>{item.highlight}</strong>
                  </span>
                </div>
                <span className="activity-time">{item.time}</span>
              </div>
            )) : (
              <div className="placeholder-page" style={{ padding: 40 }}>
                <Icon path={Icons.activity} size={32} />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card chart-full">
          <div className="chart-card-header">
            <h4>Latest Messages</h4>
          </div>
          {recentMessages.length > 0 ? (
            <div className="activity-list">
              {recentMessages.map((msg) => (
                <div key={msg._id} className="activity-item">
                  <div className="activity-item-left">
                    <div className={`activity-dot ${msg.isRead ? 'green' : 'orange'}`} />
                    <span className="activity-text">
                      <strong>{msg.name}</strong>
                      <span> — {msg.subject || msg.message?.substring(0, 60)}</span>
                    </span>
                  </div>
                  <span className="activity-time">{timeAgo(msg.createdAt)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="placeholder-page" style={{ padding: 40 }}>
              <Icon path={Icons.mail} size={32} />
              <p>No messages yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
