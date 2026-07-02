import React, { useState, useEffect, useCallback } from 'react';
import { adminApi, imageUrl } from '../services/api';
import api from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import PageLayout from '../components/PageLayout';
import SectionStyles from '../components/SectionStyles';
import DataTable from '../components/DataTable';
import Toolbar from '../components/Toolbar';

const categories = ['Full Stack', 'Frontend', 'Backend', 'DevOps', 'Mobile', 'AI/ML'];

const tabs = ['General', 'Content', 'Media', 'Card Style'];

export default function ProjectsManagement() {
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('General');
  const [searchVal, setSearchVal] = useState('');
  const [filterVal, setFilterVal] = useState({ status: '', category: '' });
  const [form, setForm] = useState({
    title: '', slug: '', description: '', tags: '', category: 'Full Stack',
    status: 'draft', featured: false, isVisible: true, order: 0,
    liveUrl: '', githubUrl: '', youtubeUrl: '', projectUrl: '',
    thumbnail: '', images: [], technologies: [],
    statusBadge: 'Completed', objectPosition: 'center',
    liveLabel: 'Live Demo', githubLabel: 'GitHub', detailsLabel: 'Details',
    cardBorderRadius: 16, overlayOpacity: 0.6, hoverScale: 1.05, hoverShadow: true,
    showStatusBadge: true, showTechStack: true, maxTechDisplay: 6, descriptionLines: 3,
  });

  useEffect(() => { fetchProjects(); }, []);

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

  const generateSlug = (title) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const openCreate = () => {
    setEditing(null);
    setActiveTab('General');
    setForm({ 
      title: '', slug: '', description: '', tags: '', category: 'Full Stack', 
      status: 'draft', featured: false, isVisible: true, order: 0, 
      liveUrl: '', githubUrl: '', youtubeUrl: '', projectUrl: '', 
      thumbnail: '', images: [], technologies: [],
      statusBadge: 'Completed', objectPosition: 'center', 
      liveLabel: 'Live Demo', githubLabel: 'GitHub', detailsLabel: 'Details',
      cardBorderRadius: 16, overlayOpacity: 0.6, hoverScale: 1.05, hoverShadow: true,
      showStatusBadge: true, showTechStack: true, maxTechDisplay: 6, descriptionLines: 3,
    });
    setShowModal(true);
  };

  const openEdit = (project) => {
    setEditing(project);
    setActiveTab('General');
    setForm({
      title: project.title || '',
      slug: project.slug || '',
      description: project.description || '',
      tags: (project.tags || []).join(', '),
      category: project.category || 'Full Stack',
      status: project.status || 'draft',
      featured: project.featured || false,
      isVisible: project.isVisible !== false,
      order: project.order ?? 0,
      liveUrl: project.liveUrl || '',
      githubUrl: project.githubUrl || '',
      youtubeUrl: project.youtubeUrl || '',
      projectUrl: project.projectUrl || '',
      thumbnail: project.thumbnail || '',
      images: project.images || [],
      technologies: project.technologies || [],
      statusBadge: project.statusBadge || 'Completed',
      objectPosition: project.objectPosition || 'center',
      liveLabel: project.liveLabel || 'Live Demo',
      githubLabel: project.githubLabel || 'GitHub',
      detailsLabel: project.detailsLabel || 'Details',
      cardBorderRadius: project.cardBorderRadius || 16,
      overlayOpacity: project.overlayOpacity || 0.6,
      hoverScale: project.hoverScale || 1.05,
      hoverShadow: project.hoverShadow !== false,
      showStatusBadge: project.showStatusBadge !== false,
      showTechStack: project.showTechStack !== false,
      maxTechDisplay: project.maxTechDisplay || 6,
      descriptionLines: project.descriptionLines || 3,
    });
    setShowModal(true);
  };

  const handleSave = async (action = 'save') => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const data = {
        ...form,
        technologies: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        slug: form.slug || generateSlug(form.title),
        status: action === 'publish' ? 'published' : form.status,
      };
      delete data.tags;
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
      toast.error(err?.response?.data?.message || 'Failed to save project');
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
      data.slug = generateSlug(data.title);
      await adminApi.createProject(data);
      toast.success('Project duplicated');
      await fetchProjects();
    } catch {
      toast.error('Failed to duplicate project');
    }
  };

  const handleToggleStatus = async (project) => {
    try {
      await adminApi.updateProject(project._id, { status: project.status === 'published' ? 'draft' : 'published' });
      toast.success(`Project ${project.status === 'published' ? 'unpublished' : 'published'}`);
      await fetchProjects();
    } catch {
      toast.error('Failed to toggle status');
    }
  };

  const handleToggleFeature = async (project) => {
    try {
      await adminApi.updateProject(project._id, { featured: !project.featured });
      toast.success(project.featured ? 'Unfeatured' : 'Featured');
      await fetchProjects();
    } catch {
      toast.error('Failed to toggle feature');
    }
  };

  const uploadImage = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return data.data.url;
    } catch {
      toast.error('Upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const url = await uploadImage(file);
    if (url) setForm({ ...form, thumbnail: url });
  };

  const handleImagesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    const urls = await Promise.all(files.map(uploadImage));
    setForm({ ...form, images: [...form.images, ...urls.filter(Boolean)] });
  };

  const handleBulkAction = async (action, selected) => {
    if (selected.length === 0) return;
    try {
      for (const id of selected) {
        if (action === 'delete') await adminApi.deleteProject(id);
        else if (action === 'publish') await adminApi.updateProject(id, { status: 'published' });
        else if (action === 'unpublish') await adminApi.updateProject(id, { status: 'draft' });
      }
      toast.success(`${selected.length} projects ${action === 'delete' ? 'deleted' : action}`);
      await fetchProjects();
    } catch {
      toast.error('Bulk action failed');
    }
  };

  const filteredData = projects.filter(p => {
    const q = searchVal.toLowerCase();
    if (q && !p.title?.toLowerCase().includes(q) && !p.category?.toLowerCase().includes(q)) return false;
    if (filterVal.status && p.status !== filterVal.status) return false;
    if (filterVal.category && p.category !== filterVal.category) return false;
    return true;
  });

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: Icons.folder, color: 'blue' },
    { label: 'Published', value: projects.filter(p => p.status === 'published').length, icon: Icons.check, color: 'green' },
    { label: 'Draft', value: projects.filter(p => p.status === 'draft').length, icon: Icons.edit, color: 'yellow' },
    { label: 'Featured', value: projects.filter(p => p.featured).length, icon: Icons.star, color: 'purple' },
    { label: 'Archived', value: projects.filter(p => p.status === 'archived').length, icon: Icons.archive || Icons.folder, color: 'gray' },
  ];

  const columns = [
    {
      key: 'thumbnail', label: '', width: 60,
      render: (row) => (
        <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', background: 'var(--color-bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {row.thumbnail ? <img src={imageUrl(row.thumbnail)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icon path={Icons.image} size={16} style={{ color: 'var(--color-text-tertiary)' }} />}
        </div>
      ),
    },
    {
      key: 'title', label: 'Title',
      render: (row) => (
        <div>
          <div className="cell-title">{row.title}</div>
          <div className="cell-subtitle">{row.slug}</div>
        </div>
      ),
    },
    { key: 'category', label: 'Category', render: (row) => <span className="badge badge-gray">{row.category}</span> },
    {
      key: 'status', label: 'Status',
      render: (row) => <span className={`status ${row.status === 'published' ? 'published' : row.status === 'archived' ? 'draft' : 'draft'}`}>{row.status || 'draft'}</span>,
    },
    {
      key: 'featured', label: 'Featured',
      render: (row) => (
        <button onClick={(e) => { e.stopPropagation(); handleToggleFeature(row); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: row.featured ? '#F59E0B' : 'var(--color-text-tertiary)', padding: 4, transition: 'color 0.2s' }} title={row.featured ? 'Unfeature' : 'Feature'}>
          <Icon path={Icons.star} size={16} />
        </button>
      ),
    },
    { key: 'views', label: 'Views', render: (row) => <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{row.views ?? 0}</span> },
    { key: 'createdAt', label: 'Created', render: (row) => <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}</span> },
    { key: 'updatedAt', label: 'Updated', render: (row) => <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '-'}</span> },
  ];

  const actionButtons = [
    { icon: Icons.eye, label: 'View', onClick: (row) => window.open(`/projects/${row.slug || row._id}`, '_blank') },
    { icon: Icons.edit, label: 'Edit', onClick: (row) => openEdit(row) },
    { icon: Icons.copy, label: 'Duplicate', onClick: (row) => handleDuplicate(row) },
    { icon: Icons['eye-off'], label: 'Publish/Unpublish', onClick: (row) => handleToggleStatus(row) },
    { icon: Icons.trash2, label: 'Delete', onClick: (row) => setDeleteTarget(row), variant: 'danger' },
  ];

  const renderTabForm = () => {
    if (activeTab === 'General') return (
      <>
        <div className="form-group">
          <label>Title <span style={{ color: 'var(--color-danger)' }}>*</span></label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: editing ? form.slug : generateSlug(e.target.value) })} placeholder="My Awesome Project" />
        </div>
        <div className="form-group">
          <label>Slug</label>
          <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="my-awesome-project" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="form-group">
            <label>Order</label>
            <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-check">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            <span>Featured project</span>
          </label>
        </div>
        <div className="form-group">
          <label className="form-check">
            <input type="checkbox" checked={form.isVisible} onChange={(e) => setForm({ ...form, isVisible: e.target.checked })} />
            <span>Visible on portfolio</span>
          </label>
        </div>
      </>
    );
    if (activeTab === 'Content') return (
      <>
        <div className="form-group">
          <label>Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your project..." rows={6} style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.85rem' }} />
        </div>
        <div className="form-group">
          <label>Technologies (comma-separated)</label>
          <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="React, Node.js, MongoDB, Express" />
          <small style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>Enter technologies separated by commas. These will appear as badges on the card.</small>
        </div>
        <div className="form-group">
          <label>YouTube / Video URL</label>
          <input value={form.youtubeUrl} onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })} placeholder="https://youtube.com/..." />
        </div>
      </>
    );
    if (activeTab === 'Media') return (
      <>
        <div className="form-group">
          <label>Thumbnail</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {form.thumbnail && (
              <div style={{ position: 'relative', width: 120, height: 80, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                <img src={imageUrl(form.thumbnail)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={() => setForm({ ...form, thumbnail: '' })} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>&times;</button>
              </div>
            )}
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '2px dashed var(--color-border)', borderRadius: 8, cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.85rem', background: 'var(--color-bg-subtle)', transition: 'border-color 0.2s' }}>
              <Icon path={Icons.upload} size={14} />
              {form.thumbnail ? 'Replace' : 'Upload Thumbnail'}
              <input type="file" accept="image/*" onChange={handleThumbnailUpload} style={{ display: 'none' }} />
            </label>
            {uploading && <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Uploading...</span>}
          </div>
        </div>
        <div className="form-group">
          <label>Gallery Images</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            {form.images.map((img, i) => (
              <div key={i} style={{ position: 'relative', width: 80, height: 60, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                <img src={imageUrl(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })} style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>&times;</button>
              </div>
            ))}
          </div>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '2px dashed var(--color-border)', borderRadius: 8, cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.85rem', background: 'var(--color-bg-subtle)' }}>
            <Icon path={Icons.image} size={14} />
            Add Images
            <input type="file" accept="image/*" multiple onChange={handleImagesUpload} style={{ display: 'none' }} />
          </label>
        </div>
      </>
    );
    if (activeTab === 'Card Style') return (
      <>
        <div className="form-group">
          <label className="form-check">
            <input type="checkbox" checked={form.isVisible} onChange={(e) => setForm({ ...form, isVisible: e.target.checked })} />
            <span>Visible on portfolio</span>
          </label>
        </div>
        <div className="form-group">
          <label className="form-check">
            <input type="checkbox" checked={form.showStatusBadge} onChange={(e) => setForm({ ...form, showStatusBadge: e.target.checked })} />
            <span>Show status badge</span>
          </label>
        </div>
        <div className="form-group">
          <label className="form-check">
            <input type="checkbox" checked={form.showTechStack} onChange={(e) => setForm({ ...form, showTechStack: e.target.checked })} />
            <span>Show technology stack</span>
          </label>
        </div>
        <div className="form-group">
          <label>Status Badge Label</label>
          <select value={form.statusBadge} onChange={(e) => setForm({ ...form, statusBadge: e.target.value })}>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Featured">Featured</option>
            <option value="Open Source">Open Source</option>
          </select>
        </div>
        <div className="form-group">
          <label>Image Position</label>
          <select value={form.objectPosition} onChange={(e) => setForm({ ...form, objectPosition: e.target.value })}>
            <option value="center">Center</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>

        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '1rem 0 0.5rem', color: 'var(--color-text)' }}>Button Labels</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Live Demo Button</label>
            <input value={form.liveLabel} onChange={(e) => setForm({ ...form, liveLabel: e.target.value })} placeholder="Live Demo" />
          </div>
          <div className="form-group">
            <label>GitHub Button</label>
            <input value={form.githubLabel} onChange={(e) => setForm({ ...form, githubLabel: e.target.value })} placeholder="GitHub" />
          </div>
          <div className="form-group">
            <label>Details Button</label>
            <input value={form.detailsLabel} onChange={(e) => setForm({ ...form, detailsLabel: e.target.value })} placeholder="Details" />
          </div>
        </div>

        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '1rem 0 0.5rem', color: 'var(--color-text)' }}>Card Styling</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Border Radius (px)</label>
            <input type="number" min="0" max="50" value={form.cardBorderRadius} onChange={(e) => setForm({ ...form, cardBorderRadius: Number(e.target.value) })} />
          </div>
          <div className="form-group">
            <label>Overlay Opacity (0-1)</label>
            <input type="number" min="0" max="1" step="0.1" value={form.overlayOpacity} onChange={(e) => setForm({ ...form, overlayOpacity: Number(e.target.value) })} />
          </div>
          <div className="form-group">
            <label>Hover Scale</label>
            <input type="number" min="1" max="1.2" step="0.01" value={form.hoverScale} onChange={(e) => setForm({ ...form, hoverScale: Number(e.target.value) })} />
          </div>
          <div className="form-group">
            <label>Description Lines</label>
            <input type="number" min="1" max="5" value={form.descriptionLines} onChange={(e) => setForm({ ...form, descriptionLines: Number(e.target.value) })} />
          </div>
          <div className="form-group">
            <label>Max Tech Display</label>
            <input type="number" min="1" max="12" value={form.maxTechDisplay} onChange={(e) => setForm({ ...form, maxTechDisplay: Number(e.target.value) })} />
          </div>
          <div className="form-group">
            <label className="form-check">
              <input type="checkbox" checked={form.hoverShadow} onChange={(e) => setForm({ ...form, hoverShadow: e.target.checked })} />
              <span>Hover shadow effect</span>
            </label>
          </div>
        </div>

        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '1rem 0 0.5rem', color: 'var(--color-text)' }}>Project URLs</h4>
        <div className="form-group">
          <label>Live Demo URL</label>
          <input value={form.liveUrl} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} placeholder="https://..." />
        </div>
        <div className="form-group">
          <label>GitHub URL</label>
          <input value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} placeholder="https://github.com/..." />
        </div>
        <div className="form-group">
          <label>Details Page URL</label>
          <input value={form.projectUrl} onChange={(e) => setForm({ ...form, projectUrl: e.target.value })} placeholder="/projects/my-project" />
        </div>
      </>
    );
    return null;
  };

  return (
    <PageLayout
      title="Projects Management"
      description="Manage your portfolio projects"
      stats={stats}
    >
      <Toolbar
        searchValue={searchVal}
        onSearchChange={setSearchVal}
        searchPlaceholder="Search projects..."
        filters={[
          { key: 'status', label: 'Status', type: 'select', options: ['published', 'draft', 'archived'] },
          { key: 'category', label: 'Category', type: 'select', options: categories },
        ]}
        filterValues={filterVal}
        onFilterChange={(key, val) => {
          if (val === '__reset__' || key === '__reset__') setFilterVal({ status: '', category: '' });
          else setFilterVal({ ...filterVal, [key]: val });
        }}
        onAddNew={openCreate}
        onRefresh={fetchProjects}
        onExportCSV={() => {
          const csv = [['Title','Category','Status','Featured','Views'].join(',')];
          projects.forEach(p => csv.push([p.title,p.category,p.status,p.featured,p.views].join(',')));
          const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = 'projects.csv'; a.click();
          URL.revokeObjectURL(url);
          toast.success('Projects exported');
        }}
        extraActions={[
          { label: 'Export', icon: Icons.download, onClick: () => {
            const csv = [['Title','Category','Status','Featured','Views'].join(',')];
            projects.forEach(p => csv.push([p.title,p.category,p.status,p.featured,p.views].join(',')));
            const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'projects.csv'; a.click();
            URL.revokeObjectURL(url);
            toast.success('Projects exported');
          }},
        ]}
      />

      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        actions={actionButtons}
        onBulkAction={(action, selected) => handleBulkAction(action, selected)}
        searchable={false}
        emptyMessage="No projects yet. Click 'Add New' to create your first project."
        emptyIcon={Icons.folder}
      />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Project' : 'Add Project'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
              {tabs.map(tab => (
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
              {renderTabForm()}
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)' }}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-ghost" onClick={() => handleSave('draft')} disabled={saving || uploading}>
                <Icon path={Icons.save} size={14} /> Save Draft
              </button>
              <button className="btn btn-ghost" onClick={() => { if (editing) window.open(`/projects/${editing.slug || editing._id}`, '_blank'); }} disabled={!editing}>
                <Icon path={Icons.eye} size={14} /> Preview
              </button>
              <button className="btn btn-primary" onClick={() => handleSave('publish')} disabled={saving || uploading}>
                {saving ? 'Saving...' : <><Icon path={Icons['external-link']} size={14} /> Publish</>}
              </button>
            </div>
          </div>
        </div>
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

      <SectionStyles sectionKey="projects" label="Projects Section Styles" />
    </PageLayout>
  );
}
