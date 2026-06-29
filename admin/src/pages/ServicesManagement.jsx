import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';

export default function ServicesManagement() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', icon: '', features: '' });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getServices();
      setItems(data.data || []);
    } catch { toast.error('Failed to load services'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '', icon: '', features: '' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title || '', description: item.description || '', icon: item.icon || '',
      features: (item.features || []).join('\n'),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, features: form.features.split('\n').map(s => s.trim()).filter(Boolean) };
      if (editing) await adminApi.updateService(editing._id, payload);
      else await adminApi.createService(payload);
      toast.success(editing ? 'Service updated' : 'Service created');
      await fetchItems();
      setShowModal(false);
    } catch { toast.error('Failed to save service'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteService(deleteTarget._id);
      toast.success('Service deleted');
      setItems(prev => prev.filter(i => i._id !== deleteTarget._id));
    } catch { toast.error('Failed to delete service'); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const columns = [
    {
      key: 'title',
      label: 'Service',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {row.icon && <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)' }}><Icon path={Icons[row.icon] || Icons.code} size={16} /></div>}
          <div>
            <div className="cell-title">{row.title}</div>
            <div className="cell-subtitle">{row.description?.substring(0, 60)}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'features',
      label: 'Features',
      render: (row) => <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{(row.features || []).length} features</span>,
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
          <h1>Services</h1>
          <p>Manage your services - {items.length} total</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreate}><Icon path={Icons.plus} size={16} /> Add Service</button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        onEdit={openEdit}
        onDelete={(row) => setDeleteTarget(row)}
        searchPlaceholder="Search services..."
        emptyMessage="No services yet. Click 'Add Service' to create one."
        emptyIcon={Icons.settings}
      />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Service' : 'Add Service'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Title <span style={{ color: 'var(--danger)' }}>*</span></label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="form-group"><label>Description</label><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="form-group"><label>Icon</label><input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Code, globe, server, etc." /></div>
              <div className="form-group"><label>Features (one per line)</label><textarea rows={3} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Responsive Design&#10;Performance Optimization" /></div>
            </div>
            <div className="modal-footer" style={{ padding: '16px 0 0' }}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update Service' : 'Create Service'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Service"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}
