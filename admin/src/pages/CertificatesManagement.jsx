import React, { useState, useEffect } from 'react';
import { adminApi, imageUrl } from '../services/api';
import api from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import PageLayout from '../components/PageLayout';
import SectionStyles from '../components/SectionStyles';
import Toolbar from '../components/Toolbar';

export default function CertificatesManagement() {
  const toast = useToast();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [filterVal, setFilterVal] = useState({ status: '' });
  const [form, setForm] = useState({
    title: '', issuer: '', issueDate: '', expiryDate: '',
    credentialUrl: '', description: '', image: '', status: 'verified', featured: false,
  });

  useEffect(() => { fetchCertificates(); }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getCertificates();
      setCertificates(data.data || []);
    } catch {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', issuer: '', issueDate: '', expiryDate: '', credentialUrl: '', description: '', image: '', status: 'verified', featured: false });
    setShowModal(true);
  };

  const openEdit = (cert) => {
    setEditing(cert);
    setForm({
      title: cert.title || '',
      issuer: cert.issuer || '',
      issueDate: cert.issueDate || '',
      expiryDate: cert.expiryDate || '',
      credentialUrl: cert.credentialUrl || '',
      description: cert.description || '',
      image: cert.image || '',
      status: cert.status || 'verified',
      featured: cert.featured || false,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await adminApi.updateCertificate(editing._id, form);
      } else {
        await adminApi.createCertificate(form);
      }
      toast.success(editing ? 'Certificate updated' : 'Certificate created');
      await fetchCertificates();
      setShowModal(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save certificate');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteCertificate(deleteTarget._id);
      toast.success('Certificate deleted');
      setCertificates(prev => prev.filter(c => c._id !== deleteTarget._id));
    } catch {
      toast.error('Failed to delete certificate');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (data.data?.url) setForm({ ...form, image: data.data.url });
      toast.success('Image uploaded');
    } catch {
      toast.error('Failed to upload image');
    }
  };

  const filteredData = certificates.filter(c => {
    const q = searchVal.toLowerCase();
    if (q && !c.title?.toLowerCase().includes(q) && !c.issuer?.toLowerCase().includes(q)) return false;
    if (filterVal.status && c.status !== filterVal.status) return false;
    return true;
  });

  const verified = certificates.filter(c => c.status === 'verified' || c.visible);
  const expired = certificates.filter(c => c.expiryDate && new Date(c.expiryDate) < new Date());
  const featured = certificates.filter(c => c.featured);

  const stats = [
    { label: 'Total', value: certificates.length, icon: Icons.award, color: 'blue' },
    { label: 'Verified', value: verified.length, icon: Icons['check-circle'], color: 'green' },
    { label: 'Expired', value: expired.length, icon: Icons['alert-circle'], color: 'red' },
    { label: 'Featured', value: featured.length, icon: Icons.star, color: 'purple' },
  ];

  const statusColor = (status) => {
    const map = { verified: 'green', expired: 'red', revoked: 'red', pending: 'yellow' };
    return map[status] || 'gray';
  };

  return (
    <PageLayout
      title="Certificates"
      description="Manage your certifications and credentials"
      stats={stats}
    >
      <Toolbar
        searchValue={searchVal}
        onSearchChange={setSearchVal}
        searchPlaceholder="Search certificates..."
        filters={[
          { key: 'status', label: 'Status', type: 'select', options: ['verified', 'expired', 'revoked', 'pending'] },
        ]}
        filterValues={filterVal}
        onFilterChange={(key, val) => {
          if (key === '__reset__' || val === '__reset__') setFilterVal({ status: '' });
          else setFilterVal({ ...filterVal, [key]: val });
        }}
        onAddNew={openCreate}
        onRefresh={fetchCertificates}
      />

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ borderRadius: 14, border: '1px solid var(--color-border)', overflow: 'hidden', background: 'var(--color-card)' }}>
              <div className="skeleton" style={{ width: '100%', height: 140, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              <div style={{ padding: '1rem' }}>
                <div className="skeleton" style={{ width: '70%', height: 16, marginBottom: 8, borderRadius: 6, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                <div className="skeleton" style={{ width: '50%', height: 12, borderRadius: 6, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              </div>
            </div>
          ))}
        </div>
      ) : filteredData.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '4rem 2rem', color: 'var(--color-text-tertiary)' }}>
          <Icon path={Icons.award} size={48} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0 }}>No certificates yet</h3>
          <p style={{ margin: 0, fontSize: '0.88rem' }}>Click 'Add New' to add your first certificate.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {filteredData.map(cert => (
            <div
              key={cert._id}
              style={{
                borderRadius: 14, border: '1px solid var(--color-border)',
                overflow: 'hidden', background: 'var(--color-card)',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
            >
              <div style={{ height: 140, background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                {cert.image ? (
                  <img src={imageUrl(cert.image)} alt={cert.title} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 16 }} />
                ) : (
                  <Icon path={Icons.award} size={48} style={{ color: 'var(--color-text-tertiary)' }} />
                )}
                <div style={{ position: 'absolute', top: 8, left: 8 }}>
                  <span className={`badge badge-${statusColor(cert.status)}`}>{cert.status || (cert.visible ? 'verified' : 'hidden')}</span>
                  {cert.featured && <span className="badge badge-primary" style={{ marginLeft: 4 }}>Featured</span>}
                </div>
                {cert.credentialUrl && (
                  <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 6, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }} title="View Credential">
                    <Icon path={Icons['external-link']} size={12} />
                  </a>
                )}
              </div>
              <div style={{ padding: '1rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)', marginBottom: 4 }}>{cert.title}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: 4 }}>{cert.issuer}</div>
                {cert.issueDate && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
                    Issued: {cert.issueDate}
                    {cert.expiryDate && <span> · Expires: {cert.expiryDate}</span>}
                  </div>
                )}
                {cert.description && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', margin: '0.5rem 0 0 0', lineHeight: 1.4 }}>{cert.description}</p>
                )}
                <div style={{ display: 'flex', gap: 4, marginTop: '0.75rem', justifyContent: 'flex-end' }}>
                  <button onClick={() => openEdit(cert)} style={{ width: 30, height: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--color-text-secondary)', background: 'var(--color-bg-subtle)', transition: 'background 0.15s' }} title="Edit">
                    <Icon path={Icons.edit} size={14} />
                  </button>
                  <button onClick={() => setDeleteTarget(cert)} style={{ width: 30, height: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--color-danger)', background: 'var(--color-bg-subtle)', transition: 'background 0.15s' }} title="Delete">
                    <Icon path={Icons.trash2} size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Certificate' : 'Add Certificate'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Title <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="AWS Certified Developer" />
                </div>
                <div className="form-group">
                  <label>Issuer</label>
                  <input value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} placeholder="Amazon Web Services" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Issue Date</label>
                  <input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Credential URL</label>
                <input value={form.credentialUrl} onChange={(e) => setForm({ ...form, credentialUrl: e.target.value })} placeholder="https://credential.example.com/..." />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the certification..." />
              </div>
              <div className="form-group">
                <label>Certificate Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  {form.image && (
                    <div style={{ position: 'relative', width: 120, height: 80, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                      <img src={imageUrl(form.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      <button onClick={() => setForm({ ...form, image: '' })} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>&times;</button>
                    </div>
                  )}
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '2px dashed var(--color-border)', borderRadius: 8, cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.85rem', background: 'var(--color-bg-subtle)', transition: 'border-color 0.2s' }}>
                    <Icon path={Icons.upload} size={14} />
                    {form.image ? 'Replace' : 'Upload Image'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="verified">Verified</option>
                    <option value="expired">Expired</option>
                    <option value="revoked">Revoked</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '10px' }}>
                  <label className="form-check">
                    <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                    <span>Featured</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Certificate"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />

      <SectionStyles sectionKey="certificates" label="Certificates Section Styles" />
    </PageLayout>
  );
}
