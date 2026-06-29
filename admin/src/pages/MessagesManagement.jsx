import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';

export default function MessagesManagement() {
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getMessages({ limit: 50 });
      setMessages(data.data || []);
    } catch { toast.error('Failed to load messages'); }
    finally { setLoading(false); }
  };

  const filtered = messages.filter(m => {
    if (filter === 'unread' && m.isRead) return false;
    if (filter === 'replied' && !m.isReplied) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!m.name?.toLowerCase().includes(q) && !m.email?.toLowerCase().includes(q) && !(m.message || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleSelect = async (msg) => {
    setSelected(msg);
    setReply('');
    if (!msg.isRead) {
      try {
        await adminApi.markAsRead(msg._id);
        setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, isRead: true } : m));
      } catch { /* ignore */ }
    }
  };

  const handleReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await adminApi.replyMessage(selected._id, { replyContent: reply });
      setMessages(prev => prev.map(m => m._id === selected._id ? { ...m, isReplied: true, replyContent: reply } : m));
      setSelected({ ...selected, isReplied: true, replyContent: reply });
      toast.success('Reply sent');
      setReply('');
    } catch { toast.error('Failed to send reply'); }
    finally { setSending(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteMessage(deleteTarget._id);
      toast.success('Message deleted');
      setMessages(prev => prev.filter(m => m._id !== deleteTarget._id));
      if (selected?._id === deleteTarget._id) setSelected(null);
    } catch { toast.error('Failed to delete message'); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Messages</h1>
          <p>Manage contact form submissions - {messages.length} total</p>
        </div>
        <div className="page-actions">
          <div className="filter-tabs" style={{ display: 'flex', gap: 4, background: 'var(--gray-100)', borderRadius: 8, padding: 2 }}>
            {['all', 'unread', 'replied'].map(f => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`}
                style={{ padding: '6px 14px', fontSize: 12, fontWeight: 500, borderRadius: 6, border: 'none', cursor: 'pointer', background: filter === f ? 'var(--white)' : 'transparent', color: filter === f ? 'var(--blue)' : 'var(--text-secondary)', boxShadow: filter === f ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 16, minHeight: 'calc(100vh - 200px)' }}>
        <div className="card" style={{ overflow: 'auto', padding: 0 }}>
          <div style={{ padding: 12, borderBottom: '1px solid var(--gray-200)' }}>
            <div className="search-inline">
              <Icon path={Icons.search} size={14} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search messages..." style={{ border: 'none', outline: 'none', fontSize: 13, flex: 1 }} />
              {search && <button className="btn-ghost btn-xs" onClick={() => setSearch('')}><Icon path={Icons.x} size={12} /></button>}
            </div>
          </div>
          {loading ? (
            <div style={{ padding: 20 }}>
              {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 60, marginBottom: 8, borderRadius: 8 }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <Icon path={Icons.messageSquare} size={36} />
              <h3>No messages</h3>
              <p>{filter !== 'all' ? `No ${filter} messages found` : 'No messages yet'}</p>
            </div>
          ) : (
            filtered.map(msg => (
              <div
                key={msg._id}
                onClick={() => handleSelect(msg)}
                className="message-list-item"
                data-selected={selected?._id === msg._id}
                data-unread={!msg.isRead}
                style={{
                  padding: '12px 14px', borderBottom: '1px solid var(--gray-100)',
                  cursor: 'pointer', background: selected?._id === msg._id ? 'var(--blue-light)' : 'transparent',
                  opacity: msg.isRead ? 0.65 : 1, borderLeft: msg.isReplied ? '3px solid var(--green)' : msg.isRead ? '3px solid transparent' : '3px solid var(--blue)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: msg.isRead ? 400 : 600, fontSize: 13 }}>{msg.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{new Date(msg.createdAt).toLocaleDateString()}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {msg.subject || msg.message?.substring(0, 60)}
                </p>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  {msg.isReplied ? 'Replied' : msg.isRead ? 'Read' : 'New'}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          {selected ? (
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600 }}>{selected.name}</h3>
                  <a href={`mailto:${selected.email}`} style={{ fontSize: 12, color: 'var(--blue)', textDecoration: 'none' }}>{selected.email}</a>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(selected)}>
                  <Icon path={Icons.trash2} size={14} /> Delete
                </button>
              </div>
              {selected.subject && (
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  Subject: {selected.subject}
                </div>
              )}
              <div style={{ padding: 16, background: 'var(--bg)', borderRadius: 8, fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {selected.message}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8, display: 'flex', gap: 12 }}>
                <span>Received {new Date(selected.createdAt).toLocaleString()}</span>
                {selected.isRead && <span>· Read</span>}
                {selected.isReplied && <span>· Replied</span>}
              </div>
              {selected.isReplied && (
                <div style={{ marginTop: 16, padding: 14, background: 'var(--green-light)', borderRadius: 8, border: '1px solid var(--green-border)' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)', marginBottom: 4 }}>Your reply:</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{selected.replyContent}</p>
                </div>
              )}
              <div style={{ marginTop: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Reply to {selected.name}</label>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write your reply..."
                  rows={4}
                  style={{ width: '100%', padding: 10, border: '1px solid var(--gray-200)', borderRadius: 8, fontFamily: 'var(--font)', fontSize: 13, resize: 'vertical' }}
                />
                <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={handleReply} disabled={!reply.trim() || sending}>
                  {sending ? 'Sending...' : <><Icon path={Icons.send} size={14} /> Send Reply</>}
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 60 }}>
              <Icon path={Icons.messageSquare} size={48} />
              <h3>Select a message</h3>
              <p>Choose a message from the inbox to read and reply.</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Message"
        message={`Delete message from "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}
