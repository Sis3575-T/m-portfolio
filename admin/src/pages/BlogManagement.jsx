import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';

export default function BlogManagement() {
  const toast = useToast();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', category: 'General', tags: '', featured: false });

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getBlogs();
      setBlogs(data.data || []);
    } catch { toast.error('Failed to load blog posts'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', slug: '', excerpt: '', content: '', category: 'General', tags: '', featured: false });
    setShowModal(true);
  };

  const openEdit = (blog) => {
    setEditing(blog);
    setForm({
      title: blog.title || '', slug: blog.slug || '', excerpt: blog.excerpt || '',
      content: blog.content || '', category: blog.category || 'General',
      tags: (blog.tags || []).join(', '), featured: blog.featured || false,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const data = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      };
      if (editing) await adminApi.updateBlog(editing._id, data);
      else await adminApi.createBlog(data);
      toast.success(editing ? 'Post updated' : 'Post created');
      await fetchBlogs();
      setShowModal(false);
    } catch { toast.error('Failed to save blog post'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteBlog(deleteTarget._id);
      toast.success('Post deleted');
      setBlogs(prev => prev.filter(b => b._id !== deleteTarget._id));
    } catch { toast.error('Failed to delete post'); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const columns = [
    { key: 'title', label: 'Title', render: (row) => <div className="cell-title">{row.title}</div> },
    { key: 'category', label: 'Category' },
    {
      key: 'featured',
      label: 'Featured',
      render: (row) => row.featured ? <span className="badge badge-primary">Featured</span> : null,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => <span className={`status ${row.isActive ? 'published' : 'draft'}`}>{row.isActive ? 'Published' : 'Draft'}</span>,
    },
    {
      key: 'publishedAt',
      label: 'Date',
      render: (row) => <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{row.publishedAt ? new Date(row.publishedAt).toLocaleDateString() : '-'}</span>,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Blog Posts</h1>
          <p>Manage your blog - {blogs.length} posts</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreate}>
            <Icon path={Icons.plus} size={16} /> New Post
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={blogs}
        loading={loading}
        onEdit={openEdit}
        onDelete={(row) => setDeleteTarget(row)}
        searchPlaceholder="Search posts..."
        emptyMessage="No blog posts yet. Click 'New Post' to create one."
        emptyIcon={Icons.fileText}
      />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Post' : 'New Post'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="leave-empty-to-auto-generate" />
              </div>
              <div className="form-group">
                <label>Excerpt</label>
                <textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Content (markdown)</label>
                <textarea rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Tags (comma-separated)</label>
                  <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-check">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                  <span>Featured post</span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update Post' : 'Create Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Post"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}
