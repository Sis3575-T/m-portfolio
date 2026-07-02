import React, { useState, useEffect, useRef } from 'react';
import { adminApi, imageUrl } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import PageLayout from '../components/PageLayout';
import SectionStyles from '../components/SectionStyles';

export default function HeroManagement() {
  const toast = useToast();
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const avatarInputRef = useRef(null);
  const bgInputRef = useRef(null);
  const [form, setForm] = useState({
    name: '', title: '', shortBio: '',
    avatar: '', avatarFile: null,
    backgroundImage: '', backgroundFile: null,
    socialLinks: [{ platform: '', url: '' }],
    ctaButtons: [{ label: '', url: '' }],
    highlights: [{ value: '', label: '' }],
  });

  useEffect(() => { fetchHero(); }, []);

  const fetchHero = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getHero();
      const h = data.data || data || {};
      setHero(h);
      setForm({
        name: h.name || '',
        title: h.title || '',
        shortBio: h.shortBio || h.introduction || '',
        avatar: h.avatar || '',
        avatarFile: null,
        backgroundImage: h.backgroundImage || '',
        backgroundFile: null,
        socialLinks: (h.socialLinks || []).length > 0 ? h.socialLinks : [{ platform: '', url: '' }],
        ctaButtons: (h.ctaButtons || h.buttons || []).length > 0 ? (h.ctaButtons || h.buttons || []) : [{ label: '', url: '' }],
        highlights: (h.highlights || []).length > 0 ? h.highlights : [{ value: '', label: '' }],
      });
    } catch {
      toast.error('Failed to load hero');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('title', form.title);
      fd.append('shortBio', form.shortBio);
      fd.append('socialLinks', JSON.stringify(form.socialLinks.filter(s => s.platform || s.url)));
      fd.append('ctaButtons', JSON.stringify(form.ctaButtons.filter(b => b.label)));
      fd.append('highlights', JSON.stringify(form.highlights.filter(h => h.value || h.label)));
      if (form.avatarFile) fd.append('avatar', form.avatarFile);
      if (form.backgroundFile) fd.append('backgroundImage', form.backgroundFile);
      await adminApi.updateHero(fd);
      toast.success('Hero updated successfully');
      await fetchHero();
    } catch {
      toast.error('Failed to save hero');
    } finally {
      setSaving(false);
    }
  };

  const addSocial = () => setForm({ ...form, socialLinks: [...form.socialLinks, { platform: '', url: '' }] });
  const removeSocial = (i) => setForm({ ...form, socialLinks: form.socialLinks.filter((_, idx) => idx !== i) });
  const updateSocial = (i, field, value) => {
    const copy = [...form.socialLinks];
    copy[i] = { ...copy[i], [field]: value };
    setForm({ ...form, socialLinks: copy });
  };

  const addCta = () => setForm({ ...form, ctaButtons: [...form.ctaButtons, { label: '', url: '' }] });
  const removeCta = (i) => setForm({ ...form, ctaButtons: form.ctaButtons.filter((_, idx) => idx !== i) });
  const updateCta = (i, field, value) => {
    const copy = [...form.ctaButtons];
    copy[i] = { ...copy[i], [field]: value };
    setForm({ ...form, ctaButtons: copy });
  };

  const addHighlight = () => setForm({ ...form, highlights: [...form.highlights, { value: '', label: '' }] });
  const removeHighlight = (i) => setForm({ ...form, highlights: form.highlights.filter((_, idx) => idx !== i) });
  const updateHighlight = (i, field, value) => {
    const copy = [...form.highlights];
    copy[i] = { ...copy[i], [field]: value };
    setForm({ ...form, highlights: copy });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setForm({ ...form, avatarFile: file, avatar: URL.createObjectURL(file) });
  };

  const handleBgChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setForm({ ...form, backgroundFile: file, backgroundImage: URL.createObjectURL(file) });
  };

  const stats = [
    { label: 'Current Hero', value: hero ? 'Active' : 'None', icon: Icons.user, color: 'blue' },
    { label: 'Media Count', value: (hero?.avatar ? 1 : 0) + (hero?.backgroundImage ? 1 : 0), icon: Icons.image, color: 'green' },
  ];

  if (loading) {
    return (
      <PageLayout title="Hero Management" description="Manage your hero section" stats={stats}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1,2,3].map(i => (
            <div key={i} className="skeleton" style={{ width: '100%', height: 48, borderRadius: 8, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
          ))}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Hero Management"
      description="Manage your hero section content"
      stats={stats}
      breadcrumbs={[{ label: 'Pages' }, { label: 'Hero' }]}
      quickActions={[
        { label: saving ? 'Saving...' : 'Save Changes', icon: Icons.save, onClick: handleSave, primary: true },
        { label: 'Refresh', icon: Icons['refresh-cw'], onClick: fetchHero },
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Avatar Image</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{ width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--color-border)', background: 'var(--color-bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
              onClick={() => avatarInputRef.current?.click()}
            >
              {form.avatar ? (
                <img src={form.avatarFile ? form.avatar : imageUrl(form.avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Icon path={Icons.user} size={36} style={{ color: 'var(--color-text-tertiary)' }} />
              )}
            </div>
            <div>
              <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              <button className="btn btn-ghost btn-sm" onClick={() => avatarInputRef.current?.click()}>Upload Avatar</button>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', margin: '0.25rem 0 0' }}>Recommended: 500x500px</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Hero Content</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Name <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label>Professional Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Full Stack Developer" />
            </div>
            <div className="form-group">
              <label>Short Bio</label>
              <textarea rows={3} value={form.shortBio} onChange={(e) => setForm({ ...form, shortBio: e.target.value })} placeholder="A brief introduction..." />
            </div>
          </div>
        </div>

        <div style={{ padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Background Image</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{ width: 200, height: 120, borderRadius: 10, overflow: 'hidden', border: '2px solid var(--color-border)', background: 'var(--color-bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
              onClick={() => bgInputRef.current?.click()}
            >
              {form.backgroundImage ? (
                <img src={form.backgroundFile ? form.backgroundImage : imageUrl(form.backgroundImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Icon path={Icons.image} size={36} style={{ color: 'var(--color-text-tertiary)' }} />
              )}
            </div>
            <div>
              <input ref={bgInputRef} type="file" accept="image/*" onChange={handleBgChange} style={{ display: 'none' }} />
              <button className="btn btn-ghost btn-sm" onClick={() => bgInputRef.current?.click()}>Upload Background</button>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', margin: '0.25rem 0 0' }}>Recommended: 1920x1080px</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Social Links</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {form.socialLinks.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <input value={s.platform} onChange={(e) => updateSocial(i, 'platform', e.target.value)} placeholder="Platform (GitHub, LinkedIn...)" />
                </div>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <input value={s.url} onChange={(e) => updateSocial(i, 'url', e.target.value)} placeholder="URL" />
                </div>
                <button onClick={() => removeSocial(i)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--color-danger)', background: 'transparent', flexShrink: 0 }}>
                  <Icon path={Icons.trash2} size={14} />
                </button>
              </div>
            ))}
            <button className="btn btn-ghost btn-sm" onClick={addSocial} style={{ alignSelf: 'flex-start' }}>
              <Icon path={Icons.plus} size={14} /> Add Social Link
            </button>
          </div>
        </div>

        <div style={{ padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>CTA Buttons</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {form.ctaButtons.map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <input value={b.label} onChange={(e) => updateCta(i, 'label', e.target.value)} placeholder="Button Label" />
                </div>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <input value={b.url} onChange={(e) => updateCta(i, 'url', e.target.value)} placeholder="URL (#contact, #projects...)" />
                </div>
                <button onClick={() => removeCta(i)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--color-danger)', background: 'transparent', flexShrink: 0 }}>
                  <Icon path={Icons.trash2} size={14} />
                </button>
              </div>
            ))}
            <button className="btn btn-ghost btn-sm" onClick={addCta} style={{ alignSelf: 'flex-start' }}>
              <Icon path={Icons.plus} size={14} /> Add CTA Button
            </button>
          </div>
        </div>

        <div style={{ padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Highlights Stats</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: '-0.5rem 0 1rem' }}>Stats shown on the hero section (e.g. "2+ Years", "15+ Projects")</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {form.highlights.map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <input value={h.value} onChange={(e) => updateHighlight(i, 'value', e.target.value)} placeholder="Value (e.g. 2+)" />
                </div>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <input value={h.label} onChange={(e) => updateHighlight(i, 'label', e.target.value)} placeholder="Label (e.g. Years)" />
                </div>
                <button onClick={() => removeHighlight(i)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--color-danger)', background: 'transparent', flexShrink: 0 }}>
                  <Icon path={Icons.trash2} size={14} />
                </button>
              </div>
            ))}
            <button className="btn btn-ghost btn-sm" onClick={addHighlight} style={{ alignSelf: 'flex-start' }}>
              <Icon path={Icons.plus} size={14} /> Add Stat
            </button>
          </div>
        </div>
      </div>

      <SectionStyles sectionKey="hero" label="Hero Section Styles" />
    </PageLayout>
  );
}
