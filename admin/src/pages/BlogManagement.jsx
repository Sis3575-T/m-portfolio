import React, { useState, useEffect, useRef } from 'react';
import { adminApi, imageUrl } from '../services/api';
import api from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import PageLayout from '../components/PageLayout';
import SectionStyles from '../components/SectionStyles';
import DataTable from '../components/DataTable';
import Toolbar from '../components/Toolbar';

const blogTabs = ['General', 'Content', 'Media', 'SEO'];

export default function BlogManagement() {
  const toast = useToast();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('General');
  const [searchVal, setSearchVal] = useState('');
  const [filterVal, setFilterVal] = useState({ status: '', category: '' });
  const [form, setForm] = useState({
    title: '', slug: '', category: 'General', status: 'draft', tags: '',
    featured: false, content: '', excerpt: '',
    metaTitle: '', metaDescription: '', keywords: '',
    image: '',
  });
  const textareaRef = useRef(null);

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getBlogs();
      setBlogs(data.data || []);
    } catch {
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const openCreate = () => {
    setEditing(null);
    setActiveTab('General');
    setForm({ title: '', slug: '', category: 'General', status: 'draft', tags: '', featured: false, content: '', excerpt: '', metaTitle: '', metaDescription: '', keywords: '', image: '' });
    setShowModal(true);
  };

  const openEdit = (blog) => {
    setEditing(blog);
    setActiveTab('General');
    setForm({
      title: blog.title || '',
      slug: blog.slug || '',
      category: blog.category || 'General',
      status: blog.status || 'draft',
      tags: (blog.tags || []).join(', '),
      featured: blog.featured || false,
      content: blog.content || '',
      excerpt: blog.excerpt || '',
      metaTitle: blog.metaTitle || '',
      metaDescription: blog.metaDescription || '',
      keywords: blog.keywords || '',
      image: blog.image || '',
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
        slug: form.slug || generateSlug(form.title),
      };
      if (editing) await adminApi.updateBlog(editing._id, data);
      else await adminApi.createBlog(data);
      toast.success(editing ? 'Post updated' : 'Post created');
      await fetchBlogs();
      setShowModal(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save blog post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteBlog(deleteTarget._id);
      toast.success('Post deleted');
      setBlogs(prev => prev.filter(b => b._id !== deleteTarget._id));
    } catch {
      toast.error('Failed to delete post');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleDuplicate = async (blog) => {
    try {
      const data = { ...blog, title: `${blog.title} (Copy)` };
      delete data._id;
      delete data.createdAt;
      delete data.updatedAt;
      data.slug = generateSlug(data.title);
      await adminApi.createBlog(data);
      toast.success('Post duplicated');
      await fetchBlogs();
    } catch {
      toast.error('Failed to duplicate post');
    }
  };

  const handleToggleStatus = async (blog) => {
    try {
      await adminApi.updateBlog(blog._id, { status: blog.status === 'published' ? 'draft' : 'published' });
      toast.success(`Post ${blog.status === 'published' ? 'unpublished' : 'published'}`);
      await fetchBlogs();
    } catch {
      toast.error('Failed to toggle status');
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

  const handleBulkAction = async (action, selected) => {
    if (selected.length === 0) return;
    try {
      for (const id of selected) {
        if (action === 'delete') await adminApi.deleteBlog(id);
        else if (action === 'publish') await adminApi.updateBlog(id, { status: 'published' });
        else if (action === 'unpublish') await adminApi.updateBlog(id, { status: 'draft' });
      }
      toast.success(`${selected.length} posts ${action === 'delete' ? 'deleted' : action}`);
      await fetchBlogs();
    } catch {
      toast.error('Bulk action failed');
    }
  };

  const insertFormatting = (cmd, val) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = form.content;
    let result;
    if (cmd === 'bold') result = text.slice(0, start) + `**${text.slice(start, end)}**` + text.slice(end);
    else if (cmd === 'italic') result = text.slice(0, start) + `*${text.slice(start, end)}*` + text.slice(end);
    else if (cmd === 'h2') result = text.slice(0, start) + `## ${text.slice(start, end)}` + text.slice(end);
    else if (cmd === 'h3') result = text.slice(0, start) + `### ${text.slice(start, end)}` + text.slice(end);
    else if (cmd === 'link') result = text.slice(0, start) + `[${text.slice(start, end)}](url)` + text.slice(end);
    else if (cmd === 'list') result = text.slice(0, start) + `- ${text.slice(start, end)}` + text.slice(end);
    setForm({ ...form, content: result });
  };

  const filteredData = blogs.filter(b => {
    const q = searchVal.toLowerCase();
    if (q && !b.title?.toLowerCase().includes(q)) return false;
    if (filterVal.status && b.status !== filterVal.status) return false;
    if (filterVal.category && b.category !== filterVal.category) return false;
    return true;
  });

  const stats = [
    { label: 'Total Posts', value: blogs.length, icon: Icons['file-text'], color: 'blue' },
    { label: 'Published', value: blogs.filter(b => b.status === 'published').length, icon: Icons.check, color: 'green' },
    { label: 'Drafts', value: blogs.filter(b => b.status === 'draft').length, icon: Icons.edit, color: 'yellow' },
    { label: 'Categories', value: [...new Set(blogs.map(b => b.category).filter(Boolean))].length, icon: Icons.folder, color: 'purple' },
    { label: 'Views', value: blogs.reduce((s, b) => s + (b.views || 0), 0), icon: Icons.eye, color: 'gray' },
  ];

  const columns = [
    {
      key: 'title', label: 'Title',
      render: (row) => <div className="cell-title">{row.title}</div>,
    },
    { key: 'category', label: 'Category', render: (row) => <span className="badge badge-gray">{row.category || 'General'}</span> },
    {
      key: 'status', label: 'Status',
      render: (row) => <span className={`status ${row.status === 'published' ? 'published' : 'draft'}`}>{row.status || 'draft'}</span>,
    },
    { key: 'views', label: 'Views', render: (row) => <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{row.views ?? 0}</span> },
    { key: 'createdAt', label: 'Created', render: (row) => <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}</span> },
    { key: 'updatedAt', label: 'Updated', render: (row) => <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '-'}</span> },
  ];

  const actionButtons = [
    { icon: Icons.eye, label: 'View', onClick: (row) => window.open(`/blog/${row.slug || row._id}`, '_blank') },
    { icon: Icons.edit, label: 'Edit', onClick: (row) => openEdit(row) },
    { icon: Icons.copy, label: 'Duplicate', onClick: (row) => handleDuplicate(row) },
    { icon: Icons['eye-off'], label: 'Publish/Unpublish', onClick: (row) => handleToggleStatus(row) },
    { icon: Icons.trash2, label: 'Delete', onClick: (row) => setDeleteTarget(row), variant: 'danger' },
  ];

  const renderTabContent = () => {
    if (activeTab === 'General') return (
      <>
        <div className="form-group">
          <label>Title <span style={{ color: 'var(--color-danger)' }}>*</span></label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: editing ? form.slug : generateSlug(e.target.value) })} placeholder="My Blog Post" />
        </div>
        <div className="form-group">
          <label>Slug</label>
          <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="my-blog-post" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option>General</option>
              <option>Technology</option>
              <option>Design</option>
              <option>Business</option>
              <option>Lifestyle</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Tags (comma-separated)</label>
          <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="react, javascript, web" />
        </div>
        <div className="form-group">
          <label className="form-check">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            <span>Featured post</span>
          </label>
        </div>
      </>
    );
    if (activeTab === 'Content') return (
      <>
        <div className="form-group">
          <label>Excerpt</label>
          <textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Brief summary of the post..." />
        </div>
        <div className="form-group">
          <label>Content</label>
          <div style={{ display: 'flex', gap: 4, marginBottom: 6, flexWrap: 'wrap' }}>
            {[
              { cmd: 'bold', label: 'B' },
              { cmd: 'italic', label: 'I' },
              { cmd: 'h2', label: 'H2' },
              { cmd: 'h3', label: 'H3' },
              { cmd: 'link', label: '🔗' },
              { cmd: 'list', label: '•' },
            ].map(btn => (
              <button
                key={btn.cmd}
                type="button"
                onClick={() => insertFormatting(btn.cmd)}
                style={{
                  padding: '4px 10px', border: '1px solid var(--color-border)', borderRadius: 6,
                  background: 'var(--color-bg-subtle)', cursor: 'pointer', fontSize: '0.82rem',
                  fontWeight: btn.cmd === 'bold' ? 700 : 500, color: 'var(--color-text-secondary)',
                  fontFamily: btn.cmd === 'bold' ? 'inherit' : undefined,
                  fontStyle: btn.cmd === 'italic' ? 'italic' : undefined,
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            rows={12}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Write your content here (Markdown supported)..."
            style={{ width: '100%', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.85rem', lineHeight: 1.6, padding: '0.75rem', border: '1.5px solid var(--color-border)', borderRadius: 8, background: 'var(--color-bg-subtle)', color: 'var(--color-text)', resize: 'vertical', outline: 'none' }}
          />
        </div>
      </>
    );
    if (activeTab === 'Media') return (
      <div className="form-group">
        <label>Featured Image</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {form.image && (
            <div style={{ position: 'relative', width: 200, height: 120, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              <img src={imageUrl(form.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={() => setForm({ ...form, image: '' })} style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>&times;</button>
            </div>
          )}
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', border: '2px dashed var(--color-border)', borderRadius: 10, cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.85rem', background: 'var(--color-bg-subtle)', transition: 'border-color 0.2s' }}>
            <Icon path={Icons.upload} size={16} />
            {form.image ? 'Replace Image' : 'Upload Featured Image'}
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
          </label>
        </div>
      </div>
    );
    if (activeTab === 'SEO') return (
      <>
        <div className="form-group">
          <label>Meta Title</label>
          <input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} placeholder="SEO title (leave empty to use post title)" />
        </div>
        <div className="form-group">
          <label>Meta Description</label>
          <textarea rows={3} value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} placeholder="Brief description for search engines..." />
        </div>
        <div className="form-group">
          <label>Keywords</label>
          <input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="keyword1, keyword2, keyword3" />
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>Comma-separated list of keywords</span>
        </div>
      </>
    );
    return null;
  };

  return (
    <PageLayout
      title="Blog Management"
      description="Manage your blog posts"
      stats={stats}
    >
      <Toolbar
        searchValue={searchVal}
        onSearchChange={setSearchVal}
        searchPlaceholder="Search posts..."
        filters={[
          { key: 'status', label: 'Status', type: 'select', options: ['published', 'draft'] },
          { key: 'category', label: 'Category', type: 'select', options: ['General', 'Technology', 'Design', 'Business', 'Lifestyle'] },
        ]}
        filterValues={filterVal}
        onFilterChange={(key, val) => {
          if (key === '__reset__' || val === '__reset__') setFilterVal({ status: '', category: '' });
          else setFilterVal({ ...filterVal, [key]: val });
        }}
        onAddNew={openCreate}
        onRefresh={fetchBlogs}
      />

      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        actions={actionButtons}
        onBulkAction={(action, selected) => handleBulkAction(action, selected)}
        searchable={false}
        emptyMessage="No blog posts yet. Click 'Add New' to create your first post."
        emptyIcon={Icons['file-text']}
      />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 760 }}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Post' : 'New Post'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
              {blogTabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1, padding: '0.75rem 1rem', border: 'none', background: activeTab === tab ? 'var(--color-primary-subtle)' : 'transparent',
                    color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontWeight: activeTab === tab ? 700 : 500, fontSize: '0.85rem', cursor: 'pointer',
                    borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="modal-body">
              {renderTabContent()}
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
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />

      <SectionStyles sectionKey="blog" label="Blog Section Styles" />
    </PageLayout>
  );
}
