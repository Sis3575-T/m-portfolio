import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { timeAgo } from '../lib/utils';

const actionColorMap = {
  Login: 'badge-green', Create: 'badge-blue', Update: 'badge-purple',
  Upload: 'badge-orange', Delete: 'badge-gray',
};

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    adminApi.getActivityLogs()
      .then(({ data }) => setLogs(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? logs : logs.filter(l => l.action?.toLowerCase() === filter.toLowerCase());

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Activity Logs</h2>
          <p>Track all admin actions ({logs.length} entries)</p>
        </div>
        <div className="page-actions">
          <div className="tabs">
            {['all', 'login', 'create', 'update', 'delete', 'upload'].map(f => (
              <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr><th>Action</th><th>Description</th><th>User</th><th>Time</th></tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <tr key={log._id}>
                <td>
                  <span className={`badge ${actionColorMap[log.action] || 'badge-gray'}`}>{log.action}</span>
                </td>
                <td style={{ fontSize: 13 }}>{log.description}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon path={Icons.user} size={12} />
                    <span style={{ fontSize: 13 }}>{log.user?.name || 'Admin'}</span>
                  </div>
                </td>
                <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon path={Icons.clock} size={12} />
                    {timeAgo(log.createdAt)}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4}><div className="empty-state"><Icon path={Icons.activity} size={40} /><h3>No activity logs</h3><p>No matching entries found.</p></div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
