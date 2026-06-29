import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';

export default function SettingsPage({ onNavigate }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    siteTitle: '', siteDescription: '', email: '',
    github: '', linkedin: '', twitter: '', telegram: '',
    seoTitle: '', seoDescription: '', footerText: '', copyrightText: '',
    phone: '', address: '',
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
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, val]) => { payload.append(key, val); });
      await adminApi.updateSettings(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error('Failed to save settings', err); }
    finally { setSaving(false); }
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
      </div>

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

      <div className="settings-section">
        <h3>Account</h3>
        <p>Manage your admin account</p>
        <button className="btn btn-outline" onClick={() => onNavigate?.('password')}>
          Change Password
        </button>
      </div>
    </div>
  );
}
