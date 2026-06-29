import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Icon, Icons } from '../lib/icons';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const getAuthHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('admin_token')}` });

const securityApi = {
  getLoginHistory: (params: Record<string, unknown>) => axios.get(`${API_URL}/security/login-history`, { headers: getAuthHeaders(), params }),
  getFailedAttempts: () => axios.get(`${API_URL}/security/failed-attempts`, { headers: getAuthHeaders() }),
  getLoginStats: () => axios.get(`${API_URL}/security/stats`, { headers: getAuthHeaders() }),
  clearHistory: () => axios.delete(`${API_URL}/security/login-history`, { headers: getAuthHeaders() }),
};

interface LoginEntry {
  _id: string;
  email: string;
  ipAddress: string;
  status: 'success' | 'failed';
  userAgent: string;
  timestamp: string;
}

interface LoginStats {
  totalLogins: number;
  failed24h: number;
  uniqueIps: number;
  currentSession?: { ip: string; browser: string; loginTime: string };
}

const STATUS_TABS = ['all', 'success', 'failed'] as const;

export default function SecurityCenter() {
  const [entries, setEntries] = useState<LoginEntry[]>([]);
  const [stats, setStats] = useState<LoginStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const perPage = 10;

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [historyRes, statsRes] = await Promise.all([
        securityApi.getLoginHistory({}),
        securityApi.getLoginStats(),
      ]);
      setEntries(historyRes.data.data || []);
      setStats(statsRes.data.data || null);
    } catch {
      setError('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = entries.filter(e => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!e.email.toLowerCase().includes(q) && !e.ipAddress.toLowerCase().includes(q)) return false;
    }
    if (dateFrom && new Date(e.timestamp) < new Date(dateFrom)) return false;
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      if (new Date(e.timestamp) > end) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  useEffect(() => { setPage(1); }, [search, statusFilter, dateFrom, dateTo]);

  const handleClearHistory = async () => {
    setClearing(true);
    try {
      await securityApi.clearHistory();
      setEntries([]);
      setShowClearConfirm(false);
    } catch {
      alert('Failed to clear login history');
    } finally {
      setClearing(false);
    }
  };

  const truncateUA = (ua: string, max = 60) => {
    if (ua.length <= max) return ua;
    return ua.substring(0, max) + '...';
  };

  const summaryCards = stats ? [
    { label: 'Total Logins', value: stats.totalLogins, icon: Icons['user-check'], color: '#2563EB' },
    { label: 'Failed (24h)', value: stats.failed24h, icon: Icons['x-circle'], color: '#DC2626' },
    { label: 'Unique IPs', value: stats.uniqueIps, icon: Icons.globe, color: '#8B5CF6' },
  ] : [];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header"><div><h2>Security Center</h2><p>Monitor login activity and manage security settings</p></div></div>
        <div className="empty-state" style={{ padding: 80 }}>
          <Icon path={Icons['alert-circle']} size={40} />
          <h3>Error loading security data</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Security Center</h2>
          <p>Monitor login activity and manage security settings</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-danger" onClick={() => setShowClearConfirm(true)} disabled={entries.length === 0}>
            <Icon path={Icons.trash2} size={14} style={{ marginRight: 6 }} />
            Clear History
          </button>
        </div>
      </div>

      {summaryCards.length > 0 && (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', marginBottom: 20 }}>
          {summaryCards.map(c => (
            <div key={c.label} className="stat-card" style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div className="stat-card-icon" style={{ background: `${c.color}15`, color: c.color }}>
                <Icon path={c.icon} size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="stat-card-label" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.label}</div>
                <div className="stat-card-value" style={{ fontSize: 22 }}>{c.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Icon path={Icons.search} size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search by email or IP..."
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
        <div className="filter-tabs">
          {STATUS_TABS.map(s => (
            <button key={s} className={`filter-tab ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className="analytics-card" style={{ padding: 20, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#2563EB15', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon path={Icons.shield} size={18} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: 14 }}>Two-Factor Authentication</h4>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>Two-factor authentication coming soon</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative', width: 40, height: 22, borderRadius: 11, background: twoFaEnabled ? '#16A34A' : 'var(--border)', cursor: 'not-allowed', transition: 'background 0.2s', opacity: 0.5 }}>
              <div style={{ position: 'absolute', top: 2, left: twoFaEnabled ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{twoFaEnabled ? 'Enabled' : 'Disabled'}</span>
            <span className="badge badge-gray" style={{ fontSize: 10 }}>Coming Soon</span>
          </div>
        </div>

        <div className="analytics-card" style={{ padding: 20, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#8B5CF615', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon path={Icons['user-check']} size={18} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: 14 }}>Current Session</h4>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>Your active session details</p>
            </div>
          </div>
          {stats?.currentSession ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>IP Address</span>
                <span style={{ color: 'var(--text)' }}>{stats.currentSession.ip}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Browser</span>
                <span style={{ color: 'var(--text)' }}>{stats.currentSession.browser}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Login Time</span>
                <span style={{ color: 'var(--text)' }}>{new Date(stats.currentSession.loginTime).toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Session info available after first login</p>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: 80 }}>
          <Icon path={Icons['user-check']} size={40} />
          <h3>No login history</h3>
          <p>{search || dateFrom || dateTo || statusFilter !== 'all' ? 'No matching entries found.' : 'No login activity recorded yet.'}</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>IP Address</th>
                  <th>Status</th>
                  <th>User Agent</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(entry => (
                  <tr key={entry._id}>
                    <td style={{ fontWeight: 500 }}>{entry.email}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{entry.ipAddress}</td>
                    <td>
                      <span className={`badge ${entry.status === 'success' ? 'badge-success' : 'badge-danger'}`}>
                        {entry.status === 'success' ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={entry.userAgent}>
                      {truncateUA(entry.userAgent)}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Icon path={Icons.clock} size={12} />
                        {new Date(entry.timestamp).toLocaleString()}
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

      {showClearConfirm && (
        <div className="modal-overlay" onClick={() => setShowClearConfirm(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Clear Login History</h3>
              <button className="modal-close" onClick={() => setShowClearConfirm(false)}><Icon path={Icons.x} size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Are you sure you want to clear all login history? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowClearConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleClearHistory} disabled={clearing}>
                {clearing ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2, marginRight: 6 }} /> : null}
                {clearing ? 'Clearing...' : 'Clear History'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
