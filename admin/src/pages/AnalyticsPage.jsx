import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import PageLayout from '../components/PageLayout';
import DataTable from '../components/DataTable';
import { Icons, Icon } from '../lib/icons';
import { adminApi } from '../services/api';

const COLORS = ['var(--color-primary)', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16'];

function formatDuration(sec) {
  if (!sec || sec <= 0) return '0s';
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function formatNumber(n) {
  if (!n && n !== 0) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const Flag = ({ country }) => {
  if (!country || country === '—') return <span style={{ fontSize: 16 }}>🌍</span>;
  const codeMap = {
    'United States': '🇺🇸', 'US': '🇺🇸', 'USA': '🇺🇸',
    'United Kingdom': '🇬🇧', 'UK': '🇬🇧',
    'Germany': '🇩🇪', 'DE': '🇩🇪',
    'France': '🇫🇷', 'FR': '🇫🇷',
    'Canada': '🇨🇦', 'CA': '🇨🇦',
    'Australia': '🇦🇺', 'AU': '🇦🇺',
    'India': '🇮🇳', 'IN': '🇮🇳',
    'Brazil': '🇧🇷', 'BR': '🇧🇷',
    'Japan': '🇯🇵', 'JP': '🇯🇵',
    'China': '🇨🇳', 'CN': '🇨🇳',
    'Russia': '🇷🇺', 'RU': '🇷🇺',
    'Ethiopia': '🇪🇹', 'ET': '🇪🇹',
    'Netherlands': '🇳🇱', 'NL': '🇳🇱',
    'Sweden': '🇸🇪', 'SE': '🇸🇪',
    'Norway': '🇳🇴', 'NO': '🇳🇴',
    'Denmark': '🇩🇰', 'DK': '🇩🇰',
    'Finland': '🇫🇮', 'FI': '🇫🇮',
    'Italy': '🇮🇹', 'IT': '🇮🇹',
    'Spain': '🇪🇸', 'ES': '🇪🇸',
  };
  return <span style={{ fontSize: 16 }}>{codeMap[country] || '🌍'}</span>;
};

const BrowserIcon = ({ browser }) => {
  const icons = {
    Chrome: '🔵', Firefox: '🟠', Safari: '🟢', Edge: '🔷', Opera: '🔴',
  };
  return <span>{icons[browser] || '🌐'}</span>;
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overviewData, setOverviewData] = useState(null);
  const [liveVisitors, setLiveVisitors] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [totalVisitorCount, setTotalVisitorCount] = useState(0);
  const [visitorLoading, setVisitorLoading] = useState(false);
  const [pageViews, setPageViews] = useState([]);
  const [browsers, setBrowsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [sources, setSources] = useState([]);
  const [countries, setCountries] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [bounceRate, setBounceRate] = useState(0);
  const [avgDuration, setAvgDuration] = useState(0);
  const [dateRange, setDateRange] = useState('30d');
  const [dailyVisits, setDailyVisits] = useState([]);
  const [returningStats, setReturningStats] = useState({ new: 0, returning: 0, newPercent: 0, returningPercent: 0 });
  const [cities, setCities] = useState([]);
  const [weeklyMonthly, setWeeklyMonthly] = useState({ weekly: [], monthly: [] });
  const [wmView, setWmView] = useState('monthly');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        liveRes, visitorsRes, browsersRes, devicesRes,
        sourcesRes, countriesRes, pagesRes, bounceRes, durationRes, statsRes,
        dailyRes, returningRes, citiesRes, wmRes,
      ] = await Promise.all([
        adminApi.getLiveVisitors().catch(() => ({ data: { data: [] } })),
        adminApi.getVisitorsList({ page: 1, limit: 15 }).catch(() => ({ data: { data: { visitors: [] } } })),
        adminApi.getBrowserStatsNew().catch(() => ({ data: { data: [] } })),
        adminApi.getDeviceStatsNew().catch(() => ({ data: { data: [] } })),
        adminApi.getSources().catch(() => ({ data: { data: [] } })),
        adminApi.getCountries().catch(() => ({ data: { data: [] } })),
        adminApi.getPagesStats().catch(() => ({ data: { data: [] } })),
        adminApi.getBounceRate({ range: dateRange }).catch(() => ({ data: { data: { rate: 0 } } })),
        adminApi.getSessionDuration({ range: dateRange }).catch(() => ({ data: { data: { average: 0 } } })),
        adminApi.getDashboardStats().catch(() => ({ data: { data: {} } })),
        adminApi.getDailyVisits({ range: dateRange }).catch(() => ({ data: { data: [] } })),
        adminApi.getReturningStats().catch(() => ({ data: { data: { new: 0, returning: 0, newPercent: 0, returningPercent: 0 } } })),
        adminApi.getCities().catch(() => ({ data: { data: [] } })),
        adminApi.getWeeklyMonthly().catch(() => ({ data: { data: { weekly: [], monthly: [] } } })),
      ]);

      const live = liveRes.data?.data || [];
      setLiveVisitors(Array.isArray(live) ? live : []);

      setBrowsers(browsersRes.data?.data || []);
      setDevices(devicesRes.data?.data || []);
      setSources(sourcesRes.data?.data || []);
      setCountries(countriesRes.data?.data || []);
      setTopPages(pagesRes.data?.data || []);

      const visitorList = visitorsRes.data?.data?.visitors || [];
      setVisitors(Array.isArray(visitorList) ? visitorList : []);
      const uniqueCount = statsRes.data?.data?.uniqueVisitors || 0;
      setTotalVisitorCount(uniqueCount);

      setBounceRate(bounceRes.data?.data?.rate || 0);
      setAvgDuration(durationRes.data?.data?.average || 0);

      const dailyData = dailyRes.data?.data || [];
      setDailyVisits(Array.isArray(dailyData) ? dailyData : []);

      setReturningStats(returningRes.data?.data || { new: 0, returning: 0, newPercent: 0, returningPercent: 0 });

      const cityData = citiesRes.data?.data || [];
      setCities(Array.isArray(cityData) ? cityData : []);

      const wmData = wmRes.data?.data || { weekly: [], monthly: [] };
      setWeeklyMonthly(wmData);
    } catch (err) {
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (dailyVisits.length > 0) {
      setPageViews(dailyVisits.map(d => ({
        date: formatDateLabel(d.date),
        visits: d.visits || 0,
        unique: d.unique || 0,
        pageViews: d.pageViews || 0,
      })));
    } else if (visitors.length > 0) {
      const dayMap = {};
      visitors.forEach(v => {
        if (v.createdAt) {
          const d = new Date(v.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          dayMap[d] = (dayMap[d] || 0) + (v.pageViews || 1);
        }
      });
      const sorted = Object.entries(dayMap)
        .map(([date, views]) => ({ date, views }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      setPageViews(sorted.length > 0 ? sorted : []);
    } else {
      setPageViews([]);
    }
  }, [dailyVisits, visitors]);

  const handleExport = async () => {
    try {
      const res = await adminApi.getReport({ format: 'csv', range: dateRange });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'analytics-report.csv';
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      const csv = 'Metric,Value\n' + statsRow.map(s => `${s.label},${s.value}`).join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      a.download = 'analytics-report.csv';
      a.click();
    }
  };

  const todayVisitors = visitors.filter(v => {
    if (!v.createdAt) return false;
    return new Date(v.createdAt).toDateString() === new Date().toDateString();
  }).length;
  const activeNow = liveVisitors.length;
  const totalVisitors = totalVisitorCount;

  const totalPageViews = pageViews.reduce((s, p) => s + (p.pageViews || p.views || 0), 0);
  const statsRow = [
    { icon: Icons['user-plus'], label: "Today's Visitors", value: formatNumber(todayVisitors), color: 'blue' },
    { icon: Icons.users, label: 'Total Visitors', value: formatNumber(totalVisitors), color: 'green' },
    { icon: Icons.activity, label: 'Online Now', value: activeNow, color: 'purple' },
    { icon: Icons['user-check'], label: 'Returning', value: `${returningStats.returningPercent}%`, color: 'emerald' },
    { icon: Icons.clock, label: 'Avg Duration', value: formatDuration(avgDuration), color: 'blue' },
    { icon: Icons['trending-up'], label: 'Bounce Rate', value: `${bounceRate}%`, color: 'red' },
    { icon: Icons['bar-chart'], label: 'Page Views', value: formatNumber(totalPageViews), color: 'green' },
  ];

  const visitorColumns = [
    { key: 'visitorId', label: 'Visitor', width: 130, render: (row) => row?.visitorId ? <span title={row.visitorId}><span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.75rem' }}>Guest </span><code style={{ fontSize: '0.75rem', color: 'var(--color-primary)', background: 'var(--color-primary-bg)', padding: '2px 6px', borderRadius: 4 }}>{row.visitorId.slice(-8)}</code></span> : '—' },
    { key: 'city', label: 'City', width: 100, render: (row) => row?.city || '—' },
    { key: 'country', label: 'Country', width: 100, render: (row) => <><Flag country={row?.country} /> {row?.country || '—'}</> },
    { key: 'browser', label: 'Browser', width: 90, render: (row) => <><BrowserIcon browser={row?.browser} /> {row?.browser || '—'}</> },
    { key: 'os', label: 'OS', width: 80, render: (row) => row?.os || '—' },
    { key: 'deviceType', label: 'Device', width: 80, render: (row) => row?.deviceType || '—' },
    { key: 'pageViews', label: 'Views', width: 60, render: (row) => row?.pageViews || 0 },
    { key: 'landingPage', label: 'Landing Page', width: 150, render: (row) => row?.landingPage || '/' },
    { key: 'duration', label: 'Duration', width: 80, render: (row) => formatDuration(row?.duration) },
    { key: 'createdAt', label: 'Time', width: 150, render: (row) => row?.createdAt ? new Date(row.createdAt).toLocaleString() : '—' },
  ];

  return (
    <PageLayout
      breadcrumbs={[
        { label: 'Analytics' },
        { label: 'Real Analytics' },
      ]}
      title="Real Analytics"
      description="Real visitor analytics powered by the new tracking system"
      stats={loading ? undefined : statsRow}
      quickActions={[
        { label: 'Export CSV', icon: Icons.download, onClick: handleExport },
        { label: 'Refresh', icon: Icons['refresh-cw'], onClick: fetchData },
      ]}
    >
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="skeleton" style={{ height: 300, borderRadius: 14 }} />
          <div className="skeleton" style={{ height: 300, borderRadius: 14 }} />
          <div className="skeleton" style={{ height: 300, borderRadius: 14 }} />
          <div className="skeleton" style={{ height: 300, borderRadius: 14 }} />
        </div>
      )}

      {error && (
        <div className="error-state">
          <Icon path={Icons['alert-circle']} size={48} />
          <h3 className="error-state-title">Failed to load analytics</h3>
          <p className="error-state-message">{error}</p>
          <button className="btn btn-primary" onClick={fetchData}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Date Range Filter */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {['today', '7d', '30d', '90d'].map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                style={{
                  padding: '0.4rem 1rem', borderRadius: 8, border: `1px solid ${dateRange === range ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: dateRange === range ? 'var(--color-primary)' : 'transparent',
                  color: dateRange === range ? '#fff' : 'var(--color-text-secondary)',
                  fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                }}
              >
                {range === 'today' ? 'Today' : range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>

          {/* Live Visitors Feed */}
          {liveVisitors.length > 0 && (
            <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block', animation: 'analyticsPulse 2s infinite' }} />
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>Live Visitors ({liveVisitors.length})</h3>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', overflow: 'auto', paddingBottom: '0.5rem' }}>
                {liveVisitors.slice(0, 10).map((v, i) => (
                  <div key={v._id || i} className="live-visitor-card">
                    <div className="live-visitor-header">
                      <Flag country={v.country} />
                      <BrowserIcon browser={v.browser} />
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-success)', fontWeight: 600, marginLeft: 'auto' }}>● Live</span>
                    </div>
                    <div className="live-visitor-page" title={v.currentPage}>{v.currentPage || '/'}</div>
                    <div className="live-visitor-meta">
                      {v.city && v.city !== v.country ? `${v.city}, ` : ''}{v.country || 'Unknown'}
                      {' · '}{v.os || ''}
                      {' · '}{formatDuration(v.duration)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Page Views Trend */}
            <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)', margin: 0, marginBottom: '1rem' }}>Daily Traffic</h3>
              {pageViews.length === 0 ? (
                <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>No data available</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={pageViews}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} />
                    <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="pageViews" stroke="var(--color-primary)" fill="url(#colorViews)" strokeWidth={2} name="Page Views" />
                    <Area type="monotone" dataKey="unique" stroke="#10B981" fill="none" strokeWidth={2} strokeDasharray="4 4" name="Unique Visitors" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Browser Distribution */}
            <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)', margin: 0, marginBottom: '1rem' }}>Browser Distribution</h3>
              {browsers.length === 0 ? (
                <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>No data available</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={browsers} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" nameKey="name">
                      {browsers.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
                    <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" iconSize={8}
                      formatter={(value) => <span style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Device Distribution */}
            <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)', margin: 0, marginBottom: '1rem' }}>Device Distribution</h3>
              {devices.length === 0 ? (
                <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>No data available</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={devices} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} width={80} />
                    <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {devices.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Traffic Sources */}
            <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)', margin: 0, marginBottom: '1rem' }}>Traffic Sources</h3>
              {sources.length === 0 ? (
                <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>No data available</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={sources}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                    <XAxis dataKey="source" tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} />
                    <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {sources.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Top Countries */}
            <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)', margin: 0, marginBottom: '1rem' }}>Top Countries</h3>
              {countries.length === 0 ? (
                <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>No data available</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={countries.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} />
                    <YAxis dataKey="country" type="category" tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} width={100} />
                    <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {countries.slice(0, 10).map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

          {/* Returning vs New Visitors */}
          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)', margin: 0, marginBottom: '1rem' }}>Returning vs New Visitors</h3>
            {returningStats.total === 0 ? (
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={[
                    { name: 'New', value: returningStats.new || 0 },
                    { name: 'Returning', value: returningStats.returning || 0 },
                  ]} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" nameKey="name">
                    <Cell fill="var(--color-primary)" />
                    <Cell fill="#10B981" />
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
                  <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" iconSize={8}
                    formatter={(value) => <span style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '0.5rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-primary)' }}>{formatNumber(returningStats.new || 0)}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>New ({returningStats.newPercent || 0}%)</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#10B981' }}>{formatNumber(returningStats.returning || 0)}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>Returning ({returningStats.returningPercent || 0}%)</div>
              </div>
            </div>
          </div>

          {/* Weekly / Monthly Trend */}
          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                {wmView === 'monthly' ? 'Monthly Trend' : 'Weekly Trend'}
              </h3>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                {['weekly', 'monthly'].map(v => (
                  <button key={v} onClick={() => setWmView(v)}
                    style={{
                      padding: '0.2rem 0.6rem', borderRadius: 6, border: `1px solid ${wmView === v ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: wmView === v ? 'var(--color-primary)' : 'transparent',
                      color: wmView === v ? '#fff' : 'var(--color-text-secondary)',
                      fontWeight: 600, fontSize: '0.7rem', cursor: 'pointer',
                    }}
                  >{v === 'monthly' ? 'Monthly' : 'Weekly'}</button>
                ))}
              </div>
            </div>
            {weeklyMonthly[wmView].length === 0 ? (
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={weeklyMonthly[wmView].slice(-12)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'var(--color-text-tertiary)' }} interval={0} angle={-30} textAnchor="end" height={40} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} />
                  <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="visits" radius={[3, 3, 0, 0]} fill="var(--color-primary)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top Cities */}
          {cities.length > 0 && (
            <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)', margin: 0, marginBottom: '1rem' }}>Top Cities</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={cities.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} />
                  <YAxis dataKey="city" type="category" tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} width={90} />
                  <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                    formatter={(value, name, props) => [value, `${props.payload.city}, ${props.payload.country || ''}`]}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {cities.slice(0, 10).map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top Pages */}
          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)', margin: 0, marginBottom: '1rem' }}>Top Pages</h3>
              {topPages.length === 0 ? (
                <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>No page data available</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {topPages.slice(0, 8).map((page, i) => {
                    const maxViews = Math.max(...topPages.map(p => p.views || p.count || 0), 1);
                    const views = page.views || page.count || 0;
                    const pct = (views / maxViews) * 100;
                    return (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                          <span style={{ color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{page.path || page.name || '/'}</span>
                          <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>{formatNumber(views)}</span>
                        </div>
                        <div style={{ height: 6, background: 'var(--color-gray-100)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: COLORS[i % COLORS.length], borderRadius: 3 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Visitors Table */}
          <DataTable
            columns={visitorColumns}
            data={visitors}
            loading={loading || visitorLoading}
            emptyMessage="No visitors data available yet. Wait for real visitors to visit your portfolio."
            emptyIcon={Icons.users}
            actions={[
              { label: 'Delete', variant: 'danger', icon: Icons.trash2, onClick: async (row) => {
                if (!confirm('Delete this visitor record?')) return;
                try {
                  await adminApi.deleteVisitor(row._id);
                  setVisitors(prev => prev.filter(v => v._id !== row._id));
                } catch (e) {
                  alert('Failed to delete visitor');
                }
              }},
            ]}
            pageSize={10}
          />
        </>
      )}

      <style>{`
        @keyframes analyticsPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .live-visitor-card {
          min-width: 200px;
          padding: 0.75rem;
          border-radius: 10px;
          border: 1px solid var(--color-border);
          background: var(--color-bg-subtle);
          flex-shrink: 0;
        }
        .live-visitor-card:hover {
          border-color: var(--color-primary);
        }
        .live-visitor-header {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 0.4rem;
        }
        .live-visitor-page {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--color-text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-bottom: 0.25rem;
        }
        .live-visitor-meta {
          font-size: 0.65rem;
          color: var(--color-text-tertiary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </PageLayout>
  );
}
