import React, { useState, useEffect } from 'react';
import { adminApi, imageUrl } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import type { Testimonial } from '../types';

interface TestimonialForm {
  name: string;
  position: string;
  company: string;
  content: string;
  avatar: string;
  rating: number;
  isActive: boolean;
}

export default function TestimonialsManagement() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<TestimonialForm>({ name: '', position: '', company: '', content: '', avatar: '', rating: 5, isActive: true });
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    adminApi.getTestimonials()
      .then(({ data }) => setTestimonials(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = testimonials;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', position: '', company: '', content: '', avatar: '', rating: 5, isActive: true });
    setShowModal(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({
      name: t.name, position: t.position || '', company: t.company || '',
      content: t.content, avatar: t.avatar || '', rating: t.rating, isActive: t.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editing) await adminApi.updateTestimonial(editing._id, form);
      else await adminApi.createTestimonial(form);
      const { data } = await adminApi.getTestimonials();
      setTestimonials(data.data || []);
      setShowModal(false);
    } catch (err) { console.error('Failed to save', err); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await adminApi.deleteTestimonial(id);
      setTestimonials(prev => prev.filter(t => t._id !== id));
    } catch (err) { console.error('Failed to delete', err); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('category', 'image');
      const { data: up } = await adminApi.uploadMedia(fd);
      if (up.success && up.data?.url) setForm({ ...form, avatar: up.data.url });
    } catch (err) { console.error('Upload failed', err); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Testimonials</h2>
          <p>Manage client testimonials ({testimonials.length} total)</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreate}><Icon path={Icons.plus} size={16} /> Add Testimonial</button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Position</th><th>Rating</th><th>Status</th><th style={{ width: 80 }}>Actions</th></tr></thead>
          <tbody>
            {paged.map(t => (
              <tr key={t._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {t.avatar && <img src={imageUrl(t.avatar)} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />}
                    <div>
                      <div className="cell-title">{t.name}</div>
                      {t.company && <div className="cell-subtitle">{t.company}</div>}
                    </div>
                  </div>
                </td>
                <td>{t.position || '-'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} style={{ color: i < t.rating ? '#F59E0B' : '#CBD5E1', fontSize: 14 }}>★</span>
                    ))}
                  </div>
                </td>
                <td><span className={`badge ${t.isActive ? 'badge-green' : 'badge-gray'}`}>{t.isActive ? 'Active' : 'Hidden'}</span></td>
                <td>
                  <div className="table-actions">
                    <button className="btn-edit" onClick={() => openEdit(t)} data-tooltip="Edit"><Icon path={Icons.edit} size={14} /></button>
                    <button className="btn-delete" onClick={() => handleDelete(t._id)} data-tooltip="Delete"><Icon path={Icons.trash2} size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={5}><div className="empty-state"><Icon path={Icons.star} size={40} /><h3>No testimonials</h3><p>Add your first testimonial.</p></div></td></tr>
            )}
          </tbody>
        </table>
        {filtered.length > perPage && (
          <div className="pagination">
            <span className="pagination-info">Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, filtered.length)} of {filtered.length}</span>
            <div className="pagination-buttons">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><Icon path={Icons['chevron-left']} size={14} /></button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                <button key={i} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><Icon path={Icons['chevron-right']} size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><Icon path={Icons.x} size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Client name" /></div>
                <div className="form-group"><label>Position</label><input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="CEO" /></div>
              </div>
              <div className="form-group"><label>Company</label><input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" /></div>
              <div className="form-group"><label>Content</label><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Testimonial text..." rows={3} /></div>
              <div className="form-row">
                <div className="form-group">
                  <label>Rating</label>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map(r => (
                      <button key={r} type="button" onClick={() => setForm({ ...form, rating: r })}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: r <= form.rating ? '#F59E0B' : '#CBD5E1' }}>
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Avatar</label>
                  <div className="image-upload-area">
                    {form.avatar && (
                      <div className="image-preview" style={{ width: 50, height: 50, borderRadius: '50%' }}>
                        <img src={imageUrl(form.avatar)} alt="" />
                        <button className="remove-image" onClick={() => setForm({ ...form, avatar: '' })}><Icon path={Icons.x} size={12} /></button>
                      </div>
                    )}
                    <label className="image-upload-btn">
                      <Icon path={Icons.upload} size={14} /> Upload
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-check">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                  <span>Active</span>
                </label>
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
