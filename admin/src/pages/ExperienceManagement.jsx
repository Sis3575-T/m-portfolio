import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';

export default function ExperienceManagement() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company: '', position: '', location: '', startDate: '', endDate: '',
    current: false, description: '', responsibilities: '', achievements: '',
  });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getExperiences();
      setItems(data.data || []);
    } catch { toast.error('Failed to load experiences'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '', responsibilities: '', achievements: '' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      company: item.company || '', position: item.position || '', location: item.location || '',
      startDate: item.startDate ? item.startDate.slice(0, 10) : '',
      endDate: item.endDate ? item.endDate.slice(0, 10) : '',
      current: item.current || false, description: item.description || '',
      responsibilities: (item.responsibilities || []).join('\n'),
      achievements: (item.achievements || []).join('\n'),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.company.trim() || !form.position.trim()) { toast.error('Company and position are required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        responsibilities: form.responsibilities.split('\n').map(s => s.trim()).filter(Boolean),
        achievements: form.achievements.split('\n').map(s => s.trim()).filter(Boolean),
      };
      if (editing) await adminApi.updateExperience(editing._id, payload);
      else await adminApi.createExperience(payload);
      toast.success(editing ? 'Experience updated' : 'Experience created');
      await fetchItems();
      setShowModal(false);
    } catch { toast.error('Failed to save experience'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteExperience(deleteTarget._id);
      toast.success('Experience deleted');
      setItems(prev => prev.filter(i => i._id !== deleteTarget._id));
    } catch { toast.error('Failed to delete experience'); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const columns = [
    {
      key: 'company',
      label: 'Company',
      render: (row) => (
        <div>
          <div className="cell-title">{row.company}</div>
          <div className="cell-subtitle">{row.position}</div>
        </div>
      ),
    },
    { key: 'location', label: 'Location' },
    {
      key: 'duration',
      label: 'Duration',
      render: (row) => (
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {row.startDate?.slice(0, 7) || '?'} — {row.current ? 'Present' : (row.endDate?.slice(0, 7) || '?')}
        </span>
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
          <h1>Experience</h1>
          <p>Manage your work history - {items.length} total</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreate}>
            <Icon path={Icons.plus} size={16} /> Add Experience
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        onEdit={openEdit}
        onDelete={(row) => setDeleteTarget(row)}
        searchPlaceholder="Search companies..."
        emptyMessage="No experiences yet. Click 'Add Experience' to create one."
        emptyIcon={Icons.briefcase}
      />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Experience' : 'Add Experience'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label>Company <span style={{ color: 'var(--danger)' }}>*</span></label><input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
                <div className="form-group"><label>Position <span style={{ color: 'var(--danger)' }}>*</span></label><input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Location</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 10 }}>
                  <label className="form-check">
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
              <div className="form-group"><label>Responsibilities (one per line)</label><textarea rows={3} value={form.responsibilities} onChange={(e) => setForm({ ...form, responsibilities: e.target.value })} placeholder="Led team of 5 developers" /></div>
              <div className="form-group"><label>Achievements (one per line)</label><textarea rows={2} value={form.achievements} onChange={(e) => setForm({ ...form, achievements: e.target.value })} placeholder="Reduced costs by 40%" /></div>
            </div>
            <div className="modal-footer" style={{ padding: '16px 0 0' }}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update Experience' : 'Create Experience'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Experience"
        message={`Delete experience at "${deleteTarget?.company}" (${deleteTarget?.position})?`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}
