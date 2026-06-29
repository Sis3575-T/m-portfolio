import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';

export default function TestimonialsManagement() {
  const toast = useToast();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', company: '', content: '', rating: 5, featured: false });

  useEffect(() => { fetchTestimonials(); }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getTestimonials();
      setTestimonials(data.data || []);
    } catch { toast.error('Failed to load testimonials'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', role: '', company: '', content: '', rating: 5, featured: false });
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({ name: t.name, role: t.role, company: t.company || '', content: t.content, rating: t.rating || 5, featured: t.featured || false });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.content.trim()) { toast.error('Name and content are required'); return; }
    setSaving(true);
    try {
      if (editing) await adminApi.updateTestimonial(editing._id, form);
      else await adminApi.createTestimonial(form);
      toast.success(editing ? 'Testimonial updated' : 'Testimonial created');
      await fetchTestimonials();
      setShowModal(false);
    } catch { toast.error('Failed to save testimonial'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteTestimonial(deleteTarget._id);
      toast.success('Testimonial deleted');
      setTestimonials(prev => prev.filter(t => t._id !== deleteTarget._id));
    } catch { toast.error('Failed to delete testimonial'); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    {
      key: 'role',
      label: 'Role',
      render: (row) => <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{row.role}{row.company ? ` at ${row.company}` : ''}</span>,
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (row) => <span style={{ color: '#F59E0B', fontSize: 13 }}>{'★'.repeat(row.rating)}{'☆'.repeat(5 - row.rating)}</span>,
    },
    {
      key: 'featured',
      label: 'Featured',
      render: (row) => row.featured ? <span className="badge badge-primary">Featured</span> : <span className="badge badge-gray">No</span>,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Testimonials</h1>
          <p>Manage client testimonials - {testimonials.length} total</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreate}>
            <Icon path={Icons.plus} size={16} /> Add Testimonial
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={testimonials}
        loading={loading}
        onEdit={openEdit}
        onDelete={(row) => setDeleteTarget(row)}
        searchPlaceholder="Search testimonials..."
        emptyMessage="No testimonials yet. Click 'Add Testimonial' to create one."
        emptyIcon={Icons.messageSquare}
      />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Rating (1-5)</label>
                  <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
                    {[5, 4, 3, 2, 1].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Content <span style={{ color: 'var(--danger)' }}>*</span></label>
                <textarea rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-check">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                  <span>Featured testimonial</span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update Testimonial' : 'Create Testimonial'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Testimonial"
        message={`Delete testimonial from "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}
