import React, { useState, useEffect, useRef } from 'react';
import { adminApi, imageUrl } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import type { Setting } from '../types';

interface SettingsForm {
  siteTitle: string;
  siteDescription: string;
  email: string;
  github: string;
  linkedin: string;
  twitter: string;
  telegram: string;
  seoTitle: string;
  seoDescription: string;
  footerText: string;
  copyrightText: string;
  phone: string;
  address: string;
  maintenanceMode: boolean;
  language: string;
}

type TabId = 'general' | 'social' | 'seo' | 'advanced';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'general', label: 'General', icon: Icons.settings },
  { id: 'social', label: 'Social Links', icon: Icons.link-2 },
  { id: 'seo', label: 'SEO', icon: Icons.globe },
  { id: 'advanced', label: 'Advanced', icon: Icons.shield },
];

export default function SettingsPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [settings, setSettings] = useState<Setting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [faviconPreview, setFaviconPreview] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);

  const apiKey = (() => {
    try { return localStorage.getItem('admin_token') || ''; } catch { return ''; }
  })();

  const [form, setForm] = useState<SettingsForm>({
    siteTitle: '', siteDescription: '', email: '',
    github: '', linkedin: '', twitter: '', telegram: '',
    seoTitle: '', seoDescription: '', footerText: '', copyrightText: '',
    phone: '', address: '',
    maintenanceMode: false,
    language: 'en',
  });

  useEffect(() => {
    adminApi.getSettings()
      .then(({ data }) => {
        const s = data.data || {};
        setSettings(s);
        setForm({
          siteTitle: s.siteTitle || '',
          siteDescription: s.siteDescription || '',
          email: s.email || '',
          github: s.github || '',
          linkedin: s.linkedin || '',
          twitter: s.twitter || '',
          telegram: s.telegram || '',
          seoTitle: s.seoTitle || '',
          seoDescription: s.seoDescription || '',
          footerText: s.footerText || '',
          copyrightText: s.copyrightText || '',
          phone: s.phone || '',
          address: s.address || '',
          maintenanceMode: !!s.maintenanceMode,
          language: s.language || 'en',
        });
        setLogoPreview(imageUrl(s.logo));
        setFaviconPreview(imageUrl(s.favicon));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFaviconFile(file);
    setFaviconPreview(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    if (logoRef.current) logoRef.current.value = '';
  };

  const removeFavicon = () => {
    setFaviconFile(null);
    setFaviconPreview('');
    if (faviconRef.current) faviconRef.current.value = '';
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        payload.append(key, String(val));
      });
      if (logoFile) payload.append('logo', logoFile);
      if (faviconFile) payload.append('favicon', faviconFile);
      if (!logoFile && !logoPreview) payload.append('removeLogo', 'true');
      if (!faviconFile && !faviconPreview) payload.append('removeFavicon', 'true');
      await adminApi.updateSettings(payload);
      setSaved(true);
      setSettings(prev => prev ? { ...prev, ...form } : prev);
      setLogoFile(null);
      setFaviconFile(null);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error('Failed to save settings', err); }
    finally { setSaving(false); }
  };

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Settings</h2>
          <p>Manage your portfolio configuration</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Icon path={Icons.save} size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {saved && (
        <div style={{ padding: '10px 16px', background: 'var(--success-light)', color: 'var(--success)', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 500, marginBottom: 16 }}>
          Settings saved successfully!
        </div>
      )}

      <div className="tabs" style={{ marginBottom: 24 }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <Icon path={tab.icon} size={13} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <>
          <div className="settings-section">
            <h3>Logo</h3>
            <p>Upload your site logo (image will be displayed in the header)</p>
            <div className="image-upload-area">
              {logoPreview && (
                <div className="image-preview" style={{ width: 140, height: 80 }}>
                  <img src={logoPreview} alt="Logo preview" />
                  <button className="remove-image" onClick={removeLogo} type="button">
                    <Icon path={Icons.x} size={12} />
                  </button>
                </div>
              )}
              <input
                ref={logoRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                style={{ display: 'none' }}
              />
              <button className="image-upload-btn" onClick={() => logoRef.current?.click()} type="button">
                <Icon path={Icons.upload} size={14} /> {logoPreview ? 'Change Logo' : 'Upload Logo'}
              </button>
            </div>
          </div>

          <div className="settings-section">
            <h3>Favicon</h3>
            <p>Upload your site favicon (accepts .ico, .png, .svg)</p>
            <div className="image-upload-area">
              {faviconPreview && (
                <div className="image-preview" style={{ width: 48, height: 48, borderRadius: 8 }}>
                  <img src={faviconPreview} alt="Favicon preview" style={{ objectFit: 'contain', padding: 4 }} />
                  <button className="remove-image" onClick={removeFavicon} type="button">
                    <Icon path={Icons.x} size={12} />
                  </button>
                </div>
              )}
              <input
                ref={faviconRef}
                type="file"
                accept=".ico,.png,.svg,image/x-icon,image/png,image/svg+xml"
                onChange={handleFaviconChange}
                style={{ display: 'none' }}
              />
              <button className="image-upload-btn" onClick={() => faviconRef.current?.click()} type="button">
                <Icon path={Icons.upload} size={14} /> {faviconPreview ? 'Change Favicon' : 'Upload Favicon'}
              </button>
            </div>
          </div>

          <div className="settings-section">
            <h3>General Information</h3>
            <p>Basic information about your portfolio site</p>
            <div className="form-row">
              <div className="form-group">
                <label>Site Title</label>
                <input value={form.siteTitle} onChange={(e) => setForm({ ...form, siteTitle: e.target.value })} placeholder="My Portfolio" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@example.com" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 890" />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="City, Country" />
              </div>
            </div>
            <div className="form-group">
              <label>Site Description</label>
              <textarea value={form.siteDescription} onChange={(e) => setForm({ ...form, siteDescription: e.target.value })} placeholder="A brief description of your portfolio..." rows={3} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Language</label>
                <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                  <option value="en">English</option>
                  <option value="am">አማርኛ (Amharic)</option>
                </select>
              </div>
              <div className="form-group" />
            </div>
          </div>

          <div className="settings-section">
            <h3>Footer</h3>
            <p>Footer text and copyright information</p>
            <div className="form-group">
              <label>Footer Text</label>
              <input value={form.footerText} onChange={(e) => setForm({ ...form, footerText: e.target.value })} placeholder="Built with React & Node.js" />
            </div>
            <div className="form-group">
              <label>Copyright Text</label>
              <input value={form.copyrightText} onChange={(e) => setForm({ ...form, copyrightText: e.target.value })} placeholder="© 2024 All rights reserved" />
            </div>
          </div>
        </>
      )}

      {activeTab === 'social' && (
        <div className="settings-section">
          <h3>Social Media Links</h3>
          <p>Add your social media profile URLs</p>
          <div className="form-group">
            <label>GitHub</label>
            <input value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} placeholder="https://github.com/username" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>LinkedIn</label>
              <input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/in/username" />
            </div>
            <div className="form-group">
              <label>Twitter</label>
              <input value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} placeholder="https://twitter.com/username" />
            </div>
          </div>
          <div className="form-group">
            <label>Telegram</label>
            <input value={form.telegram} onChange={(e) => setForm({ ...form, telegram: e.target.value })} placeholder="https://t.me/username" />
          </div>
        </div>
      )}

      {activeTab === 'seo' && (
        <div className="settings-section">
          <h3>SEO Settings</h3>
          <p>Search engine optimization configuration</p>
          <div className="form-group">
            <label>SEO Title</label>
            <input value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} placeholder="Portfolio of John Doe" />
          </div>
          <div className="form-group">
            <label>SEO Description</label>
            <textarea value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} placeholder="A brief description for search engines..." rows={2} />
          </div>
        </div>
      )}

      {activeTab === 'advanced' && (
        <>
          <div className="settings-section">
            <h3>Maintenance Mode</h3>
            <p>When enabled, visitors will see a maintenance page instead of your portfolio</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: form.maintenanceMode ? 12 : 0 }}>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={form.maintenanceMode}
                  onChange={(e) => setForm({ ...form, maintenanceMode: e.target.checked })}
                />
                <span className="toggle-slider" />
              </label>
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>
                {form.maintenanceMode ? 'Maintenance mode is active' : 'Maintenance mode is off'}
              </span>
            </div>
            {form.maintenanceMode && (
              <div>
                <span className="badge badge-warning" style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Icon path={Icons['alert-triangle']} size={13} />
                  Your portfolio is currently in maintenance mode — visitors cannot access it
                </span>
              </div>
            )}
          </div>

          <div className="settings-section">
            <h3>API Key</h3>
            <p>Your authentication token for API access</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  value={apiKey ? `${apiKey.substring(0, 48)}...` : 'No token available'}
                  readOnly
                  style={{ fontFamily: 'monospace', fontSize: 12, paddingRight: 40, color: 'var(--text-secondary)', background: 'var(--bg)' }}
                />
              </div>
              <button
                className="btn btn-outline"
                onClick={handleCopyKey}
                style={{ flexShrink: 0, gap: 6 }}
                title="Copy API key"
              >
                <Icon path={copied ? Icons.check : Icons.copy} size={14} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="form-help">This is your personal access token. Keep it private — do not share it publicly.</p>
          </div>

          <div className="settings-section">
            <h3>Language</h3>
            <p>Default language for your portfolio site</p>
            <div className="form-group">
              <label>Default Language</label>
              <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                <option value="en">English</option>
                <option value="am">አማርኛ (Amharic)</option>
              </select>
            </div>
          </div>

          <div className="settings-section">
            <h3>Account</h3>
            <p>Manage your admin account</p>
            <button className="btn btn-outline" onClick={() => onNavigate?.('password')}>
              Change Password
            </button>
          </div>
        </>
      )}
    </div>
  );
}
