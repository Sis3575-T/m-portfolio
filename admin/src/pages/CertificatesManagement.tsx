import React, { useState, useEffect } from 'react';
import { adminApi, imageUrl } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import type { Certificate } from '../types';
import { formatDate } from '../lib/utils';

interface CertForm {
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  credentialUrl: string;
  image: string;
  visible: boolean;
}

export default function CertificatesManagement() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Certificate | null>(null);
  const [form, setForm] = useState<CertForm>({
    title: '', issuer: '', issueDate: '', expiryDate: '',
    credentialId: '', credentialUrl: '', image: '', visible: true,
  });

  useEffect(() => {
    adminApi.getCertificates()
      .then(({ data }) => setCertificates(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', issuer: '', issueDate: '', expiryDate: '', credentialId: '', credentialUrl: '', image: '', visible: true });
    setShowModal(true);
  };

  const openEdit = (cert: Certificate) => {
    setEditing(cert);
    setForm({
      title: cert.title, issuer: cert.issuer,
      issueDate: cert.issueDate || '', expiryDate: cert.expiryDate || '',
      credentialId: cert.credentialId || '', credentialUrl: cert.credentialUrl || '',
      image: cert.image || '', visible: cert.visible,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== undefined && val !== null) formData.append(key, String(val));
      });
      if (editing) await adminApi.updateCertificate(editing._id, formData);
      else await adminApi.createCertificate(formData);
      const { data } = await adminApi.getCertificates();
      setCertificates(data.data || []);
      setShowModal(false);
    } catch (err) { console.error('Failed to save certificate', err); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this certificate?')) return;
    try { await adminApi.deleteCertificate(id); setCertificates(prev => prev.filter(c => c._id !== id)); }
    catch (err) { console.error('Failed to delete', err); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('category', 'image');
      const { data: up } = await adminApi.uploadMedia(fd);
      if (up.success && up.data?.url) setForm({ ...form, image: up.data.url });
    } catch (err) { console.error('Failed to upload image', err); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Certificates</h2>
          <p>Manage your certifications and credentials ({certificates.length} total)</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreate}><Icon path={Icons.plus} size={16} /> Add Certificate</button>
        </div>
      </div>

      <div className="media-grid">
        {certificates.map(cert => (
          <div key={cert._id} className="media-card">
            <div className="media-preview" style={{ background: 'var(--bg)' }}>
              {cert.image ? (
                <img src={imageUrl(cert.image)} alt={cert.title} style={{ objectFit: 'contain', padding: 12 }} />
              ) : (
                <Icon path={Icons.award} size={40} />
              )}
            </div>
            <div className="media-info">
              <div className="media-name">{cert.title}</div>
              <div className="media-meta">{cert.issuer}</div>
              {cert.issueDate && <div className="media-meta">Issued: {cert.issueDate}</div>}
            </div>
            <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 4 }}>
              <span className={`badge ${cert.visible ? 'badge-green' : 'badge-gray'}`}>{cert.visible ? 'Visible' : 'Hidden'}</span>
              {cert.credentialUrl && (
                <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer"
                  className="btn btn-ghost btn-xs" style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }} data-tooltip="View credential">
                  <Icon path={Icons['external-link']} size={12} />
                </a>
              )}
            </div>
            <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
              <button className="btn-edit" style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none' }}
                onClick={() => openEdit(cert)} data-tooltip="Edit">
                <Icon path={Icons.edit} size={12} />
              </button>
              <button className="btn-delete" style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none' }}
                onClick={() => handleDelete(cert._id)} data-tooltip="Delete">
                <Icon path={Icons.trash2} size={12} />
              </button>
            </div>
          </div>
        ))}
        {certificates.length === 0 && (
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state" onClick={openCreate} style={{ cursor: 'pointer' }}>
              <Icon path={Icons.award} size={48} />
              <h3>No certificates yet</h3>
              <p>Click here to add your first certificate</p>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Certificate' : 'Add Certificate'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><Icon path={Icons.x} size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label>Certificate Name</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div className="form-group"><label>Organization</label><input value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Issue Date</label><input type="text" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} placeholder="e.g. 2024-03" /></div>
                <div className="form-group"><label>Expiry Date</label><input type="text" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} placeholder="e.g. 2027-03 or 'No expiry'" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Credential ID</label><input value={form.credentialId} onChange={(e) => setForm({ ...form, credentialId: e.target.value })} /></div>
                <div className="form-group"><label>Credential URL</label><input value={form.credentialUrl} onChange={(e) => setForm({ ...form, credentialUrl: e.target.value })} placeholder="https://" /></div>
              </div>
              <div className="form-group">
                <label>Certificate Image</label>
                <div className="image-upload-area">
                  {form.image && (
                    <div className="image-preview" style={{ width: 120, height: 80 }}>
                      <img src={imageUrl(form.image)} alt="preview" />
                      <button className="remove-image" onClick={() => setForm({ ...form, image: '' })}><Icon path={Icons.x} size={12} /></button>
                    </div>
                  )}
                  <label className="image-upload-btn">
                    <Icon path={Icons.upload} size={14} /> Upload Image
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label className="form-check">
                  <input type="checkbox" checked={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.checked })} />
                  <span>Visible on portfolio</span>
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
