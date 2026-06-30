import React, { useState, useEffect, useCallback } from 'react';
import { adminApi, imageUrl } from '../services/api';
import api from '../services/api';

const COLOR_FIELDS = [
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'background', label: 'Background' },
  { key: 'surface', label: 'Surface' },
  { key: 'card', label: 'Card' },
  { key: 'border', label: 'Border' },
  { key: 'text', label: 'Text' },
  { key: 'heading', label: 'Heading' },
  { key: 'link', label: 'Link' },
  { key: 'success', label: 'Success' },
  { key: 'warning', label: 'Warning' },
  { key: 'danger', label: 'Danger' },
];

const INITIAL_FORM = {
  name: '',
  colors: Object.fromEntries(COLOR_FIELDS.map(f => [f.key, '#000000'])),
  typography: { fontFamily: 'Inter, sans-serif', headingFont: 'Inter, sans-serif', monoFont: 'JetBrains Mono, monospace', baseSize: 16, scale: '1.25', lineHeight: 1.6 },
  layout: { containerWidth: 1200, gridGap: 24, borderRadius: 8, spacing: 16 },
  shadows: { sm: '0 1px 2px rgba(0,0,0,0.04)', md: '0 4px 6px rgba(0,0,0,0.07)', lg: '0 10px 15px rgba(0,0,0,0.08)', xl: '0 20px 25px rgba(0,0,0,0.1)' },
  darkMode: { enabled: false, background: '#0F172A', surface: '#1E293B', card: '#1E293B', border: '#334155', text: '#F1F5F9', heading: '#F8FAFC' },
  customCSS: '',
};

export default function ThemeBuilder() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('colors');
  const [form, setForm] = useState(INITIAL_FORM);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchThemes(); }, []);

  const fetchThemes = async () => {
    try {
      const { data } = await api.get('/theme');
      setThemes(data.data || []);
      const active = (data.data || []).find(t => t.isActive);
      if (active) { setSelectedTheme(active); setForm(active); }
    } catch { setMessage('Failed to load themes'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true); setMessage('');
    try {
      if (selectedTheme?._id) {
        const { data } = await api.put(`/theme/${selectedTheme._id}`, form);
        setSelectedTheme(data.data);
        setMessage('Theme saved successfully');
      } else {
        const { data } = await api.post('/theme', form);
        setSelectedTheme(data.data);
        setMessage('Theme created successfully');
      }
      fetchThemes();
    } catch { setMessage('Failed to save theme'); }
    finally { setSaving(false); }
  };

  const activateTheme = async (id) => {
    try {
      await api.post(`/theme/${id}/activate`);
      fetchThemes();
      setMessage('Theme activated');
    } catch { setMessage('Failed to activate theme'); }
  };

  const duplicateTheme = async (id) => {
    try {
      const { data } = await api.post(`/theme/${id}/duplicate`);
      setSelectedTheme(data.data);
      setForm(data.data);
      fetchThemes();
      setMessage('Theme duplicated');
    } catch { setMessage('Failed to duplicate theme'); }
  };

  const deleteTheme = async (id) => {
    if (!window.confirm('Delete this theme?')) return;
    try {
      await api.delete(`/theme/${id}`);
      if (selectedTheme?._id === id) { setSelectedTheme(null); setForm(INITIAL_FORM); }
      fetchThemes();
      setMessage('Theme deleted');
    } catch { setMessage('Failed to delete theme'); }
  };

  const updateColor = (key, val) => setForm(prev => ({ ...prev, colors: { ...prev.colors, [key]: val } }));
  const updateTypography = (key, val) => setForm(prev => ({ ...prev, typography: { ...prev.typography, [key]: val } }));
  const updateLayout = (key, val) => setForm(prev => ({ ...prev, layout: { ...prev.layout, [key]: val } }));
  const updateDarkMode = (key, val) => setForm(prev => ({ ...prev, darkMode: { ...prev.darkMode, [key]: val } }));
  const updateShadow = (key, val) => setForm(prev => ({ ...prev, shadows: { ...prev.shadows, [key]: val } }));

  const TABS = [
    { id: 'colors', label: 'Colors', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
    { id: 'typography', label: 'Typography', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M12 18v-6 M9 15h6' },
    { id: 'layout', label: 'Layout', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z M4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z M16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
    { id: 'shadows', label: 'Shadows', icon: 'M12 3a6 6 0 00-6 6v4a6 6 0 0012 0V9a6 6 0 00-6-6z' },
    { id: 'dark', label: 'Dark Mode', icon: 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z' },
    { id: 'css', label: 'Custom CSS', icon: 'M10 20l4-16 M14 4l6 6-6 6 M10 20l-6-6 6-6' },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-text)' }}>Theme Builder</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Create and manage your global design system</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Theme'}
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-4 px-4 py-2.5 rounded-lg text-sm font-medium"
          style={{ background: message.includes('Failed') ? 'var(--color-danger-subtle)' : 'var(--color-success-subtle)', color: message.includes('Failed') ? 'var(--color-danger)' : 'var(--color-success)' }}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-[280px_1fr] gap-6">
        <div className="rounded-xl border p-4" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Themes</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedTheme(null); setForm(INITIAL_FORM); }}>New</button>
          </div>
          <div className="space-y-2">
            {themes.map(theme => (
              <div key={theme._id}
                className="flex items-center justify-between p-2.5 rounded-lg cursor-pointer text-sm transition-all"
                style={{ background: selectedTheme?._id === theme._id ? 'var(--color-primary-subtle)' : 'transparent', color: 'var(--color-text-secondary)' }}
                onClick={() => { setSelectedTheme(theme); setForm(theme); }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded" style={{ background: theme.colors?.primary }} />
                  <span className="font-medium">{theme.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {theme.isActive && <span className="badge badge-success text-xs">Active</span>}
                  <button className="btn-icon btn-sm" onClick={(e) => { e.stopPropagation(); activateTheme(theme._id); }} title="Activate">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  </button>
                  <button className="btn-icon btn-sm" onClick={(e) => { e.stopPropagation(); duplicateTheme(theme._id); }} title="Duplicate">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                  </button>
                  <button className="btn-icon btn-sm" onClick={(e) => { e.stopPropagation(); deleteTheme(theme._id); }} title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                  </button>
                </div>
              </div>
            ))}
            {themes.length === 0 && <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-tertiary)' }}>No themes yet. Create one.</p>}
          </div>
        </div>

        <div className="rounded-xl border" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'var(--color-gray-100)' }}>
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-md text-xs font-medium transition-all ${activeTab === tab.id ? 'bg-white shadow-sm' : ''}`}
                  style={{ color: activeTab === tab.id ? 'var(--color-text)' : 'var(--color-text-secondary)' }}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 max-h-[600px] overflow-y-auto">
            {activeTab === 'colors' && (
              <div className="grid grid-cols-2 gap-4">
                {COLOR_FIELDS.map(field => (
                  <div key={field.key} className="flex items-center gap-3">
                    <input type="color" value={form.colors[field.key] || '#000000'}
                      onChange={(e) => updateColor(field.key, e.target.value)}
                      className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
                    <div className="flex-1">
                      <label className="text-xs font-semibold block" style={{ color: 'var(--color-text)' }}>{field.label}</label>
                      <input type="text" value={form.colors[field.key] || ''}
                        onChange={(e) => updateColor(field.key, e.target.value)}
                        className="w-full mt-0.5 px-2.5 py-1.5 text-xs rounded-md border"
                        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'typography' && (
              <div className="space-y-5">
                {[
                  { key: 'fontFamily', label: 'Font Family', type: 'text', placeholder: 'Inter, sans-serif' },
                  { key: 'headingFont', label: 'Heading Font', type: 'text', placeholder: 'Inter, sans-serif' },
                  { key: 'monoFont', label: 'Monospace Font', type: 'text', placeholder: 'JetBrains Mono, monospace' },
                ].map(f => (
                  <div key={f.key} className="form-group">
                    <label>{f.label}</label>
                    <input value={form.typography[f.key] || ''} onChange={(e) => updateTypography(f.key, e.target.value)} placeholder={f.placeholder} />
                  </div>
                ))}
                <div className="form-row">
                  <div className="form-group">
                    <label>Base Size (px)</label>
                    <input type="number" value={form.typography.baseSize || 16} onChange={(e) => updateTypography('baseSize', parseInt(e.target.value) || 16)} />
                  </div>
                  <div className="form-group">
                    <label>Scale Ratio</label>
                    <input value={form.typography.scale || '1.25'} onChange={(e) => updateTypography('scale', e.target.value)} placeholder="1.25" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Line Height</label>
                  <input type="number" step="0.1" value={form.typography.lineHeight || 1.6} onChange={(e) => updateTypography('lineHeight', parseFloat(e.target.value) || 1.6)} />
                </div>
              </div>
            )}

            {activeTab === 'layout' && (
              <div className="space-y-5">
                <div className="form-row">
                  <div className="form-group"><label>Container Width (px)</label><input type="number" value={form.layout.containerWidth || 1200} onChange={(e) => updateLayout('containerWidth', parseInt(e.target.value) || 1200)} /></div>
                  <div className="form-group"><label>Grid Gap (px)</label><input type="number" value={form.layout.gridGap || 24} onChange={(e) => updateLayout('gridGap', parseInt(e.target.value) || 24)} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Border Radius (px)</label><input type="number" value={form.layout.borderRadius || 8} onChange={(e) => updateLayout('borderRadius', parseInt(e.target.value) || 8)} /></div>
                  <div className="form-group"><label>Spacing (px)</label><input type="number" value={form.layout.spacing || 16} onChange={(e) => updateLayout('spacing', parseInt(e.target.value) || 16)} /></div>
                </div>
              </div>
            )}

            {activeTab === 'shadows' && (
              <div className="space-y-5">
                {['sm', 'md', 'lg', 'xl'].map(size => (
                  <div key={size} className="form-group">
                    <label>Shadow {size.toUpperCase()}</label>
                    <input value={form.shadows[size] || ''} onChange={(e) => updateShadow(size, e.target.value)} placeholder="0 1px 2px rgba(0,0,0,0.04)" />
                    <div className="mt-2 p-4 rounded-lg border" style={{ boxShadow: form.shadows[size] || 'none', borderColor: 'var(--color-border)' }}>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Preview</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'dark' && (
              <div className="space-y-5">
                <div className="form-check mb-4">
                  <input type="checkbox" checked={form.darkMode.enabled} onChange={(e) => updateDarkMode('enabled', e.target.checked)} />
                  <label>Enable Dark Mode</label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'background', label: 'Background' },
                    { key: 'surface', label: 'Surface' },
                    { key: 'card', label: 'Card' },
                    { key: 'border', label: 'Border' },
                    { key: 'text', label: 'Text' },
                    { key: 'heading', label: 'Heading' },
                  ].map(f => (
                    <div key={f.key} className="flex items-center gap-3">
                      <input type="color" value={form.darkMode[f.key] || '#000000'}
                        onChange={(e) => updateDarkMode(f.key, e.target.value)}
                        className="w-9 h-9 rounded-lg border-0 cursor-pointer" />
                      <div className="flex-1">
                        <label className="text-xs font-semibold block" style={{ color: 'var(--color-text)' }}>{f.label}</label>
                        <input type="text" value={form.darkMode[f.key] || ''}
                          onChange={(e) => updateDarkMode(f.key, e.target.value)}
                          className="w-full mt-0.5 px-2 py-1 text-xs rounded-md border"
                          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'css' && (
              <div className="form-group">
                <label>Custom CSS</label>
                <textarea rows={12} value={form.customCSS || ''} onChange={(e) => setForm(prev => ({ ...prev, customCSS: e.target.value }))}
                  placeholder="/* Add your custom CSS here */" className="font-mono text-xs" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
