import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import PageLayout from '../components/PageLayout';
import SectionStyles from '../components/SectionStyles';
import Toolbar from '../components/Toolbar';

export default function ServicesManagement() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [filterVal, setFilterVal] = useState({ status: '' });
  const [form, setForm] = useState({ title: '', description: '', icon: '', isActive: true, order: 0 });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getServices();
      setItems(data.data || []);
    } catch {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '', icon: '', isActive: true, order: 0 });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title || '',
      description: item.description || '',
      icon: item.icon || '',
      isActive: item.isActive !== false,
      order: item.order ?? 0,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, order: Number(form.order) };
      if (editing) {
        await adminApi.updateService(editing._id, payload);
        toast.success('Service updated');
      } else {
        await adminApi.createService(payload);
        toast.success('Service created');
      }
      await fetchItems();
      setShowModal(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteService(deleteTarget._id);
      toast.success('Service deleted');
      setItems(prev => prev.filter(i => i._id !== deleteTarget._id));
    } catch {
      toast.error('Failed to delete service');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      await adminApi.updateService(item._id, { isActive: !item.isActive });
      toast.success(`Service ${item.isActive ? 'deactivated' : 'activated'}`);
      setItems(prev => prev.map(i => i._id === item._id ? { ...i, isActive: !i.isActive } : i));
    } catch {
      toast.error('Failed to toggle status');
    }
  };

  const handleReorder = async (item, direction) => {
    const idx = items.findIndex(i => i._id === item._id);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === items.length - 1) return;
    const newItems = [...items];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newItems[idx], newItems[swapIdx]] = [newItems[swapIdx], newItems[idx]];
    const updated = newItems.map((i, index) => ({ ...i, order: index }));
    setItems(updated);
    try {
      await adminApi.updateService(item._id, { order: updated[idx].order });
    } catch {
      toast.error('Failed to reorder');
      await fetchItems();
    }
  };

  const filtered = items.filter(item => {
    const q = searchVal.toLowerCase();
    if (q && !item.title?.toLowerCase().includes(q) && !item.description?.toLowerCase().includes(q)) return false;
    if (filterVal.status === 'active' && item.isActive === false) return false;
    if (filterVal.status === 'inactive' && item.isActive !== false) return false;
    return true;
  });

  const activeCount = items.filter(i => i.isActive !== false).length;
  const inactiveCount = items.filter(i => i.isActive === false).length;

  const stats = [
    { label: 'Total Services', value: items.length, icon: Icons.settings, color: 'blue' },
    { label: 'Active', value: activeCount, icon: Icons['check-circle'], color: 'green' },
    { label: 'Inactive', value: inactiveCount, icon: Icons['x-circle'], color: 'gray' },
  ];

  return (
    <PageLayout
      title="Services Management"
      description="Manage the services you offer"
      stats={stats}
    >
      <Toolbar
        searchValue={searchVal}
        onSearchChange={setSearchVal}
        searchPlaceholder="Search services..."
        filters={[
          { key: 'status', label: 'Status', type: 'select', options: ['', 'active', 'inactive'], labels: { '': 'All', active: 'Active', inactive: 'Inactive' } },
        ]}
        filterValues={filterVal}
        onFilterChange={(key, val) => {
          if (val === '__reset__' || key === '__reset__') setFilterVal({ status: '' });
          else setFilterVal({ ...filterVal, [key]: val });
        }}
        onRefresh={fetchItems}
        onAddNew={openCreate}
      />

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1.25rem' }}>
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10, marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 8, borderRadius: 4 }} />
              <div className="skeleton" style={{ height: 12, width: '80%', marginBottom: 4, borderRadius: 4 }} />
              <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 4 }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '4rem 2rem', background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, color: 'var(--color-text-tertiary)' }}>
          <Icon path={Icons.settings} size={48} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0 }}>No services yet</h3>
          <p style={{ fontSize: '0.84rem', margin: 0, textAlign: 'center' }}>Click 'Add New' to create your first service.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {filtered.map((item, index) => (
            <div
              key={item._id}
              style={{
                background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden',
                transition: 'box-shadow 0.2s, border-color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary-light)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', flexShrink: 0,
                    }}>
                      <Icon path={Icons[item.icon] || Icons.code} size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)' }}>{item.title}</div>
                      <span className={`status ${item.isActive !== false ? 'published' : 'draft'}`} style={{ fontSize: '0.7rem', marginTop: 2 }}>
                        {item.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>
                    #{item.order ?? index + 1}
                  </div>
                </div>

                <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: '0 0 1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', borderTop: '1px solid var(--color-border-light)', paddingTop: '0.75rem' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)} title="Edit">
                    <Icon path={Icons.edit} size={14} />
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleToggleStatus(item)} title={item.isActive !== false ? 'Deactivate' : 'Activate'}>
                    <Icon path={item.isActive !== false ? Icons['eye-off'] : Icons.eye} size={14} />
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleReorder(item, 'up')} disabled={index === 0} title="Move up" style={{ opacity: index === 0 ? 0.3 : 1 }}>
                    <Icon path={Icons['chevron-up']} size={14} />
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleReorder(item, 'down')} disabled={index === filtered.length - 1} title="Move down" style={{ opacity: index === filtered.length - 1 ? 0.3 : 1 }}>
                    <Icon path={Icons['chevron-down']} size={14} />
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)', marginLeft: 'auto' }} onClick={() => setDeleteTarget(item)} title="Delete">
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
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Service' : 'Add Service'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Web Development" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe this service..." />
              </div>
              <div className="form-group">
                <label>Icon</label>
                <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="code, globe, server, settings, etc." />
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', marginTop: 4 }}>
                  Use icon name from the icon library (e.g., code, globe, server, settings, award, etc.)
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Order</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.5rem' }}>
                  <label className="form-check">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                    <span>Active</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
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

      <SectionStyles sectionKey="services" label="Services Section Styles" />
    </PageLayout>
  );
}
