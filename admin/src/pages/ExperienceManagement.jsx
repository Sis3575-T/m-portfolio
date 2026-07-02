import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import PageLayout from '../components/PageLayout';
import SectionStyles from '../components/SectionStyles';
import Toolbar from '../components/Toolbar';

export default function ExperienceManagement() {
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
    company: '', position: '', startDate: '', endDate: '',
    current: false, description: '', technologies: '', order: 0, totalYears: 0,
  });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getExperiences();
      setItems(data.data || []);
    } catch {
      toast.error('Failed to load experiences');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ company: '', position: '', startDate: '', endDate: '', current: false, description: '', technologies: '', order: 0, totalYears: 0 });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      company: item.company || '',
      position: item.position || '',
      startDate: item.startDate ? item.startDate.slice(0, 10) : '',
      endDate: item.endDate ? item.endDate.slice(0, 10) : '',
      current: item.current || false,
      description: item.description || '',
      technologies: (item.technologies || []).join(', '),
      order: item.order ?? 0,
      totalYears: item.totalYears ?? 0,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.company.trim() || !form.position.trim()) { toast.error('Company and position are required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        technologies: form.technologies.split(',').map(t => t.trim()).filter(Boolean),
        endDate: form.current ? '' : form.endDate,
      };
      if (editing) await adminApi.updateExperience(editing._id, payload);
      else await adminApi.createExperience(payload);
      toast.success(editing ? 'Experience updated' : 'Experience created');
      await fetchItems();
      setShowModal(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save experience');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteExperience(deleteTarget._id);
      toast.success('Experience deleted');
      setItems(prev => prev.filter(i => i._id !== deleteTarget._id));
    } catch {
      toast.error('Failed to delete experience');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const filteredItems = items.filter(item => {
    const q = searchVal.toLowerCase();
    if (!q) return true;
    return item.company?.toLowerCase().includes(q) || item.position?.toLowerCase().includes(q);
  });

  const currentPositions = items.filter(i => i.current);
  const totalYears = items.reduce((years, item) => {
    if (item.totalYears) return years + item.totalYears;
    if (item.current) {
      const start = new Date(item.startDate);
      return years + ((new Date()) - start) / (365.25 * 24 * 60 * 60 * 1000);
    }
    if (item.startDate && item.endDate) {
      return years + (new Date(item.endDate) - new Date(item.startDate)) / (365.25 * 24 * 60 * 60 * 1000);
    }
    return years;
  }, 0);

  const stats = [
    { label: 'Total Experiences', value: items.length, icon: Icons.briefcase, color: 'blue' },
    { label: 'Current Positions', value: currentPositions.length, icon: Icons['user-check'], color: 'green' },
    { label: 'Total Years', value: Math.round(totalYears * 10) / 10, icon: Icons.clock, color: 'purple' },
  ];

  const timelineStyle = {
    position: 'relative',
    paddingLeft: '2rem',
  };

  const lineStyle = {
    position: 'absolute',
    left: '0.5rem',
    top: 0,
    bottom: 0,
    width: 2,
    background: 'var(--color-border)',
  };

  const dotStyle = (isCurrent) => ({
    position: 'absolute',
    left: '-1.1rem',
    top: '0.3rem',
    width: 14,
    height: 14,
    borderRadius: '50%',
    background: isCurrent ? 'var(--color-primary)' : 'var(--color-border)',
    border: '3px solid var(--color-card)',
    zIndex: 1,
  });

  return (
    <PageLayout
      title="Experience"
      description="Manage your work history"
      stats={stats}
    >
      <Toolbar
        searchValue={searchVal}
        onSearchChange={setSearchVal}
        searchPlaceholder="Search companies..."
        onAddNew={openCreate}
        onRefresh={fetchItems}
      />

      {loading ? (
        <div style={{ padding: '2rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ padding: '1.5rem', marginBottom: '1rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
              <div className="skeleton" style={{ width: '40%', height: 20, marginBottom: 8, borderRadius: 6, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              <div className="skeleton" style={{ width: '60%', height: 14, marginBottom: 12, borderRadius: 6, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              <div className="skeleton" style={{ width: '80%', height: 14, borderRadius: 6, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '4rem 2rem', color: 'var(--color-text-tertiary)' }}>
          <Icon path={Icons.briefcase} size={48} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0 }}>No experiences yet</h3>
          <p style={{ margin: 0, fontSize: '0.88rem' }}>Click 'Add New' to add your work experience.</p>
        </div>
      ) : (
        <div style={timelineStyle}>
          <div style={lineStyle} />
          {filteredItems.map((item) => (
            <div key={item._id} style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <div style={dotStyle(item.current)} />
              <div
                style={{
                  padding: '1.25rem', borderRadius: 14, border: '1px solid var(--color-border)',
                  background: 'var(--color-card)', transition: 'box-shadow 0.2s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
                  const actions = e.currentTarget.querySelector('.hover-actions');
                  if (actions) actions.style.opacity = 1;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '';
                  const actions = e.currentTarget.querySelector('.hover-actions');
                  if (actions) actions.style.opacity = 0;
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)' }}>{item.company}</span>
                      {item.current && <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>Current</span>}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem', fontWeight: 500 }}>{item.position}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-tertiary)', marginBottom: '0.75rem' }}>
                      {formatDate(item.startDate)} — {item.current ? 'Present' : formatDate(item.endDate)}
                    </div>
                    {item.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0 0 0.75rem 0', lineHeight: 1.5 }}>{item.description}</p>
                    )}
                    {item.technologies && item.technologies.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(Array.isArray(item.technologies) ? item.technologies : []).map((tech, i) => (
                          <span key={i} className="badge badge-gray">{tech}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="hover-actions" style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: 4, opacity: 0, transition: 'opacity 0.2s' }}>
                  <button onClick={() => openEdit(item)} style={{ width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--color-text-secondary)', background: 'var(--color-bg-subtle)', transition: 'background 0.15s' }} title="Edit">
                    <Icon path={Icons.edit} size={14} />
                  </button>
                  <button onClick={() => setDeleteTarget(item)} style={{ width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--color-danger)', background: 'var(--color-bg-subtle)', transition: 'background 0.15s' }} title="Delete">
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
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Experience' : 'Add Experience'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Company <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Corp" />
                </div>
                <div className="form-group">
                  <label>Position <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Senior Developer" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} disabled={form.current} />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '10px' }}>
                  <label className="form-check">
                    <input type="checkbox" checked={form.current} onChange={(e) => setForm({ ...form, current: e.target.checked })} />
                    <span>Present</span>
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your role and responsibilities..." />
              </div>
              <div className="form-group">
                <label>Technologies (comma-separated)</label>
                <input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} placeholder="React, Node.js, AWS" />
              </div>
              <div className="form-group">
                <label>Order</label>
                <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label>Total Years <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', fontWeight: 400 }}>(manual override)</span></label>
                <input type="number" step="0.1" min="0" value={form.totalYears} onChange={(e) => setForm({ ...form, totalYears: Number(e.target.value) })} placeholder="e.g. 2.5" />
              </div>
            </div>
            <div className="modal-footer">
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

      <SectionStyles sectionKey="experience" label="Experience Section Styles" />
    </PageLayout>
  );
}
