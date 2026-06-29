import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';

export default function EducationManagement() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    institution: '', degree: '', field: '', startDate: '', endDate: '',
    gpa: '', description: '', achievements: '',
  });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getEducation();
      setItems(data.data || []);
    } catch { toast.error('Failed to load education records'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '', description: '', achievements: '' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      institution: item.institution || '', degree: item.degree || '', field: item.field || '',
      startDate: item.startDate ? item.startDate.slice(0, 10) : '',
      endDate: item.endDate ? item.endDate.slice(0, 10) : '',
      gpa: item.gpa || '', description: item.description || '',
      achievements: (item.achievements || []).join('\n'),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.institution.trim()) { toast.error('Institution is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, achievements: form.achievements.split('\n').map(s => s.trim()).filter(Boolean) };
      if (editing) await adminApi.updateEducation(editing._id, payload);
      else await adminApi.createEducation(payload);
      toast.success(editing ? 'Education updated' : 'Education created');
      await fetchItems();
      setShowModal(false);
    } catch { toast.error('Failed to save education record'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteEducation(deleteTarget._id);
      toast.success('Education record deleted');
      setItems(prev => prev.filter(i => i._id !== deleteTarget._id));
    } catch { toast.error('Failed to delete education record'); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const columns = [
    {
      key: 'institution',
      label: 'Institution',
      render: (row) => (
        <div>
          <div className="cell-title">{row.institution}</div>
          <div className="cell-subtitle">{row.degree}{row.field ? ` in ${row.field}` : ''}</div>
        </div>
      ),
    },
    {
      key: 'gpa',
      label: 'GPA',
      render: (row) => row.gpa ? <span className="badge badge-gray">{row.gpa}</span> : null,
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (row) => (
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {row.startDate?.slice(0, 4) || '?'} — {row.endDate?.slice(0, 4) || '?'}
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
          <h1>Education</h1>
          <p>Manage your education history - {items.length} total</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreate}>
            <Icon path={Icons.plus} size={16} /> Add Education
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        onEdit={openEdit}
        onDelete={(row) => setDeleteTarget(row)}
        searchPlaceholder="Search institutions..."
        emptyMessage="No education records yet. Click 'Add Education' to add one."
        emptyIcon={Icons.book}
      />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Education' : 'Add Education'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label>Institution <span style={{ color: 'var(--danger)' }}>*</span></label><input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} /></div>
                <div className="form-group"><label>Degree</label><input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Field of Study</label><input value={form.field} onChange={(e) => setForm({ ...form, field: e.target.value })} /></div>
                <div className="form-group"><label>GPA</label><input value={form.gpa} onChange={(e) => setForm({ ...form, gpa: e.target.value })} placeholder="3.85" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Start Date</label><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
                <div className="form-group"><label>End Date</label><input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Description</label><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="form-group"><label>Achievements (one per line)</label><textarea rows={3} value={form.achievements} onChange={(e) => setForm({ ...form, achievements: e.target.value })} placeholder="Dean's List" /></div>
            </div>
            <div className="modal-footer" style={{ padding: '16px 0 0' }}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update Education' : 'Create Education'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Education"
        message={`Delete education record at "${deleteTarget?.institution}"?`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}
