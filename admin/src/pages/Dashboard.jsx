import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageLayout from '../components/PageLayout';
import { Icons, Icon } from '../lib/icons';
import { adminApi } from '../services/api';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatNumber(n) {
  if (!n && n !== 0) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatDuration(sec) {
  if (!sec || sec <= 0) return '0s';
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function Widget({ title, icon, children, loading: widgetLoading, error, onRetry }) {
  return (
    <div style={{
      background: 'var(--color-card)', border: '1px solid var(--color-border)',
      borderRadius: 14, padding: '1.25rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          {icon && <Icon path={icon} size={14} style={{ color: 'var(--color-text-tertiary)' }} />}
          {title}
        </h3>
        {error && onRetry && (
          <button onClick={onRetry} style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid var(--color-danger)', background: 'transparent', color: 'var(--color-danger)', fontSize: '0.68rem', cursor: 'pointer', fontWeight: 600 }}>
            Retry
          </button>
        )}
      </div>
      {widgetLoading ? (
        <div className="skeleton" style={{ height: 80, borderRadius: 8 }} />
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-danger)', fontSize: '0.8rem' }}>
          <Icon path={Icons['alert-circle']} size={16} />
          <p style={{ margin: '0.5rem 0 0' }}>Failed to load</p>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [media, setMedia] = useState([]);
  const [activity, setActivity] = useState([]);
  const [liveVisitors, setLiveVisitors] = useState([]);
  const [liveVisitorsCount, setLiveVisitorsCount] = useState(0);
  const [todayVisitors, setTodayVisitors] = useState(0);
  const [weeklyVisitors, setWeeklyVisitors] = useState(0);
  const [recentVisitors, setRecentVisitors] = useState([]);
  const [browsers, setBrowsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [sources, setSources] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [avgDuration, setAvgDuration] = useState(0);
  const [widgetErrors, setWidgetErrors] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        projRes, skillRes, blogRes, msgRes, mediaRes, activityRes,
        liveRes, visitorsRes, browsersRes, devicesRes, sourcesRes, pagesRes, durationRes,
      ] = await Promise.all([
        adminApi.getProjects().catch(() => ({ data: { data: [] } })),
        adminApi.getSkills().catch(() => ({ data: { data: [] } })),
        adminApi.getBlogs().catch(() => ({ data: { data: [] } })),
        adminApi.getMessages({}).catch(() => ({ data: { data: [] } })),
        adminApi.getMedia({}).catch(() => ({ data: { data: [] } })),
        adminApi.getRecentActivity().catch(() => ({ data: { data: [] } })),
        adminApi.getLiveVisitors().catch(() => ({ data: { data: [] } })),
        adminApi.getVisitorsList({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }).catch(() => ({ data: { data: { visitors: [] } } })),
        adminApi.getBrowserStatsNew().catch(() => ({ data: { data: [] } })),
        adminApi.getDeviceStatsNew().catch(() => ({ data: { data: [] } })),
        adminApi.getSources().catch(() => ({ data: { data: [] } })),
        adminApi.getPagesStats().catch(() => ({ data: { data: [] } })),
        adminApi.getSessionDuration({ range: '30d' }).catch(() => ({ data: { data: { average: 0 } } })),
      ]);

      setProjects(projRes.data?.data || []);
      setSkills(skillRes.data?.data || []);
      setBlogs(blogRes.data?.data || []);
      setMessages(msgRes.data?.data || []);
      setMedia(mediaRes.data?.data || []);
      setActivity(activityRes.data?.data || []);

      const live = liveRes.data?.data || [];
      setLiveVisitors(Array.isArray(live) ? live : []);
      setLiveVisitorsCount(Array.isArray(live) ? live.length : 0);

      const vList = visitorsRes.data?.data?.visitors || [];
      setRecentVisitors(Array.isArray(vList) ? vList.slice(0, 10) : []);
      setTodayVisitors(vList.filter(v => v.createdAt && new Date(v.createdAt).toDateString() === new Date().toDateString()).length);
      const weekAgo = new Date(Date.now() - 7 * 86400000);
      setWeeklyVisitors(vList.filter(v => v.createdAt && new Date(v.createdAt) >= weekAgo).length);

      setBrowsers(browsersRes.data?.data || []);
      setDevices(devicesRes.data?.data || []);
      setSources(sourcesRes.data?.data || []);
      setTopPages(pagesRes.data?.data || []);
      setAvgDuration(durationRes.data?.data?.average || 0);

      setWidgetErrors({});
    } catch {
      setWidgetErrors({ fetch: true });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const totalProjects = projects.length;
  const publishedProjects = projects.filter(p => p.isActive !== false).length;
  const totalSkills = skills.length;
  const blogCount = blogs.length;
  const unreadMessages = messages.filter(m => !m.isRead && !m.read).length;
  const mediaCount = media.length;

  const stats = [
    { icon: Icons.folder, label: 'Total Projects', value: totalProjects, color: 'blue' },
    { icon: Icons['check-circle'], label: 'Published', value: publishedProjects, color: 'green' },
    { icon: Icons.code, label: 'Skills', value: totalSkills, color: 'purple' },
    { icon: Icons['file-text'], label: 'Blog Posts', value: blogCount, color: 'blue' },
    { icon: Icons.mail, label: 'Unread Messages', value: unreadMessages, color: 'red' },
    { icon: Icons.image, label: 'Media Files', value: mediaCount, color: 'yellow' },
  ];

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  const navigateTo = (page) => {
    localStorage.setItem('admin_page', page);
    window.location.reload();
  };

  const quickActions = [
    { label: 'Add Project', icon: Icons.plus, onClick: () => navigateTo('projects'), primary: true },
    { label: 'Write Blog', icon: Icons['file-plus'], onClick: () => navigateTo('blog') },
    { label: 'View Site', icon: Icons['external-link'], onClick: () => window.open('/', '_blank') },
    { label: 'Settings', icon: Icons.settings, onClick: () => navigateTo('settings') },
  ];

  const browserData = browsers.length > 0 ? browsers.map(b => ({ name: b.name, value: b.value, color: COLORS[browsers.indexOf(b) % COLORS.length] })) : [];
  const osData = []; // We can add if needed
  const deviceData = devices.length > 0 ? devices.map(d => ({ name: d.name, value: d.value, color: COLORS[devices.indexOf(d) % COLORS.length] })) : [];

  const quickActionGrid = [
    { label: 'New Project', icon: Icons.folder, onClick: () => navigateTo('projects'), color: '#2563EB' },
    { label: 'New Blog Post', icon: Icons['file-plus'], onClick: () => navigateTo('blog'), color: '#16A34A' },
    { label: 'View Site', icon: Icons['external-link'], onClick: () => window.open('/', '_blank'), color: '#7C3AED' },
    { label: 'Backup Now', icon: Icons['download-cloud'], onClick: () => navigateTo('backup'), color: '#F59E0B' },
    { label: 'Clear Cache', icon: Icons['refresh-cw'], onClick: () => fetchData(), color: '#06B6D4' },
  ];

  const TRAFFIC_SOURCES = sources.length > 0 ? sources : [
    { source: 'Direct', count: 0, percentage: 0, color: '#2563EB' },
  ];

  return (
    <PageLayout
      title="Dashboard"
      description="Welcome to your portfolio CMS. Here's an overview of your content and visitor activity."
      stats={loading ? undefined : stats}
      quickActions={quickActions}
    >
      {/* Top Row: Live Visitors + Visitors Today + Weekly */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <Widget title="Live Visitors" icon={Icons['bar-chart']}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
              <Icon path={Icons.users} size={28} />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>{liveVisitorsCount}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>active visitors now</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-success)', marginTop: 2 }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)', marginRight: 4 }} />
                Online
              </div>
            </div>
          </div>
          {liveVisitors.length > 0 && (
            <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {liveVisitors.slice(0, 5).map((v, i) => (
                <span key={v._id || i} style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: 4, background: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}>
                  {v.country || '?'} · {v.browser || '?'}
                </span>
              ))}
            </div>
          )}
        </Widget>

        <Widget title="Visitors Today" icon={Icons['user-plus']}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-success-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)' }}>
              <Icon path={Icons['bar-chart-3']} size={28} />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>{formatNumber(todayVisitors)}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>visitors today</div>
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: 8, fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>
            <span>This week: {formatNumber(weeklyVisitors)}</span>
            <span>Avg duration: {formatDuration(avgDuration)}</span>
          </div>
        </Widget>

        <Widget title="Traffic Sources" icon={Icons['trending-up']}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {TRAFFIC_SOURCES.slice(0, 5).map((source, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 2 }}>
                  <span style={{ color: 'var(--color-text)' }}>{source.source || source.name}</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{source.percentage || 0}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'var(--color-border-light)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, source.percentage || 0)}%`, background: COLORS[i % COLORS.length], borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </Widget>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <Widget title="Browser Distribution" icon={Icons.monitor}>
          {browserData.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', padding: '0.5rem 0' }}>
              {browserData.map((d, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '0.5rem 0.75rem', borderRadius: 8, background: 'var(--color-bg-subtle)', minWidth: 70 }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: d.color }}>{d.value}%</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--color-text-tertiary)' }}>{d.name}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-tertiary)', fontSize: '0.82rem' }}>No browser data yet</div>
          )}
        </Widget>

        <Widget title="Device Distribution" icon={Icons.smartphone}>
          {deviceData.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', padding: '0.5rem 0' }}>
              {deviceData.map((d, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '0.5rem 0.75rem', borderRadius: 8, background: 'var(--color-bg-subtle)', minWidth: 70 }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: d.color }}>{d.value}%</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--color-text-tertiary)' }}>{d.name}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-tertiary)', fontSize: '0.82rem' }}>No device data yet</div>
          )}
        </Widget>
      </div>

      {/* Three column row: Top Pages, Recent Visitors, Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Top Pages */}
        <Widget title="Top Pages" icon={Icons['file-text']}>
          {topPages.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {topPages.slice(0, 5).map((page, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: i < Math.min(4, topPages.length - 1) ? '1px solid var(--color-border-light)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-tertiary)', width: 16, flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{page.path || '/'}</span>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '0.5rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text)' }}>{formatNumber(page.views || 0)}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>{page.avgTime ? formatDuration(page.avgTime) : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-tertiary)', fontSize: '0.82rem' }}>No page data yet</div>
          )}
        </Widget>

        {/* Recent Visitors */}
        <Widget title="Recent Visitors" icon={Icons.users}>
          {recentVisitors.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {recentVisitors.slice(0, 6).map((v, i) => (
                <div key={v._id || i} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.4rem 0', borderBottom: i < Math.min(5, recentVisitors.length - 1) ? '1px solid var(--color-border-light)' : 'none' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-primary)',
                    background: 'var(--color-primary-subtle)',
                  }}>
                    {(v.country || '?').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {v.country || 'Unknown'} · {v.browser || '?'}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>
                      {v.landingPage || '/'} · {formatDuration(v.duration || 0)}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    {formatTime(v.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-tertiary)', fontSize: '0.82rem' }}>No visitors yet</div>
          )}
        </Widget>

        {/* Recent Activity */}
        <Widget title="Recent Activity" icon={Icons.clock}>
          {activity.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {activity.slice(0, 6).map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.4rem 0', borderBottom: i < Math.min(5, activity.length - 1) ? '1px solid var(--color-border-light)' : 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-primary)', flexShrink: 0 }}>
                    {typeof item.user === 'string' ? item.user.charAt(0).toUpperCase() : (item.user?.name?.charAt(0)?.toUpperCase() || 'S')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <strong>{typeof item.user === 'string' ? item.user : (item.user?.name || 'System')}</strong> {item.action || item.message || ''}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', flexShrink: 0, whiteSpace: 'nowrap' }}>{item.time || formatTime(item.timestamp) || ''}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-tertiary)', fontSize: '0.82rem' }}>No recent activity</div>
          )}
        </Widget>
      </div>

      {/* Bottom Row: Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
        <Widget title="Quick Actions" icon={Icons.settings}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>
            {quickActionGrid.map((action) => (
              <button
                key={action.label}
                onClick={action.onClick}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '0.5rem', padding: '0.85rem 0.5rem',
                  border: '1px solid var(--color-border)', borderRadius: 10,
                  background: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)',
                  cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.72rem', fontWeight: 600,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = action.color; e.currentTarget.style.background = `${action.color}10`; e.currentTarget.style.color = action.color; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-bg-subtle)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${action.color}15`, color: action.color }}>
                  <Icon path={action.icon} size={18} />
                </div>
                {action.label}
              </button>
            ))}
          </div>
        </Widget>
      </div>

      {/* Live Visitors Detail */}
      {liveVisitors.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', marginTop: '1.25rem' }}>
          <Widget title={`Live Visitors (${liveVisitors.length})`} icon={Icons.activity}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {liveVisitors.slice(0, 12).map((v, i) => (
                <div key={v._id || i} style={{
                  padding: '0.5rem 0.75rem', borderRadius: 8, background: 'var(--color-bg-subtle)',
                  border: '1px solid var(--color-border-light)', fontSize: '0.72rem', minWidth: 140,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block' }} />
                    <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{v.country || 'Unknown'}</span>
                  </div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.65rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {v.currentPage || '/'} · {formatDuration(v.duration || 0)}
                  </div>
                </div>
              ))}
            </div>
          </Widget>
        </div>
      )}
    </PageLayout>
  );
}

const COLORS = ['var(--color-primary)', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
