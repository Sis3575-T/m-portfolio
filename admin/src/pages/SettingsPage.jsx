import React, { useState, useEffect, useRef } from 'react';
import { adminApi, imageUrl } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import PageLayout from '../components/PageLayout';

const initialForm = {
  siteTitle: '', siteDescription: '', logo: '', favicon: '', language: 'en', timezone: 'UTC',
  contactEmail: '', contactPhone: '', address: '', mapLat: '', mapLng: '', contactFormEmail: '',
  github: '', linkedin: '', twitter: '', instagram: '', facebook: '',
  smtpHost: '', smtpPort: '587', smtpUser: '', smtpPass: '', smtpFrom: '',
  gaId: '', gtmId: '', fbPixel: '', recaptchaSiteKey: '', recaptchaSecretKey: '', cloudinaryCloud: '', cloudinaryKey: '', cloudinarySecret: '',
  seoTitle: '', seoDescription: '', cvUrl: '',
};

export default function SettingsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [form, setForm] = useState(initialForm);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getSettings();
      const s = data.data || data || {};
      setForm({
        siteTitle: s.siteTitle || '',
        siteDescription: s.siteDescription || '',
        logo: s.logo || '',
        favicon: s.favicon || '',
        language: s.language || 'en',
        timezone: s.timezone || 'UTC',
        contactEmail: s.contactEmail || s.email || '',
        contactPhone: s.contactPhone || s.phone || '',
        address: s.address || '',
        mapLat: s.mapLat || '',
        mapLng: s.mapLng || '',
        contactFormEmail: s.contactFormEmail || '',
        github: s.github || '',
        linkedin: s.linkedin || '',
        twitter: s.twitter || '',
        instagram: s.instagram || '',
        facebook: s.facebook || '',
        smtpHost: s.smtpHost || '',
        smtpPort: s.smtpPort || '587',
        smtpUser: s.smtpUser || '',
        smtpPass: s.smtpPass || '',
        smtpFrom: s.smtpFrom || '',
        gaId: s.gaId || '',
        gtmId: s.gtmId || '',
        fbPixel: s.fbPixel || '',
        recaptchaSiteKey: s.recaptchaSiteKey || '',
        recaptchaSecretKey: s.recaptchaSecretKey || '',
        cloudinaryCloud: s.cloudinaryCloud || '',
        cloudinaryKey: s.cloudinaryKey || '',
        cloudinarySecret: s.cloudinarySecret || '',
        seoTitle: s.seoTitle || '',
        seoDescription: s.seoDescription || '',
        cvUrl: s.cvUrl || '',
      });
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== undefined && val !== null) fd.append(key, val);
      });
      await adminApi.updateSettings(fd);
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast.error('Please fill in all fields'); return;
    }
    if (passwordForm.new.length < 8) { toast.error('New password must be at least 8 characters'); return; }
    if (passwordForm.new !== passwordForm.confirm) { toast.error('Passwords do not match'); return; }
    setChangingPassword(true);
    try {
      await adminApi.changePassword(passwordForm.current, passwordForm.new);
      toast.success('Password changed successfully');
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleFileUpload = async (field, file) => {
    const fd = new FormData();
    fd.append('file', file);
    try {
      const api = (await import('../services/api')).default;
      const { data } = await api.post('/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = data.data?.url || data.url || '';
      setForm(prev => ({ ...prev, [field]: url }));
      toast.success(`${field} updated`);
    } catch {
      toast.error('Upload failed');
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Icons.settings },
    { id: 'contact', label: 'Contact', icon: Icons.mail },
    { id: 'social', label: 'Social', icon: Icons.globe },
    { id: 'email', label: 'Email', icon: Icons.send },
    { id: 'integrations', label: 'Integrations', icon: Icons.code },
    { id: 'security', label: 'Security', icon: Icons.shield },
  ];

  const renderSection = (title, desc, children) => (
    <div style={{ padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 0.25rem' }}>{title}</h3>
      {desc && <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: '0 0 1rem' }}>{desc}</p>}
      {children}
    </div>
  );

  const renderField = (label, key, opts = {}) => (
    <div className="form-group" key={key}>
      <label>{label}</label>
      {opts.type === 'textarea' ? (
        <textarea rows={opts.rows || 3} value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={opts.placeholder} />
      ) : opts.type === 'select' ? (
        <select value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })}>
          {opts.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input type={opts.inputType || 'text'} value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={opts.placeholder} />
      )}
    </div>
  );

  if (loading) {
    return (
      <PageLayout title="Settings" description="Manage your portfolio configuration">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton" style={{ width: '100%', height: 48, borderRadius: 8, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
          ))}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Settings"
      description="Manage your portfolio configuration"
      quickActions={activeTab !== 'security' ? [
        { label: saving ? 'Saving...' : 'Save Settings', icon: Icons.save, onClick: handleSave, primary: true },
      ] : undefined}
    >
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: 0, flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem',
              border: 'none', borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
              background: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              transition: 'color 0.2s, border-color 0.2s',
            }}
          >
            <Icon path={tab.icon} size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {activeTab === 'general' && (
          <>
            {renderSection('Site Information', 'Basic information about your site', (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {renderField('Site Name', 'siteTitle', { placeholder: 'My Portfolio' })}
                  {renderField('Language', 'language', { type: 'select', options: [
                    { value: 'en', label: 'English' }, { value: 'es', label: 'Spanish' },
                    { value: 'fr', label: 'French' }, { value: 'de', label: 'German' },
                    { value: 'pt', label: 'Portuguese' },
                  ]})}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {renderField('Site Description', 'siteDescription', { placeholder: 'A brief description of your site' })}
                  {renderField('SEO Title', 'seoTitle', { placeholder: 'My Portfolio - Welcome' })}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {renderField('SEO Description', 'seoDescription', { type: 'textarea', rows: 2, placeholder: 'SEO meta description for search engines' })}
                  {renderField('CV/Resume URL', 'cvUrl', { placeholder: 'https://example.com/resume.pdf' })}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {renderField('Timezone', 'timezone', { type: 'select', options: [
                    { value: 'UTC', label: 'UTC' }, { value: 'America/New_York', label: 'America/New_York' },
                    { value: 'America/Chicago', label: 'America/Chicago' }, { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
                    { value: 'Europe/London', label: 'Europe/London' }, { value: 'Europe/Berlin', label: 'Europe/Berlin' },
                    { value: 'Asia/Tokyo', label: 'Asia/Tokyo' }, { value: 'Asia/Kolkata', label: 'Asia/Kolkata' },
                  ]})}
                </div>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem', display: 'block' }}>Logo</label>
                    <div
                      style={{ width: 120, height: 60, borderRadius: 8, overflow: 'hidden', border: '2px solid var(--color-border)', background: 'var(--color-bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      onClick={() => logoInputRef.current?.click()}
                    >
                      {form.logo ? <img src={imageUrl(form.logo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Icon path={Icons.image} size={24} style={{ color: 'var(--color-text-tertiary)' }} />}
                    </div>
                    <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && handleFileUpload('logo', e.target.files[0])} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem', display: 'block' }}>Favicon</label>
                    <div
                      style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', border: '2px solid var(--color-border)', background: 'var(--color-bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      onClick={() => faviconInputRef.current?.click()}
                    >
                      {form.favicon ? <img src={imageUrl(form.favicon)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Icon path={Icons.image} size={20} style={{ color: 'var(--color-text-tertiary)' }} />}
                    </div>
                    <input ref={faviconInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && handleFileUpload('favicon', e.target.files[0])} />
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === 'contact' && (
          <>
            {renderSection('Contact Information', 'Your contact details', (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {renderField('Contact Email', 'contactEmail', { placeholder: 'contact@example.com' })}
                  {renderField('Contact Phone', 'contactPhone', { placeholder: '+1 234 567 890' })}
                </div>
                {renderField('Address', 'address', { placeholder: '123 Main St, City, Country' })}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {renderField('Map Latitude', 'mapLat', { placeholder: '40.7128' })}
                  {renderField('Map Longitude', 'mapLng', { placeholder: '-74.0060' })}
                </div>
                {renderField('Contact Form Email', 'contactFormEmail', { placeholder: 'form-submissions@example.com' })}
              </div>
            ))}
          </>
        )}

        {activeTab === 'social' && (
          <>
            {renderSection('Social Media Links', 'Your social media profile URLs', (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {renderField('GitHub', 'github', { placeholder: 'https://github.com/username' })}
                {renderField('LinkedIn', 'linkedin', { placeholder: 'https://linkedin.com/in/username' })}
                {renderField('Twitter', 'twitter', { placeholder: 'https://twitter.com/username' })}
                {renderField('Instagram', 'instagram', { placeholder: 'https://instagram.com/username' })}
                {renderField('Facebook', 'facebook', { placeholder: 'https://facebook.com/username' })}
              </div>
            ))}
          </>
        )}

        {activeTab === 'email' && (
          <>
            {renderSection('SMTP Configuration', 'Email server settings', (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {renderField('SMTP Host', 'smtpHost', { placeholder: 'smtp.gmail.com' })}
                  {renderField('SMTP Port', 'smtpPort', { placeholder: '587' })}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {renderField('SMTP User', 'smtpUser', { placeholder: 'user@gmail.com' })}
                  {renderField('SMTP Password', 'smtpPass', { inputType: 'password', placeholder: 'Enter SMTP password' })}
                </div>
                {renderField('From Address', 'smtpFrom', { placeholder: 'noreply@example.com' })}
              </div>
            ))}
          </>
        )}

        {activeTab === 'integrations' && (
          <>
            {renderSection('Analytics & Integrations', 'Third-party service keys', (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {renderField('Google Analytics ID', 'gaId', { placeholder: 'G-XXXXXXXXXX' })}
                  {renderField('Google Tag Manager ID', 'gtmId', { placeholder: 'GTM-XXXXXXX' })}
                </div>
                {renderField('Facebook Pixel ID', 'fbPixel', { placeholder: 'XXXXXXXXXXXXXXXXX' })}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {renderField('reCAPTCHA Site Key', 'recaptchaSiteKey', { placeholder: '6Lc...' })}
                  {renderField('reCAPTCHA Secret Key', 'recaptchaSecretKey', { placeholder: '6Lc...' })}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {renderField('Cloudinary Cloud', 'cloudinaryCloud', { placeholder: 'mycloud' })}
                  {renderField('Cloudinary Key', 'cloudinaryKey', { placeholder: 'API Key' })}
                </div>
                {renderField('Cloudinary Secret', 'cloudinarySecret', { inputType: 'password', placeholder: 'API Secret' })}
              </div>
            ))}
          </>
        )}

        {activeTab === 'security' && (
          <>
            {renderSection('Account Security', 'Manage your admin account password and security settings', (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 1rem' }}>Change Password</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Current Password</label>
                        <input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} placeholder="Enter current password" />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label>New Password</label>
                          <input type="password" value={passwordForm.new} onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })} placeholder="Min 8 characters" />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label>Confirm Password</label>
                          <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} placeholder="Re-enter new password" />
                        </div>
                      </div>
                      <button className="btn btn-primary" onClick={handleChangePassword} disabled={changingPassword} style={{ alignSelf: 'flex-start' }}>
                        <Icon path={Icons.save} size={14} /> {changingPassword ? 'Changing...' : 'Change Password'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 1rem' }}>Password Requirements</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {[
                        { label: 'Minimum 8 characters', check: passwordForm.new.length >= 8 },
                        { label: 'Contains uppercase letter', check: /[A-Z]/.test(passwordForm.new) },
                        { label: 'Contains lowercase letter', check: /[a-z]/.test(passwordForm.new) },
                        { label: 'Contains a number', check: /\d/.test(passwordForm.new) },
                        { label: 'Contains a symbol', check: /[!@#$%^&*(),.?":{}|<>_]/.test(passwordForm.new) },
                        { label: 'Passwords match', check: passwordForm.new && passwordForm.new === passwordForm.confirm },
                      ].map((req, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.75rem', borderRadius: 8, background: req.check ? 'var(--color-success-subtle, #ecfdf5)' : 'var(--color-bg-subtle)', border: `1px solid ${req.check ? 'var(--color-success, #10b981)' : 'var(--color-border)'}`, transition: 'all 0.2s' }}>
                          <span style={{ color: req.check ? 'var(--color-success, #10b981)' : 'var(--color-text-tertiary)', fontSize: '1rem', lineHeight: 1 }}>
                            {req.check ? '✓' : '○'}
                          </span>
                          <span style={{ fontSize: '0.82rem', color: req.check ? 'var(--color-success, #10b981)' : 'var(--color-text-secondary)', fontWeight: req.check ? 600 : 400 }}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </PageLayout>
  );
}
