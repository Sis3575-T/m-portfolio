import React, { useState, useEffect, useRef } from 'react';
import { adminApi, imageUrl } from '../services/api';
import api from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';

const socialFields = [
  { key: 'github', label: 'GitHub', icon: Icons.github, placeholder: 'https://github.com/username' },
  { key: 'linkedin', label: 'LinkedIn', icon: Icons.linkedin, placeholder: 'https://linkedin.com/in/username' },
  { key: 'twitter', label: 'Twitter', icon: Icons.twitter, placeholder: 'https://twitter.com/username' },
  { key: 'telegram', label: 'Telegram', icon: Icons.send, placeholder: 'https://t.me/username' },
  { key: 'facebook', label: 'Facebook', icon: Icons['external-link'], placeholder: 'https://facebook.com/username' },
  { key: 'instagram', label: 'Instagram', icon: Icons['external-link'], placeholder: 'https://instagram.com/username' },
  { key: 'youtube', label: 'YouTube', icon: Icons['external-link'], placeholder: 'https://youtube.com/@username' },
  { key: 'medium', label: 'Medium', icon: Icons['external-link'], placeholder: 'https://medium.com/@username' },
  { key: 'stackoverflow', label: 'Stack Overflow', icon: Icons['external-link'], placeholder: 'https://stackoverflow.com/users/...' },
  { key: 'leetcode', label: 'LeetCode', icon: Icons.code, placeholder: 'https://leetcode.com/username' },
];

export default function ProfileManagement() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState({});
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', city: '', country: '',
    nationality: '', dateOfBirth: '', professionalTitle: '', shortBio: '',
    longBio: '', currentCompany: '', currentPosition: '',
    yearsOfExperience: '', freelanceAvailable: false,
    github: '', linkedin: '', twitter: '', telegram: '',
    facebook: '', instagram: '', youtube: '', medium: '',
    stackoverflow: '', leetcode: '',
    languages: '',
    siteTitle: '', siteDescription: '', footerText: '', copyrightText: '',
    seoTitle: '', seoDescription: '',
  });

  useEffect(() => {
    Promise.all([
      adminApi.getMe(),
      adminApi.getSettings(),
    ]).then(([userRes, settingsRes]) => {
      const user = userRes.data?.user || userRes.data || {};
      const s = settingsRes.data?.data || {};
      setProfile(user);
      setSettings(s);
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: s.phone || user.phone || '',
        address: s.address || user.address || '',
        city: user.city || '',
        country: user.country || '',
        nationality: user.nationality || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        professionalTitle: user.professionalTitle || s.siteDescription || '',
        shortBio: user.shortBio || s.siteDescription || '',
        longBio: user.longBio || '',
        currentCompany: user.currentCompany || '',
        currentPosition: user.currentPosition || '',
        yearsOfExperience: user.yearsOfExperience || '',
        freelanceAvailable: user.freelanceAvailable || false,
        github: s.github || user.github || '',
        linkedin: s.linkedin || user.linkedin || '',
        twitter: s.twitter || user.twitter || '',
        telegram: s.telegram || user.telegram || '',
        facebook: s.facebook || user.facebook || '',
        instagram: s.instagram || user.instagram || '',
        youtube: s.youtube || user.youtube || '',
        medium: s.medium || user.medium || '',
        stackoverflow: s.stackoverflow || user.stackoverflow || '',
        leetcode: s.leetcode || user.leetcode || '',
        languages: (user.languages || []).join(', '),
        siteTitle: s.siteTitle || '',
        siteDescription: s.siteDescription || '',
        footerText: s.footerText || '',
        copyrightText: s.copyrightText || '',
        seoTitle: s.seoTitle || '',
        seoDescription: s.seoDescription || '',
      });
    }).catch(() => toast.error('Failed to load profile'))
    .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.languages) {
        payload.languages = payload.languages.split(',').map(s => s.trim()).filter(Boolean).join(', ');
      }
      await api.put('/settings', payload);
      toast.success('Profile saved successfully');
    } catch (err) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const uploadPhoto = async (field, file) => {
    const fd = new FormData();
    fd.append('file', file);
    try {
      const { data } = await api.post('/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = data.data?.url || data.url || '';
      await api.put('/settings', { [field]: url });
      setForm(prev => ({ ...prev, [field]: url }));
      toast.success(`${field} updated`);
    } catch {
      toast.error('Upload failed');
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: Icons.user },
    { id: 'social', label: 'Social Media', icon: Icons['share-2'] },
    { id: 'settings', label: 'Site Settings', icon: Icons.settings },
  ];

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div><h1>Profile Management</h1><p>Manage your personal information and portfolio settings</p></div>
        </div>
        <div className="settings-section">
          <div className="skeleton" style={{ width: '60%', height: 24, marginBottom: 16 }} />
          <div className="skeleton" style={{ width: '100%', height: 48, marginBottom: 12 }} />
          <div className="skeleton" style={{ width: '100%', height: 48, marginBottom: 12 }} />
          <div className="skeleton" style={{ width: '100%', height: 100, marginBottom: 12 }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Profile Management</h1>
          <p>Manage your personal information, social links, and portfolio settings</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Icon path={Icons.save} size={16} /> {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 24 }}>
        {tabs.map(tab => (
          <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            <Icon path={tab.icon} size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'personal' && (
        <>
          <div className="settings-section">
            <h3>Profile Photo & Cover</h3>
            <p>Upload your profile and cover images</p>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 8, display: 'block' }}>Profile Photo</label>
                <div style={{ width: 120, height: 120, borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '2px solid var(--border)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
                  {form.profilePhoto ? (
                    <img src={imageUrl(form.profilePhoto)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Icon path={Icons.user} size={32} style={{ color: 'var(--gray-400)' }} />
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { if (e.target.files[0]) uploadPhoto('profilePhoto', e.target.files[0]); }} />
                <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => fileInputRef.current?.click()}>Change Photo</button>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 8, display: 'block' }}>Cover Photo</label>
                <div style={{ width: '100%', height: 140, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '2px solid var(--border)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => document.getElementById('coverInput')?.click()}>
                  {form.coverPhoto ? (
                    <img src={imageUrl(form.coverPhoto)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Icon path={Icons.image} size={32} style={{ color: 'var(--gray-400)' }} />
                  )}
                </div>
                <input id="coverInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { if (e.target.files[0]) uploadPhoto('coverPhoto', e.target.files[0]); }} />
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3>Basic Information</h3>
            <p>Your personal details</p>
            <div className="form-row">
              <div className="form-group"><label>Full Name</label><input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="John Doe" /></div>
              <div className="form-group"><label>Professional Title</label><input value={form.professionalTitle} onChange={(e) => setForm({...form, professionalTitle: e.target.value})} placeholder="Full Stack Developer" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="john@example.com" /></div>
              <div className="form-group"><label>Phone</label><input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="+1 234 567 890" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Address</label><input value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} placeholder="123 Main St" /></div>
              <div className="form-group"><label>City</label><input value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} placeholder="New York" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Country</label><input value={form.country} onChange={(e) => setForm({...form, country: e.target.value})} placeholder="USA" /></div>
              <div className="form-group"><label>Nationality</label><input value={form.nationality} onChange={(e) => setForm({...form, nationality: e.target.value})} placeholder="American" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Date of Birth</label><input type="date" value={form.dateOfBirth} onChange={(e) => setForm({...form, dateOfBirth: e.target.value})} /></div>
              <div className="form-group"><label>Years of Experience</label><input type="number" value={form.yearsOfExperience} onChange={(e) => setForm({...form, yearsOfExperience: e.target.value})} placeholder="5" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Current Company</label><input value={form.currentCompany} onChange={(e) => setForm({...form, currentCompany: e.target.value})} placeholder="Acme Corp" /></div>
              <div className="form-group"><label>Current Position</label><input value={form.currentPosition} onChange={(e) => setForm({...form, currentPosition: e.target.value})} placeholder="Senior Developer" /></div>
            </div>
            <div className="form-group"><label>Languages (comma-separated)</label><input value={form.languages} onChange={(e) => setForm({...form, languages: e.target.value})} placeholder="English, Spanish, French" /></div>
            <div className="form-group"><label>Short Biography</label><textarea value={form.shortBio} onChange={(e) => setForm({...form, shortBio: e.target.value})} placeholder="A brief introduction..." rows={3} /></div>
            <div className="form-group"><label>Full Biography</label><textarea value={form.longBio} onChange={(e) => setForm({...form, longBio: e.target.value})} placeholder="Detailed biography..." rows={6} /></div>
            <div className="form-check">
              <input type="checkbox" checked={form.freelanceAvailable} onChange={(e) => setForm({...form, freelanceAvailable: e.target.checked})} />
              <label>Available for freelance work</label>
            </div>
          </div>
        </>
      )}

      {activeTab === 'social' && (
        <div className="settings-section">
          <h3>Social Media Profiles</h3>
          <p>Connect your social media accounts</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {socialFields.map(field => (
              <div key={field.key} className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon path={field.icon} size={14} /> {field.label}
                </label>
                <input value={form[field.key] || ''} onChange={(e) => setForm({...form, [field.key]: e.target.value})} placeholder={field.placeholder} />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <>
          <div className="settings-section">
            <h3>Site Information</h3>
            <p>Basic information about your portfolio</p>
            <div className="form-row">
              <div className="form-group"><label>Site Title</label><input value={form.siteTitle} onChange={(e) => setForm({...form, siteTitle: e.target.value})} placeholder="My Portfolio" /></div>
              <div className="form-group"><label>Site Description</label><input value={form.siteDescription} onChange={(e) => setForm({...form, siteDescription: e.target.value})} placeholder="A brief description" /></div>
            </div>
            <div className="form-group"><label>Footer Text</label><input value={form.footerText} onChange={(e) => setForm({...form, footerText: e.target.value})} placeholder="Built with React & Node.js" /></div>
            <div className="form-group"><label>Copyright Text</label><input value={form.copyrightText} onChange={(e) => setForm({...form, copyrightText: e.target.value})} placeholder="© 2024 All rights reserved" /></div>
          </div>
          <div className="settings-section">
            <h3>SEO Configuration</h3>
            <p>Search engine optimization settings</p>
            <div className="form-group"><label>SEO Title</label><input value={form.seoTitle} onChange={(e) => setForm({...form, seoTitle: e.target.value})} placeholder="Portfolio of John Doe" /></div>
            <div className="form-group"><label>SEO Description</label><textarea value={form.seoDescription} onChange={(e) => setForm({...form, seoDescription: e.target.value})} placeholder="Meta description for search engines..." rows={3} /></div>
          </div>
        </>
      )}
    </div>
  );
}
