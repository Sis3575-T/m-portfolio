import React, { useState, useEffect, useCallback, useRef } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import type { Message } from '../types';
import { formatDateTime } from '../lib/utils';

const PAGE_SIZE = 20;

const REPLY_TEMPLATES = [
  { label: 'Thank you for your inquiry', content: 'Thank you for reaching out. I appreciate your interest and will get back to you shortly regarding your inquiry.' },
  { label: 'Meeting request confirmed', content: 'Thank you for your message. I would be happy to schedule a meeting with you. Please let me know your preferred date and time, and I will confirm accordingly.' },
  { label: 'Collaboration / proposal', content: 'Thank you for your proposal. I have reviewed the details and I am interested in exploring this opportunity further. Let me know the next steps.' },
  { label: 'General acknowledgment', content: 'Thank you for contacting me. Your message has been received and I will respond as soon as possible.' },
  { label: 'Not available / redirect', content: 'Thank you for your message. Unfortunately, I am not currently available for new projects. I will keep your information on file and reach out if anything changes.' },
];

function LoadFlaggedState(): Set<string> {
  try {
    const raw = localStorage.getItem('msgs_flagged');
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch { return new Set<string>(); }
}

function SaveFlaggedState(ids: Set<string>) {
  localStorage.setItem('msgs_flagged', JSON.stringify([...ids]));
}

function ExportCSV(messages: Message[]): void {
  const header = 'Name,Email,Subject,Message,Date,Read,Replied';
  const rows = messages.map(m =>
    `"${(m.name || '').replace(/"/g, '""')}","${(m.email || '').replace(/"/g, '""')}","${(m.subject || '').replace(/"/g, '""')}","${(m.message || '').replace(/"/g, '""')}","${new Date(m.createdAt).toISOString()}","${m.isRead}","${m.isReplied}"`
  );
  const csv = '\uFEFF' + header + '\n' + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'messages.csv'; a.click();
  URL.revokeObjectURL(url);
}

function ExportJSON(messages: Message[]): void {
  const data = messages.map(m => ({
    name: m.name, email: m.email, subject: m.subject,
    message: m.message, date: m.createdAt, isRead: m.isRead, isReplied: m.isReplied,
  }));
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'messages.json'; a.click();
  URL.revokeObjectURL(url);
}

export default function MessagesManagement() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(LoadFlaggedState);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  const fetchMessages = useCallback(async (p: number, search: string) => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page: p, limit: PAGE_SIZE };
      if (search.trim()) params.search = search.trim();
      const { data: res } = await adminApi.getMessages(params);
      setMessages(res.data || []);
      setTotal(res.total ?? 0);
      setTotalPages(res.pages ?? 1);
      setPage(res.page ?? 1);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback((value: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchMessages(1, value);
    }, 350);
  }, [fetchMessages]);

  useEffect(() => {
    fetchMessages(1, '');
  }, [fetchMessages]);

  useEffect(() => {
    SaveFlaggedState(flaggedIds);
  }, [flaggedIds]);

  const filtered = messages.filter(m => {
    if (filter === 'unread' && m.isRead) return false;
    if (filter === 'read' && !m.isRead) return false;
    return true;
  });

  const unreadCount = total;
  const someSelected = selectedIds.size > 0;
  const allVisibleSelected = filtered.length > 0 && filtered.every(m => selectedIds.has(m._id));

  const handleSelectMessage = async (msg: Message) => {
    setSelected(msg);
    setReply('');
    if (!msg.isRead) {
      try {
        await adminApi.markAsRead(msg._id);
        setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, isRead: true } : m));
      } catch (err) { /* ignore */ }
    }
  };

  const handleReply = async () => {
    if (!reply.trim() || !selected) return;
    try {
      await adminApi.replyMessage(selected._id, { replyContent: reply });
      setMessages(prev => prev.map(m => m._id === selected._id ? { ...m, isReplied: true, replyContent: reply } : m));
      setSelected({ ...selected, isReplied: true, replyContent: reply });
      setReply('');
    } catch (err) { console.error('Failed to reply', err); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await adminApi.deleteMessage(id);
      setMessages(prev => prev.filter(m => m._id !== id));
      if (selected?._id === id) setSelected(null);
      setTotal(prev => Math.max(0, prev - 1));
    } catch (err) { console.error('Failed to delete', err); }
  };

  const handleBulkMarkRead = async () => {
    for (const id of selectedIds) {
      try { await adminApi.markAsRead(id); } catch { /* ignore */ }
    }
    setMessages(prev => prev.map(m => selectedIds.has(m._id) ? { ...m, isRead: true } : m));
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (!window.confirm(`Delete ${count} selected message${count > 1 ? 's' : ''}?`)) return;
    for (const id of selectedIds) {
      try { await adminApi.deleteMessage(id); } catch { /* ignore */ }
    }
    setMessages(prev => prev.filter(m => !selectedIds.has(m._id)));
    if (selected && selectedIds.has(selected._id)) setSelected(null);
    setTotal(prev => Math.max(0, prev - count));
    setSelectedIds(new Set());
  };

  const handleBulkExport = () => {
    const msgs = messages.filter(m => selectedIds.has(m._id));
    if (exportFormat === 'csv') ExportCSV(msgs);
    else ExportJSON(msgs);
    setSelectedIds(new Set());
  };

  const handleExportAll = async () => {
    try {
      const { data: res } = await adminApi.getMessages({ limit: 10000 });
      const all = res.data || [];
      if (all.length === 0) return alert('No messages to export.');
      if (exportFormat === 'csv') ExportCSV(all);
      else ExportJSON(all);
    } catch (err) {
      console.error('Export failed', err);
      alert('Failed to export messages.');
    }
  };

  const toggleFlagged = (id: string) => {
    setFlaggedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(m => m._id)));
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const applyTemplate = (content: string) => {
    setReply(content);
  };

  const totalPagesArr = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (loading && messages.length === 0) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Messages</h2>
          <p>Contact form submissions — {total} total</p>
        </div>
        <div className="page-actions">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
            style={{
              padding: '6px 10px', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)',
              fontSize: 12, background: 'var(--card)', color: 'var(--text)', cursor: 'pointer',
            }}
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
          <button className="btn btn-outline btn-sm" onClick={handleExportAll}>
            <Icon path={Icons.download} size={14} /> Export All
          </button>
          <div className="tabs">
            {(['all', 'unread', 'read'] as const).map(f => (
              <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}{f === 'unread' ? ` (${messages.filter(m => !m.isRead).length})` : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="messages-layout">
        <div className="messages-list">
          <div className="messages-list-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAll}
                style={{ margin: 0, cursor: 'pointer' }}
                title="Select all visible"
              />
              <span>Inbox</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-secondary)' }}>
              {filtered.length} / {total}
            </span>
          </div>

          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--bg)', borderRadius: 'var(--radius)',
              padding: '6px 10px', border: '1px solid var(--border)',
            }}>
              <Icon path={Icons.search} size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search name, email, subject..."
                style={{
                  border: 'none', background: 'transparent', outline: 'none',
                  fontSize: 12, width: '100%', color: 'var(--text)',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}
                >
                  <Icon path={Icons.x} size={14} style={{ color: 'var(--text-tertiary)' }} />
                </button>
              )}
            </div>
          </div>

          {someSelected && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
              background: 'var(--primary-subtle)', borderBottom: '1px solid var(--border)',
              fontSize: 12,
            }}>
              <span style={{ fontWeight: 600, color: 'var(--primary)', marginRight: 4 }}>
                {selectedIds.size} selected
              </span>
              <button className="btn btn-sm" style={{ background: 'var(--primary)', color: '#fff', padding: '3px 8px', fontSize: 11 }} onClick={handleBulkMarkRead}>
                Mark Read
              </button>
              <button className="btn btn-sm" style={{ background: 'var(--danger)', color: '#fff', padding: '3px 8px', fontSize: 11 }} onClick={handleBulkDelete}>
                Archive
              </button>
              <button className="btn btn-sm" style={{ background: 'var(--gray-800)', color: '#fff', padding: '3px 8px', fontSize: 11 }} onClick={handleBulkExport}>
                Export
              </button>
            </div>
          )}

          {loading && <div style={{ padding: 20, textAlign: 'center' }}><div className="spinner" style={{ width: 20, height: 20 }} /></div>}

          {!loading && filtered.map(msg => {
            const isFlagged = flaggedIds.has(msg._id);
            const isSelected = selectedIds.has(msg._id);
            return (
              <div
                key={msg._id}
                className={`message-item ${selected?._id === msg._id ? 'active' : ''} ${!msg.isRead ? 'unread' : ''}`}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, paddingTop: 2 }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(msg._id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ margin: 0, cursor: 'pointer' }}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFlagged(msg._id); }}
                    style={{
                      border: 'none', background: 'none', cursor: 'pointer', padding: 0, lineHeight: 0,
                      color: isFlagged ? 'var(--warning, #eab308)' : 'var(--text-tertiary)',
                    }}
                    title={isFlagged ? 'Unflag' : 'Flag as important'}
                  >
                    <Icon path={Icons.star} size={14} />
                  </button>
                </div>
                <div
                  style={{ flex: 1, minWidth: 0 }}
                  onClick={() => { setSelectedIds(new Set()); handleSelectMessage(msg); }}
                >
                  <div className="message-item-header">
                    <span className="message-item-name">{msg.name}</span>
                    <span className="message-item-date">{new Date(msg.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="message-item-subject">{msg.subject || msg.message?.substring(0, 80)}</p>
                </div>
              </div>
            );
          })}

          {!loading && filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-light)' }}>
              <Icon path={Icons.mail} size={32} style={{ margin: '0 auto 8px', display: 'block' }} />
              <p style={{ fontSize: 13 }}>{searchQuery ? 'No messages match your search' : 'No messages'}</p>
            </div>
          )}

          {totalPages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              padding: '12px 16px', borderTop: '1px solid var(--border)',
            }}>
              <button
                disabled={page <= 1}
                onClick={() => fetchMessages(page - 1, searchQuery)}
                style={{
                  border: '1px solid var(--border)', background: 'var(--card)', borderRadius: 'var(--radius)',
                  padding: '4px 8px', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.4 : 1,
                  display: 'flex', alignItems: 'center', fontSize: 12,
                }}
              >
                <Icon path={Icons['chevron-left']} size={14} />
              </button>
              {totalPagesArr.slice(
                Math.max(0, Math.min(page - 3, totalPages - 5)),
                Math.max(5, Math.min(page + 2, totalPages))
              ).map(p => (
                <button
                  key={p}
                  onClick={() => fetchMessages(p, searchQuery)}
                  style={{
                    minWidth: 28, height: 28, borderRadius: 'var(--radius)',
                    border: p === page ? 'none' : '1px solid var(--border)',
                    background: p === page ? 'var(--primary)' : 'var(--card)',
                    color: p === page ? '#fff' : 'var(--text)',
                    fontWeight: p === page ? 600 : 400,
                    cursor: 'pointer', fontSize: 12, padding: '0 6px',
                  }}
                >
                  {p}
                </button>
              ))}
              {totalPages > 5 && page < totalPages - 2 && (
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)', padding: '0 2px' }}>…</span>
              )}
              <button
                disabled={page >= totalPages}
                onClick={() => fetchMessages(page + 1, searchQuery)}
                style={{
                  border: '1px solid var(--border)', background: 'var(--card)', borderRadius: 'var(--radius)',
                  padding: '4px 8px', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.4 : 1,
                  display: 'flex', alignItems: 'center', fontSize: 12,
                }}
              >
                <Icon path={Icons['chevron-right']} size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="messages-detail">
          {selected ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {selected.name}
                    {flaggedIds.has(selected._id) && (
                      <Icon path={Icons.star} size={16} style={{ color: 'var(--warning, #eab308)' }} />
                    )}
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selected.email}</p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className={`btn btn-sm ${flaggedIds.has(selected._id) ? 'btn-warning' : 'btn-ghost'}`}
                    onClick={() => toggleFlagged(selected._id)}
                    title={flaggedIds.has(selected._id) ? 'Remove flag' : 'Flag as important'}
                  >
                    <Icon path={Icons.star} size={14} /> {flaggedIds.has(selected._id) ? 'Flagged' : 'Flag'}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selected._id)}>
                    <Icon path={Icons.trash2} size={14} /> Delete
                  </button>
                </div>
              </div>
              {selected.subject && (
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, fontWeight: 500 }}>
                  Subject: {selected.subject}
                </p>
              )}
              <div style={{ padding: 16, background: 'var(--bg)', borderRadius: 'var(--radius)', fontSize: 13, lineHeight: 1.7, border: '1px solid var(--border)', marginBottom: 16 }}>
                {selected.message}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 16 }}>
                Received {formatDateTime(selected.createdAt)}
                {selected.isRead && <span> · Read</span>}
                {flaggedIds.has(selected._id) && <span> · Flagged</span>}
              </p>
              {selected.isReplied && (
                <div style={{ padding: 12, background: 'var(--success-light)', borderRadius: 'var(--radius)', marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--success)', marginBottom: 4 }}>Your reply:</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selected.replyContent}</p>
                </div>
              )}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 500 }}>Reply</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Use Template:</span>
                    <select
                      value=""
                      onChange={(e) => { if (e.target.value) applyTemplate(e.target.value); }}
                      style={{
                        padding: '3px 8px', fontSize: 11, borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)', cursor: 'pointer',
                      }}
                    >
                      <option value="" disabled>Select template…</option>
                      {REPLY_TEMPLATES.map((t, i) => (
                        <option key={i} value={t.content}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write your reply..."
                  style={{
                    width: '100%', padding: 10, border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius)', fontSize: 13, minHeight: 80,
                    resize: 'vertical', fontFamily: 'var(--font)', color: 'var(--text)',
                  }}
                />
                <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={handleReply} disabled={!reply.trim()}>
                  <Icon path={Icons.send} size={14} /> Send Reply
                </button>
              </div>
            </div>
          ) : (
            <div className="messages-detail-empty">
              <Icon path={Icons['message-square']} size={48} />
              <h3>Select a message</h3>
              <p>Choose a message from the inbox to read and reply.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
