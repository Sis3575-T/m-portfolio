import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import type { Skill } from '../types';

const categories = ['Frontend', 'Backend', 'Database', 'Cloud', 'DevOps', 'Tools', 'Other'];

interface SkillForm {
  name: string;
  category: string;
  proficiency: number;
  icon: string;
}

export default function SkillsManagement() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState<SkillForm>({ name: '', category: 'Frontend', proficiency: 80, icon: '' });

  useEffect(() => {
    adminApi.getSkills()
      .then(({ data }) => setSkills(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', category: 'Frontend', proficiency: 80, icon: '' });
    setShowModal(true);
  };

  const openEdit = (skill: Skill) => {
    setEditing(skill);
    setForm({ name: skill.name, category: skill.category, proficiency: skill.proficiency, icon: skill.icon || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editing) await adminApi.updateSkill(editing._id, form);
      else await adminApi.createSkill(form);
      const { data } = await adminApi.getSkills();
      setSkills(data.data || []);
      setShowModal(false);
    } catch (err) { console.error('Failed to save skill', err); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      await adminApi.deleteSkill(id);
      setSkills(prev => prev.filter(s => s._id !== id));
    } catch (err) { console.error('Failed to delete', err); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Skills</h2>
          <p>Manage your technical skills ({skills.length} total)</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreate}><Icon path={Icons.plus} size={16} /> Add Skill</button>
        </div>
      </div>
      {categories.map(cat => {
        const catSkills = skills.filter(s => s.category === cat);
        if (catSkills.length === 0 && cat !== 'Frontend') return null;
        return (
          <div key={cat} className="skill-category">
            <div className="skill-category-title">{cat}</div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Proficiency</th><th>Status</th><th style={{ width: 80 }}>Actions</th></tr>
                </thead>
                <tbody>
                  {catSkills.map(s => (
                    <tr key={s._id}>
                      <td><div className="cell-title">{s.name}</div></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="progress-bar" style={{ maxWidth: 160 }}>
                            <div className="progress-bar-fill" style={{ width: `${s.proficiency}%` }} />
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{s.proficiency}%</span>
                        </div>
                      </td>
                      <td><span className={`badge ${s.isActive ? 'badge-green' : 'badge-gray'}`}>{s.isActive ? 'Active' : 'Hidden'}</span></td>
                      <td>
                        <div className="table-actions">
                          <button className="btn-edit" onClick={() => openEdit(s)} data-tooltip="Edit"><Icon path={Icons.edit} size={14} /></button>
                          <button className="btn-delete" onClick={() => handleDelete(s._id)} data-tooltip="Delete"><Icon path={Icons.trash2} size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {catSkills.length === 0 && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: 'var(--text-light)' }}>No skills in this category</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Skill' : 'Add Skill'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><Icon path={Icons.x} size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Skill Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. React, Node.js" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Proficiency (0-100)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="range" min={0} max={100} value={form.proficiency} onChange={(e) => setForm({ ...form, proficiency: Number(e.target.value) })} style={{ flex: 1 }} />
                    <span style={{ fontSize: 12, fontWeight: 600, minWidth: 36 }}>{form.proficiency}%</span>
                  </div>
                </div>
              </div>
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
