import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';

const presetColors = [
  '#0F766E', '#2563EB', '#7C3AED', '#DC2626', '#D97706',
  '#16A34A', '#EC4899', '#6366F1', '#F97316', '#14B8A6',
];

const fontOptions = [
  'Inter, sans-serif',
  'Roboto, sans-serif',
  'Poppins, sans-serif',
  'Playfair Display, serif',
  'Montserrat, sans-serif',
  'Open Sans, sans-serif',
  'Lato, sans-serif',
  'Merriweather, serif',
];

export default function ThemeCustomizer() {
  const toast = useToast();
  const [resetTarget, setResetTarget] = useState(false);
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminApi.getTheme()
      .then(({ data }) => setTheme(data.data))
      .catch(() => toast.error('Failed to load theme'))
      .finally(() => setLoading(false));
  }, []);

  const updateTheme = async (updates) => {
    if (!theme) return;
    const updated = { ...theme, ...updates };
    setTheme(updated);
    setSaving(true);
    try {
      await adminApi.updateTheme(updates);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { toast.error('Failed to update theme'); }
    finally { setSaving(false); }
  };

  const handleReset = async () => {
    try {
      const { data } = await adminApi.resetTheme();
      setTheme(data.data);
      toast.success('Theme reset to defaults');
    } catch { toast.error('Failed to reset theme'); }
    finally { setResetTarget(false); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>;
  if (!theme) return <div className="placeholder-page"><p>No theme data available</p></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Theme Customizer</h2>
          <p>Customize your portfolio appearance</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={handleReset}>
            <Icon path={Icons['refresh-cw']} size={16} /> Reset
          </button>
          {saving && <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Saving...</span>}
          {saved && <span style={{ fontSize: 12, color: 'var(--success)' }}>Saved!</span>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <div className="settings-section">
            <h3>Colors</h3>
            <p>Primary, secondary, and accent colors</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {([
                { label: 'Primary Color', key: 'primaryColor' },
                { label: 'Secondary Color', key: 'secondaryColor' },
                { label: 'Accent Color', key: 'accentColor' },
                { label: 'Background Color', key: 'backgroundColor' },
                { label: 'Card Color', key: 'cardColor' },
                { label: 'Text Color', key: 'textColor' },
              ]).map(({ label, key }) => (
                <div key={key}>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>{label}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="color"
                      value={theme[key] || '#000000'}
                      onChange={(e) => updateTheme({ [key]: e.target.value })}
                      style={{ width: 40, height: 40, border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', padding: 0 }}
                    />
                    <input
                      value={theme[key] || ''}
                      onChange={(e) => updateTheme({ [key]: e.target.value })}
                      placeholder="#000000"
                      style={{ flex: 1, padding: '7px 10px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 13, fontFamily: 'var(--font-mono)' }}
                    />
                    <div className="color-picker-grid">
                      {presetColors.map(c => (
                        <div
                          key={c}
                          className={`color-swatch${theme[key] === c ? ' selected' : ''}`}
                          style={{ background: c }}
                          onClick={() => updateTheme({ [key]: c })}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="settings-section">
            <h3>Fonts</h3>
            <p>Choose heading and body fonts</p>
            <div className="form-group">
              <label>Body Font</label>
              <select value={theme.fontFamily} onChange={(e) => updateTheme({ fontFamily: e.target.value })}>
                {fontOptions.map(f => <option key={f} value={f}>{f.split(',')[0]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Heading Font</label>
              <select value={theme.headingFont} onChange={(e) => updateTheme({ headingFont: e.target.value })}>
                {fontOptions.map(f => <option key={f} value={f}>{f.split(',')[0]}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div>
          <div className="settings-section">
            <h3>Style Settings</h3>
            <p>Component style preferences</p>
            <div className="form-group">
              <label>Button Style</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['rounded', 'flat', 'pill']).map(s => (
                  <button key={s} className={`btn ${theme.buttonStyle === s ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => updateTheme({ buttonStyle: s })}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Card Style</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['bordered', 'shadow', 'flat']).map(s => (
                  <button key={s} className={`btn ${theme.cardStyle === s ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => updateTheme({ cardStyle: s })}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Header Style</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['fixed', 'static', 'sticky']).map(s => (
                  <button key={s} className={`btn ${theme.headerStyle === s ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => updateTheme({ headerStyle: s })}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Footer Style</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['dark', 'light', 'accent']).map(s => (
                  <button key={s} className={`btn ${theme.footerStyle === s ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => updateTheme({ footerStyle: s })}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3>Live Preview</h3>
            <p>See how your theme looks</p>
            <div className="theme-preview">
              <div className="theme-preview-header" style={{ background: theme.backgroundColor || '#ffffff', color: theme.textColor || '#000000', borderBottom: `1px solid ${theme.secondaryColor || '#e2e8f0'}` }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>Portfolio</span>
                <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                  <span>Home</span>
                  <span>Projects</span>
                  <span>Contact</span>
                </div>
              </div>
              <div className="theme-preview-body" style={{ background: theme.backgroundColor || '#ffffff' }}>
                <div style={{ padding: 20, background: theme.cardColor || '#ffffff', borderRadius: 8, border: `1px solid ${theme.secondaryColor || '#e2e8f0'}`, marginBottom: 16 }}>
                  <h3 style={{ color: theme.textColor || '#000000', marginBottom: 8, fontFamily: theme.headingFont }}>Sample Heading</h3>
                  <p style={{ color: theme.textColor || '#000000', fontFamily: theme.fontFamily, fontSize: 13, lineHeight: 1.6 }}>
                    This is a preview of how your content will look with the current theme settings.
                  </p>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button className={`btn btn-sm ${theme.buttonStyle === 'pill' ? 'btn-primary' : 'btn-primary'}`} style={{ borderRadius: theme.buttonStyle === 'rounded' ? 'var(--radius)' : theme.buttonStyle === 'pill' ? '20px' : '0' }}>
                      Primary Button
                    </button>
                    <button className="btn btn-sm btn-outline" style={{ borderRadius: theme.buttonStyle === 'rounded' ? 'var(--radius)' : theme.buttonStyle === 'pill' ? '20px' : '0' }}>
                      Secondary
                    </button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[1, 2].map(i => (
                    <div key={i} style={{ padding: 16, background: theme.cardColor || '#ffffff', borderRadius: 8, border: `1px solid ${theme.secondaryColor || '#e2e8f0'}` }}>
                      <div style={{ height: 80, background: 'var(--bg)', borderRadius: 4, marginBottom: 8 }} />
                      <div style={{ height: 12, width: '60%', background: 'var(--bg)', borderRadius: 4, marginBottom: 4 }} />
                      <div style={{ height: 12, width: '40%', background: 'var(--bg)', borderRadius: 4 }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={resetTarget}
        onClose={() => setResetTarget(false)}
        onConfirm={handleReset}
        title="Reset Theme"
        message="Reset theme to default values? All your customizations will be lost."
        confirmText="Reset"
        type="danger"
      />
    </div>
  );
}
