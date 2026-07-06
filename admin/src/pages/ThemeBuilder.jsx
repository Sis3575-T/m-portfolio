import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import api from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import PageLayout from '../components/PageLayout';
import ConfirmDialog from '../components/ConfirmDialog';

const COLOR_FIELDS = [
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'accent', label: 'Accent' },
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
  typography: { fontFamily: 'Inter, sans-serif', headingFont: 'Inter, sans-serif', bodySize: 16, headingSize: 32, lineHeight: 1.6 },
  layout: { containerWidth: 1200, padding: 16, gap: 24 },
  buttons: { borderRadius: 8, padding: '0.5rem 1rem', shadow: '0 2px 4px rgba(0,0,0,0.1)', hoverEffect: true },
  customCSS: '',
};

export default function ThemeBuilder() {
  const toast = useToast();
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('colors');
  const [form, setForm] = useState(INITIAL_FORM);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => { fetchThemes(); }, []);

  const fetchThemes = async () => {
    try {
      const { data } = await adminApi.getTheme();
      const items = data.data || data || [];
      setThemes(Array.isArray(items) ? items : [items]);
      const active = (Array.isArray(items) ? items : [items]).find(t => t.isActive);
      if (active) { setSelectedTheme(active); setForm(active); }
    } catch {
      toast.error('Failed to load themes');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (selectedTheme?._id) {
        const { data } = await api.put(`/theme/${selectedTheme._id}`, form);
        setSelectedTheme(data.data);
        toast.success('Theme saved');
      } else {
        const { data } = await api.post('/theme', form);
        setSelectedTheme(data.data);
        toast.success('Theme created');
      }
      await fetchThemes();
    } catch {
      toast.error('Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await adminApi.resetTheme();
      toast.success('Theme reset to defaults');
      await fetchThemes();
    } catch {
      toast.error('Failed to reset theme');
    } finally {
      setResetting(false);
    }
  };

  const activateTheme = async (id) => {
    try {
      await api.post(`/theme/${id}/activate`);
      toast.success('Theme activated');
      await fetchThemes();
    } catch {
      toast.error('Failed to activate theme');
    }
  };

  const duplicateTheme = async (id) => {
    try {
      const { data } = await api.post(`/theme/${id}/duplicate`);
      setSelectedTheme(data.data);
      setForm(data.data);
      toast.success('Theme duplicated');
      await fetchThemes();
    } catch {
      toast.error('Failed to duplicate theme');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/theme/${deleteTarget._id}`);
      if (selectedTheme?._id === deleteTarget._id) { setSelectedTheme(null); setForm(INITIAL_FORM); }
      toast.success('Theme deleted');
      await fetchThemes();
    } catch {
      toast.error('Failed to delete theme');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const updateColor = (key, val) => setForm(prev => ({ ...prev, colors: { ...prev.colors, [key]: val } }));
  const updateTypography = (key, val) => setForm(prev => ({ ...prev, typography: { ...prev.typography, [key]: val } }));
  const updateLayout = (key, val) => setForm(prev => ({ ...prev, layout: { ...prev.layout, [key]: val } }));
  const updateButtons = (key, val) => setForm(prev => ({ ...prev, buttons: { ...prev.buttons, [key]: val } }));

  const cssVars = Object.entries(form.colors || {}).map(([k, v]) => `--color-${k}: ${v};`).join('\n');
  const previewCss = `
    :root { ${cssVars} }
    body { font-family: ${form.typography?.fontFamily || 'inherit'}; font-size: ${form.typography?.bodySize || 16}px; line-height: ${form.typography?.lineHeight || 1.6}; }
    h1, h2, h3 { font-family: ${form.typography?.headingFont || 'inherit'}; }
    h1 { font-size: ${form.typography?.headingSize || 32}px; }
    .btn { border-radius: ${form.buttons?.borderRadius || 8}px; padding: ${form.buttons?.padding || '0.5rem 1rem'}; box-shadow: ${form.buttons?.shadow || 'none'}; }
    .container { max-width: ${form.layout?.containerWidth || 1200}px; padding: ${form.layout?.padding || 16}px; gap: ${form.layout?.gap || 24}px; }
  `;

  const previewIframe = React.useMemo(() => {
    const html = `<!DOCTYPE html><html><head><style>${previewCss}${form.customCSS || ''}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { padding: 2rem; }
.section { padding: 2rem; margin-bottom: 1rem; border-radius: var(--color-border-radius, 8px); }
h1 { margin-bottom: 0.5rem; }
p { margin-bottom: 1rem; }
.btn { display: inline-block; padding: 0.5rem 1rem; border: none; cursor: pointer; font-size: 14px; margin-right: 0.5rem; }
.btn-primary { background: var(--color-primary); color: #fff; }
.btn-secondary { background: var(--color-secondary); color: #fff; }
.card { padding: 1.5rem; border-radius: 12px; background: var(--color-card); border: 1px solid var(--color-border); }
</style></head><body>
<div class="section" style="background:var(--color-background);">
  <h1 style="color:var(--color-heading);">Theme Preview</h1>
  <p style="color:var(--color-text);">This is a live preview of your theme settings.</p>
  <button class="btn btn-primary">Primary Button</button>
  <button class="btn btn-secondary">Secondary Button</button>
</div>
<div class="card">
  <h3 style="color:var(--color-heading);">Card Title</h3>
  <p style="color:var(--color-text);">Card content with <a href="#" style="color:var(--color-link);">a link</a>.</p>
  <span style="color:var(--color-success);">Success</span>
  <span style="color:var(--color-warning);margin-left:1rem;">Warning</span>
  <span style="color:var(--color-danger);margin-left:1rem;">Danger</span>
</div>
</body></html>`;
    return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
  }, [previewCss, form.customCSS, form.typography, form.layout, form.buttons]);

  const TABS = [
    { id: 'colors', label: 'Colors', icon: Icons.palette },
    { id: 'typography', label: 'Typography', icon: Icons.file },
    { id: 'layout', label: 'Layout', icon: Icons.grid },
    { id: 'buttons', label: 'Buttons', icon: Icons['mouse-pointer'] },
    { id: 'css', label: 'Custom CSS', icon: Icons.code },
  ];

  if (loading) {
    return (
      <PageLayout title="Theme Builder" description="Create and manage your design system">
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="skeleton" style={{ flex: 1, height: 400, borderRadius: 14, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
          <div className="skeleton" style={{ width: 380, height: 400, borderRadius: 14, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Theme Builder"
      description="Create and manage your global design system"
      quickActions={[
        { label: saving ? 'Saving...' : 'Save Theme', icon: Icons.save, onClick: handleSave, primary: true },
        { label: 'Reset', icon: Icons['refresh-cw'], onClick: handleReset, variant: 'outline' },
      ]}
    >
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        <div style={{ flex: '0.6', minWidth: 0, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
          <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--color-border)', fontSize: '0.78rem', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon path={Icons['external-link']} size={12} /> Live Preview
          </div>
          <iframe
            key={previewKey}
            src={previewIframe}
            title="Theme Preview"
            style={{ width: '100%', height: 500, border: 'none', background: '#fff' }}
          />
        </div>

        <div style={{ flex: '0.4', minWidth: 360 }}>
          <div style={{ borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-border)' }}>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                    padding: '0.6rem 0.5rem', border: 'none', background: activeTab === tab.id ? 'var(--color-primary-subtle)' : 'none',
                    cursor: 'pointer', fontSize: '0.72rem', fontWeight: activeTab === tab.id ? 700 : 500,
                    color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    transition: 'background 0.2s',
                  }}
                >
                  <Icon path={tab.icon} size={12} /> {tab.label}
                </button>
              ))}
            </div>

            <div style={{ padding: '1.25rem', maxHeight: 460, overflowY: 'auto' }}>
              {activeTab === 'colors' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {COLOR_FIELDS.map(field => (
                    <div key={field.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="color" value={form.colors[field.key] || '#000000'}
                        onChange={(e) => updateColor(field.key, e.target.value)}
                        style={{ width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer', padding: 0 }} />
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text)', display: 'block' }}>{field.label}</label>
                        <input type="text" value={form.colors[field.key] || ''}
                          onChange={(e) => updateColor(field.key, e.target.value)}
                          style={{ width: '100%', border: '1px solid var(--color-border)', borderRadius: 4, padding: '0.2rem 0.4rem', fontSize: '0.72rem', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'monospace' }} />
                        {form.colors[field.key] && (
                          <button
                            onClick={() => updateColor(field.key, '')}
                            style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', display: 'flex' }}
                            title="Clear color"
                          >
                            <Icon path={Icons.x} size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div className="form-check">
                      <input type="checkbox" checked={form.darkMode?.enabled || false} onChange={(e) => setForm(prev => ({ ...prev, darkMode: { ...prev.darkMode, enabled: e.target.checked } }))} />
                      <label>Enable Dark Mode</label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'typography' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Font Family</label>
                    <input value={form.typography?.fontFamily || ''} onChange={(e) => updateTypography('fontFamily', e.target.value)} placeholder="Inter, sans-serif" />
                  </div>
                  <div className="form-group">
                    <label>Heading Font</label>
                    <input value={form.typography?.headingFont || ''} onChange={(e) => updateTypography('headingFont', e.target.value)} placeholder="Inter, sans-serif" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Heading Size (px)</label>
                      <input type="number" value={form.typography?.headingSize || 32} onChange={(e) => updateTypography('headingSize', parseInt(e.target.value) || 32)} />
                    </div>
                    <div className="form-group">
                      <label>Body Size (px)</label>
                      <input type="number" value={form.typography?.bodySize || 16} onChange={(e) => updateTypography('bodySize', parseInt(e.target.value) || 16)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Line Height</label>
                    <input type="number" step="0.1" value={form.typography?.lineHeight || 1.6} onChange={(e) => updateTypography('lineHeight', parseFloat(e.target.value) || 1.6)} />
                  </div>
                </div>
              )}

              {activeTab === 'layout' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Container Width (px)</label>
                    <input type="number" value={form.layout?.containerWidth || 1200} onChange={(e) => updateLayout('containerWidth', parseInt(e.target.value) || 1200)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Padding (px)</label>
                      <input type="number" value={form.layout?.padding || 16} onChange={(e) => updateLayout('padding', parseInt(e.target.value) || 16)} />
                    </div>
                    <div className="form-group">
                      <label>Gap (px)</label>
                      <input type="number" value={form.layout?.gap || 24} onChange={(e) => updateLayout('gap', parseInt(e.target.value) || 24)} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'buttons' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Border Radius (px)</label>
                      <input type="number" value={form.buttons?.borderRadius || 8} onChange={(e) => updateButtons('borderRadius', parseInt(e.target.value) || 8)} />
                    </div>
                    <div className="form-group">
                      <label>Padding</label>
                      <input value={form.buttons?.padding || '0.5rem 1rem'} onChange={(e) => updateButtons('padding', e.target.value)} placeholder="0.5rem 1rem" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Box Shadow</label>
                    <input value={form.buttons?.shadow || ''} onChange={(e) => updateButtons('shadow', e.target.value)} placeholder="0 2px 4px rgba(0,0,0,0.1)" />
                  </div>
                  <div className="form-check">
                    <input type="checkbox" checked={form.buttons?.hoverEffect !== false} onChange={(e) => updateButtons('hoverEffect', e.target.checked)} />
                    <label>Enable Hover Effect</label>
                  </div>
                </div>
              )}

              {activeTab === 'css' && (
                <div className="form-group">
                  <label>Custom CSS</label>
                  <textarea rows={12} value={form.customCSS || ''} onChange={(e) => setForm(prev => ({ ...prev, customCSS: e.target.value }))}
                    placeholder="/* Add your custom CSS here */"
                    style={{ fontFamily: 'monospace', fontSize: '0.78rem' }} />
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '1rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Saved Themes</h4>
              <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedTheme(null); setForm(INITIAL_FORM); setPreviewKey(k => k + 1); }}>
                <Icon path={Icons.plus} size={12} /> New
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {themes.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-tertiary)', textAlign: 'center', padding: '1rem' }}>No themes yet. Create one.</p>
              ) : (
                themes.map(theme => (
                  <div
                    key={theme._id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.6rem 0.75rem', borderRadius: 8, cursor: 'pointer',
                      background: selectedTheme?._id === theme._id ? 'var(--color-primary-subtle)' : 'transparent',
                      color: 'var(--color-text-secondary)', transition: 'background 0.15s',
                    }}
                    onClick={() => { setSelectedTheme(theme); setForm(theme); setPreviewKey(k => k + 1); }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 20, height: 20, borderRadius: 4, background: theme.colors?.primary || '#000' }} />
                      <span style={{ fontSize: '0.84rem', fontWeight: 500 }}>{theme.name || 'Unnamed Theme'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {theme.isActive && <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-success)', padding: '0.1rem 0.4rem', borderRadius: 4, background: 'var(--color-success-subtle)' }}>Active</span>}
                      <button className="btn-ghost btn-icon" style={{ width: 28, height: 28 }} onClick={(e) => { e.stopPropagation(); activateTheme(theme._id); }} title="Activate">
                        <Icon path={Icons.check} size={12} />
                      </button>
                      <button className="btn-ghost btn-icon" style={{ width: 28, height: 28 }} onClick={(e) => { e.stopPropagation(); duplicateTheme(theme._id); }} title="Duplicate">
                        <Icon path={Icons.copy} size={12} />
                      </button>
                      <button className="btn-ghost btn-icon" style={{ width: 28, height: 28, color: 'var(--color-danger)' }} onClick={(e) => { e.stopPropagation(); setDeleteTarget(theme); }} title="Delete">
                        <Icon path={Icons.trash2} size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Theme"
        message={`Delete "${deleteTarget?.name || 'this theme'}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />
    </PageLayout>
  );
}
