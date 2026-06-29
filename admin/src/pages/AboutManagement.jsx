import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';

function AboutManagement() {
  const [abouts, setAbouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    biography: '', careerJourney: '',
    keyAchievements: '',
    stats: [{ label: '', value: '', suffix: '' }],
  });

  useEffect(() => {
    fetchAbouts();
  }, []);

  const fetchAbouts = async () => {
    try {
      const { data } = await adminApi.getAbout();
      setAbouts(data.data || []);
    } catch (err) {
      console.error('Failed to load about');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ biography: '', careerJourney: '', keyAchievements: '', stats: [{ label: '', value: '', suffix: '' }] });
    setShowModal(true);
  };

  const openEdit = (about) => {
    setEditing(about);
    setForm({
      biography: about.biography || '',
      careerJourney: about.careerJourney || '',
      keyAchievements: (about.keyAchievements || []).join('\n'),
      stats: (about.stats || []).length > 0 ? about.stats : [{ label: '', value: '', suffix: '' }],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        ...form,
        keyAchievements: form.keyAchievements.split('\n').map(s => s.trim()).filter(Boolean),
        stats: form.stats.filter(s => s.label || s.value),
      };
      if (editing) {
        await adminApi.updateAbout(editing._id, payload);
      } else {
        await adminApi.createAbout?.(payload);
      }
      await fetchAbouts();
      setShowModal(false);
      setMessage('Saved successfully');
    } catch (err) {
      setMessage('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const addStat = () => setForm({ ...form, stats: [...form.stats, { label: '', value: '', suffix: '' }] });
  const removeStat = (i) => setForm({ ...form, stats: form.stats.filter((_, idx) => idx !== i) });
  const updateStat = (i, field, value) => {
    const copy = [...form.stats];
    copy[i] = { ...copy[i], [field]: value };
    setForm({ ...form, stats: copy });
  };

  if (loading) return <div className="placeholder-page"><p>Loading...</p></div>;

  return (
    <div>
      <div className="table-header">
        <span style={{ fontSize: 14, fontWeight: 500 }}>{abouts.length} about sections</span>
        <button className="btn btn-primary" onClick={openCreate}><i className="fa-regular fa-plus"></i> Add About</button>
      </div>

      {message && <div style={{ padding: '8px 12px', marginBottom: 12, background: message.includes('Failed') ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', borderRadius: 6, fontSize: 13 }}>{message}</div>}

      <table className="data-table">
        <thead><tr><th>Biography</th><th>Achievements</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {abouts.map(a => (
            <tr key={a._id}>
              <td style={{ fontWeight: 500, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.biography}</td>
              <td>{(a.keyAchievements || []).length} achievements</td>
              <td><span className={`status ${a.isActive ? 'published' : 'draft'}`}>{a.isActive ? 'Active' : 'Hidden'}</span></td>
              <td>
                <div className="table-actions">
                  <button className="edit" onClick={() => openEdit(a)} title="Edit"><i className="fa-regular fa-pen"></i></button>
                </div>
              </td>
            </tr>
          ))}
          {abouts.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--gray-400)' }}>No about sections yet</td></tr>}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit About' : 'Add About'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Biography</label>
                <textarea rows={4} value={form.biography} onChange={(e) => setForm({ ...form, biography: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Career Journey</label>
                <textarea rows={3} value={form.careerJourney} onChange={(e) => setForm({ ...form, careerJourney: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Key Achievements (one per line)</label>
                <textarea rows={3} value={form.keyAchievements} onChange={(e) => setForm({ ...form, keyAchievements: e.target.value })} placeholder="Achievement 1&#10;Achievement 2" />
              </div>

              <div className="form-section-title">Stats</div>
              {form.stats.map((s, i) => (
                <div key={i} className="form-row" style={{ alignItems: 'center' }}>
                  <div className="form-group" style={{ flex: 1 }}><input value={s.label} onChange={(e) => updateStat(i, 'label', e.target.value)} placeholder="Label (e.g. Projects)" /></div>
                  <div className="form-group" style={{ flex: 1 }}><input value={s.value} onChange={(e) => updateStat(i, 'value', e.target.value)} placeholder="Value (e.g. 50)" /></div>
                  <div className="form-group" style={{ flex: 1 }}><input value={s.suffix} onChange={(e) => updateStat(i, 'suffix', e.target.value)} placeholder="Suffix (e.g. +)" /></div>
                  <button className="btn-icon" onClick={() => removeStat(i)} style={{ flexShrink: 0, marginTop: 0 }}><i className="fa-regular fa-xmark"></i></button>
                </div>
              ))}
              <button className="btn btn-outline btn-sm" onClick={addStat}><i className="fa-regular fa-plus"></i> Add Stat</button>
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

export default AboutManagement;
