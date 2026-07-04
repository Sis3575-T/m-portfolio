import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import backendApi from '../services/backendApi';

/* ─── Auth ─── */
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      console.log('Attempting login...');
      const res = await backendApi.login(email, password);
      console.log('Login response:', res);
      if (res.success && res.token) {
        localStorage.setItem('portfolio_admin_token', res.token);
        console.log('Token saved, redirecting...');
        onLogin(res.token);
      } else {
        setError(res.message || 'Login failed - no error message');
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.message || '';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('Network Error')) {
        setError('Cannot reach backend server. Make sure to:\n1. Start backend: cd backend && npm run dev\n2. Restart frontend: cd frontend && npm run dev\n3. Backend runs on port 5001');
      } else {
        setError(msg || 'Login failed. Check console for details (F12).');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-icon">
          <svg width="48" height="48" viewBox="0 0 36 32">
            <rect width="36" height="32" rx="8" fill="#7c3aed" />
            <text x="18" y="24" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="20" fill="white" textAnchor="middle">ST</text>
          </svg>
        </div>
        <h1>Admin Login</h1>
        <p className="admin-login-sub">Enter your credentials to access the admin panel</p>
        <form onSubmit={handleSubmit}>
          <div className="admin-field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="sisay3575@gmail.com" required />
          </div>
          <div className="admin-field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <div className="admin-login-error">{error}</div>}
          <button type="submit" className="admin-btn admin-btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="admin-login-footer">
          <Link to="/">← Back to site</Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Sidebar Sections ─── */
const sections = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'settings', label: 'Settings' },
  { id: 'hero', label: 'Hero' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'messages', label: 'Messages' },
  { id: 'styles', label: 'Styles' },
];

/* ─── Dashboard ─── */
function Dashboard({ stats }) {
  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginTop: 20 }}>
        {[
          { label: 'Skills', count: stats.skills },
          { label: 'Projects', count: stats.projects },
          { label: 'Experience', count: stats.experience },
          { label: 'Education', count: stats.education },
          { label: 'Messages', count: stats.messages },
        ].map(s => (
          <div key={s.label} className="admin-stat-card">
            <div className="admin-stat-count">{s.count}</div>
            <div className="admin-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Settings Editor ─── */
function SettingsEditor({ api }) {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.getSettings().then(res => {
      if (res.success && res.data) setSettings(res.data);
    }).catch(() => {});
  }, []);

  const handleChange = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      const res = await api.updateSettings(settings);
      if (res.success) setMsg('Saved successfully');
    } catch (err) {
      setMsg('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="admin-loading">Loading...</div>;

  const fields = [
    { key: 'name', label: 'Name' }, { key: 'siteTitle', label: 'Site Title' },
    { key: 'tagline', label: 'Tagline' }, { key: 'professionalTitle', label: 'Professional Title' },
    { key: 'shortBio', label: 'Short Bio', type: 'textarea' },
    { key: 'longBio', label: 'Long Bio', type: 'textarea' },
    { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address' }, { key: 'city', label: 'City' },
    { key: 'country', label: 'Country' },
    { key: 'profilePhoto', label: 'Profile Photo URL' },
    { key: 'github', label: 'GitHub URL' }, { key: 'linkedin', label: 'LinkedIn URL' },
    { key: 'twitter', label: 'Twitter URL' }, { key: 'telegram', label: 'Telegram URL' },
    { key: 'yearsOfExperience', label: 'Years of Experience' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Settings</h2>
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
      </div>
      {msg && <div className={`admin-msg ${msg.startsWith('Error') ? 'admin-msg-error' : 'admin-msg-success'}`}>{msg}</div>}
      <div className="admin-form-grid">
        {fields.map(f => (
          <div key={f.key} className="admin-field">
            <label>{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea rows={3} value={settings[f.key] || ''} onChange={e => handleChange(f.key, e.target.value)} />
            ) : (
              <input type="text" value={settings[f.key] || ''} onChange={e => handleChange(f.key, e.target.value)} />
            )}
          </div>
        ))}
      </div>
      <div className="admin-toggle-row">
        <label>Freelance Available</label>
        <input type="checkbox" checked={settings.freelanceAvailable !== false} onChange={e => handleChange('freelanceAvailable', e.target.checked)} />
      </div>
    </div>
  );
}

/* ─── Hero Editor ─── */
function HeroEditor({ api }) {
  const [hero, setHero] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.getHeroAdmin().then(res => {
      if (res.success) {
        const h = Array.isArray(res.data) ? res.data[0] : res.data;
        if (h) setHero(h);
      }
    }).catch(() => {});
  }, []);

  const handleChange = (key, value) => setHero(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      const res = await api.updateHero(hero);
      if (res.success) setMsg('Saved successfully');
    } catch (err) {
      setMsg('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!hero) return <div className="admin-loading">Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Hero Section</h2>
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
      </div>
      {msg && <div className="admin-msg admin-msg-success">{msg}</div>}
      <div className="admin-form-grid">
        {[
          { key: 'name', label: 'Name' }, { key: 'title', label: 'Title' },
          { key: 'introduction', label: 'Short Bio' }, { key: 'role', label: 'Role' },
          { key: 'location', label: 'Location' },
        ].map(f => (
          <div key={f.key} className="admin-field">
            <label>{f.label}</label>
            <textarea rows={2} value={hero[f.key] || ''} onChange={e => handleChange(f.key, e.target.value)} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Generic List Editor ─── */
function ListEditor({ title, api, fetchFn, createFn, updateFn, deleteFn, fields, emptyItem, labelKey }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [newItem, setNewItem] = useState({ ...emptyItem });

  const load = useCallback(async () => {
    try {
      const res = await fetchFn();
      if (res.success) setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setMsg('Load error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      for (const item of items) {
        if (item._id && item._id.startsWith('new_')) {
          await createFn(item);
        } else if (item._id) {
          await updateFn(item._id, item);
        }
      }
      setMsg('Saved successfully');
      await load();
    } catch (err) {
      setMsg('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    if (!newItem[labelKey || 'name']?.trim()) return;
    setItems(prev => [...prev, { ...newItem, _id: 'new_' + Date.now() }]);
    setNewItem({ ...emptyItem });
  };

  const updateItem = (id, key, value) => {
    setItems(prev => prev.map(i => i._id === id ? { ...i, [key]: value } : i));
  };

  const removeItem = async (id) => {
    if (id && !id.startsWith('new_')) {
      try { await deleteFn(id); } catch {}
    }
    setItems(prev => prev.filter(i => i._id !== id));
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>{title}</h2>
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save All'}</button>
      </div>
      {msg && <div className={`admin-msg ${msg.startsWith('Error') || msg.startsWith('Load') ? 'admin-msg-error' : 'admin-msg-success'}`}>{msg}</div>}

      {items.map(item => (
        <div key={item._id} className="admin-card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button className="admin-btn-sm admin-btn-danger" onClick={() => removeItem(item._id)}>Delete</button>
          </div>
          <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {fields.map(f => (
              <div key={f.key} className="admin-field" style={f.fullWidth ? { gridColumn: '1/-1' } : {}}>
                <label>{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea rows={f.rows || 2} value={item[f.key] || ''} onChange={e => updateItem(item._id, f.key, e.target.value)} />
                ) : f.type === 'select' ? (
                  <select value={item[f.key] || ''} onChange={e => updateItem(item._id, f.key, e.target.value)}>
                    {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : f.type === 'number' ? (
                  <input type="number" value={item[f.key] || ''} onChange={e => updateItem(item._id, f.key, parseInt(e.target.value) || 0)} />
                ) : (
                  <input type="text" value={item[f.key] || ''} onChange={e => updateItem(item._id, f.key, e.target.value)} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="admin-card" style={{ marginTop: 16 }}>
        <strong style={{ color: 'var(--primary-color)' }}>Add New</strong>
        <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 8 }}>
          {fields.map(f => (
            <div key={f.key} className="admin-field" style={f.fullWidth ? { gridColumn: '1/-1' } : {}}>
              <label>{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea rows={f.rows || 2} value={newItem[f.key] || ''} onChange={e => setNewItem(prev => ({ ...prev, [f.key]: e.target.value }))} />
              ) : f.type === 'select' ? (
                <select value={newItem[f.key] || ''} onChange={e => setNewItem(prev => ({ ...prev, [f.key]: e.target.value }))}>
                  {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type="text" value={newItem[f.key] || ''} onChange={e => setNewItem(prev => ({ ...prev, [f.key]: e.target.value }))} />
              )}
            </div>
          ))}
        </div>
        <button className="admin-btn admin-btn-primary" style={{ marginTop: 8 }} onClick={addItem}>Add</button>
      </div>
    </div>
  );
}

/* ─── Messages ─── */
function Messages({ api }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMessages().then(res => {
      if (res.success) setMessages(Array.isArray(res.data) ? res.data : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div>
      <h2>Messages</h2>
      {messages.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>No messages yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          {messages.map(m => (
            <div key={m._id} className="admin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <strong>{m.name}</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(m.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{m.email}</div>
              {m.subject && <div style={{ marginTop: 4, fontWeight: 500 }}>{m.subject}</div>}
              <div style={{ marginTop: 4, color: '#cbd5e1' }}>{m.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Theme / Styles Editor ─── */
function ThemeEditor({ api }) {
  const [theme, setTheme] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = useCallback(() => {
    api.getActiveTheme().then(res => {
      if (res.success && res.data) setTheme(res.data);
    }).catch(() => {});
  }, [api]);

  useEffect(() => { load(); }, [load]);

  const set = (path, value) => {
    setTheme(prev => {
      const parts = path.split('.');
      if (parts.length === 1) return { ...prev, [parts[0]]: value };
      return { ...prev, [parts[0]]: { ...(prev[parts[0]] || {}), [parts[1]]: value } };
    });
  };

  const handleSave = async () => {
    if (!theme?._id) return;
    setSaving(true);
    setMsg('');
    try {
      const res = await api.updateTheme(theme._id, theme);
      if (res.success) setMsg('Styles saved successfully');
    } catch (err) {
      setMsg('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!theme) return <div className="admin-loading">Loading...</div>;

  const colorFields = ['primary', 'secondary', 'background', 'surface', 'card', 'border', 'text', 'heading', 'link', 'success', 'warning', 'danger'];
  const darkFields = ['background', 'surface', 'card', 'border', 'text', 'heading'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Theme Styles</h2>
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
      </div>
      {msg && <div className={`admin-msg ${msg.startsWith('Error') ? 'admin-msg-error' : 'admin-msg-success'}`}>{msg}</div>}

      <div className="admin-card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 12 }}>Theme Name</h3>
        <div className="admin-field">
          <input type="text" value={theme.name || ''} onChange={e => set('name', e.target.value)} />
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 12 }}>Colors</h3>
        <div className="admin-form-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
          {colorFields.map(f => (
            <div key={f} className="admin-field">
              <label style={{ textTransform: 'capitalize' }}>{f}</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={theme.colors?.[f] || '#000000'} onChange={e => set('colors.' + f, e.target.value)} style={{ width: 40, height: 36, padding: 0, border: 'none', cursor: 'pointer' }} />
                <input type="text" value={theme.colors?.[f] || ''} onChange={e => set('colors.' + f, e.target.value)} style={{ flex: 1 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 12 }}>Typography</h3>
        <div className="admin-form-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {[
            { key: 'fontFamily', label: 'Font Family' },
            { key: 'headingFont', label: 'Heading Font' },
            { key: 'monoFont', label: 'Mono Font' },
            { key: 'baseSize', label: 'Base Size (px)', type: 'number' },
            { key: 'scale', label: 'Scale' },
            { key: 'lineHeight', label: 'Line Height', type: 'number' },
          ].map(f => (
            <div key={f.key} className="admin-field">
              <label>{f.label}</label>
              <input type={f.type === 'number' ? 'number' : 'text'} value={theme.typography?.[f.key] ?? ''} onChange={e => set('typography.' + f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 12 }}>Layout</h3>
        <div className="admin-form-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {[
            { key: 'containerWidth', label: 'Container Width (px)', type: 'number' },
            { key: 'gridGap', label: 'Grid Gap (px)', type: 'number' },
            { key: 'borderRadius', label: 'Border Radius (px)', type: 'number' },
            { key: 'spacing', label: 'Spacing (px)', type: 'number' },
          ].map(f => (
            <div key={f.key} className="admin-field">
              <label>{f.label}</label>
              <input type="number" value={theme.layout?.[f.key] ?? ''} onChange={e => set('layout.' + f.key, Number(e.target.value))} />
            </div>
          ))}
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 12 }}>Dark Mode</h3>
        <div className="admin-toggle-row">
          <label>Enable Dark Mode</label>
          <input type="checkbox" checked={theme.darkMode?.enabled !== false} onChange={e => set('darkMode.enabled', e.target.checked)} />
        </div>
        <div className="admin-form-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', marginTop: 12 }}>
          {darkFields.map(f => (
            <div key={f} className="admin-field">
              <label style={{ textTransform: 'capitalize' }}>Dark {f}</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={theme.darkMode?.[f] || '#000000'} onChange={e => set('darkMode.' + f, e.target.value)} style={{ width: 40, height: 36, padding: 0, border: 'none', cursor: 'pointer' }} />
                <input type="text" value={theme.darkMode?.[f] || ''} onChange={e => set('darkMode.' + f, e.target.value)} style={{ flex: 1 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 12 }}>Custom CSS</h3>
        <div className="admin-field">
          <textarea rows={6} value={theme.customCSS || ''} onChange={e => set('customCSS', e.target.value)} placeholder="/* Add custom CSS rules here */" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Admin Page (Main) ─── */
export default function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem('portfolio_admin_token'));
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({ skills: 0, projects: 0, experience: 0, education: 0, messages: 0 });

  useEffect(() => {
    if (!token) return;
    Promise.all([
      backendApi.getSkills().catch(() => ({ data: [] })),
      backendApi.getProjects().catch(() => ({ data: [] })),
      backendApi.getExperience().catch(() => ({ data: [] })),
      backendApi.getEducation().catch(() => ({ data: [] })),
      backendApi.getMessages().catch(() => ({ data: [] })),
    ]).then(([skills, projects, exp, edu, msgs]) => {
      setStats({
        skills: Array.isArray(skills.data) ? skills.data.length : 0,
        projects: Array.isArray(projects.data) ? projects.data.length : 0,
        experience: Array.isArray(exp.data) ? exp.data.length : 0,
        education: Array.isArray(edu.data) ? edu.data.length : 0,
        messages: Array.isArray(msgs.data) ? msgs.data.length : 0,
      });
    });
  }, [token]);

  if (!token) {
    return <LoginPage onLogin={setToken} />;
  }

  const handleLogout = () => {
    localStorage.removeItem('portfolio_admin_token');
    setToken(null);
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-left">
          <Link to="/" className="admin-back-link">← Back to Site</Link>
          <h1>Admin Panel</h1>
        </div>
        <div className="admin-header-right">
          <button className="admin-btn admin-btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          {sections.map(s => (
            <button
              key={s.id}
              className={`admin-nav-link ${activeSection === s.id ? 'active' : ''}`}
              onClick={() => setActiveSection(s.id)}
            >
              {s.label}
            </button>
          ))}
        </aside>
        <main className="admin-content">
          {activeSection === 'dashboard' && <Dashboard stats={stats} />}

          {activeSection === 'settings' && <SettingsEditor api={backendApi} />}

          {activeSection === 'hero' && <HeroEditor api={backendApi} />}

          {activeSection === 'skills' && (
            <ListEditor
              title="Skills"
              api={backendApi}
              fetchFn={() => backendApi.getSkillsAdmin()}
              createFn={(data) => backendApi.createSkill(data)}
              updateFn={(id, data) => backendApi.updateSkill(id, data)}
              deleteFn={(id) => backendApi.deleteSkill(id)}
              labelKey="name"
              emptyItem={{ name: '', category: 'Frontend', icon: 'react', proficiency: 80 }}
              fields={[
                { key: 'name', label: 'Name' },
                { key: 'category', label: 'Category', type: 'select', options: ['Frontend', 'Backend', 'Database', 'Tools', 'Design', 'Other'] },
                { key: 'proficiency', label: 'Proficiency %', type: 'number' },
                { key: 'icon', label: 'Icon' },
              ]}
            />
          )}

          {activeSection === 'projects' && (
            <ListEditor
              title="Projects"
              api={backendApi}
              fetchFn={() => backendApi.getProjectsAdmin()}
              createFn={(data) => backendApi.createProject(data)}
              updateFn={(id, data) => backendApi.updateProject(id, data)}
              deleteFn={(id) => backendApi.deleteProject(id)}
              labelKey="title"
              emptyItem={{ title: '', description: '', category: 'Full Stack', technologies: [], liveUrl: '', githubUrl: '', isVisible: true }}
              fields={[
                { key: 'title', label: 'Title' },
                { key: 'category', label: 'Category' },
                { key: 'description', label: 'Description', type: 'textarea', rows: 2, fullWidth: true },
                { key: 'liveUrl', label: 'Live URL' },
                { key: 'githubUrl', label: 'GitHub URL' },
              ]}
            />
          )}

          {activeSection === 'experience' && (
            <ListEditor
              title="Experience"
              api={backendApi}
              fetchFn={() => backendApi.getExperienceAdmin()}
              createFn={(data) => backendApi.createExperience(data)}
              updateFn={(id, data) => backendApi.updateExperience(id, data)}
              deleteFn={(id) => backendApi.deleteExperience(id)}
              labelKey="position"
              emptyItem={{ company: '', position: '', startDate: '', endDate: '', current: false, description: '', location: '' }}
              fields={[
                { key: 'company', label: 'Company' },
                { key: 'position', label: 'Position' },
                { key: 'startDate', label: 'Start Date' },
                { key: 'endDate', label: 'End Date' },
                { key: 'location', label: 'Location' },
                { key: 'description', label: 'Description', type: 'textarea', rows: 2, fullWidth: true },
              ]}
            />
          )}

          {activeSection === 'education' && (
            <ListEditor
              title="Education"
              api={backendApi}
              fetchFn={() => backendApi.getEducationAdmin()}
              createFn={(data) => backendApi.createEducation(data)}
              updateFn={(id, data) => backendApi.updateEducation(id, data)}
              deleteFn={(id) => backendApi.deleteEducation(id)}
              labelKey="degree"
              emptyItem={{ institution: '', degree: '', field: '', startDate: '', endDate: '', description: '' }}
              fields={[
                { key: 'institution', label: 'Institution' },
                { key: 'degree', label: 'Degree' },
                { key: 'field', label: 'Field' },
                { key: 'startDate', label: 'Start Date' },
                { key: 'endDate', label: 'End Date' },
                { key: 'description', label: 'Description', type: 'textarea', rows: 2, fullWidth: true },
              ]}
            />
          )}

          {activeSection === 'messages' && <Messages api={backendApi} />}

          {activeSection === 'styles' && <ThemeEditor api={backendApi} />}
        </main>
      </div>
    </div>
  );
}
