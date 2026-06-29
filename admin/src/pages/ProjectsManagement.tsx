import React, { useState, useEffect } from 'react';
import { adminApi, imageUrl } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import type { Project } from '../types';

interface ProjectForm {
  title: string;
  description: string;
  technologies: string;
  githubUrl: string;
  liveUrl: string;
  thumbnail: string;
  images: string[];
  featured: boolean;
  category: string;
}

const emptyForm: ProjectForm = {
  title: '', description: '', technologies: '', githubUrl: '', liveUrl: '',
  thumbnail: '', images: [], featured: false, category: 'Full Stack',
};

export default function ProjectsManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const perPage = 10;

  const fetchProjects = async () => {
    try {
      const { data } = await adminApi.getProjects();
      setProjects(data.data || []);
    } catch (err) { console.error('Failed to load projects', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const filtered = projects.filter(p =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.technologies?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };

  const openEdit = (project: Project) => {
    setEditing(project);
    setForm({
      title: project.title || '',
      description: project.description || '',
      technologies: (project.technologies || []).join(', '),
      githubUrl: project.githubUrl || '',
      liveUrl: project.liveUrl || '',
      thumbnail: project.thumbnail || '',
      images: project.images || [],
      featured: project.featured || false,
      category: project.category || 'Full Stack',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, technologies: form.technologies.split(',').map(t => t.trim()).filter(Boolean) };
      if (editing) await adminApi.updateProject(editing._id, payload);
      else await adminApi.createProject(payload);
      await fetchProjects();
      setShowModal(false);
    } catch (err) { console.error('Failed to save project', err); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try { await adminApi.deleteProject(id); setProjects(prev => prev.filter(p => p._id !== id)); }
    catch (err) { console.error('Failed to delete', err); }
  };

  const handleToggle = async (id: string) => {
    try { await adminApi.toggleProject(id); await fetchProjects(); }
    catch (err) { console.error('Failed to toggle', err); }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('category', 'image');
      const { data: up } = await adminApi.uploadMedia(fd);
      if (up.success && up.data?.url) setForm({ ...form, thumbnail: up.data.url });
    } catch (err) { console.error('Failed to upload thumbnail', err); }
  };

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('category', 'image');
        const { data: up } = await adminApi.uploadMedia(fd);
        if (up.success && up.data?.url) urls.push(up.data.url);
      }
      setForm({ ...form, images: [...form.images, ...urls] });
    } catch (err) { console.error('Failed to upload images', err); }
  };

  const removeImage = (idx: number) => setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Projects</h2>
          <p>Manage your portfolio projects ({projects.length} total)</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreate}><Icon path={Icons.plus} size={16} /> Add Project</button>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="table-search">
              <Icon path={Icons.search} size={14} />
              <input type="text" placeholder="Search projects..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
          </div>
          <div className="table-toolbar-right">
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{filtered.length} results</span>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Project</th><th>Technologies</th><th>Category</th><th>Status</th><th style={{ width: 100 }}>Actions</th></tr>
          </thead>
          <tbody>
            {paged.map((p) => (
              <tr key={p._id}>
                <td>
                  <div className="cell-title">{p.title}</div>
                  {p.featured && <span className="badge badge-blue">Featured</span>}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {(p.technologies || []).slice(0, 3).map((t, i) => (
                      <span key={i} className="badge badge-gray">{t}</span>
                    ))}
                    {(p.technologies || []).length > 3 && <span className="badge badge-gray">+{p.technologies.length - 3}</span>}
                  </div>
                </td>
                <td><span className="badge badge-blue">{p.category}</span></td>
                <td><span className={`badge ${p.isActive ? 'badge-green' : 'badge-gray'}`}>{p.isActive ? 'Published' : 'Hidden'}</span></td>
                <td>
                  <div className="table-actions">
                    <button className="btn-edit" onClick={() => openEdit(p)} data-tooltip="Edit"><Icon path={Icons.edit} size={14} /></button>
                    <button className="btn-view" onClick={() => handleToggle(p._id)} data-tooltip={p.isActive ? 'Hide' : 'Show'}>{p.isActive ? <Icon path={Icons['eye-off']} size={14} /> : <Icon path={Icons.eye} size={14} />}</button>
                    <button className="btn-delete" onClick={() => handleDelete(p._id)} data-tooltip="Delete"><Icon path={Icons.trash2} size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={5}><div className="empty-state"><Icon path={Icons.folder} size={40} /><h3>No projects found</h3><p>Create your first project to get started.</p><button className="btn btn-primary" onClick={openCreate}><Icon path={Icons.plus} size={16} /> Add Project</button></div></td></tr>
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
              <h3>{editing ? 'Edit Project' : 'Add Project'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><Icon path={Icons.x} size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Project name" /></div>
              <div className="form-group"><label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your project..." rows={4} /></div>
              <div className="form-group"><label>Technologies <span className="form-help">(comma-separated)</span></label><input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} placeholder="React, Node.js, MongoDB" /></div>
              <div className="form-row">
                <div className="form-group"><label>GitHub URL</label><input value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} placeholder="https://github.com/..." /></div>
                <div className="form-group"><label>Live URL</label><input value={form.liveUrl} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} placeholder="https://..." /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option>Full Stack</option><option>Frontend</option><option>Backend</option><option>DevOps</option><option>Mobile</option><option>AI/ML</option>
                  </select>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 9 }}>
                  <label className="form-check" style={{ marginBottom: 0 }}>
                    <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                    <span>Featured project</span>
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Thumbnail</label>
                <div className="image-upload-area">
                  {form.thumbnail && (
                    <div className="image-preview">
                      <img src={imageUrl(form.thumbnail)} alt="thumb" />
                      <button className="remove-image" onClick={() => setForm({ ...form, thumbnail: '' })}><Icon path={Icons.x} size={12} /></button>
                    </div>
                  )}
                  <label className="image-upload-btn">
                    <Icon path={Icons.upload} size={14} /> Upload Image
                    <input type="file" accept="image/*" onChange={handleThumbnailUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Gallery Images</label>
                <div className="image-upload-area" style={{ marginBottom: 8 }}>
                  {form.images.map((img, i) => (
                    <div key={i} className="image-preview">
                      <img src={imageUrl(img)} alt="" />
                      <button className="remove-image" onClick={() => removeImage(i)}><Icon path={Icons.x} size={12} /></button>
                    </div>
                  ))}
                </div>
                <label className="image-upload-btn">
                  <Icon path={Icons.upload} size={14} /> Add Images
                  <input type="file" accept="image/*" multiple onChange={handleImagesUpload} style={{ display: 'none' }} />
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update Project' : 'Create Project'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
