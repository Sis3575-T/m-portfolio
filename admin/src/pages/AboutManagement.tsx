import React, { useState, useEffect, useRef } from 'react';
import { adminApi, imageUrl } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import type { About } from '../types';

export default function AboutManagement() {
  const [about, setAbout] = useState<About | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [image, setImage] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    adminApi.getAbout()
      .then(({ data }) => {
        const a = data.data;
        if (a) {
          setAbout(a);
          setContent(a.content || '');
          setSummary(a.summary || '');
          setImage(a.image || '');
          setSkills(a.skills || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('category', 'image');
      const { data: up } = await adminApi.uploadMedia(fd);
      if (up.success && up.data?.url) setImage(up.data.url);
    } catch (err) { console.error('Upload failed', err); }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const fd = new FormData();
      fd.append('content', content);
      fd.append('summary', summary);
      fd.append('image', image);
      fd.append('skills', JSON.stringify(skills));
      await adminApi.updateAbout(fd);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error('Failed to save about', err); }
    finally { setSaving(false); }
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (i: number) => setSkills(skills.filter((_, idx) => idx !== i));

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>About Section</h2>
          <p>Edit your about section content</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Icon path={Icons.save} size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {saved && (
        <div style={{ padding: '10px 16px', background: 'var(--success-light)', color: 'var(--success)', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 500, marginBottom: 16 }}>
          About section saved successfully!
        </div>
      )}

      <div className="settings-section">
        <h3>Content</h3>
        <p>About section text and summary</p>
        <div className="form-group">
          <label>Content</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Full about content..." rows={8} />
        </div>
        <div className="form-group">
          <label>Summary</label>
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Short summary..." rows={3} />
        </div>
      </div>

      <div className="settings-section">
        <h3>Image</h3>
        <p>Your profile or about section image</p>
        <div className="image-upload-area">
          {image && (
            <div className="image-preview" style={{ width: 160, height: 120 }}>
              <img src={imageUrl(image)} alt="about" />
              <button className="remove-image" onClick={() => setImage('')}><Icon path={Icons.x} size={12} /></button>
            </div>
          )}
          <label className="image-upload-btn">
            <Icon path={Icons.upload} size={14} /> Upload Image
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3>Skills</h3>
        <p>Skills displayed in the about section</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Add a skill..."
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary btn-sm" onClick={addSkill}><Icon path={Icons.plus} size={14} /> Add</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {skills.map((skill, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 12 }}>
              {skill}
              <button onClick={() => removeSkill(i)} style={{ color: 'var(--text-light)', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}><Icon path={Icons.x} size={12} /></button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
