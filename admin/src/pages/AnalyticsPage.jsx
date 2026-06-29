import React, { useState, useEffect, useCallback, useRef } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';

const RANGE_OPTIONS = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'Last Year', value: '1y' },
];

function StatCard({ label, value, icon, color, sub }) {
  return (
    <div className="stat-card" style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <div className="stat-card-icon" style={{ background: `${color}15`, color }}>
        <Icon path={icon} size={18} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="stat-card-label" style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</div>
        <div className="stat-card-value" style={{ fontSize: 24 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}

function DateRangePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const activeLabel = RANGE_OPTIONS.find((o) => o.value === value)?.label || 'Custom';

  return (
    <div className="dropdown" ref={ref} style={{ position: 'relative' }}>
      <button className="btn btn-outline" onClick={() => setOpen(!open)}>
        <Icon path={Icons.calendar} size={14} />
        {activeLabel}
        <Icon path={Icons['chevron-down']} size={12} />
      </button>
      {open && (
        <div className="dropdown-menu" style={{ position: 'absolute', top: '100%', right: 0, zIndex: 100, marginTop: 4, minWidth: 160 }}>
          {RANGE_OPTIONS.map((o) => (
            <div
              key={o.value}
              className={`dropdown-item ${value === o.value ? 'active' : ''}`}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryCards({ data }) {
  const cards = [
    { label: 'Total Visitors', value: (data?.totalVisitors ?? 0).toLocaleString(), icon: Icons.users, color: '#0F766E' },
    { label: 'Unique Visitors', value: (data?.uniqueVisitors ?? 0).toLocaleString(), icon: Icons['user-check'], color: '#2563EB' },
    { label: 'Returning', value: (data?.returningVisitors ?? 0).toLocaleString(), icon: Icons['refresh-cw'], color: '#8B5CF6' },
    { label: 'Online Now', value: data?.onlineNow ?? 0, icon: Icons['activity'], color: '#16A34A', sub: 'active right now' },
    { label: "Today's Visitors", value: (data?.todayVisitors ?? 0).toLocaleString(), icon: Icons.sun, color: '#D97706' },
    { label: 'Weekly Visitors', value: (data?.weeklyVisitors ?? 0).toLocaleString(), icon: Icons['calendar'], color: '#EC4899' },
    { label: 'Monthly Visitors', value: (data?.monthlyVisitors ?? 0).toLocaleString(), icon: Icons['bar-chart'], color: '#0F766E' },
    { label: 'Page Views', value: (data?.totalPageViews ?? 0).toLocaleString(), icon: Icons.eye, color: '#2563EB' },
    { label: 'Avg Session', value: formatDuration(data?.avgSessionDuration ?? 0), icon: Icons.clock, color: '#8B5CF6' },
    { label: 'Bounce Rate', value: `${data?.bounceRate ?? 0}%`, icon: Icons.trendingDown, color: '#DC2626' },
    { label: 'CV Downloads', value: (data?.totalDownloads ?? 0).toLocaleString(), icon: Icons.download, color: '#16A34A' },
    { label: 'Messages', value: (data?.totalMessages ?? 0).toLocaleString(), icon: Icons.mail, color: '#D97706' },
  ];
  return (
    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
      {cards.map((c) => <StatCard key={c.label} {...c} />)}
    </div>
  );
}

function formatDuration(sec) {
  if (!sec || sec <= 0) return '0s';
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function formatNumber(n) {
  if (!n) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

function TrendChart({ data }) {
  if (!data || data.length === 0) return <div className="chart-empty">No trend data available</div>;
  const maxVal = Math.max(...data.map((d) => d.count || 0), 1);
  const barWidth = Math.max(6, Math.min(30, 600 / data.length));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 180, padding: '8px 0', width: '100%' }}>
      {data.map((d, i) => {
        const h = Math.max(4, (d.count / maxVal) * 160);
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: barWidth }}>
            <div style={{ width: '100%', background: 'var(--accent)', borderRadius: '3px 3px 0 0', height: h, opacity: d.unique ? 0.8 : 0.4, transition: 'height 0.3s' }} title={`Visits: ${d.count}, Unique: ${d.unique || 0}`} />
            {data.length <= 14 && (
              <span style={{ fontSize: 8, color: 'var(--text-light)', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>
                {d.date || d.month || d.label || ''}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function HorizontalBar({ data, color = 'var(--accent)', maxItems = 8 }) {
  const items = (data || []).slice(0, maxItems);
  const maxVal = Math.max(...items.map((i) => i.count || i.value || 0), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => {
        const val = item.count || item.value || 0;
        const pct = item.percentage || Math.round((val / maxVal) * 100);
        const label = item.country || item.source || item.name || item.path || item._id || '';
        return (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
              <span style={{ color: 'var(--text)' }}>{label}</span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{formatNumber(val)}</span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.3s' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PieChart({ data, colorScale = ['#0F766E', '#2563EB', '#8B5CF6', '#D97706', '#EC4899', '#16A34A', '#DC2626', '#64748B'] }) {
  if (!data || data.length === 0) return <div className="chart-empty">No data</div>;
  const total = data.reduce((s, d) => s + (d.value || d.count || 0), 0);
  const sorted = [...data].sort((a, b) => (b.value || b.count || 0) - (a.value || a.count || 0));
  let cumPct = 0;
  const segments = sorted.map((d, i) => {
    const pct = total > 0 ? (d.value || d.count || 0) / total : 0;
    const startAngle = cumPct * 360;
    cumPct += pct;
    const endAngle = cumPct * 360;
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);
    const largeArc = pct > 0.5 ? 1 : 0;
    return { key: d.name || d._id || d.country || '', pct: Math.round(pct * 100), color: colorScale[i % colorScale.length], path: pct > 0 ? `M50,50 L${x1},${y1} A40,40 0 ${largeArc},1 ${x2},${y2} Z` : '' };
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: '100%' }}>
      <svg width="120" height="120" viewBox="0 0 100 100">
        {segments.map((s, i) => s.path ? <path key={i} d={s.path} fill={s.color} /> : null)}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {sorted.slice(0, 8).map((d, i) => {
          const name = d.name || d._id || d.country || '';
          const val = d.value || d.count || 0;
          const pct = total > 0 ? Math.round((val / total) * 100) : 0;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: colorScale[i % colorScale.length], flexShrink: 0 }} />
              <span style={{ color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
              <span style={{ color: 'var(--text)', fontWeight: 600 }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LiveFeed({ events }) {
  const getIcon = (type) => {
    switch (type) {
      case 'visit': return Icons['user-plus'];
      case 'download': return Icons.download;
      case 'contact': return Icons.mail;
      case 'action': return Icons['mouse-pointer'];
      default: return Icons['activity'];
    }
  };
  const getColor = (type) => {
    switch (type) {
      case 'visit': return '#2563EB';
      case 'download': return '#16A34A';
      case 'contact': return '#D97706';
      case 'action': return '#8B5CF6';
      default: return '#64748B';
    }
  };
  if (!events || events.length === 0) return <div className="chart-empty">No recent activity</div>;
  return (
    <div className="live-feed">
      {events.slice(0, 15).map((e, i) => (
        <div key={i} className="live-feed-item">
          <div className="live-feed-dot" style={{ background: getColor(e.type) }}>
            <Icon path={getIcon(e.type)} size={12} />
          </div>
          <div className="live-feed-content">
            <p>{e.message}</p>
            <span>{timeAgo(e.timestamp)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function timeAgo(date) {
  const sec = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (sec < 60) return 'just now';
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

function VisitorTable({ data, loading, search, onSearchChange, page, onPageChange, totalPages, sortBy, onSort }) {
  const columns = [
    { key: 'visitDate', label: 'Date/Time', sortable: true },
    { key: 'country', label: 'Country', sortable: true },
    { key: 'city', label: 'City', sortable: true },
    { key: 'device', label: 'Device', sortable: true },
    { key: 'browser', label: 'Browser', sortable: true },
    { key: 'os', label: 'OS', sortable: true },
    { key: 'referrer', label: 'Referrer', sortable: true },
    { key: 'sessionDuration', label: 'Duration', sortable: true },
    { key: 'pageViews', label: 'Pages', sortable: true },
  ];

  return (
    <div>
      <div className="table-toolbar">
        <div className="search-input">
          <Icon path={Icons.search} size={14} />
          <input type="text" placeholder="Search visitors..." value={search} onChange={(e) => onSearchChange(e.target.value)} />
        </div>
        <div className="table-actions">
          <button className="btn btn-outline btn-sm" onClick={() => adminApi.getExportData({ format: 'csv' }).then((r) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([r.data])); a.download = 'visitors.csv'; a.click(); })}>
            <Icon path={Icons.download} size={14} /> Export CSV
          </button>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} onClick={col.sortable ? () => onSort(col.key) : undefined} style={col.sortable ? { cursor: 'pointer' } : {}}>
                  {col.label}
                  {sortBy === col.key && <Icon path={Icons['chevron-down']} size={10} style={{ marginLeft: 4 }} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
            ) : (!data || data.length === 0) ? (
              <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>No visitors found</td></tr>
            ) : (
              data.map((v, i) => (
                <tr key={v.id || i}>
                  <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{new Date(v.visitDate).toLocaleDateString()} {new Date(v.visitDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td>{v.country}</td>
                  <td>{v.city}</td>
                  <td><span className={`badge badge-${(v.device || '').toLowerCase()}`}>{v.device}</span></td>
                  <td>{v.browser}</td>
                  <td>{v.os}</td>
                  <td style={{ fontSize: 12 }}>{v.referrer}</td>
                  <td>{formatDuration(v.sessionDuration)}</td>
                  <td>{v.pageViews}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</button>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Page {page} of {totalPages}</span>
          <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const toast = useToast();
  const [range, setRange] = useState('30d');
  const [dashboardData, setDashboardData] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [locations, setLocations] = useState(null);
  const [devices, setDevices] = useState([]);
  const [browsers, setBrowsers] = useState([]);
  const [overview, setOverview] = useState(null);
  const [liveFeed, setLiveFeed] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [visitorLoading, setVisitorLoading] = useState(false);
  const [visitorSearch, setVisitorSearch] = useState('');
  const [visitorPage, setVisitorPage] = useState(1);
  const [visitorTotalPages, setVisitorTotalPages] = useState(1);
  const [visitorSort, setVisitorSort] = useState('createdAt');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const feedRef = useRef(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const [dash, trend, loc, dev, brow, ov] = await Promise.all([
        adminApi.getDashboardStats({ range }),
        adminApi.getVisitorStats({ range }),
        adminApi.getVisitorLocations(),
        adminApi.getDeviceStats({ range }),
        adminApi.getBrowserStats({ range }),
        adminApi.getAnalyticsOverview({ range }),
      ]);
      setDashboardData(dash.data.data);
      setTrendData(trend.data.data || []);
      setLocations(loc.data.data);
      setDevices(dev.data.data || []);
      setBrowsers(brow.data.data || []);
      setOverview(ov.data.data);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [range]);

  const fetchLiveFeed = useCallback(async () => {
    try {
      const { data } = await adminApi.getLiveFeed();
      setLiveFeed(data.data || []);
    } catch (err) { /* ignore */ }
  }, []);

  const fetchVisitors = useCallback(async () => {
    setVisitorLoading(true);
    try {
      const params = { page: visitorPage, limit: 15, sortBy: visitorSort, sortOrder: 'desc' };
      if (visitorSearch) params.search = visitorSearch;
      const { data } = await adminApi.getVisitorDetails(params);
      setVisitors(data.data.visitors || []);
      setVisitorTotalPages(data.data.pages || 1);
    } catch (err) { /* ignore */ }
    setVisitorLoading(false);
  }, [visitorPage, visitorSort, visitorSearch]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);
  useEffect(() => { fetchLiveFeed(); const iv = setInterval(fetchLiveFeed, 15000); return () => clearInterval(iv); }, [fetchLiveFeed]);
  useEffect(() => { fetchVisitors(); }, [fetchVisitors]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'visitors', label: 'Visitors' },
    { id: 'locations', label: 'Locations' },
    { id: 'devices', label: 'Devices & Browsers' },
    { id: 'pages', label: 'Pages' },
    { id: 'live', label: 'Live Feed' },
  ];

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div className="page-header-left">
          <h3>Analytics Dashboard</h3>
          <p>Visitor insights and performance metrics</p>
        </div>
        <DateRangePicker value={range} onChange={(v) => { setRange(v); setLoading(true); }} />
      </div>

      <SummaryCards data={dashboardData} />

      <div className="tabs" style={{ marginTop: 20 }}>
        {tabs.map((t) => (
          <div key={t.id} className={`tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </div>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="analytics-grid" style={{ marginTop: 16 }}>
          <div className="analytics-card full">
            <h4>Visitor Trend</h4>
            <TrendChart data={trendData} />
          </div>
          <div className="analytics-card">
            <h4>Traffic Sources</h4>
            <HorizontalBar data={overview?.referrers} color="#2563EB" />
          </div>
          <div className="analytics-card">
            <h4>Devices</h4>
            <PieChart data={devices} />
          </div>
          <div className="analytics-card">
            <h4>Browsers</h4>
            <PieChart data={browsers} colorScale={['#2563EB', '#D97706', '#8B5CF6', '#16A34A', '#DC2626', '#64748B', '#EC4899', '#0F766E']} />
          </div>
          <div className="analytics-card">
            <h4>Top Countries</h4>
            <HorizontalBar data={overview?.locations} color="#0F766E" />
          </div>
          <div className="analytics-card">
            <h4>Top Pages</h4>
            <HorizontalBar data={overview?.topPages} color="#8B5CF6" />
          </div>
          <div className="analytics-card full">
            <h4>Live Activity Feed</h4>
            <LiveFeed events={liveFeed} />
          </div>
        </div>
      )}

      {activeTab === 'visitors' && (
        <div className="analytics-card full" style={{ marginTop: 16 }}>
          <h4>Visitor Details</h4>
          <VisitorTable
            data={visitors}
            loading={visitorLoading}
            search={visitorSearch}
            onSearchChange={(v) => { setVisitorSearch(v); setVisitorPage(1); }}
            page={visitorPage}
            onPageChange={setVisitorPage}
            totalPages={visitorTotalPages}
            sortBy={visitorSort}
            onSort={(k) => setVisitorSort(k)}
          />
        </div>
      )}

      {activeTab === 'locations' && (
        <div className="analytics-grid" style={{ marginTop: 16 }}>
          <div className="analytics-card full">
            <h4>Countries</h4>
            <HorizontalBar data={locations?.countries} color="#0F766E" maxItems={20} />
          </div>
          <div className="analytics-card full">
            <h4>Cities</h4>
            <HorizontalBar data={locations?.cities} color="#2563EB" maxItems={20} />
          </div>
        </div>
      )}

      {activeTab === 'devices' && (
        <div className="analytics-grid" style={{ marginTop: 16 }}>
          <div className="analytics-card">
            <h4>Device Distribution</h4>
            <PieChart data={devices} />
          </div>
          <div className="analytics-card">
            <h4>Browser Distribution</h4>
            <PieChart data={browsers} colorScale={['#2563EB', '#D97706', '#8B5CF6', '#16A34A', '#DC2626', '#64748B']} />
          </div>
          <div className="analytics-card">
            <h4>Operating Systems</h4>
            <PieChart data={overview?.devices || []} colorScale={['#2563EB', '#16A34A', '#64748B', '#D97706', '#8B5CF6', '#DC2626']} />
          </div>
        </div>
      )}

      {activeTab === 'pages' && (
        <div className="analytics-grid" style={{ marginTop: 16 }}>
          <div className="analytics-card full">
            <h4>Page Performance</h4>
            {overview?.topPages && overview.topPages.length > 0 ? (
              <table className="data-table" style={{ border: 'none', boxShadow: 'none' }}>
                <thead>
                  <tr><th>Page</th><th>Views</th><th>Unique Visitors</th></tr>
                </thead>
                <tbody>
                  {overview.topPages.map((p, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{p.path || '/'}</td>
                      <td>{formatNumber(p.views)}</td>
                      <td>{formatNumber(p.unique)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="chart-empty">No page data</div>}
          </div>
        </div>
      )}

      {activeTab === 'live' && (
        <div className="analytics-grid" style={{ marginTop: 16 }}>
          <div className="analytics-card full">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h4 style={{ margin: 0 }}>Live Activity Feed</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Live</span>
              </div>
            </div>
            <LiveFeed events={liveFeed} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
