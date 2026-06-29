import React, { useState, useEffect, useRef } from 'react';
import { adminApi, imageUrl } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import type { Hero } from '../types';

export default function HeroManagement() {
  const [hero, setHero] = useState<Hero | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState('');
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([]);
  const [buttons, setButtons] = useState<{ label: string; url: string; variant: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    adminApi.getHero()
      .then(({ data }) => {
        const h = data.data;
        if (h) {
          setHero(h);
          setTitle(h.title || '');
          setSubtitle(h.subtitle || '');
          setDescription(h.description || '');
          setAvatar(h.avatar || '');
          setSocialLinks(h.socialLinks || []);
          setButtons(h.buttons || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('category', 'image');
      const { data: up } = await adminApi.uploadMedia(fd);
      if (up.success && up.data?.url) setAvatar(up.data.url);
    } catch (err) { console.error('Upload failed', err); }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('subtitle', subtitle);
      fd.append('description', description);
      fd.append('avatar', avatar);
      fd.append('socialLinks', JSON.stringify(socialLinks));
      fd.append('buttons', JSON.stringify(buttons));
      await adminApi.updateHero(fd);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error('Failed to save hero', err); }
    finally { setSaving(false); }
  };

  const addSocialLink = () => setSocialLinks([...socialLinks, { platform: '', url: '' }]);
  const updateSocialLink = (i: number, field: keyof typeof socialLinks[0], val: string) => {
    const copy = [...socialLinks];
    copy[i] = { ...copy[i], [field]: val };
    setSocialLinks(copy);
  };
  const removeSocialLink = (i: number) => setSocialLinks(socialLinks.filter((_, idx) => idx !== i));

  const addButton = () => setButtons([...buttons, { label: '', url: '', variant: 'primary' }]);
  const updateButton = (i: number, field: keyof typeof buttons[0], val: string) => {
    const copy = [...buttons];
    copy[i] = { ...copy[i], [field]: val };
    setButtons(copy);
  };
  const removeButton = (i: number) => setButtons(buttons.filter((_, idx) => idx !== i));

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Hero Section</h2>
          <p>Edit your portfolio hero section</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Icon path={Icons.save} size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {saved && (
        <div style={{ padding: '10px 16px', background: 'var(--success-light)', color: 'var(--success)', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 500, marginBottom: 16 }}>
          Hero section saved successfully!
        </div>
      )}

      <div className="settings-section">
        <h3>Content</h3>
        <p>Main hero section text content</p>
        <div className="form-group">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Hi, I'm John Doe" />
        </div>
        <div className="form-group">
          <label>Subtitle</label>
          <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="e.g. Full Stack Developer" />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." rows={3} />
        </div>
      </div>

      <div className="settings-section">
        <h3>Avatar</h3>
        <p>Profile photo or avatar image</p>
        <div className="image-upload-area">
          {avatar && (
            <div className="image-preview" style={{ width: 120, height: 120, borderRadius: 'var(--radius-lg)' }}>
              <img src={imageUrl(avatar)} alt="avatar" style={{ objectFit: 'cover' }} />
              <button className="remove-image" onClick={() => setAvatar('')}><Icon path={Icons.x} size={12} /></button>
            </div>
          )}
          <label className="image-upload-btn">
            <Icon path={Icons.upload} size={14} /> Upload Avatar
            <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3>Social Links</h3>
        <p>Social media profile links displayed in hero</p>
        {socialLinks.map((link, i) => (
          <div key={i} className="form-row" style={{ marginBottom: 10 }}>
            <div className="form-group">
              <label>Platform</label>
              <select value={link.platform} onChange={(e) => updateSocialLink(i, 'platform', e.target.value)}>
                <option value="">Select</option>
                <option value="github">GitHub</option>
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">Twitter</option>
                <option value="telegram">Telegram</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>
            <div className="form-group">
              <label>URL</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={link.url} onChange={(e) => updateSocialLink(i, 'url', e.target.value)} placeholder="https://" style={{ flex: 1 }} />
                <button className="btn btn-outline btn-sm" onClick={() => removeSocialLink(i)}><Icon path={Icons.x} size={14} /></button>
              </div>
            </div>
          </div>
        ))}
        <button className="btn btn-outline btn-sm" onClick={addSocialLink}>
          <Icon path={Icons.plus} size={14} /> Add Link
        </button>
      </div>

      <div className="settings-section">
        <h3>Buttons</h3>
        <p>Call-to-action buttons in hero</p>
        {buttons.map((btn, i) => (
          <div key={i} className="form-row-3" style={{ marginBottom: 10 }}>
            <div className="form-group">
              <label>Label</label>
              <input value={btn.label} onChange={(e) => updateButton(i, 'label', e.target.value)} placeholder="Get in Touch" />
            </div>
            <div className="form-group">
              <label>URL</label>
              <input value={btn.url} onChange={(e) => updateButton(i, 'url', e.target.value)} placeholder="https://" />
            </div>
            <div className="form-group">
              <label>Variant</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={btn.variant} onChange={(e) => updateButton(i, 'variant', e.target.value)}>
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="outline">Outline</option>
                </select>
                <button className="btn btn-outline btn-sm" onClick={() => removeButton(i)}><Icon path={Icons.x} size={14} /></button>
              </div>
            </div>
          </div>
        ))}
        <button className="btn btn-outline btn-sm" onClick={addButton}>
          <Icon path={Icons.plus} size={14} /> Add Button
        </button>
      </div>
    </div>
  );
}
