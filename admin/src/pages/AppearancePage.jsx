import React, { useState, useEffect, useRef } from 'react';
import { adminApi } from '../services/api';
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

const DEFAULT_THEME = {
  name: 'Default',
  colors: Object.fromEntries(COLOR_FIELDS.map(f => [f.key, '#000000'])),
  typography: { fontFamily: 'Inter, sans-serif', headingFont: 'Inter, sans-serif', bodySize: 16, headingSize: 32, lineHeight: 1.6 },
  layout: { containerWidth: 1200, padding: 16, gap: 24 },
  buttons: { borderRadius: 8, padding: '0.5rem 1rem', shadow: '0 2px 4px rgba(0,0,0,0.1)', hoverEffect: true },
  navbar: { height: 64, background: '#ffffff', text: '#1f2937', sticky: true },
  footer: { background: '#1f2937', text: '#f9fafb', padding: 48 },
  customCSS: '',
};

const TABS = [
  { id: 'colors', label: 'Colors', icon: 'M14 9l3-3m-3 3a3 3 0 11-6 0 3 3 0 016 0z M9 15l-3 3' },
  { id: 'typography', label: 'Typography', icon: 'M4 7V4h16v3M9 20h6M12 4v16' },
  { id: 'layout', label: 'Layout', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z' },
  { id: 'buttons', label: 'Buttons', icon: 'M12 4v16m4-16h-2M10 4H8' },
  { id: 'navbar', label: 'Navbar / Footer', icon: 'M4 16h16M4 20h16M4 2h16v12H4z' },
  { id: 'custom', label: 'Custom CSS', icon: 'M16 18l6-6-6-6 M8 6l-6 6 6 6' },
];

export default function AppearancePage() {
  const [activeTab, setActiveTab] = useState('colors');
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [savedTheme, setSavedTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const iframeRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    if (iframeRef.current && theme) {
      updatePreview();
    }
  }, [theme, activeTab]);

  const loadTheme = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/theme');
      if (res.data) {
        const merged = { ...DEFAULT_THEME, ...res.data };
        setTheme(merged);
        setSavedTheme(JSON.parse(JSON.stringify(merged)));
      }
    } catch {
      setTheme(DEFAULT_THEME);
    } finally {
      setLoading(false);
    }
  };

  const updatePreview = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head><style>
        :root {
          ${Object.entries(theme.colors).map(([k, v]) => `--${k}: ${v};`).join('\n')}
          --font-family: ${theme.typography.fontFamily};
          --heading-font: ${theme.typography.headingFont};
          --body-size: ${theme.typography.bodySize}px;
          --heading-size: ${theme.typography.headingSize}px;
          --line-height: ${theme.typography.lineHeight};
          --container-width: ${theme.layout.containerWidth}px;
          --padding: ${theme.layout.padding}px;
          --gap: ${theme.layout.gap}px;
          --btn-radius: ${theme.buttons.borderRadius}px;
          --btn-padding: ${theme.buttons.padding};
          --btn-shadow: ${theme.buttons.shadow};
          --navbar-height: ${theme.navbar.height}px;
          --navbar-bg: ${theme.navbar.background};
          --navbar-text: ${theme.navbar.text};
          --footer-bg: ${theme.footer.background};
          --footer-text: ${theme.footer.text};
          --footer-padding: ${theme.footer.padding}px;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: var(--font-family);
          font-size: var(--body-size);
          line-height: var(--line-height);
          background: var(--background);
          color: var(--text);
          padding: 20px;
        }
        h1, h2, h3 { font-family: var(--heading-font); color: var(--heading); }
        h1 { font-size: var(--heading-size); }
        .btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: var(--btn-padding); border-radius: var(--btn-radius);
          box-shadow: ${theme.buttons.hoverEffect ? 'var(--btn-shadow)' : 'none'};
          border: none; cursor: pointer; font-family: var(--font-family);
          transition: all 0.2s;
        }
        .btn-primary { background: var(--primary); color: #fff; }
        .btn-secondary { background: var(--secondary); color: #fff; }
        .btn-outline { background: transparent; border: 2px solid var(--primary); color: var(--primary); }
        .card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 8px; padding: 24px; margin: 16px 0;
        }
        nav { background: var(--navbar-bg); color: var(--navbar-text); height: var(--navbar-height); display: flex; align-items: center; padding: 0 20px; ${theme.navbar.sticky ? 'position: sticky; top: 0;' : ''} }
        footer { background: var(--footer-bg); color: var(--footer-text); padding: var(--footer-padding); text-align: center; }
        .container { max-width: var(--container-width); margin: 0 auto; padding: 0 var(--padding); }
        .grid { display: grid; gap: var(--gap); grid-template-columns: 1fr 1fr 1fr; }
        @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }
      </style></head>
      <body>
        <nav>Navbar</nav>
        <div class="container">
          <h1>Heading Level 1</h1>
          <h2>Heading Level 2</h2>
          <p style="margin:12px 0">Body text with <a href="#" style="color:var(--link)">a link</a>. This preview shows how your theme will look on the frontend.</p>
          <div class="grid">
            <div class="card"><h3>Card Title</h3><p>Card content with sample text.</p></div>
            <div class="card"><h3>Card Title</h3><p>Card content with sample text.</p></div>
            <div class="card"><h3>Card Title</h3><p>Card content with sample text.</p></div>
          </div>
          <div style="display:flex;gap:12px;margin:24px 0;flex-wrap:wrap">
            <button class="btn btn-primary">Primary Button</button>
            <button class="btn btn-secondary">Secondary Button</button>
            <button class="btn btn-outline">Outline Button</button>
          </div>
        </div>
        <footer>Footer Content</footer>
        ${theme.customCSS ? `<style>${theme.customCSS}</style>` : ''}
      </body>
      </html>
    `);
    doc.close();
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminApi.put('/theme', theme);
      setSavedTheme(JSON.parse(JSON.stringify(theme)));
      toast.success('Theme saved successfully');
    } catch {
      toast.error('Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setSaving(true);
      await adminApi.put('/theme', { ...theme, published: true });
      setSavedTheme(JSON.parse(JSON.stringify(theme)));
      toast.success('Theme published live');
      setConfirmPublish(false);
    } catch {
      toast.error('Failed to publish theme');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setTheme(JSON.parse(JSON.stringify(DEFAULT_THEME)));
    setConfirmReset(false);
    toast.info('Theme reset to defaults (not saved yet)');
  };

  const updateColor = (key, value) => {
    setTheme(prev => ({ ...prev, colors: { ...prev.colors, [key]: value } }));
  };

  const updateTypography = (key, value) => {
    setTheme(prev => ({ ...prev, typography: { ...prev.typography, [key]: value } }));
  };

  const updateLayout = (key, value) => {
    setTheme(prev => ({ ...prev, layout: { ...prev.layout, [key]: value } }));
  };

  const updateButtons = (key, value) => {
    setTheme(prev => ({ ...prev, buttons: { ...prev.buttons, [key]: value } }));
  };

  const updateNavbar = (key, value) => {
    setTheme(prev => ({ ...prev, navbar: { ...prev.navbar, [key]: value } }));
  };

  const updateFooter = (key, value) => {
    setTheme(prev => ({ ...prev, footer: { ...prev.footer, [key]: value } }));
  };

  const hasChanges = JSON.stringify(theme) !== JSON.stringify(savedTheme);

  if (loading) {
    return <PageLayout title="Appearance"><div className="loading-spinner" /></PageLayout>;
  }

  return (
    <PageLayout
      title="Appearance"
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={() => setConfirmReset(true)} disabled={saving}>
            <Icon path="M1 4v6h6" /> Reset
          </button>
          <button className="btn btn-secondary" onClick={handleSave} disabled={saving || !hasChanges}>
            <Icon path="M4 8v8h16V8l-4-4H8z M8 12h8 M12 8v4" /> {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button className="btn btn-primary" onClick={() => setConfirmPublish(true)} disabled={saving || !hasChanges}>
            <Icon path="M5 12h14M12 5l7 7-7 7" /> Publish
          </button>
        </div>
      }
    >
      <div className="appearance-layout">
        <div className="appearance-sidebar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`appearance-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon path={tab.icon} />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="appearance-main">
          <div className="appearance-form">
            {activeTab === 'colors' && (
              <div className="appearance-section">
                <h3>Color Palette</h3>
                <p className="text-muted">Customize the color scheme for your portfolio website.</p>
                <div className="color-grid">
                  {COLOR_FIELDS.map(field => (
                    <div key={field.key} className="color-field">
                      <label>{field.label}</label>
                      <div className="color-input-group">
                        <input
                          type="color"
                          value={theme.colors[field.key]}
                          onChange={e => updateColor(field.key, e.target.value)}
                        />
                        <input
                          type="text"
                          value={theme.colors[field.key]}
                          onChange={e => updateColor(field.key, e.target.value)}
                          className="color-hex"
                        />
                        {theme.colors[field.key] && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => updateColor(field.key, '')}
                            title="Clear color"
                          >
                            <Icon path={Icons.x} size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'typography' && (
              <div className="appearance-section">
                <h3>Typography Settings</h3>
                <p className="text-muted">Configure fonts, sizes, and spacing for all text elements.</p>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Body Font</label>
                    <input type="text" value={theme.typography.fontFamily} onChange={e => updateTypography('fontFamily', e.target.value)} placeholder="Inter, sans-serif" />
                  </div>
                  <div className="form-group">
                    <label>Heading Font</label>
                    <input type="text" value={theme.typography.headingFont} onChange={e => updateTypography('headingFont', e.target.value)} placeholder="Inter, sans-serif" />
                  </div>
                  <div className="form-group">
                    <label>Body Font Size (px)</label>
                    <input type="number" value={theme.typography.bodySize} onChange={e => updateTypography('bodySize', Number(e.target.value))} min={12} max={24} />
                  </div>
                  <div className="form-group">
                    <label>Heading Size (px)</label>
                    <input type="number" value={theme.typography.headingSize} onChange={e => updateTypography('headingSize', Number(e.target.value))} min={18} max={64} />
                  </div>
                  <div className="form-group">
                    <label>Line Height</label>
                    <input type="number" value={theme.typography.lineHeight} onChange={e => updateTypography('lineHeight', Number(e.target.value))} min={1} max={3} step={0.1} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'layout' && (
              <div className="appearance-section">
                <h3>Layout Settings</h3>
                <p className="text-muted">Control the overall page structure and spacing.</p>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Container Width (px)</label>
                    <input type="number" value={theme.layout.containerWidth} onChange={e => updateLayout('containerWidth', Number(e.target.value))} min={800} max={1600} step={20} />
                  </div>
                  <div className="form-group">
                    <label>Page Padding (px)</label>
                    <input type="number" value={theme.layout.padding} onChange={e => updateLayout('padding', Number(e.target.value))} min={0} max={64} />
                  </div>
                  <div className="form-group">
                    <label>Grid Gap (px)</label>
                    <input type="number" value={theme.layout.gap} onChange={e => updateLayout('gap', Number(e.target.value))} min={0} max={64} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'buttons' && (
              <div className="appearance-section">
                <h3>Button Styles</h3>
                <p className="text-muted">Customize the appearance of all buttons across the site.</p>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Border Radius (px)</label>
                    <input type="number" value={theme.buttons.borderRadius} onChange={e => updateButtons('borderRadius', Number(e.target.value))} min={0} max={32} />
                  </div>
                  <div className="form-group">
                    <label>Padding</label>
                    <input type="text" value={theme.buttons.padding} onChange={e => updateButtons('padding', e.target.value)} placeholder="0.5rem 1rem" />
                  </div>
                  <div className="form-group">
                    <label>Shadow</label>
                    <input type="text" value={theme.buttons.shadow} onChange={e => updateButtons('shadow', e.target.value)} placeholder="0 2px 4px rgba(0,0,0,0.1)" />
                  </div>
                  <div className="form-group checkbox-group">
                    <label>
                      <input type="checkbox" checked={theme.buttons.hoverEffect} onChange={e => updateButtons('hoverEffect', e.target.checked)} />
                      Enable hover effects
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'navbar' && (
              <div className="appearance-section">
                <h3>Navbar & Footer</h3>
                <p className="text-muted">Configure the top navigation bar and footer appearance.</p>
                <h4 style={{ margin: '16px 0 8px' }}>Navbar</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Height (px)</label>
                    <input type="number" value={theme.navbar.height} onChange={e => updateNavbar('height', Number(e.target.value))} min={40} max={100} />
                  </div>
                  <div className="form-group">
                    <label>Background</label>
                    <div className="color-input-group">
                      <input type="color" value={theme.navbar.background} onChange={e => updateNavbar('background', e.target.value)} />
                      <input type="text" value={theme.navbar.background} onChange={e => updateNavbar('background', e.target.value)} className="color-hex" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Text Color</label>
                    <div className="color-input-group">
                      <input type="color" value={theme.navbar.text} onChange={e => updateNavbar('text', e.target.value)} />
                      <input type="text" value={theme.navbar.text} onChange={e => updateNavbar('text', e.target.value)} className="color-hex" />
                    </div>
                  </div>
                  <div className="form-group checkbox-group">
                    <label>
                      <input type="checkbox" checked={theme.navbar.sticky} onChange={e => updateNavbar('sticky', e.target.checked)} />
                      Sticky navbar (fixed at top on scroll)
                    </label>
                  </div>
                </div>
                <h4 style={{ margin: '24px 0 8px' }}>Footer</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Background</label>
                    <div className="color-input-group">
                      <input type="color" value={theme.footer.background} onChange={e => updateFooter('background', e.target.value)} />
                      <input type="text" value={theme.footer.background} onChange={e => updateFooter('background', e.target.value)} className="color-hex" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Text Color</label>
                    <div className="color-input-group">
                      <input type="color" value={theme.footer.text} onChange={e => updateFooter('text', e.target.value)} />
                      <input type="text" value={theme.footer.text} onChange={e => updateFooter('text', e.target.value)} className="color-hex" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Padding (px)</label>
                    <input type="number" value={theme.footer.padding} onChange={e => updateFooter('padding', Number(e.target.value))} min={16} max={128} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'custom' && (
              <div className="appearance-section">
                <h3>Custom CSS</h3>
                <p className="text-muted">Add your own CSS rules to override or extend the theme.</p>
                <textarea
                  className="custom-css-editor"
                  value={theme.customCSS}
                  onChange={e => setTheme(prev => ({ ...prev, customCSS: e.target.value }))}
                  placeholder={`/* Add your custom CSS here */\n.my-class {\n  color: red;\n}`}
                  rows={20}
                />
              </div>
            )}
          </div>
          <div className="appearance-preview">
            <div className="preview-header">
              <Icon path="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              Live Preview
            </div>
            <iframe ref={iframeRef} title="Theme Preview" className="preview-iframe" />
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmPublish}
        onClose={() => setConfirmPublish(false)}
        onConfirm={handlePublish}
        title="Publish Theme"
        message="This will apply the current theme to your live portfolio website. Continue?"
        confirmLabel="Publish"
        confirmVariant="primary"
      />
      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={handleReset}
        title="Reset Theme"
        message="This will reset all theme settings to their default values. This change is not saved until you click Save or Publish."
        confirmLabel="Reset"
        confirmVariant="danger"
      />
    </PageLayout>
  );
}
