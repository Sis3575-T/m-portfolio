import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';

const categories = ['Frontend', 'Backend', 'Database', 'Cloud', 'DevOps', 'Tools', 'Mobile', 'AI/ML', 'Other'];

export default function SkillsManagement() {
  const toast = useToast();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Frontend', proficiency: 80, icon: '' });

  useEffect(() => { fetchSkills(); }, []);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getSkills();
      setSkills(data.data || []);
    } catch { toast.error('Failed to load skills'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', category: 'Frontend', proficiency: 80, icon: '' });
    setShowModal(true);
  };

  const openEdit = (skill) => {
    setEditing(skill);
    setForm({ name: skill.name, category: skill.category || 'Frontend', proficiency: skill.proficiency ?? 80, icon: skill.icon || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (editing) await adminApi.updateSkill(editing._id, form);
      else await adminApi.createSkill(form);
      toast.success(editing ? 'Skill updated' : 'Skill created');
      await fetchSkills();
      setShowModal(false);
    } catch { toast.error('Failed to save skill'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteSkill(deleteTarget._id);
      toast.success('Skill deleted');
      setSkills(prev => prev.filter(s => s._id !== deleteTarget._id));
    } catch { toast.error('Failed to delete skill'); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const getCategoryColor = (cat) => {
    const colors = { Frontend: '#3B82F6', Backend: '#10B981', Database: '#F59E0B', Cloud: '#8B5CF6', DevOps: '#EF4444', Tools: '#EC4899', Mobile: '#14B8A6', 'AI/ML': '#F97316', Other: '#6B7280' };
    return colors[cat] || '#6B7280';
  };

  const columns = [
    {
      key: 'name',
      label: 'Skill',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {row.icon && <Icon path={Icons[row.icon] || Icons.code} size={18} style={{ color: getCategoryColor(row.category) }} />}
          <div>
            <div className="cell-title">{row.name}</div>
            {row.category && <div className="cell-subtitle">{row.category}</div>}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => (
        <span className="badge" style={{ background: `${getCategoryColor(row.category)}18`, color: getCategoryColor(row.category) }}>
          {row.category}
        </span>
      ),
    },
    {
      key: 'proficiency',
      label: 'Proficiency',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 140 }}>
          <div style={{ flex: 1, height: 8, background: 'var(--gray-100)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${row.proficiency}%`, height: '100%', background: 'linear-gradient(90deg, #3B82F6, #2563EB)', borderRadius: 4, transition: 'width 0.6s ease' }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', minWidth: 32 }}>{row.proficiency}%</span>
        </div>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => <span className={`status ${row.isActive ? 'published' : 'draft'}`}>{row.isActive ? 'Active' : 'Hidden'}</span>,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Skills Management</h1>
          <p>Manage your technical skills - {skills.length} total</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreate}>
            <Icon path={Icons.plus} size={16} /> Add Skill
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={skills}
        loading={loading}
        onEdit={openEdit}
        onDelete={(row) => setDeleteTarget(row)}
        searchPlaceholder="Search skills..."
        emptyMessage="No skills yet. Click 'Add Skill' to create one."
        emptyIcon={Icons.code}
      />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Skill' : 'Add Skill'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="React, Node.js, etc." />
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="range" min={0} max={100} value={form.proficiency} onChange={(e) => setForm({ ...form, proficiency: Number(e.target.value) })} style={{ flex: 1 }} />
                    <span style={{ fontSize: 12, fontWeight: 600, minWidth: 32 }}>{form.proficiency}%</span>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Icon</label>
                <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}>
                  <option value="">None</option>
                  {Object.keys(Icons).filter(k => !['plus', 'search', 'x', 'menu', 'chevronDown', 'chevronLeft', 'chevronRight', 'moreHorizontal', 'settings'].includes(k)).map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                {form.icon && Icons[form.icon] && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon path={Icons[form.icon]} size={20} style={{ color: getCategoryColor(form.category) }} />
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{form.icon}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update Skill' : 'Create Skill'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Skill"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}
