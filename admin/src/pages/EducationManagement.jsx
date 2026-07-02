import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import PageLayout from '../components/PageLayout';
import SectionStyles from '../components/SectionStyles';
import DataTable from '../components/DataTable';
import Toolbar from '../components/Toolbar';

export default function EducationManagement() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [form, setForm] = useState({
    institution: '', degree: '', field: '', startDate: '', endDate: '',
    grade: '', description: '',
  });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getEducation();
      setItems(data.data || []);
    } catch {
      toast.error('Failed to load education records');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ institution: '', degree: '', field: '', startDate: '', endDate: '', grade: '', description: '' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      institution: item.institution || '',
      degree: item.degree || '',
      field: item.field || '',
      startDate: item.startDate ? item.startDate.slice(0, 10) : '',
      endDate: item.endDate ? item.endDate.slice(0, 10) : '',
      grade: item.grade || '',
      description: item.description || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.institution.trim()) { toast.error('Institution is required'); return; }
    setSaving(true);
    try {
      if (editing) await adminApi.updateEducation(editing._id, form);
      else await adminApi.createEducation(form);
      toast.success(editing ? 'Education updated' : 'Education created');
      await fetchItems();
      setShowModal(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save education record');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteEducation(deleteTarget._id);
      toast.success('Education record deleted');
      setItems(prev => prev.filter(i => i._id !== deleteTarget._id));
    } catch {
      toast.error('Failed to delete education record');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filteredData = items.filter(item => {
    const q = searchVal.toLowerCase();
    if (!q) return true;
    return item.institution?.toLowerCase().includes(q) || item.degree?.toLowerCase().includes(q) || item.field?.toLowerCase().includes(q);
  });

  const degreeCount = items.filter(i => i.degree && !['Certificate', 'Certification'].includes(i.degree)).length;
  const certCount = items.filter(i => ['Certificate', 'Certification'].includes(i.degree)).length;

  const stats = [
    { label: 'Total Entries', value: items.length, icon: Icons.book, color: 'blue' },
    { label: 'Degrees', value: degreeCount, icon: Icons['graduation-cap'], color: 'green' },
    { label: 'Certificates', value: certCount, icon: Icons.award, color: 'purple' },
  ];

  const columns = [
    {
      key: 'institution', label: 'Institution',
      render: (row) => (
        <div>
          <div className="cell-title">{row.institution}</div>
          <div className="cell-subtitle">{row.degree}{row.field ? ` in ${row.field}` : ''}</div>
        </div>
      ),
    },
    { key: 'degree', label: 'Degree', render: (row) => row.degree ? <span className="badge badge-gray">{row.degree}</span> : null },
    { key: 'field', label: 'Field' },
    { key: 'startDate', label: 'Start', render: (row) => <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{row.startDate ? new Date(row.startDate).getFullYear() : '-'}</span> },
    { key: 'endDate', label: 'End', render: (row) => <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{row.endDate ? new Date(row.endDate).getFullYear() : '-'}</span> },
    { key: 'grade', label: 'Grade', render: (row) => row.grade ? <span className="badge badge-green">{row.grade}</span> : null },
  ];

  const actionButtons = [
    { icon: Icons.edit, label: 'Edit', onClick: (row) => openEdit(row) },
    { icon: Icons.trash2, label: 'Delete', onClick: (row) => setDeleteTarget(row), variant: 'danger' },
  ];

  return (
    <PageLayout
      title="Education"
      description="Manage your education history"
      stats={stats}
    >
      <Toolbar
        searchValue={searchVal}
        onSearchChange={setSearchVal}
        searchPlaceholder="Search institutions..."
        onAddNew={openCreate}
        onRefresh={fetchItems}
      />

      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        actions={actionButtons}
        searchable={false}
        emptyMessage="No education records yet. Click 'Add New' to add one."
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Institution <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} placeholder="University of Technology" />
                </div>
                <div className="form-group">
                  <label>Degree</label>
                  <input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} placeholder="Bachelor of Science" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Field of Study</label>
                  <input value={form.field} onChange={(e) => setForm({ ...form, field: e.target.value })} placeholder="Computer Science" />
                </div>
                <div className="form-group">
                  <label>Grade / GPA</label>
                  <input value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} placeholder="3.85" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Relevant coursework, activities, achievements..." />
              </div>
            </div>
            <div className="modal-footer">
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

      <SectionStyles sectionKey="education" label="Education Section Styles" />
    </PageLayout>
  );
}
