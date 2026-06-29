import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { timeAgo } from '../lib/utils';
import type { ActivityLog } from '../types';

const actionColorMap: Record<string, string> = {
  Login: 'badge-success',
  Create: 'badge-blue',
  Update: 'badge-purple',
  Upload: 'badge-warning',
  Delete: 'badge-danger',
};

const tabs = ['all', 'login', 'create', 'update', 'delete', 'upload'] as const;

export default function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    adminApi.getActivityLogs()
      .then(({ data }) => setLogs(data.data || []))
      .catch(() => setError('Failed to load activity logs'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(log => {
    if (filter !== 'all' && log.action.toLowerCase() !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!log.description.toLowerCase().includes(q) && !log.user.name.toLowerCase().includes(q)) return false;
    }
    if (dateFrom && new Date(log.createdAt) < new Date(dateFrom)) return false;
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      if (new Date(log.createdAt) > end) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  useEffect(() => { setPage(1); }, [filter, search, dateFrom, dateTo]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state" style={{ padding: 80 }}>
        <Icon path={Icons['alert-circle']} size={40} />
        <h3>Error loading logs</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Activity Logs</h2>
          <p>Track all admin actions ({logs.length} entries)</p>
        </div>
        <div className="page-actions">
          <div className="tabs">
            {tabs.map(f => (
              <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Icon path={Icons.search} size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search by description or user..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card)', fontSize: 13, color: 'var(--text)', outline: 'none' }}
          />
        </div>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card)', fontSize: 13, color: 'var(--text)', outline: 'none' }} />
        <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>to</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card)', fontSize: 13, color: 'var(--text)', outline: 'none' }} />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: 80 }}>
          <Icon path={Icons.activity} size={40} />
          <h3>No activity logs</h3>
          <p>{search || dateFrom || dateTo ? 'No matching entries found.' : 'No activity logged yet.'}</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Description</th>
                  <th>User</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(log => (
                  <tr key={log._id}>
                    <td>
                      <span className={`badge ${actionColorMap[log.action] || 'badge-gray'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: 13 }}>{log.description}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon path={Icons.user} size={12} />
                        <span style={{ fontSize: 13 }}>{log.user.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Icon path={Icons.clock} size={12} />
                        {timeAgo(log.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <div className="pagination-info">
              Page {safePage} of {totalPages} ({filtered.length} total)
            </div>
            <div className="pagination-buttons">
              <button disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>Previous</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={safePage === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
