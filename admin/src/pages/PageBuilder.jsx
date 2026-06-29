import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';

export default function PageBuilder() {
  const toast = useToast();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [form, setForm] = useState({ title: '', insertAfter: '' });
  const [dragIdx, setDragIdx] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchPages(); }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getPages();
      setPages(data.data || []);
    } catch { toast.error('Failed to load pages'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setForm({ title: '', insertAfter: '' });
    setShowModal(true);
  };

  const handleCreate = async () => {
    try {
      await adminApi.createPage({
        title: form.title,
        slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        insertAfter: form.insertAfter || undefined,
      });
      toast.success('Page created');
      await fetchPages();
      setShowModal(false);
    } catch { toast.error('Failed to create page'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deletePage(deleteTarget._id);
      toast.success('Page deleted');
      await fetchPages();
    } catch { toast.error('Failed to delete page'); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const handleDuplicate = async (id) => {
    try {
      await adminApi.duplicatePage(id);
      toast.success('Page duplicated');
      await fetchPages();
    } catch { toast.error('Failed to duplicate page'); }
  };

  const handleToggle = async (id) => {
    try {
      await adminApi.togglePage(id);
      toast.success('Page toggled');
      await fetchPages();
    } catch { toast.error('Failed to toggle page'); }
  };

  const handleRename = async (id) => {
    if (!editName.trim()) return;
    try {
      await adminApi.updatePage(id, { title: editName });
      toast.success('Page renamed');
      await fetchPages();
      setEditingId(null);
    } catch { toast.error('Failed to rename page'); }
  };

  const handleDragStart = (idx) => setDragIdx(idx);
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const copy = [...pages];
    const [moved] = copy.splice(dragIdx, 1);
    copy.splice(idx, 0, moved);
    setPages(copy);
    setDragIdx(idx);
  };
  const handleDragEnd = async () => {
    setDragIdx(null);
    try {
      await adminApi.reorderPages(pages.map((p, i) => ({ _id: p._id, order: i })));
    } catch { toast.error('Failed to reorder pages'); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Page Builder</h2>
          <p>Create and manage your site pages ({pages.length} pages)</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreate}><Icon path={Icons['file-plus']} size={16} /> Create Page</button>
        </div>
      </div>

      <div className="page-builder-list">
        {pages.map((p, idx) => (
          <div
            key={p._id}
            className={`page-builder-item${dragIdx === idx ? ' dragging' : ''}`}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
          >
            <div className="page-builder-item-left">
              <div className="drag-handle">
                <Icon path={Icons.move} size={16} />
              </div>
              <div className={`page-builder-status ${p.isPublished ? 'published' : 'draft'}`} />
              <div>
                {editingId === p._id ? (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRename(p._id); if (e.key === 'Escape') setEditingId(null); }}
                      style={{ padding: '4px 8px', fontSize: 13, width: 200 }}
                      autoFocus
                    />
                    <button className="btn btn-primary btn-xs" onClick={() => handleRename(p._id)}>Save</button>
                    <button className="btn btn-outline btn-xs" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <div className="page-builder-item-title">{p.title}</div>
                    <div className="page-builder-item-url">/{p.slug}</div>
                  </>
                )}
              </div>
            </div>
            <div className="page-builder-item-actions">
              {editingId !== p._id && (
                <>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setEditingId(p._id); setEditName(p.title); }}>
                    <Icon path={Icons.edit} size={14} />
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDuplicate(p._id)}>
                    <Icon path={Icons.copy} size={14} />
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleToggle(p._id)}>
                    {p.isPublished ? <Icon path={Icons['eye-off']} size={14} /> : <Icon path={Icons.eye} size={14} />}
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => setDeleteTarget(p)}>
                    <Icon path={Icons.trash2} size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {pages.length === 0 && (
          <div className="empty-state">
            <Icon path={Icons['file-plus']} size={48} />
            <h3>No pages yet</h3>
            <p>Create your first page to get started.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Page</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><Icon path={Icons.x} size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Page Name</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. About Us" autoFocus />
              </div>
              <div className="form-group">
                <label>Insert After (optional)</label>
                <select value={form.insertAfter} onChange={(e) => setForm({ ...form, insertAfter: e.target.value })}>
                  <option value="">At the end</option>
                  {pages.map(p => (
                    <option key={p._id} value={p._id}>After "{p.title}"</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={!form.title.trim()}>Create</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Page"
        message={`Delete "${deleteTarget?.title}" page? This cannot be undone. All components on this page will be lost.`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}
