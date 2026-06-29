import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';

const componentTypes = [
  { type: 'hero', label: 'Hero', icon: Icons.image },
  { type: 'about', label: 'About', icon: Icons.user },
  { type: 'services', label: 'Services', icon: Icons.briefcase },
  { type: 'projects', label: 'Projects', icon: Icons.folder },
  { type: 'skills', label: 'Skills', icon: Icons.code },
  { type: 'experience', label: 'Experience', icon: Icons['file-text'] },
  { type: 'education', label: 'Education', icon: Icons.book },

  { type: 'contact', label: 'Contact', icon: Icons.mail },
  { type: 'blog', label: 'Blog', icon: Icons['file-text'] },
  { type: 'certificates', label: 'Certificates', icon: Icons.award },
  { type: 'cta', label: 'Call to Action', icon: Icons['alert-triangle'] },
  { type: 'stats', label: 'Statistics', icon: Icons['bar-chart-3'] },
  { type: 'gallery', label: 'Gallery', icon: Icons.image },
  { type: 'faq', label: 'FAQ', icon: Icons['help-circle'] },
  { type: 'custom', label: 'Custom', icon: Icons.code },
];

export default function ComponentBuilder() {
  const toast = useToast();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [pages, setPages] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState('');
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComp, setSelectedComp] = useState(null);
  const [activeTab, setActiveTab] = useState('content');
  const [dragIdx, setDragIdx] = useState(null);

  useEffect(() => {
    adminApi.getPages()
      .then(({ data }) => {
        const pg = data.data || [];
        setPages(pg);
        if (pg.length > 0) setSelectedPageId(pg[0]._id);
      })
      .catch(() => toast.error('Failed to load pages'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedPageId) return;
    adminApi.getPageComponents(selectedPageId)
      .then(({ data }) => setComponents(data.data || []))
      .catch(() => toast.error('Failed to load components'));
  }, [selectedPageId]);

  const fetchComponents = async () => {
    if (!selectedPageId) return;
    try {
      const { data } = await adminApi.getPageComponents(selectedPageId);
      setComponents(data.data || []);
    } catch { toast.error('Failed to load components'); }
  };

  const handleAddComponent = async (type) => {
    try {
      await adminApi.addComponent(selectedPageId, { type, title: type.charAt(0).toUpperCase() + type.slice(1) });
      toast.success('Component added');
      await fetchComponents();
    } catch { toast.error('Failed to add component'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await adminApi.deleteComponent(selectedPageId, deleteTarget._id); await fetchComponents(); if (selectedComp?._id === deleteTarget._id) setSelectedComp(null); toast.success('Component deleted'); }
    catch { toast.error('Failed to delete component'); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const handleDuplicate = async (compId) => {
    try { await adminApi.duplicateComponent(selectedPageId, compId); toast.success('Component duplicated'); await fetchComponents(); }
    catch { toast.error('Failed to duplicate component'); }
  };

  const handleToggle = async (compId) => {
    try { await adminApi.toggleComponent(selectedPageId, compId); await fetchComponents(); }
    catch { toast.error('Failed to toggle component'); }
  };

  const handleUpdateComponent = async (field, value) => {
    if (!selectedComp) return;
    try {
      await adminApi.updateComponent(selectedPageId, selectedComp._id, { [field]: value });
      setSelectedComp({ ...selectedComp, [field]: value });
      setComponents(prev => prev.map(c => c._id === selectedComp._id ? { ...c, [field]: value } : c));
    } catch { toast.error('Failed to update component'); }
  };

  const handleDragStart = (idx) => setDragIdx(idx);
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const copy = [...components];
    const [moved] = copy.splice(dragIdx, 1);
    copy.splice(idx, 0, moved);
    setComponents(copy);
    setDragIdx(idx);
  };
  const handleDragEnd = async () => {
    setDragIdx(null);
    try { await adminApi.reorderComponents(selectedPageId, components.map((c, i) => ({ _id: c._id, order: i }))); }
    catch { toast.error('Failed to reorder components'); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>;

  const selectedPage = pages.find(p => p._id === selectedPageId);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Component Builder</h2>
          <p>Add and manage page components</p>
        </div>
        <div className="page-actions">
          <select
            value={selectedPageId}
            onChange={(e) => { setSelectedPageId(e.target.value); setSelectedComp(null); }}
            style={{ padding: '7px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 13 }}
          >
            {pages.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Add Component</h4>
          <div className="component-grid">
            {componentTypes.map(ct => (
              <div key={ct.type} className="component-type-card" onClick={() => handleAddComponent(ct.type)}>
                <Icon path={ct.icon} size={28} />
                <span>{ct.label}</span>
              </div>
            ))}
          </div>

          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Components ({components.length})</h4>
          <div className="page-builder-list">
            {components.map((comp, idx) => (
              <div
                key={comp._id}
                className={`page-builder-item${selectedComp?._id === comp._id ? ' dragging' : ''}${dragIdx === idx ? ' dragging' : ''}`}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                onClick={() => setSelectedComp(comp)}
              >
                <div className="page-builder-item-left">
                  <div className="drag-handle"><Icon path={Icons.move} size={16} /></div>
                  <div className={`page-builder-status ${comp.isVisible ? 'published' : 'draft'}`} />
                  <div>
                    <div className="page-builder-item-title">{comp.title || comp.type}</div>
                    <div className="page-builder-item-url">Type: {comp.type}</div>
                  </div>
                </div>
                <div className="page-builder-item-actions">
                  <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); handleDuplicate(comp._id); }} data-tooltip="Duplicate">
                    <Icon path={Icons.copy} size={14} />
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); handleToggle(comp._id); }} data-tooltip={comp.isVisible ? 'Hide' : 'Show'}>
                    {comp.isVisible ? <Icon path={Icons['eye-off']} size={14} /> : <Icon path={Icons.eye} size={14} />}
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={(e) => { e.stopPropagation(); setDeleteTarget(comp); }} data-tooltip="Delete">
                    <Icon path={Icons.trash2} size={14} />
                  </button>
                </div>
              </div>
            ))}
            {components.length === 0 && (
              <div className="empty-state">
                <Icon path={Icons.puzzle} size={40} />
                <h3>No components</h3>
                <p>Click a component type above to add it.</p>
              </div>
            )}
          </div>
        </div>

        <div>
          {selectedComp ? (
            <div className="settings-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0 }}>{selectedComp.title || selectedComp.type}</h3>
                <div className="tabs">
                  {(['content', 'style', 'advanced']).map(tab => (
                    <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === 'content' && (
                <div>
                  <div className="form-group"><label>Title</label><input value={selectedComp.title || ''} onChange={(e) => handleUpdateComponent('title', e.target.value)} /></div>
                  <div className="form-group"><label>Subtitle</label><input value={selectedComp.subtitle || ''} onChange={(e) => handleUpdateComponent('subtitle', e.target.value)} /></div>
                  <div className="form-group"><label>Description</label><textarea value={selectedComp.description || ''} onChange={(e) => handleUpdateComponent('description', e.target.value)} rows={3} /></div>
                  <div className="form-group"><label>Button Text</label><input value={selectedComp.buttonText || ''} onChange={(e) => handleUpdateComponent('buttonText', e.target.value)} /></div>
                  <div className="form-group"><label>Button Link</label><input value={selectedComp.buttonLink || ''} onChange={(e) => handleUpdateComponent('buttonLink', e.target.value)} /></div>
                </div>
              )}

              {activeTab === 'style' && (
                <div>
                  <div className="form-row">
                    <div className="form-group"><label>Background Color</label><input value={selectedComp.styles?.backgroundColor || ''} onChange={(e) => handleUpdateComponent('styles', { ...selectedComp.styles, backgroundColor: e.target.value })} placeholder="#ffffff" /></div>
                    <div className="form-group"><label>Text Color</label><input value={selectedComp.styles?.textColor || ''} onChange={(e) => handleUpdateComponent('styles', { ...selectedComp.styles, textColor: e.target.value })} placeholder="#000000" /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label>Border Radius</label><input value={selectedComp.styles?.borderRadius || ''} onChange={(e) => handleUpdateComponent('styles', { ...selectedComp.styles, borderRadius: e.target.value })} placeholder="8px" /></div>
                    <div className="form-group"><label>Padding</label><input value={selectedComp.styles?.padding || ''} onChange={(e) => handleUpdateComponent('styles', { ...selectedComp.styles, padding: e.target.value })} placeholder="20px" /></div>
                  </div>
                  <div className="form-row-3">
                    <div className="form-group"><label>Font Family</label><input value={selectedComp.styles?.fontFamily || ''} onChange={(e) => handleUpdateComponent('styles', { ...selectedComp.styles, fontFamily: e.target.value })} /></div>
                    <div className="form-group"><label>Font Size</label><input value={selectedComp.styles?.fontSize || ''} onChange={(e) => handleUpdateComponent('styles', { ...selectedComp.styles, fontSize: e.target.value })} placeholder="16px" /></div>
                    <div className="form-group"><label>Alignment</label><select value={selectedComp.styles?.alignment || ''} onChange={(e) => handleUpdateComponent('styles', { ...selectedComp.styles, alignment: e.target.value })}><option value="">Default</option><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></div>
                  </div>
                </div>
              )}

              {activeTab === 'advanced' && (
                <div>
                  <div className="form-group"><label>Custom CSS</label><textarea className="advanced-editor" value={selectedComp.advanced?.customCSS || ''} onChange={(e) => handleUpdateComponent('advanced', { ...selectedComp.advanced, customCSS: e.target.value })} rows={6} placeholder=".my-class { color: red; }" /></div>
                  <div className="form-group"><label>Custom Classes</label><input value={selectedComp.advanced?.customClasses || ''} onChange={(e) => handleUpdateComponent('advanced', { ...selectedComp.advanced, customClasses: e.target.value })} placeholder="my-class another-class" /></div>
                  <div className="form-row">
                    <div className="form-group"><label>Animation Type</label><select value={selectedComp.advanced?.animationType || ''} onChange={(e) => handleUpdateComponent('advanced', { ...selectedComp.advanced, animationType: e.target.value })}><option value="">None</option><option value="fade">Fade</option><option value="slide-up">Slide Up</option><option value="slide-left">Slide Left</option><option value="zoom">Zoom</option></select></div>
                    <div className="form-group"><label>Animation Duration</label><input value={selectedComp.advanced?.animationDuration || ''} onChange={(e) => handleUpdateComponent('advanced', { ...selectedComp.advanced, animationDuration: e.target.value })} placeholder="0.3s" /></div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <Icon path={Icons.puzzle} size={48} />
              <h3>Select a component</h3>
              <p>Choose a component from the left to edit its properties.</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Component"
        message={`Delete "${deleteTarget?.title || deleteTarget?.type}" component?`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}
