import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Icons, Icon } from '../lib/icons';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const getAuthHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('admin_token')}` });
const api = {
  getSummary: () => axios.get(`${API_URL}/performance/summary`, { headers: getAuthHeaders() }),
  getMetrics: (params) => axios.get(`${API_URL}/performance`, { headers: getAuthHeaders(), params }),
  getPagePerformance: () => axios.get(`${API_URL}/performance/pages`, { headers: getAuthHeaders() }),
  getImageSizes: () => axios.get(`${API_URL}/performance/images`, { headers: getAuthHeaders() }),
};

function getMetricColor(metric, value) {
  if (value == null) return 'var(--text-secondary)';
  const thresholds = {
    lcp: { good: 2500, poor: 4000 },
    fcp: { good: 1800, poor: 3000 },
    cls: { good: 0.1, poor: 0.25 },
    ttfb: { good: 800, poor: 1800 },
    loadTime: { good: 3000, poor: 5000 },
    domInteractive: { good: 3000, poor: 5000 },
  };
  const t = thresholds[metric];
  if (!t) return 'var(--text-secondary)';
  if (value < t.good) return 'var(--success)';
  if (value < t.poor) return 'var(--warning)';
  return 'var(--danger)';
}

function getMetricBg(metric, value) {
  if (value == null) return 'var(--bg-secondary)';
  const thresholds = {
    lcp: { good: 2500, poor: 4000 },
    fcp: { good: 1800, poor: 3000 },
    cls: { good: 0.1, poor: 0.25 },
    ttfb: { good: 800, poor: 1800 },
    loadTime: { good: 3000, poor: 5000 },
    domInteractive: { good: 3000, poor: 5000 },
  };
  const t = thresholds[metric];
  if (!t) return 'var(--bg-secondary)';
  if (value < t.good) return 'var(--success-subtle)';
  if (value < t.poor) return 'var(--warning-subtle)';
  return 'var(--danger-subtle)';
}

function formatMs(ms) {
  if (ms == null) return '—';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatNumber(n) {
  if (n == null) return '—';
  return Number(n).toLocaleString();
}

const METRIC_CARDS = [
  { key: 'avgLoadTime', label: 'Load Time', icon: Icons.clock, colorMetric: 'loadTime', suffix: 'ms' },
  { key: 'avgLCP', label: 'LCP', icon: Icons.zap, colorMetric: 'lcp', suffix: 'ms' },
  { key: 'avgFCP', label: 'FCP', icon: Icons.activity, colorMetric: 'fcp', suffix: 'ms' },
  { key: 'avgCLS', label: 'CLS', icon: Icons['layout'], colorMetric: 'cls', suffix: '' },
  { key: 'avgTTFB', label: 'TTFB', icon: Icons['upload'], colorMetric: 'ttfb', suffix: 'ms' },
  { key: 'avgDomInteractive', label: 'DOM Interactive', icon: Icons['code'], colorMetric: 'domInteractive', suffix: 'ms' },
];

function formatMetricValue(key, value) {
  if (value == null) return '—';
  if (key === 'avgCLS') return value.toFixed(3);
  if (key === 'avgLoadTime' || key === 'avgLCP' || key === 'avgFCP' || key === 'avgTTFB' || key === 'avgDomInteractive') return formatMs(value);
  return formatNumber(value);
}

function MetricStatCard({ metricKey, label, value, icon }) {
  const color = getMetricColor(METRIC_CARDS.find((m) => m.key === metricKey)?.colorMetric, value);
  const bg = getMetricBg(METRIC_CARDS.find((m) => m.key === metricKey)?.colorMetric, value);
  return (
    <div className="stat-card" style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <div className="stat-card-icon" style={{ background: bg, color }}>
        <Icon path={icon} size={18} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="stat-card-label" style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</div>
        <div className="stat-card-value" style={{ fontSize: 22, color }}>{formatMetricValue(metricKey, value)}</div>
      </div>
    </div>
  );
}

function PageBarChart({ data }) {
  if (!data || data.length === 0) return <div className="chart-empty">No page performance data</div>;
  const maxVal = Math.max(...data.map((d) => d.avgLoadTime || 0), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 200, padding: '8px 0', width: '100%', overflowX: 'auto' }}>
      {data.map((d, i) => {
        const h = Math.max(4, ((d.avgLoadTime || 0) / maxVal) * 170);
        const color = getMetricColor('loadTime', d.avgLoadTime);
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 50, maxWidth: 80 }}>
            <div style={{ width: '80%', background: color, borderRadius: '3px 3px 0 0', height: h, transition: 'height 0.3s', opacity: 0.85 }} title={`${d.path || '/'}: ${formatMs(d.avgLoadTime)}`} />
            <span style={{ fontSize: 8, color: 'var(--text-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', textAlign: 'center' }}>
              {d.path || '/'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ImageSizeTable({ data }) {
  if (!data || data.length === 0) return <div className="chart-empty">No image data</div>;
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Image URL</th>
            <th>Size (KB)</th>
            <th>Width</th>
            <th>Height</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {data.map((img, i) => (
            <tr key={img._id || i}>
              <td style={{ fontWeight: 500, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.url || img.path || img.filename || '—'}</td>
              <td>{img.sizeKb ? img.sizeKb.toFixed(1) : formatNumber(img.size)}</td>
              <td>{img.width || '—'}</td>
              <td>{img.height || '—'}</td>
              <td>{img.type || img.mimeType || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PerformanceDashboard() {
  const [summary, setSummary] = useState(null);
  const [pageData, setPageData] = useState([]);
  const [imageData, setImageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [sumRes, pagesRes, imagesRes] = await Promise.all([
        api.getSummary(),
        api.getPagePerformance(),
        api.getImageSizes(),
      ]);
      setSummary(sumRes.data?.data || sumRes.data || {});
      setPageData(pagesRes.data?.data || pagesRes.data || []);
      setImageData(imagesRes.data?.data || imagesRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load performance data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="performance-page" style={{ padding: '28px 32px' }}>
        <div className="page-header">
          <div className="page-header-left">
            <h1>Performance Dashboard</h1>
            <p>Frontend performance metrics</p>
          </div>
        </div>
        <div className="placeholder-page">
          <Icon path={Icons['alert-triangle']} size={48} />
          <h3>Failed to load</h3>
          <p>{error}</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={fetchAll}>
            <Icon path={Icons['refresh-cw']} size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const hasSummary = summary && Object.keys(summary).length > 0;
  const hasPageData = pageData && pageData.length > 0;
  const hasImageData = imageData && imageData.length > 0;

  return (
    <div className="performance-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Performance Dashboard</h1>
          <p>Frontend performance metrics</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={fetchAll}>
            <Icon path={Icons['refresh-cw']} size={14} /> Refresh
          </button>
        </div>
      </div>

      {hasSummary ? (
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {METRIC_CARDS.map((m) => (
            <MetricStatCard key={m.key} metricKey={m.key} label={m.label} value={summary[m.key]} icon={m.icon} />
          ))}
        </div>
      ) : (
        <div className="analytics-card full" style={{ marginBottom: 20 }}>
          <div className="chart-empty">No summary metrics available</div>
        </div>
      )}

      <div className="analytics-grid" style={{ marginBottom: 28 }}>
        <div className="analytics-card full">
          <h4>Page Load Times</h4>
          {hasPageData ? (
            <PageBarChart data={pageData} />
          ) : (
            <div className="chart-empty">No page performance data</div>
          )}
        </div>
      </div>

      <div className="analytics-grid" style={{ marginBottom: 28 }}>
        <div className="analytics-card full">
          <h4>Per-Page Performance</h4>
          {hasPageData ? (
            <div className="table-wrapper">
              <table className="data-table" style={{ border: 'none', boxShadow: 'none' }}>
                <thead>
                  <tr>
                    <th>Page URL</th>
                    <th>Avg Load Time</th>
                    <th>Avg LCP</th>
                    <th>Avg FCP</th>
                    <th>Avg CLS</th>
                    <th>Samples</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((p, i) => (
                    <tr key={p._id || i}>
                      <td style={{ fontWeight: 500, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.path || '/'}</td>
                      <td style={{ color: getMetricColor('loadTime', p.avgLoadTime), fontWeight: 600 }}>{formatMs(p.avgLoadTime)}</td>
                      <td style={{ color: getMetricColor('lcp', p.avgLCP), fontWeight: 600 }}>{formatMs(p.avgLCP)}</td>
                      <td style={{ color: getMetricColor('fcp', p.avgFCP), fontWeight: 600 }}>{formatMs(p.avgFCP)}</td>
                      <td style={{ color: getMetricColor('cls', p.avgCLS), fontWeight: 600 }}>{p.avgCLS != null ? p.avgCLS.toFixed(3) : '—'}</td>
                      <td>{formatNumber(p.count || p.samples)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="chart-empty">No page performance data</div>
          )}
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card full">
          <h4>Image Sizes</h4>
          {hasImageData ? (
            <ImageSizeTable data={imageData} />
          ) : (
            <div className="chart-empty">No image data</div>
          )}
        </div>
      </div>
    </div>
  );
}
