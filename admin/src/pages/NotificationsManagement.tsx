import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { timeAgo } from '../lib/utils';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const getAuthHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('admin_token')}` });

const notificationApi = {
  getAll: () => axios.get(`${API_URL}/notifications`, { headers: getAuthHeaders() }),
  getUnreadCount: () => axios.get(`${API_URL}/notifications/unread-count`, { headers: getAuthHeaders() }),
  markAsRead: (id: string) => axios.patch(`${API_URL}/notifications/${id}/read`, {}, { headers: getAuthHeaders() }),
  markAllAsRead: () => axios.post(`${API_URL}/notifications/read-all`, {}, { headers: getAuthHeaders() }),
  delete: (id: string) => axios.delete(`${API_URL}/notifications/${id}`, { headers: getAuthHeaders() }),
};

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

function UsersIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function MailIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function DownloadIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function MessageSquareIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function BriefcaseIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function BellIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function BellOffIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      <path d="M18.63 13A17.89 17.89 0 0 1 18 8" />
      <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14" />
      <path d="M18 8a6 6 0 0 0-9.33-5" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

const typeIconMap: Record<string, React.FC<{ size?: number }>> = {
  new_visitor: UsersIcon,
  new_message: MailIcon,
  cv_download: DownloadIcon,
  blog_comment: MessageSquareIcon,
  project_inquiry: BriefcaseIcon,
  system: BellIcon,
};

const typeColorMap: Record<string, string> = {
  new_visitor: 'var(--blue, #3b82f6)',
  new_message: 'var(--green, #22c55e)',
  cv_download: 'var(--purple, #a855f7)',
  blog_comment: 'var(--orange, #f59e0b)',
  project_inquiry: 'var(--accent, #06b6d4)',
  system: 'var(--gray-500, #6b7280)',
};

const iconBgMap: Record<string, string> = {
  new_visitor: 'var(--blue-subtle, #eff6ff)',
  new_message: 'var(--green-subtle, #f0fdf4)',
  cv_download: 'var(--purple-subtle, #faf5ff)',
  blog_comment: 'var(--orange-subtle, #fffbeb)',
  project_inquiry: 'var(--accent-subtle, #ecfeff)',
  system: 'var(--gray-100, #f3f4f6)',
};

const filterTabs = ['all', 'unread', 'read'] as const;

export default function NotificationsManagement() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await notificationApi.getAll();
      const list = Array.isArray(data) ? data : data.data || [];
      setNotifications(list);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await notificationApi.getUnreadCount();
      setUnreadCount(typeof data === 'number' ? data : data.count ?? 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  const filtered = notifications.filter(n => {
    if (filter === 'unread' && n.isRead) return false;
    if (filter === 'read' && !n.isRead) return false;
    return true;
  });

  const handleMarkAsRead = async (id: string) => {
    const prev = notifications;
    setNotifications(prev =>
      prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount(c => Math.max(0, c - 1));
    try {
      await notificationApi.markAsRead(id);
    } catch {
      setNotifications(prev);
      fetchUnreadCount();
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
    if (unreadIds.length === 0) return;
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await notificationApi.markAllAsRead();
    } catch {
      fetchNotifications();
      fetchUnreadCount();
    }
  };

  const handleDelete = async (id: string) => {
    const target = notifications.find(n => n._id === id);
    const wasUnread = target && !target.isRead;
    setNotifications(prev => prev.filter(n => n._id !== id));
    if (wasUnread) setUnreadCount(c => Math.max(0, c - 1));
    try {
      await notificationApi.delete(id);
    } catch {
      fetchNotifications();
      fetchUnreadCount();
    }
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);

  if (loading && notifications.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            Notifications
            {unreadCount > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 20, height: 20, padding: '0 6px',
                background: 'var(--primary)', color: '#fff',
                borderRadius: 10, fontSize: 11, fontWeight: 600,
                lineHeight: 1,
              }}>
                {unreadCount}
              </span>
            )}
          </h2>
          <p>Stay updated with recent activity</p>
        </div>
        <div className="page-actions">
          {unreadNotifications.length > 0 && (
            <button className="btn btn-outline btn-sm" onClick={handleMarkAllAsRead}>
              Mark All as Read
            </button>
          )}
          <div className="tabs">
            {filterTabs.map(f => (
              <button
                key={f}
                className={`tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'unread' ? ` (${unreadNotifications.length})` : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ padding: 20, textAlign: 'center' }}>
          <div className="spinner" style={{ width: 20, height: 20 }} />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="empty-state" style={{ padding: 80 }}>
          <BellOffIcon size={40} />
          <h3>No notifications</h3>
          <p>
            {filter === 'unread'
              ? 'No unread notifications. Great job staying on top of things!'
              : filter === 'read'
              ? 'No read notifications yet.'
              : 'No notifications yet. They will appear here when something happens.'}
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{
          background: 'var(--card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          {filtered.map((notif, idx) => {
            const IconComp = typeIconMap[notif.type] || BellIcon;
            const iconColor = typeColorMap[notif.type] || 'var(--text-secondary)';
            const iconBg = iconBgMap[notif.type] || 'var(--bg)';
            const isLast = idx === filtered.length - 1;

            return (
              <div
                key={notif._id}
                onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  padding: '14px 18px',
                  borderBottom: isLast ? 'none' : '1px solid var(--border)',
                  background: notif.isRead ? 'transparent' : 'var(--primary-subtle, #f0f7ff)',
                  cursor: notif.isRead ? 'default' : 'pointer',
                  transition: 'background 0.15s',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  if (!notif.isRead) e.currentTarget.style.background = 'var(--primary-subtle-hover, #e0f0ff)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = notif.isRead ? 'transparent' : 'var(--primary-subtle, #f0f7ff)';
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  color: iconColor,
                }}>
                  {IconComp ? <IconComp size={18} /> : <BellIcon size={18} />}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 8, marginBottom: 2,
                  }}>
                    <span style={{
                      fontSize: 13, fontWeight: notif.isRead ? 500 : 600,
                      color: 'var(--text)', lineHeight: 1.3,
                    }}>
                      {notif.title}
                    </span>
                    <span style={{
                      fontSize: 11, color: 'var(--text-tertiary)',
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                  <p style={{
                    fontSize: 12, color: 'var(--text-secondary)',
                    lineHeight: 1.5, margin: 0,
                  }}>
                    {notif.message}
                  </p>
                </div>

                {!notif.isRead && (
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--primary)',
                    flexShrink: 0, marginTop: 6,
                  }} />
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notif._id);
                  }}
                  title="Delete notification"
                  style={{
                    border: 'none', background: 'none', cursor: 'pointer',
                    padding: 4, lineHeight: 0, borderRadius: 4,
                    color: 'var(--text-tertiary)',
                    flexShrink: 0, marginTop: 2, opacity: 0.4,
                    transition: 'opacity 0.15s, color 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.color = 'var(--danger, #ef4444)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.opacity = '0.4';
                    e.currentTarget.style.color = 'var(--text-tertiary)';
                  }}
                >
                  <XIcon size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
