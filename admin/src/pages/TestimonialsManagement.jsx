import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import PageLayout from '../components/PageLayout';
import SectionStyles from '../components/SectionStyles';
import Toolbar from '../components/Toolbar';

export default function TestimonialsManagement() {
  const toast = useToast();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [filterVal, setFilterVal] = useState({ status: '' });
  const [form, setForm] = useState({
    name: '', role: '', company: '', content: '', rating: 5,
    avatar: '', status: 'published', featured: false,
  });

  useEffect(() => { fetchTestimonials(); }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getTestimonials();
      setTestimonials(data.data || []);
    } catch {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', role: '', company: '', content: '', rating: 5, avatar: '', status: 'published', featured: false });
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      name: t.name || '',
      role: t.role || '',
      company: t.company || '',
      content: t.content || '',
      rating: t.rating ?? 5,
      avatar: t.avatar || '',
      status: t.status || 'published',
      featured: t.featured || false,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.content.trim()) { toast.error('Name and content are required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, rating: Number(form.rating) };
      if (editing) await adminApi.updateTestimonial(editing._id, payload);
      else await adminApi.createTestimonial(payload);
      toast.success(editing ? 'Testimonial updated' : 'Testimonial created');
      await fetchTestimonials();
      setShowModal(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save testimonial');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteTestimonial(deleteTarget._id);
      toast.success('Testimonial deleted');
      setTestimonials(prev => prev.filter(t => t._id !== deleteTarget._id));
    } catch {
      toast.error('Failed to delete testimonial');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleToggleStatus = async (t) => {
    try {
      const newStatus = t.status === 'published' ? 'pending' : 'published';
      await adminApi.updateTestimonial(t._id, { status: newStatus });
      toast.success(`Testimonial ${newStatus}`);
      await fetchTestimonials();
    } catch {
      toast.error('Failed to toggle status');
    }
  };

  const handleToggleFeature = async (t) => {
    try {
      await adminApi.updateTestimonial(t._id, { featured: !t.featured });
      toast.success(t.featured ? 'Unfeatured' : 'Featured');
      await fetchTestimonials();
    } catch {
      toast.error('Failed to toggle feature');
    }
  };

  const filteredTestimonials = testimonials.filter(t => {
    const q = searchVal.toLowerCase();
    if (q && !t.name?.toLowerCase().includes(q) && !t.company?.toLowerCase().includes(q)) return false;
    if (filterVal.status && t.status !== filterVal.status) return false;
    return true;
  });

  const stats = [
    { label: 'Total', value: testimonials.length, icon: Icons['message-square'], color: 'blue' },
    { label: 'Published', value: testimonials.filter(t => t.status === 'published').length, icon: Icons.check, color: 'green' },
    { label: 'Pending', value: testimonials.filter(t => t.status === 'pending').length, icon: Icons.clock, color: 'yellow' },
    { label: 'Featured', value: testimonials.filter(t => t.featured).length, icon: Icons.star, color: 'purple' },
  ];

  const renderStars = (rating) => {
    return (
      <span style={{ color: '#F59E0B', fontSize: '0.9rem', letterSpacing: 2 }}>
        {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
      </span>
    );
  };

  return (
    <PageLayout
      title="Testimonials"
      description="Manage client testimonials"
      stats={stats}
    >
      <Toolbar
        searchValue={searchVal}
        onSearchChange={setSearchVal}
        searchPlaceholder="Search testimonials..."
        filters={[
          { key: 'status', label: 'Status', type: 'select', options: ['published', 'pending'] },
        ]}
        filterValues={filterVal}
        onFilterChange={(key, val) => {
          if (key === '__reset__' || val === '__reset__') setFilterVal({ status: '' });
          else setFilterVal({ ...filterVal, [key]: val });
        }}
        onAddNew={openCreate}
        onRefresh={fetchTestimonials}
      />

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: '60%', height: 16, marginBottom: 6, borderRadius: 6, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                  <div className="skeleton" style={{ width: '40%', height: 12, borderRadius: 6, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                </div>
              </div>
              <div className="skeleton" style={{ width: '100%', height: 14, marginBottom: 6, borderRadius: 6, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              <div className="skeleton" style={{ width: '80%', height: 14, borderRadius: 6, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
            </div>
          ))}
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '4rem 2rem', color: 'var(--color-text-tertiary)' }}>
          <Icon path={Icons['message-square']} size={48} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0 }}>No testimonials yet</h3>
          <p style={{ margin: 0, fontSize: '0.88rem' }}>Click 'Add New' to create your first testimonial.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filteredTestimonials.map(t => (
            <div
              key={t._id}
              style={{
                padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)',
                background: 'var(--color-card)', display: 'flex', flexDirection: 'column', gap: '0.75rem',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', background: 'var(--color-bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {t.avatar ? (
                      <img src={t.avatar} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', fontWeight: 700, fontSize: '1rem' }}>
                        {t.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>{t.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>
                      {t.role}{t.company ? ` at ${t.company}` : ''}
                    </div>
                  </div>
                </div>
                <span className={`status ${t.status === 'published' ? 'published' : 'draft'}`} style={{ fontSize: '0.7rem' }}>{t.status || 'pending'}</span>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
                &ldquo;{t.content}&rdquo;
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  {renderStars(t.rating)}
                  {t.featured && <span className="badge badge-primary" style={{ marginLeft: 8, fontSize: '0.65rem' }}>Featured</span>}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => openEdit(t)} style={{ width: 30, height: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--color-text-secondary)', background: 'transparent', transition: 'background 0.15s' }} title="Edit" onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-subtle)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <Icon path={Icons.edit} size={14} />
                  </button>
                  <button onClick={() => handleToggleStatus(t)} style={{ width: 30, height: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--color-text-secondary)', background: 'transparent', transition: 'background 0.15s' }} title={t.status === 'published' ? 'Unpublish' : 'Publish'} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-subtle)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <Icon path={Icons[t.status === 'published' ? 'eye-off' : 'eye']} size={14} />
                  </button>
                  <button onClick={() => handleToggleFeature(t)} style={{ width: 30, height: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: 'pointer', color: t.featured ? '#F59E0B' : 'var(--color-text-secondary)', background: 'transparent', transition: 'background 0.15s' }} title={t.featured ? 'Unfeature' : 'Feature'} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-subtle)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <Icon path={Icons.star} size={14} />
                  </button>
                  <button onClick={() => setDeleteTarget(t)} style={{ width: 30, height: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--color-danger)', background: 'transparent', transition: 'background 0.15s' }} title="Delete" onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-subtle)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
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
              <h3>{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Name <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label>Rating (1-5)</label>
                  <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
                    {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Role</label>
                  <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="CEO" />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Corp" />
                </div>
              </div>
              <div className="form-group">
                <label>Quote <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <textarea rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="What they said about your work..." />
              </div>
              <div className="form-group">
                <label>Avatar URL</label>
                <input value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} placeholder="https://..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="published">Published</option>
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

      <SectionStyles sectionKey="testimonials" label="Testimonials Section Styles" />
    </PageLayout>
  );
}
