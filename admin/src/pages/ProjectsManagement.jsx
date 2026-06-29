import React, { useState, useEffect } from 'react';
import { adminApi, imageUrl } from '../services/api';
import api from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';

function Modal({ title, children, onClose, size = '' }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${size}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export default function ProjectsManagement() {
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', technologies: '', githubUrl: '', liveUrl: '',
    thumbnail: '', images: [], featured: false, category: 'Full Stack',
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getProjects();
      setProjects(data.data || []);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setUploadError('');
    setForm({ title: '', description: '', technologies: '', githubUrl: '', liveUrl: '', thumbnail: '', images: [], featured: false, category: 'Full Stack' });
    setShowModal(true);
  };

  const openEdit = (project) => {
    setEditing(project);
    setUploadError('');
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
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const data = {
        ...form,
        technologies: form.technologies.split(',').map(t => t.trim()).filter(Boolean),
      };
      if (editing) {
        await adminApi.updateProject(editing._id, data);
        toast.success('Project updated');
      } else {
        await adminApi.createProject(data);
        toast.success('Project created');
      }
      await fetchProjects();
      setShowModal(false);
    } catch (err) {
      toast.error('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteProject(deleteTarget._id);
      toast.success('Project deleted');
      setProjects(prev => prev.filter(p => p._id !== deleteTarget._id));
    } catch {
      toast.error('Failed to delete project');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleDuplicate = async (project) => {
    try {
      const data = { ...project, title: `${project.title} (Copy)` };
      delete data._id;
      delete data.createdAt;
      delete data.updatedAt;
      await adminApi.createProject(data);
      toast.success('Project duplicated');
      await fetchProjects();
    } catch {
      toast.error('Failed to duplicate project');
    }
  };

  const handleToggle = async (project) => {
    try {
      await adminApi.toggleProject(project._id);
      toast.success(`Project ${project.isActive ? 'hidden' : 'shown'}`);
      await fetchProjects();
    } catch {
      toast.error('Failed to toggle project');
    }
  };

  const handleBulkAction = async (action, selected) => {
    if (action === 'delete') {
      if (selected.length === 0) return;
      toast.success(`${selected.length} projects deleted`);
      for (const id of selected) {
        try { await adminApi.deleteProject(id); } catch {}
      }
      await fetchProjects();
    } else if (action === 'toggle') {
      for (const id of selected) {
        try { await adminApi.toggleProject(id); } catch {}
      }
      toast.success(`${selected.length} projects toggled`);
      await fetchProjects();
    }
  };

  const uploadImage = async (file) => {
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return data.data.url;
    } catch {
      setUploadError('Upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    const url = await uploadImage(file);
    if (url) setForm({ ...form, thumbnail: url });
  };

  const handleImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    e.target.value = '';
    const urls = await Promise.all(files.map(uploadImage));
    setForm({ ...form, images: [...form.images, ...urls.filter(Boolean)] });
  };

  const columns = [
    {
      key: 'title',
      label: 'Project',
      render: (row) => (
        <div>
          <div className="cell-title">{row.title}</div>
          <div className="cell-subtitle">{row.category}</div>
        </div>
      ),
    },
    {
      key: 'technologies',
      label: 'Technologies',
      render: (row) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {(row.technologies || []).slice(0, 3).map((t, i) => (
            <span key={i} className="badge badge-gray">{t}</span>
          ))}
          {(row.technologies || []).length > 3 && <span className="badge badge-gray">+{row.technologies.length - 3}</span>}
        </div>
      ),
    },
    {
      key: 'featured',
      label: 'Featured',
      render: (row) => row.featured ? <span className="badge badge-primary">Featured</span> : <span className="badge badge-gray">No</span>,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => <span className={`status ${row.isActive ? 'published' : 'draft'}`}>{row.isActive ? 'Published' : 'Hidden'}</span>,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Projects Management</h1>
          <p>Manage your portfolio projects - {projects.length} total</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreate}>
            <Icon path={Icons.plus} size={16} /> Add Project
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={projects}
        loading={loading}
        onEdit={openEdit}
        onDelete={(row) => setDeleteTarget(row)}
        onDuplicate={handleDuplicate}
        onToggle={handleToggle}
        onBulkAction={handleBulkAction}
        searchPlaceholder="Search projects..."
        emptyMessage="No projects yet. Click 'Add Project' to create one."
        emptyIcon={Icons.folder}
      />

      {showModal && (
        <Modal title={editing ? 'Edit Project' : 'Add Project'} onClose={() => setShowModal(false)} size="modal-lg">
          <div className="form-group">
            <label>Title <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="My Awesome Project" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your project..." rows={4} />
          </div>
          <div className="form-group">
            <label>Technologies (comma-separated)</label>
            <input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} placeholder="React, Node.js, MongoDB" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>GitHub URL</label>
              <input value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} placeholder="https://github.com/..." />
            </div>
            <div className="form-group">
              <label>Live Demo URL</label>
              <input value={form.liveUrl} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option>Full Stack</option>
                <option>Frontend</option>
                <option>Backend</option>
                <option>DevOps</option>
                <option>Mobile</option>
                <option>AI/ML</option>
              </select>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 10 }}>
              <div className="form-check">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                <label>Featured project</label>
              </div>
            </div>
          </div>
          {uploadError && <div className="login-error" style={{ marginBottom: 12 }}>{uploadError}</div>}
          <div className="form-group">
            <label>Thumbnail</label>
            <div className="image-upload-area">
              {form.thumbnail && (
                <div className="image-preview">
                  <img src={imageUrl(form.thumbnail)} alt="thumb" />
                  <button className="remove-image" onClick={() => setForm({ ...form, thumbnail: '' })}>&times;</button>
                </div>
              )}
              <label className="image-upload-btn">
                <Icon path={Icons.upload} size={14} /> {form.thumbnail ? 'Replace' : 'Upload'}
                <input type="file" accept="image/*" onChange={handleThumbnailUpload} style={{ display: 'none' }} />
              </label>
              {uploading && <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Uploading...</span>}
            </div>
          </div>
          <div className="form-group">
            <label>Gallery Images</label>
            <div className="image-upload-area">
              {form.images.map((img, i) => (
                <div key={i} className="image-preview">
                  <img src={imageUrl(img)} alt="" />
                  <button className="remove-image" onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })}>&times;</button>
                </div>
              ))}
              <label className="image-upload-btn">
                <Icon path={Icons.image} size={14} /> Add Images
                <input type="file" accept="image/*" multiple onChange={handleImagesUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
          <div className="modal-footer" style={{ padding: '20px 0 0' }}>
            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving || uploading}>
              {saving ? 'Saving...' : editing ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}
