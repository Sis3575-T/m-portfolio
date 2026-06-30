import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ACTION_FILTERS = [
  { id: '', label: 'All' },
  { id: 'created', label: 'Created' },
  { id: 'updated', label: 'Updated' },
  { id: 'deleted', label: 'Deleted' },
  { id: 'uploaded', label: 'Uploaded' },
  { id: 'login', label: 'Login' },
  { id: 'logout', label: 'Logout' },
];

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 30;

  useEffect(() => {
    fetchLogs();
  }, [filter, page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { limit, offset: (page - 1) * limit };
      if (filter) params.action = filter;
      const { data } = await api.get('/activity-logs', { params });
      setLogs(data.data || []);
      setTotal(data.total || 0);
    } catch {}
    finally { setLoading(false); }
  };

  const getActionLabel = (action) => {
    return action?.replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown';
  };

  const getActionColor = (action) => {
    if (!action) return 'gray';
    if (action.includes('created') || action.includes('uploaded')) return 'success';
    if (action.includes('updated') || action.includes('edited')) return 'primary';
    if (action.includes('deleted')) return 'danger';
    if (action.includes('login')) return 'primary';
    if (action.includes('logout')) return 'gray';
    return 'gray';
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Activity Logs</h1>
          <p>Track all admin actions and system events</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm" onClick={() => { setPage(1); setFilter(''); }}>
            Clear Filters
          </button>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="filter-tabs">
              {ACTION_FILTERS.map(f => (
                <button key={f.id} className={`filter-tab ${filter === f.id ? 'active' : ''}`}
                  onClick={() => { setFilter(f.id); setPage(1); }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="table-toolbar-right">
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{total} total entries</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="spinner" />
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>User</th>
                  <th>Resource</th>
                  <th>Details</th>
                  <th>IP Address</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12" style={{ color: 'var(--text-tertiary)' }}>
                      No activity logs found
                    </td>
                  </tr>
                )}
                {logs.map((log, i) => (
                  <tr key={log._id || i}>
                    <td>
                      <span className={`badge badge-${getActionColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="cell-title">{log.user?.name || 'System'}</td>
                    <td>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {log.resource || '-'}
                      </span>
                    </td>
                    <td className="text-sm" style={{ color: 'var(--text-secondary)', maxWidth: 200 }}>
                      <span className="truncate block">{log.details ? JSON.stringify(log.details).slice(0, 60) : '-'}</span>
                    </td>
                    <td className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>{log.ip || '-'}</td>
                    <td className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{formatDate(log.timestamp || log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                <div className="pagination-info">
                  Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                </div>
                <div className="pagination-buttons">
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const start = Math.max(1, page - 2);
                    const p = start + i;
                    if (p > totalPages) return null;
                    return <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>;
                  })}
                  <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
