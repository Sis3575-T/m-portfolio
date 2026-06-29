import React, { useState, useEffect, useRef, useCallback } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import type { Blog } from '../types';
import { formatDate, formatDateTime, slugify } from '../lib/utils';

interface BlogForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  featured: boolean;
  thumbnail: string;
  scheduledAt: string;
  metaTitle: string;
  metaDescription: string;
}

const CATEGORIES = ['Technology', 'Web Development', 'Programming', 'Design', 'Career', 'Tutorial', 'Other'];

function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const exec = useCallback((cmd: string, val: string | null = null) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const handleLink = () => {
    if (showLinkInput && linkUrl) {
      exec('createLink', linkUrl);
      setLinkUrl('');
      setShowLinkInput(false);
    } else {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        setShowLinkInput(true);
      }
    }
  };

  const handleHeading = () => {
    const selection = window.getSelection();
    if (!selection) return;
    const parent = selection.anchorNode?.parentElement;
    const isH2 = parent?.closest('h2');
    exec('formatBlock', isH2 ? 'p' : 'h2');
  };

  return (
    <div className="rich-editor" style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, padding: '6px 8px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <button type="button" className="editor-btn" onClick={() => exec('bold')} title="Bold"><strong>B</strong></button>
        <button type="button" className="editor-btn" onClick={() => exec('italic')} title="Italic"><em>I</em></button>
        <button type="button" className="editor-btn" onClick={() => exec('underline')} title="Underline"><span style={{ textDecoration: 'underline' }}>U</span></button>
        <span style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
        <button type="button" className="editor-btn" onClick={handleHeading} title="Heading">H2</button>
        <span style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
        <button type="button" className="editor-btn" onClick={() => exec('insertUnorderedList')} title="Bullet List">UL</button>
        <button type="button" className="editor-btn" onClick={() => exec('insertOrderedList')} title="Ordered List">OL</button>
        <span style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
        {showLinkInput ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              style={{ width: 180, padding: '2px 6px', fontSize: 12, border: '1px solid var(--border)', borderRadius: 4 }}
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleLink(); if (e.key === 'Escape') setShowLinkInput(false); }}
            />
            <button type="button" className="editor-btn" onClick={handleLink} title="Apply">OK</button>
            <button type="button" className="editor-btn" onClick={() => setShowLinkInput(false)} title="Cancel">X</button>
          </span>
        ) : (
          <button type="button" className="editor-btn" onClick={handleLink} title="Insert Link">Link</button>
        )}
      </div>
      <div
        ref={editorRef}
        className="editor-content"
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        style={{ minHeight: '300px', padding: '12px', outline: 'none', lineHeight: 1.7 }}
      />
    </div>
  );
}

function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState('');

  const addTag = (value: string) => {
    const tag = value.trim();
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '6px 8px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--input-bg)', minHeight: 40, alignItems: 'center', cursor: 'text' }} onClick={() => {
      const input = document.getElementById('tag-input');
      input?.focus();
    }}>
      {tags.map((tag, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: 'var(--primary)', color: '#fff', borderRadius: '12px', fontSize: 12, lineHeight: '22px' }}>
          {tag}
          <button type="button" onClick={() => removeTag(i)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, fontSize: 14, lineHeight: 1 }}>&times;</button>
        </span>
      ))}
      <input
        id="tag-input"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input) addTag(input); }}
        placeholder={tags.length === 0 ? 'Type and press Enter to add tags' : ''}
        style={{ border: 'none', outline: 'none', flex: 1, minWidth: 120, background: 'transparent', fontSize: 13, padding: '2px 0' }}
      />
    </div>
  );
}

function estimateReadingTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, '');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function BlogManagement() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [form, setForm] = useState<BlogForm>({
    title: '', slug: '', excerpt: '', content: '', category: 'Technology',
    tags: [], featured: false, thumbnail: '', scheduledAt: '',
    metaTitle: '', metaDescription: '',
  });
  const [categories, setCategories] = useState<string[]>(CATEGORIES);
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showSEO, setShowSEO] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 8;

  useEffect(() => {
    adminApi.getBlogs()
      .then(({ data }) => {
        const list: Blog[] = data.data || [];
        setBlogs(list);
        const usedCategories = [...new Set(list.map(b => b.category).filter(Boolean))] as string[];
        setCategories(prev => [...new Set([...CATEGORIES, ...usedCategories])]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = blogs;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', slug: '', excerpt: '', content: '', category: 'Technology', tags: [], featured: false, thumbnail: '', scheduledAt: '', metaTitle: '', metaDescription: '' });
    setThumbnailPreview(null);
    setShowSEO(false);
    setShowModal(true);
  };

  const openEdit = (blog: Blog) => {
    setEditing(blog);
    setForm({
      title: blog.title || '',
      slug: blog.slug || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      category: blog.category || 'Technology',
      tags: blog.tags || [],
      featured: blog.featured || false,
      thumbnail: blog.thumbnail || '',
      scheduledAt: blog.scheduledAt || '',
      metaTitle: blog.metaTitle || '',
      metaDescription: blog.metaDescription || '',
    });
    setThumbnailPreview(blog.thumbnail || null);
    setShowSEO(false);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.title),
      };
      if (editing) await adminApi.updateBlog(editing._id, payload);
      else await adminApi.createBlog(payload);
      const { data } = await adminApi.getBlogs();
      setBlogs(data.data || []);
      setShowModal(false);
    } catch (err) { console.error('Failed to save blog', err); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await adminApi.deleteBlog(id);
      setBlogs(prev => prev.filter(b => b._id !== id));
    } catch (err) { console.error('Failed to delete', err); }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setThumbnailPreview(url);
      setForm({ ...form, thumbnail: url });
    };
    reader.readAsDataURL(file);
  };

  const handleAddCategory = () => {
    const cat = newCategory.trim();
    if (cat && !categories.includes(cat)) {
      setCategories(prev => [...prev, cat]);
      setForm({ ...form, category: cat });
    }
    setNewCategory('');
    setShowNewCategory(false);
  };

  const readingTime = estimateReadingTime(form.content);

  const getStatusBadge = (blog: Blog) => {
    if (blog.scheduledAt && new Date(blog.scheduledAt) > new Date()) {
      return <span className="badge badge-purple">Scheduled</span>;
    }
    if (blog.isActive) {
      return <span className="badge badge-green">Published</span>;
    }
    return <span className="badge badge-orange">Draft</span>;
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Blog Posts</h2>
          <p>Manage your blog ({blogs.length} posts)</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreate}><Icon path={Icons.plus} size={16} /> New Post</button>
        </div>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Date</th><th style={{ width: 80 }}>Actions</th></tr></thead>
          <tbody>
            {paged.map(b => (
              <tr key={b._id}>
                <td>
                  <div className="cell-title">
                    {b.thumbnail && <img src={b.thumbnail} alt="" style={{ width: 32, height: 24, objectFit: 'cover', borderRadius: 4, marginRight: 8, verticalAlign: 'middle' }} />}
                    {b.title}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    {b.featured && <span className="badge badge-blue">Featured</span>}
                    {b.tags && b.tags.slice(0, 3).map(t => <span key={t} className="badge badge-gray" style={{ fontSize: 10 }}>{t}</span>)}
                  </div>
                </td>
                <td><span className="badge badge-gray">{b.category}</span></td>
                <td>{getStatusBadge(b)}</td>
                <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {b.scheduledAt && new Date(b.scheduledAt) > new Date()
                    ? `Scheduled: ${formatDate(b.scheduledAt)}`
                    : formatDate(b.publishedAt || b.createdAt)}
                </td>
                <td>
                  <div className="table-actions">
                    <button className="btn-edit" onClick={() => openEdit(b)} data-tooltip="Edit"><Icon path={Icons.edit} size={14} /></button>
                    <button className="btn-delete" onClick={() => handleDelete(b._id)} data-tooltip="Delete"><Icon path={Icons.trash2} size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={5}><div className="empty-state"><Icon path={Icons['file-text']} size={40} /><h3>No blog posts</h3><p>Create your first blog post.</p></div></td></tr>
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
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Post' : 'New Post'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><Icon path={Icons.x} size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Slug</label>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Leave empty to auto-generate" />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <select value={form.category} onChange={(e) => {
                      if (e.target.value === '__new__') {
                        setShowNewCategory(true);
                      } else {
                        setForm({ ...form, category: e.target.value });
                      }
                    }} style={{ flex: 1 }}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      <option value="__new__">+ Add new category</option>
                    </select>
                  </div>
                  {showNewCategory && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                      <input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="New category name"
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory(); }}
                        autoFocus
                      />
                      <button type="button" className="btn btn-primary" style={{ padding: '4px 12px', fontSize: 12 }} onClick={handleAddCategory}>Add</button>
                      <button type="button" className="btn btn-outline" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => { setShowNewCategory(false); setNewCategory(''); }}>Cancel</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Excerpt</label>
                <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  Content
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 400 }}>
                    (~{readingTime} min read)
                  </span>
                </label>
                <RichTextEditor value={form.content} onChange={(html) => setForm({ ...form, content: html })} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tags</label>
                  <TagInput tags={form.tags} onChange={(tags) => setForm({ ...form, tags })} />
                </div>
                <div className="form-group">
                  <label>Featured post</label>
                  <div style={{ paddingTop: 6 }}>
                    <label className="form-check">
                      <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                      <span>Featured post</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cover Image</label>
                  <input type="file" accept="image/*" onChange={handleThumbnailUpload} style={{ fontSize: 13 }} />
                  {thumbnailPreview && (
                    <div style={{ marginTop: 8, position: 'relative', display: 'inline-block' }}>
                      <img src={thumbnailPreview} alt="Cover preview" style={{ maxWidth: 240, maxHeight: 140, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }} />
                      <button type="button" onClick={() => { setThumbnailPreview(null); setForm({ ...form, thumbnail: '' }); }} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Schedule Publish</label>
                  <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
                  {form.scheduledAt && new Date(form.scheduledAt) > new Date() && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 12, color: 'var(--primary)' }}>
                      <Icon path={Icons.clock} size={14} /> Scheduled for {formatDateTime(form.scheduledAt)}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <button type="button" onClick={() => setShowSEO(!showSEO)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'none', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}>
                  <Icon path={Icons['chevron-down']} size={14} style={{ transform: showSEO ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  SEO Settings
                </button>
              </div>

              {showSEO && (
                <div style={{ padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 16, background: 'var(--surface)' }}>
                  <div className="form-group">
                    <label>Meta Title</label>
                    <input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} placeholder="Leave empty to use post title" />
                  </div>
                  <div className="form-group">
                    <label>Meta Description</label>
                    <textarea value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} rows={2} placeholder="Brief description for search engines" />
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>
                <Icon path={Icons.save} size={14} /> {editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
