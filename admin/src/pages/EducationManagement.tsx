import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import type { Education } from '../types';

interface EduForm {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
  description: string;
  achievements: string;
}

export default function EducationManagement() {
  const [items, setItems] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Education | null>(null);
  const [form, setForm] = useState<EduForm>({
    institution: '', degree: '', field: '', startDate: '', endDate: '',
    gpa: '', description: '', achievements: '',
  });

  const fetchData = async () => {
    try {
      const { data } = await adminApi.getEducation();
      setItems(data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '', description: '', achievements: '' });
    setShowModal(true);
  };

  const openEdit = (item: Education) => {
    setEditing(item);
    setForm({
      institution: item.institution, degree: item.degree, field: item.field || '',
      startDate: item.startDate ? item.startDate.slice(0, 10) : '',
      endDate: item.endDate ? item.endDate.slice(0, 10) : '',
      gpa: item.gpa || '', description: item.description || '',
      achievements: (item.achievements || []).join(', '),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        achievements: form.achievements.split(',').map(t => t.trim()).filter(Boolean),
      };
      if (editing) await adminApi.updateEducation(editing._id, payload);
      else await adminApi.createEducation(payload);
      await fetchData();
      setShowModal(false);
    } catch (err) { console.error('Failed to save', err); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this education?')) return;
    try { await adminApi.deleteEducation(id); setItems(prev => prev.filter(i => i._id !== id)); }
    catch (err) { console.error('Failed to delete', err); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Education</h2>
          <p>Manage your educational background ({items.length} entries)</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreate}><Icon path={Icons.plus} size={16} /> Add Education</button>
        </div>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Institution</th><th>Degree</th><th>Field</th><th>Period</th><th>Status</th><th style={{ width: 80 }}>Actions</th></tr></thead>
          <tbody>
            {items.map(i => (
              <tr key={i._id}>
                <td><div className="cell-title">{i.institution}</div></td>
                <td>{i.degree}</td>
                <td>{i.field}</td>
                <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {i.startDate?.slice(0, 7)} — {i.endDate?.slice(0, 7)}
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
              <tr><td colSpan={6}><div className="empty-state"><Icon path={Icons.book} size={40} /><h3>No education yet</h3><p>Add your educational background.</p></div></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Education' : 'Add Education'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><Icon path={Icons.x} size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label>Institution</label><input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} /></div>
                <div className="form-group"><label>Degree</label><input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Field of Study</label><input value={form.field} onChange={(e) => setForm({ ...form, field: e.target.value })} /></div>
                <div className="form-group"><label>GPA</label><input value={form.gpa} onChange={(e) => setForm({ ...form, gpa: e.target.value })} placeholder="e.g. 3.8" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Start Date</label><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
                <div className="form-group"><label>End Date</label><input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Description</label><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
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
