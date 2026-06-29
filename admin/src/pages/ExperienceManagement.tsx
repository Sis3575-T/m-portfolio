import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import type { Experience } from '../types';

interface ExpForm {
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  responsibilities: string;
  achievements: string;
}

export default function ExperienceManagement() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [form, setForm] = useState<ExpForm>({
    company: '', position: '', location: '', startDate: '', endDate: '',
    current: false, description: '', responsibilities: '', achievements: '',
  });

  const fetchData = async () => {
    try {
      const { data } = await adminApi.getExperiences();
      setItems(data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '', responsibilities: '', achievements: '' });
    setShowModal(true);
  };

  const openEdit = (item: Experience) => {
    setEditing(item);
    setForm({
      company: item.company, position: item.position, location: item.location || '',
      startDate: item.startDate ? item.startDate.slice(0, 10) : '',
      endDate: item.endDate ? item.endDate.slice(0, 10) : '',
      current: item.current || false, description: item.description || '',
      responsibilities: (item.responsibilities || []).join(', '),
      achievements: (item.achievements || []).join(', '),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        responsibilities: form.responsibilities.split(',').map(t => t.trim()).filter(Boolean),
        achievements: form.achievements.split(',').map(t => t.trim()).filter(Boolean),
      };
      if (editing) await adminApi.updateExperience(editing._id, payload);
      else await adminApi.createExperience(payload);
      await fetchData();
      setShowModal(false);
    } catch (err) { console.error('Failed to save', err); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this experience?')) return;
    try { await adminApi.deleteExperience(id); setItems(prev => prev.filter(i => i._id !== id)); }
    catch (err) { console.error('Failed to delete', err); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Experience</h2>
          <p>Manage your work history ({items.length} entries)</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreate}><Icon path={Icons.plus} size={16} /> Add Experience</button>
        </div>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Company</th><th>Position</th><th>Duration</th><th>Status</th><th style={{ width: 80 }}>Actions</th></tr></thead>
          <tbody>
            {items.map(i => (
              <tr key={i._id}>
                <td><div className="cell-title">{i.company}</div></td>
                <td>{i.position}</td>
                <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {i.startDate?.slice(0, 7)} — {i.current ? 'Present' : i.endDate?.slice(0, 7)}
                </td>
                <td><span className={`badge ${i.isActive ? 'badge-green' : 'badge-gray'}`}>{i.isActive ? 'Active' : 'Hidden'}</span></td>
                <td>
                  <div className="table-actions">
                    <button className="btn-edit" onClick={() => openEdit(i)} data-tooltip="Edit"><Icon path={Icons.edit} size={14} /></button>
                    <button className="btn-delete" onClick={() => handleDelete(i._id)} data-tooltip="Delete"><Icon path={Icons.trash2} size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5}><div className="empty-state"><Icon path={Icons.briefcase} size={40} /><h3>No experience yet</h3><p>Add your first work experience.</p></div></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Experience' : 'Add Experience'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><Icon path={Icons.x} size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label>Company</label><input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
                <div className="form-group"><label>Position</label><input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Location</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 9 }}>
                  <label className="form-check" style={{ marginBottom: 0 }}>
                    <input type="checkbox" checked={form.current} onChange={(e) => setForm({ ...form, current: e.target.checked })} />
                    <span>Current position</span>
                  </label>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Start Date</label><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
                <div className="form-group"><label>End Date</label><input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} disabled={form.current} /></div>
              </div>
              <div className="form-group"><label>Description</label><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="form-group"><label>Responsibilities (comma-separated)</label><textarea rows={2} value={form.responsibilities} onChange={(e) => setForm({ ...form, responsibilities: e.target.value })} /></div>
              <div className="form-group"><label>Achievements (comma-separated)</label><textarea rows={2} value={form.achievements} onChange={(e) => setForm({ ...form, achievements: e.target.value })} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
