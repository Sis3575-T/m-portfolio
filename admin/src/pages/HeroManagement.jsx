import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';

function HeroManagement() {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', title: '', introduction: '',
    avatar: '', avatarFile: null,
    socialLinks: [{ platform: 'GitHub', url: '' }],
    buttons: [{ label: '', url: '', type: 'primary' }],
  });

  useEffect(() => {
    fetchHeroes();
  }, []);

  const fetchHeroes = async () => {
    try {
      const { data } = await adminApi.getHero();
      setHeroes(data.data || []);
    } catch (err) {
      console.error('Failed to load hero');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', title: '', introduction: '', avatar: '', avatarFile: null, socialLinks: [{ platform: 'GitHub', url: '' }], buttons: [{ label: '', url: '', type: 'primary' }] });
    setShowModal(true);
  };

  const openEdit = (hero) => {
    setEditing(hero);
    setForm({
      name: hero.name || '',
      title: hero.title || '',
      introduction: hero.introduction || '',
      avatar: hero.avatar || '',
      avatarFile: null,
      socialLinks: (hero.socialLinks || []).length > 0 ? hero.socialLinks : [{ platform: 'GitHub', url: '' }],
      buttons: (hero.buttons || []).length > 0 ? hero.buttons : [{ label: '', url: '', type: 'primary' }],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('title', form.title);
      fd.append('introduction', form.introduction);
      fd.append('socialLinks', JSON.stringify(form.socialLinks.filter(s => s.platform || s.url)));
      fd.append('buttons', JSON.stringify(form.buttons.filter(b => b.label)));
      if (form.avatarFile) {
        fd.append('avatar', form.avatarFile);
      }
      if (editing) {
        await adminApi.updateHero(editing._id, fd);
      } else {
        await adminApi.createHero(fd);
      }
      await fetchHeroes();
      setShowModal(false);
      setMessage('Saved successfully');
    } catch (err) {
      setMessage('Failed to save');
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

  const addButton = () => setForm({ ...form, buttons: [...form.buttons, { label: '', url: '', type: 'primary' }] });
  const removeButton = (i) => setForm({ ...form, buttons: form.buttons.filter((_, idx) => idx !== i) });
  const updateButton = (i, field, value) => {
    const copy = [...form.buttons];
    copy[i] = { ...copy[i], [field]: value };
    setForm({ ...form, buttons: copy });
  };

  if (loading) return <div className="placeholder-page"><p>Loading...</p></div>;

  return (
    <div>
      <div className="table-header">
        <span style={{ fontSize: 14, fontWeight: 500 }}>{heroes.length} hero sections</span>
        <button className="btn btn-primary" onClick={openCreate}><i className="fa-regular fa-plus"></i> Add Hero</button>
      </div>

      {message && <div style={{ padding: '8px 12px', marginBottom: 12, background: message.includes('Failed') ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', borderRadius: 6, fontSize: 13 }}>{message}</div>}

      <table className="data-table">
        <thead><tr><th>Name</th><th>Title</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {heroes.map(h => (
            <tr key={h._id}>
              <td style={{ fontWeight: 500 }}>{h.name}</td>
              <td>{h.title}</td>
              <td><span className={`status ${h.isActive ? 'published' : 'draft'}`}>{h.isActive ? 'Active' : 'Hidden'}</span></td>
              <td>
                <div className="table-actions">
                  <button className="edit" onClick={() => openEdit(h)} title="Edit"><i className="fa-regular fa-pen"></i></button>
                </div>
              </td>
            </tr>
          ))}
          {heroes.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--gray-400)' }}>No hero sections yet</td></tr>}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Hero' : 'Add Hero'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Title</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Introduction</label>
                <textarea rows={3} value={form.introduction} onChange={(e) => setForm({ ...form, introduction: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Profile Photo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {form.avatar && !form.avatarFile && (
                    <img
                      src={import.meta.env.VITE_API_URL?.replace('/api', '') + form.avatar}
                      alt="Current"
                      style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }}
                    />
                  )}
                  {form.avatarFile && (
                    <img
                      src={URL.createObjectURL(form.avatarFile)}
                      alt="Preview"
                      style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-color)' }}
                    />
                  )}
                  <input type="file" accept="image/*" onChange={e => setForm({ ...form, avatarFile: e.target.files[0] })} />
                </div>
              </div>

              <div className="form-section-title">Social Links</div>
              {form.socialLinks.map((s, i) => (
                <div key={i} className="form-row" style={{ alignItems: 'center' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <input value={s.platform} onChange={(e) => updateSocial(i, 'platform', e.target.value)} placeholder="Platform (GitHub, LinkedIn...)" />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <input value={s.url} onChange={(e) => updateSocial(i, 'url', e.target.value)} placeholder="URL" />
                  </div>
                  <button className="btn-icon" onClick={() => removeSocial(i)} style={{ flexShrink: 0, marginTop: 0 }}><i className="fa-regular fa-xmark"></i></button>
                </div>
              ))}
              <button className="btn btn-outline btn-sm" onClick={addSocial}><i className="fa-regular fa-plus"></i> Add Social Link</button>

              <div className="form-section-title" style={{ marginTop: 16 }}>Buttons</div>
              {form.buttons.map((b, i) => (
                <div key={i} className="form-row" style={{ alignItems: 'center' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <input value={b.label} onChange={(e) => updateButton(i, 'label', e.target.value)} placeholder="Label" />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <input value={b.url} onChange={(e) => updateButton(i, 'url', e.target.value)} placeholder="URL (#contact, #projects...)" />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <select value={b.type} onChange={(e) => updateButton(i, 'type', e.target.value)}>
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                    </select>
                  </div>
                  <button className="btn-icon" onClick={() => removeButton(i)} style={{ flexShrink: 0, marginTop: 0 }}><i className="fa-regular fa-xmark"></i></button>
                </div>
              ))}
              <button className="btn btn-outline btn-sm" onClick={addButton}><i className="fa-regular fa-plus"></i> Add Button</button>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HeroManagement;
