import React, { useState, useEffect, useCallback, useRef } from 'react';
import { adminApi } from '../services/api';
import { useToast } from './Toast';
import { Icons, Icon } from '../lib/icons';

const fontOptions = [
  { value: '', label: 'Default' },
  { value: "'Inter', sans-serif", label: 'Inter' },
  { value: "'Poppins', sans-serif", label: 'Poppins' },
  { value: "'Roboto', sans-serif", label: 'Roboto' },
  { value: "'Open Sans', sans-serif", label: 'Open Sans' },
  { value: "'Playfair Display', serif", label: 'Playfair Display' },
  { value: "'Merriweather', serif", label: 'Merriweather' },
  { value: "'Montserrat', sans-serif", label: 'Montserrat' },
  { value: "'Raleway', sans-serif", label: 'Raleway' },
  { value: "'Nunito', sans-serif", label: 'Nunito' },
  { value: "'Space Grotesk', sans-serif", label: 'Space Grotesk' },
  { value: "'DM Sans', sans-serif", label: 'DM Sans' },
];

const paddingOptions = [
  { value: 'none', label: 'None (0px)' },
  { value: 'small', label: 'Small (2rem)' },
  { value: 'medium', label: 'Medium (4rem)' },
  { value: 'large', label: 'Large (6rem)' },
  { value: 'xlarge', label: 'X-Large (8rem)' },
];

const defaultStyles = {
  bgColor: '',
  textColor: '',
  headingColor: '',
  accentColor: '',
  fontFamily: '',
  paddingY: 'medium',
  paddingX: 'medium',
  maxWidth: '',
  textAlign: '',
  borderRadius: '',
  customCss: '',
};

export default function SectionStyles({ sectionKey, label = 'Section Styles' }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [styles, setStyles] = useState(defaultStyles);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    loadStyles();
  }, [sectionKey]);

  const loadStyles = async () => {
    try {
      const res = await adminApi.getSettings();
      const settings = res.data?.data || res.data?.settings || {};
      const pageStyles = settings.pageStyles || {};
      setStyles({ ...defaultStyles, ...(pageStyles[sectionKey] || {}) });
      setLoaded(true);
    } catch {
      setStyles(defaultStyles);
      setLoaded(true);
    }
  };

  const saveStyles = useCallback(async (updated) => {
    setSaving(true);
    try {
      const res = await adminApi.getSettings();
      const current = res.data?.data || res.data?.settings || {};
      await adminApi.updateSettings({
        ...current,
        pageStyles: { ...(current.pageStyles || {}), [sectionKey]: updated },
      });
    } catch {
      toast.error('Failed to save styles');
    } finally {
      setSaving(false);
    }
  }, [sectionKey, toast]);

  const update = (key, value) => {
    const updated = { ...styles, [key]: value };
    setStyles(updated);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveStyles(updated), 600);
  };

  return (
    <div style={{ padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
          <Icon path={Icons.palette} size={16} style={{ marginRight: 8, verticalAlign: -2 }} />
          {label}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {saving && <span style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>Saving...</span>}
          <span style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'flex' }}>
            <Icon path={Icons['chevron-down']} size={16} />
          </span>
        </div>
      </div>

      {open && (
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Background Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="color" value={styles.bgColor || '#ffffff'} onChange={(e) => update('bgColor', e.target.value === '#ffffff' && !styles.bgColor ? '' : e.target.value)} style={{ width: 40, height: 36, padding: 2, borderRadius: 6, border: '1px solid var(--color-border)', cursor: 'pointer' }} />
              <input value={styles.bgColor} onChange={(e) => update('bgColor', e.target.value)} placeholder="#ffffff" style={{ flex: 1, fontSize: '0.82rem' }} />
              {styles.bgColor && <button className="btn btn-ghost btn-sm" onClick={() => update('bgColor', '')} style={{ padding: 4 }}><Icon path={Icons.x} size={12} /></button>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Text Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="color" value={styles.textColor || '#000000'} onChange={(e) => update('textColor', e.target.value === '#000000' && !styles.textColor ? '' : e.target.value)} style={{ width: 36, height: 32, padding: 1, borderRadius: 6, border: '1px solid var(--color-border)', cursor: 'pointer' }} />
                {styles.textColor && <button className="btn btn-ghost btn-sm" onClick={() => update('textColor', '')} style={{ padding: 2 }}><Icon path={Icons.x} size={10} /></button>}
              </div>
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Heading Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="color" value={styles.headingColor || '#000000'} onChange={(e) => update('headingColor', e.target.value === '#000000' && !styles.headingColor ? '' : e.target.value)} style={{ width: 36, height: 32, padding: 1, borderRadius: 6, border: '1px solid var(--color-border)', cursor: 'pointer' }} />
                {styles.headingColor && <button className="btn btn-ghost btn-sm" onClick={() => update('headingColor', '')} style={{ padding: 2 }}><Icon path={Icons.x} size={10} /></button>}
              </div>
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Accent Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="color" value={styles.accentColor || '#000000'} onChange={(e) => update('accentColor', e.target.value === '#000000' && !styles.accentColor ? '' : e.target.value)} style={{ width: 36, height: 32, padding: 1, borderRadius: 6, border: '1px solid var(--color-border)', cursor: 'pointer' }} />
                {styles.accentColor && <button className="btn btn-ghost btn-sm" onClick={() => update('accentColor', '')} style={{ padding: 2 }}><Icon path={Icons.x} size={10} /></button>}
              </div>
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Font Family</label>
              <select value={styles.fontFamily} onChange={(e) => update('fontFamily', e.target.value)} style={{ fontSize: '0.82rem' }}>
                {fontOptions.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Vertical Padding</label>
              <select value={styles.paddingY} onChange={(e) => update('paddingY', e.target.value)} style={{ fontSize: '0.82rem' }}>
                {paddingOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Max Width</label>
              <select value={styles.maxWidth} onChange={(e) => update('maxWidth', e.target.value)} style={{ fontSize: '0.82rem' }}>
                <option value="">Default</option>
                <option value="600px">Narrow (600px)</option>
                <option value="800px">Medium (800px)</option>
                <option value="1000px">Wide (1000px)</option>
                <option value="1140px">Full (1140px)</option>
                <option value="100%">Full Width</option>
              </select>
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Text Alignment</label>
              <select value={styles.textAlign} onChange={(e) => update('textAlign', e.target.value)} style={{ fontSize: '0.82rem' }}>
                <option value="">Default</option>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Border Radius</label>
              <select value={styles.borderRadius} onChange={(e) => update('borderRadius', e.target.value)} style={{ fontSize: '0.82rem' }}>
                <option value="">Default</option>
                <option value="0px">None</option>
                <option value="4px">Small</option>
                <option value="8px">Medium</option>
                <option value="12px">Large</option>
                <option value="16px">X-Large</option>
                <option value="50%">Round</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Custom CSS
              <span style={{ fontWeight: 400, fontSize: '0.72rem', color: 'var(--color-text-tertiary)', marginLeft: 8 }}>
                (applied to this section only)
              </span>
            </label>
            <textarea
              value={styles.customCss}
              onChange={(e) => update('customCss', e.target.value)}
              placeholder={`/* Override styles for this section */\n.hero { ... }\nor use the section's CSS class`}
              rows={6}
              style={{
                width: '100%',
                fontSize: '0.82rem',
                fontFamily: "'Fira Code', 'Consolas', monospace",
                padding: '0.6rem 0.75rem',
                borderRadius: 8,
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg)',
                color: 'var(--color-text)',
                resize: 'vertical',
                lineHeight: 1.5,
                tabSize: 2,
              }}
              spellCheck={false}
            />
          </div>

          {styles.customCss && (
            <div style={{ padding: '0.5rem 0.75rem', borderRadius: 8, background: 'var(--color-warning-light)', fontSize: '0.75rem', color: 'var(--color-warning)' }}>
              <Icon path={Icons['alert-triangle']} size={12} style={{ marginRight: 6, verticalAlign: -1 }} />
              Custom CSS is injected as a {'<style>'} tag in the section. Use the section's class name or data attribute to scope styles.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
