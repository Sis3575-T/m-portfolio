import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import type { Service } from '../types';

interface ServiceForm {
  title: string;
  description: string;
  icon: string;
  features: string;
  price: string;
  isActive: boolean;
}

export default function ServicesManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceForm>({ title: '', description: '', icon: '', features: '', price: '', isActive: true });
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    adminApi.getServices()
      .then(({ data }) => setServices(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = services;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '', icon: '', features: '', price: '', isActive: true });
    setShowModal(true);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({
      title: s.title,
      description: s.description,
      icon: s.icon || '',
      features: (s.features || []).join(', '),
      price: s.price || '',
      isActive: s.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, features: form.features.split(',').map(t => t.trim()).filter(Boolean) };
      if (editing) await adminApi.updateService(editing._id, payload);
      else await adminApi.createService(payload);
      const { data } = await adminApi.getServices();
      setServices(data.data || []);
      setShowModal(false);
    } catch (err) { console.error('Failed to save', err); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await adminApi.deleteService(id);
      setServices(prev => prev.filter(s => s._id !== id));
    } catch (err) { console.error('Failed to delete', err); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Services</h2>
          <p>Manage your services ({services.length} total)</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreate}><Icon path={Icons.plus} size={16} /> Add Service</button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Title</th><th>Icon</th><th>Price</th><th>Features</th><th>Status</th><th style={{ width: 80 }}>Actions</th></tr></thead>
          <tbody>
            {paged.map(s => (
              <tr key={s._id}>
                <td><div className="cell-title">{s.title}</div></td>
                <td style={{ fontSize: 20 }}>{s.icon || '-'}</td>
                <td>{s.price || '-'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {(s.features || []).slice(0, 2).map((f, i) => (
                      <span key={i} className="badge badge-gray">{f}</span>
                    ))}
                    {(s.features || []).length > 2 && (
                      <span className="badge badge-gray">+{s.features.length - 2}</span>
                    )}
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
            {paged.length === 0 && (
              <tr><td colSpan={6}><div className="empty-state"><Icon path={Icons.briefcase} size={40} /><h3>No services</h3><p>Add your first service.</p></div></td></tr>
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
              <h3>{editing ? 'Edit Service' : 'Add Service'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><Icon path={Icons.x} size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Service name" /></div>
              <div className="form-group"><label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe this service..." rows={3} /></div>
              <div className="form-row">
                <div className="form-group"><label>Icon (emoji or path)</label><input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="e.g. 🚀" /></div>
                <div className="form-group"><label>Price</label><input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="e.g. $99/mo or 'Free'" /></div>
              </div>
              <div className="form-group"><label>Features (comma-separated)</label><textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Feature 1, Feature 2, Feature 3" rows={2} /></div>
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
