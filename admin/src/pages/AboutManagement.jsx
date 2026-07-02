import React, { useState, useEffect, useRef } from 'react';
import { adminApi, imageUrl } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import PageLayout from '../components/PageLayout';
import SectionStyles from '../components/SectionStyles';

export default function AboutManagement() {
  const toast = useToast();
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    title: '', description: '',
    image: '', imageFile: null,
    keyPoints: [''],
    stats: [{ label: '', value: '' }],
  });

  useEffect(() => { fetchAbout(); }, []);

  const fetchAbout = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getAbout();
      const a = data.data || data || {};
      setAbout(a);
      setForm({
        title: a.title || '',
        description: a.biography || '',
        image: a.image || '',
        imageFile: null,
        keyPoints: (a.keyAchievements || []).length > 0 ? a.keyAchievements : [''],
        stats: (a.stats || []).length > 0 ? a.stats : [{ label: '', value: '' }],
      });
    } catch {
      toast.error('Failed to load about');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() && !form.description.trim()) { toast.error('Title or description is required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('biography', form.description);
      fd.append('keyAchievements', JSON.stringify(form.keyPoints.filter(k => k.trim())));
      fd.append('stats', JSON.stringify(form.stats.filter(s => s.label || s.value)));
      if (form.imageFile) fd.append('image', form.imageFile);
      await Promise.all([
        adminApi.updateAbout(fd),
        adminApi.updateSettings({
          longBio: form.description,
          profilePhoto: form.imageFile ? form.image : about?.image || form.image,
        }),
      ]);
      toast.success('About updated successfully');
      await fetchAbout();
    } catch {
      toast.error('Failed to save about');
    } finally {
      setSaving(false);
    }
  };

  const addPoint = () => setForm({ ...form, keyPoints: [...form.keyPoints, ''] });
  const removePoint = (i) => setForm({ ...form, keyPoints: form.keyPoints.filter((_, idx) => idx !== i) });
  const updatePoint = (i, val) => {
    const copy = [...form.keyPoints];
    copy[i] = val;
    setForm({ ...form, keyPoints: copy });
  };

  const addStat = () => setForm({ ...form, stats: [...form.stats, { label: '', value: '' }] });
  const removeStat = (i) => setForm({ ...form, stats: form.stats.filter((_, idx) => idx !== i) });
  const updateStat = (i, field, val) => {
    const copy = [...form.stats];
    copy[i] = { ...copy[i], [field]: val };
    setForm({ ...form, stats: copy });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setForm({ ...form, imageFile: file, image: URL.createObjectURL(file) });
  };

  const stats = [
    { label: 'About Section', value: about ? 'Configured' : 'Not Set', icon: Icons.user, color: 'blue' },
    { label: 'Key Points', value: (about?.keyPoints || about?.keyAchievements || []).length, icon: Icons['file-text'], color: 'green' },
    { label: 'Stats Boxes', value: (about?.stats || []).length, icon: Icons['bar-chart-3'], color: 'purple' },
  ];

  if (loading) {
    return (
      <PageLayout title="About Management" description="Manage your about section" stats={stats}>
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
      title="About Management"
      description="Manage your about section content"
      stats={stats}
      breadcrumbs={[{ label: 'Pages' }, { label: 'About' }]}
      quickActions={[
        { label: saving ? 'Saving...' : 'Save Changes', icon: Icons.save, onClick: handleSave, primary: true },
        { label: 'Refresh', icon: Icons['refresh-cw'], onClick: fetchAbout },
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Profile Image</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{ width: 120, height: 120, borderRadius: 14, overflow: 'hidden', border: '2px solid var(--color-border)', background: 'var(--color-bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
              onClick={() => fileInputRef.current?.click()}
            >
              {form.image ? (
                <img src={form.imageFile ? form.image : imageUrl(form.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Icon path={Icons.user} size={48} style={{ color: 'var(--color-text-tertiary)' }} />
              )}
            </div>
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              <button className="btn btn-ghost btn-sm" onClick={() => fileInputRef.current?.click()}>Upload Image</button>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', margin: '0.25rem 0 0' }}>Recommended: 400x400px</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Content</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Title <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="About Me" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Write about yourself..." />
            </div>
          </div>
        </div>

        <div style={{ padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Key Points</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {form.keyPoints.map((point, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <input value={point} onChange={(e) => updatePoint(i, e.target.value)} placeholder="Enter a key point..." />
                </div>
                <button onClick={() => removePoint(i)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--color-danger)', background: 'transparent', flexShrink: 0 }}>
                  <Icon path={Icons.trash2} size={14} />
                </button>
              </div>
            ))}
            <button className="btn btn-ghost btn-sm" onClick={addPoint} style={{ alignSelf: 'flex-start' }}>
              <Icon path={Icons.plus} size={14} /> Add Key Point
            </button>
          </div>
        </div>

        <div style={{ padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Stats Boxes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {form.stats.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <input value={s.label} onChange={(e) => updateStat(i, 'label', e.target.value)} placeholder="Label (e.g. Projects)" />
                </div>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <input value={s.value} onChange={(e) => updateStat(i, 'value', e.target.value)} placeholder="Value (e.g. 50+)" />
                </div>
                <button onClick={() => removeStat(i)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--color-danger)', background: 'transparent', flexShrink: 0 }}>
                  <Icon path={Icons.trash2} size={14} />
                </button>
              </div>
            ))}
            <button className="btn btn-ghost btn-sm" onClick={addStat} style={{ alignSelf: 'flex-start' }}>
              <Icon path={Icons.plus} size={14} /> Add Stat
            </button>
          </div>
        </div>
      </div>

      <SectionStyles sectionKey="about" label="About Section Styles" />
    </PageLayout>
  );
}
