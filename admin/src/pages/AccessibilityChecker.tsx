import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Icon, Icons } from '../lib/icons';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const getAuthHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('admin_token')}` });

const a11yApi = {
  getIssues: (params: Record<string, unknown>) => axios.get(`${API_URL}/accessibility`, { headers: getAuthHeaders(), params }),
  getSummary: () => axios.get(`${API_URL}/accessibility/summary`, { headers: getAuthHeaders() }),
  markAsFixed: (id: string) => axios.patch(`${API_URL}/accessibility/${id}/fix`, {}, { headers: getAuthHeaders() }),
  runAudit: (data?: Record<string, unknown>) => axios.post(`${API_URL}/accessibility/audit`, data || {}, { headers: getAuthHeaders() }),
};

interface A11yIssue {
  _id: string;
  page: string;
  type: string;
  element: string;
  impact: string;
  message: string;
  status: 'open' | 'fixed';
  detectedAt: string;
}

interface Summary {
  total: number;
  critical: number;
  serious: number;
  fixed: number;
  open: number;
}

const TYPE_ICONS: Record<string, string> = {
  'missing-alt-text': Icons.image,
  'poor-contrast': Icons.eye,
  'heading-structure': Icons['file-text'],
  'missing-label': Icons['file-plus'],
  other: Icons['alert-circle'],
};

const TYPE_LABELS: Record<string, string> = {
  'missing-alt-text': 'Missing Alt Text',
  'poor-contrast': 'Poor Contrast',
  'heading-structure': 'Heading Structure',
  'missing-label': 'Missing Label',
  other: 'Other',
};

const IMPACT_COLORS: Record<string, string> = {
  critical: 'badge-danger',
  serious: 'badge-warning',
  moderate: 'badge-blue',
  minor: 'badge-gray',
};

const TYPE_TABS = ['all', 'missing-alt-text', 'poor-contrast', 'heading-structure', 'missing-label', 'other'] as const;
const IMPACT_OPTIONS = ['all', 'critical', 'serious', 'moderate', 'minor'] as const;

export default function AccessibilityChecker() {
  const [issues, setIssues] = useState<A11yIssue[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [impactFilter, setImpactFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [auditRunning, setAuditRunning] = useState(false);
  const perPage = 10;

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, unknown> = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (impactFilter !== 'all') params.impact = impactFilter;
      const [issuesRes, summaryRes] = await Promise.all([
        a11yApi.getIssues(params),
        a11yApi.getSummary(),
      ]);
      setIssues(issuesRes.data.data || []);
      setSummary(summaryRes.data.data || null);
    } catch {
      setError('Failed to load accessibility data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [typeFilter, impactFilter]);

  const handleMarkAsFixed = async (id: string) => {
    try {
      await a11yApi.markAsFixed(id);
      setIssues(prev => prev.map(i => i._id === id ? { ...i, status: 'fixed' } : i));
      if (summary) setSummary({ ...summary, fixed: summary.fixed + 1, open: Math.max(0, summary.open - 1) });
    } catch {
      alert('Failed to mark issue as fixed');
    }
  };

  const handleRunAudit = async () => {
    setAuditRunning(true);
    try {
      await a11yApi.runAudit();
      await fetchData();
    } catch {
      alert('Failed to run audit');
    } finally {
      setAuditRunning(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(issues.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginated = issues.slice((safePage - 1) * perPage, safePage * perPage);

  const summaryCards = summary ? [
    { label: 'Total Issues', value: summary.total, icon: Icons['alert-circle'], color: '#64748B' },
    { label: 'Critical', value: summary.critical, icon: Icons['alert-triangle'], color: '#DC2626' },
    { label: 'Serious', value: summary.serious, icon: Icons['alert-triangle'], color: '#D97706' },
    { label: 'Fixed', value: summary.fixed, icon: Icons['check-circle'], color: '#16A34A' },
    { label: 'Open', value: summary.open, icon: Icons['x-circle'], color: '#DC2626' },
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
        <div className="page-header"><div><h2>Accessibility Checker</h2><p>Monitor and fix accessibility issues</p></div></div>
        <div className="empty-state" style={{ padding: 80 }}>
          <Icon path={Icons['alert-circle']} size={40} />
          <h3>Error loading issues</h3>
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
          <h2>Accessibility Checker</h2>
          <p>Monitor and fix accessibility issues across your site</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={handleRunAudit} disabled={auditRunning}>
            {auditRunning ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2, marginRight: 6 }} /> : <Icon path={Icons['refresh-cw']} size={14} style={{ marginRight: 6 }} />}
            {auditRunning ? 'Running...' : 'Run Audit'}
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
        <div className="filter-tabs">
          {TYPE_TABS.map(t => (
            <button key={t} className={`filter-tab ${typeFilter === t ? 'active' : ''}`} onClick={() => { setTypeFilter(t); setPage(1); }}>
              {t === 'all' ? 'All' : TYPE_LABELS[t] || t}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Impact:</span>
          <div className="filter-tabs">
            {IMPACT_OPTIONS.map(i => (
              <button key={i} className={`filter-tab ${impactFilter === i ? 'active' : ''}`} onClick={() => { setImpactFilter(i); setPage(1); }}>
                {i === 'all' ? 'All' : i.charAt(0).toUpperCase() + i.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {issues.length === 0 ? (
        <div className="empty-state" style={{ padding: 80 }}>
          <Icon path={Icons['check-circle']} size={40} />
          <h3>No accessibility issues</h3>
          <p>{typeFilter !== 'all' || impactFilter !== 'all' ? 'No matching issues found.' : 'Your site is accessible! Run an audit to check for issues.'}</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Type</th>
                  <th>Element</th>
                  <th>Impact</th>
                  <th>Status</th>
                  <th>Detected Date</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(issue => (
                  <tr key={issue._id}>
                    <td style={{ fontSize: 13, fontWeight: 500 }}>{issue.page}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon path={TYPE_ICONS[issue.type] || Icons['alert-circle']} size={14} style={{ color: 'var(--text-secondary)' }} />
                        <span style={{ fontSize: 13 }}>{TYPE_LABELS[issue.type] || issue.type}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{issue.element}</td>
                    <td>
                      <span className={`badge ${IMPACT_COLORS[issue.impact] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>
                        {issue.impact}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${issue.status === 'fixed' ? 'badge-success' : 'badge-warning'}`}>
                        {issue.status === 'fixed' ? 'Fixed' : 'Open'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Icon path={Icons.clock} size={12} />
                        {new Date(issue.detectedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      {issue.status === 'open' && (
                        <button className="btn btn-sm btn-outline" onClick={() => handleMarkAsFixed(issue._id)}>
                          <Icon path={Icons.check} size={12} style={{ marginRight: 4 }} />
                          Mark Fixed
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <div className="pagination-info">
              Page {safePage} of {totalPages} ({issues.length} total)
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
