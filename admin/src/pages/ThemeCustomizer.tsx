import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import type { ThemeSettings } from '../types';

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

interface ThemePreset {
  name: string;
  colors: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    cardColor: string;
    textColor: string;
    borderColor: string;
  };
}

const themePresets: ThemePreset[] = [
  {
    name: 'Default',
    colors: {
      primaryColor: '#2563EB',
      secondaryColor: '#64748B',
      accentColor: '#F59E0B',
      backgroundColor: '#FFFFFF',
      cardColor: '#FFFFFF',
      textColor: '#0F172A',
      borderColor: '#E2E8F0',
    },
  },
  {
    name: 'Dark',
    colors: {
      primaryColor: '#3B82F6',
      secondaryColor: '#1E293B',
      accentColor: '#F59E0B',
      backgroundColor: '#0F172A',
      cardColor: '#1E293B',
      textColor: '#F1F5F9',
      borderColor: '#334155',
    },
  },
  {
    name: 'Forest',
    colors: {
      primaryColor: '#16A34A',
      secondaryColor: '#65A30D',
      accentColor: '#EAB308',
      backgroundColor: '#F0FDF4',
      cardColor: '#FFFFFF',
      textColor: '#166534',
      borderColor: '#BBF7D0',
    },
  },
  {
    name: 'Sunset',
    colors: {
      primaryColor: '#EA580C',
      secondaryColor: '#DC2626',
      accentColor: '#F59E0B',
      backgroundColor: '#FFF7ED',
      cardColor: '#FFFFFF',
      textColor: '#7C2D12',
      borderColor: '#FED7AA',
    },
  },
  {
    name: 'Ocean',
    colors: {
      primaryColor: '#0891B2',
      secondaryColor: '#0D9488',
      accentColor: '#06B6D4',
      backgroundColor: '#ECFEFF',
      cardColor: '#FFFFFF',
      textColor: '#164E63',
      borderColor: '#A5F3FC',
    },
  },
  {
    name: 'Minimal',
    colors: {
      primaryColor: '#6B7280',
      secondaryColor: '#9CA3AF',
      accentColor: '#374151',
      backgroundColor: '#F9FAFB',
      cardColor: '#FFFFFF',
      textColor: '#111827',
      borderColor: '#E5E7EB',
    },
  },
];

const darkThemeColors = {
  primaryColor: '#3B82F6',
  secondaryColor: '#1E293B',
  accentColor: '#F59E0B',
  backgroundColor: '#0F172A',
  cardColor: '#1E293B',
  textColor: '#F1F5F9',
  borderColor: '#334155',
};

export default function ThemeCustomizer() {
  const [theme, setTheme] = useState<ThemeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [darkPreview, setDarkPreview] = useState(false);

  useEffect(() => {
    adminApi.getTheme()
      .then(({ data }) => setTheme(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateTheme = async (updates: Partial<ThemeSettings>) => {
    if (!theme) return;
    const updated = { ...theme, ...updates };
    setTheme(updated);
    setSaving(true);
    try {
      await adminApi.updateTheme(updates);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) { console.error('Failed to update theme', err); }
    finally { setSaving(false); }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset theme to defaults?')) return;
    try {
      const { data } = await adminApi.resetTheme();
      setTheme(data.data);
      setDarkPreview(false);
    } catch (err) { console.error('Failed to reset theme', err); }
  };

  const applyPreset = (preset: ThemePreset) => {
    updateTheme(preset.colors);
    setDarkPreview(false);
  };

  const toggleDarkPreview = () => {
    if (darkPreview) {
      setDarkPreview(false);
      adminApi.getTheme().then(({ data }) => setTheme(data.data)).catch(console.error);
    } else {
      setTheme(prev => prev ? { ...prev, ...darkThemeColors } : null);
      setDarkPreview(true);
    }
  };

  const displayTheme = theme;

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

      <div className="settings-section" style={{ marginBottom: 20 }}>
        <h3>Theme Presets</h3>
        <p>Quickly apply a predefined color scheme</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {themePresets.map(preset => (
            <button
              key={preset.name}
              className="btn btn-outline btn-sm"
              onClick={() => applyPreset(preset)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span style={{
                width: 12, height: 12, borderRadius: '50%',
                background: preset.colors.primaryColor,
                border: '1px solid var(--border)',
                display: 'inline-block',
              }} />
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ marginBottom: 0 }}>Dark Mode Preview</h3>
            <p style={{ marginTop: 2 }}>Toggle to preview a dark color scheme</p>
          </div>
          <button
            className={`btn btn-sm ${darkPreview ? 'btn-primary' : 'btn-outline'}`}
            onClick={toggleDarkPreview}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Icon path={Icons[darkPreview ? 'sun' : 'moon']} size={16} />
            {darkPreview ? 'Light Mode' : 'Dark Mode'}
          </button>
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
                { label: 'Border Color', key: 'borderColor' },
              ] as const).map(({ label, key }) => (
                <div key={key}>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>{label}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="color"
                      value={displayTheme![key as keyof ThemeSettings] as string || '#000000'}
                      onChange={(e) => updateTheme({ [key]: e.target.value })}
                      style={{ width: 40, height: 40, border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', padding: 0 }}
                    />
                    <input
                      value={displayTheme![key as keyof ThemeSettings] as string || ''}
                      onChange={(e) => updateTheme({ [key]: e.target.value })}
                      placeholder="#000000"
                      style={{ flex: 1, padding: '7px 10px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 13, fontFamily: 'var(--font-mono)' }}
                    />
                    <div className="color-picker-grid">
                      {presetColors.map(c => (
                        <div
                          key={c}
                          className={`color-swatch${displayTheme![key as keyof ThemeSettings] === c ? ' selected' : ''}`}
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
              <select value={displayTheme!.fontFamily} onChange={(e) => updateTheme({ fontFamily: e.target.value })}>
                {fontOptions.map(f => <option key={f} value={f}>{f.split(',')[0]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Heading Font</label>
              <select value={displayTheme!.headingFont} onChange={(e) => updateTheme({ headingFont: e.target.value })}>
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
                {(['rounded', 'flat', 'pill'] as const).map(s => (
                  <button key={s} className={`btn ${displayTheme!.buttonStyle === s ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => updateTheme({ buttonStyle: s })}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Card Style</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['bordered', 'shadow', 'flat'] as const).map(s => (
                  <button key={s} className={`btn ${displayTheme!.cardStyle === s ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => updateTheme({ cardStyle: s })}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Header Style</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['fixed', 'static', 'sticky'] as const).map(s => (
                  <button key={s} className={`btn ${displayTheme!.headerStyle === s ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => updateTheme({ headerStyle: s })}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Footer Style</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['dark', 'light', 'accent'] as const).map(s => (
                  <button key={s} className={`btn ${displayTheme!.footerStyle === s ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => updateTheme({ footerStyle: s })}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3>Effects</h3>
            <p>Border radius, shadow, and border settings</p>
            <div className="form-group">
              <label>Border Radius: {displayTheme!.borderRadius ?? 8}px</label>
              <input
                type="range"
                min="0"
                max="32"
                value={displayTheme!.borderRadius ?? 8}
                onChange={(e) => updateTheme({ borderRadius: parseInt(e.target.value) })}
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
                <span>0px</span>
                <span>32px</span>
              </div>
            </div>
            <div className="form-group">
              <label>Shadow Intensity: {displayTheme!.shadowIntensity ?? 5}</label>
              <input
                type="range"
                min="0"
                max="20"
                value={displayTheme!.shadowIntensity ?? 5}
                onChange={(e) => updateTheme({ shadowIntensity: parseInt(e.target.value) })}
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
                <span>None</span>
                <span>Strong</span>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3>Live Preview</h3>
            <p>See how your theme looks</p>
            <div className="theme-preview">
              <div className="theme-preview-header" style={{
                background: displayTheme!.backgroundColor || '#ffffff',
                color: displayTheme!.textColor || '#000000',
                borderBottom: `1px solid ${displayTheme!.borderColor || displayTheme!.secondaryColor || '#e2e8f0'}`,
                borderRadius: `${(displayTheme!.borderRadius ?? 8)}px ${(displayTheme!.borderRadius ?? 8)}px 0 0`,
              }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>Portfolio</span>
                <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                  <span>Home</span>
                  <span>Projects</span>
                  <span>Contact</span>
                </div>
              </div>
              <div className="theme-preview-body" style={{
                background: displayTheme!.backgroundColor || '#ffffff',
                borderRadius: `0 0 ${(displayTheme!.borderRadius ?? 8)}px ${(displayTheme!.borderRadius ?? 8)}px`,
              }}>
                <div style={{
                  padding: 20,
                  background: displayTheme!.cardColor || '#ffffff',
                  borderRadius: displayTheme!.borderRadius ?? 8,
                  border: `1px solid ${displayTheme!.borderColor || displayTheme!.secondaryColor || '#e2e8f0'}`,
                  boxShadow: (displayTheme!.shadowIntensity ?? 5) > 0
                    ? `0 ${Math.min(4, (displayTheme!.shadowIntensity ?? 5))}px ${Math.min(12, (displayTheme!.shadowIntensity ?? 5) * 2)}px rgba(0,0,0,${Math.min(0.15, ((displayTheme!.shadowIntensity ?? 5) / 20) * 0.15)})`
                    : 'none',
                  marginBottom: 16,
                }}>
                  <h3 style={{ color: displayTheme!.textColor || '#000000', marginBottom: 8, fontFamily: displayTheme!.headingFont }}>Sample Heading</h3>
                  <p style={{ color: displayTheme!.textColor || '#000000', fontFamily: displayTheme!.fontFamily, fontSize: 13, lineHeight: 1.6 }}>
                    This is a preview of how your content will look with the current theme settings.
                  </p>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button className={`btn btn-sm ${displayTheme!.buttonStyle === 'pill' ? 'btn-primary' : 'btn-primary'}`} style={{ borderRadius: displayTheme!.buttonStyle === 'rounded' ? displayTheme!.borderRadius ?? 8 : displayTheme!.buttonStyle === 'pill' ? 20 : 0 }}>
                      Primary Button
                    </button>
                    <button className="btn btn-sm btn-outline" style={{ borderRadius: displayTheme!.buttonStyle === 'rounded' ? displayTheme!.borderRadius ?? 8 : displayTheme!.buttonStyle === 'pill' ? 20 : 0 }}>
                      Secondary
                    </button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[1, 2].map(i => (
                    <div key={i} style={{
                      padding: 16,
                      background: displayTheme!.cardColor || '#ffffff',
                      borderRadius: displayTheme!.borderRadius ?? 8,
                      border: `1px solid ${displayTheme!.borderColor || displayTheme!.secondaryColor || '#e2e8f0'}`,
                      boxShadow: (displayTheme!.shadowIntensity ?? 5) > 0
                        ? `0 ${Math.min(4, (displayTheme!.shadowIntensity ?? 5))}px ${Math.min(12, (displayTheme!.shadowIntensity ?? 5) * 2)}px rgba(0,0,0,${Math.min(0.15, ((displayTheme!.shadowIntensity ?? 5) / 20) * 0.15)})`
                        : 'none',
                    }}>
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
    </div>
  );
}
