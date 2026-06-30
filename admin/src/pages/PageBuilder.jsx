import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const SECTION_TYPES = [
  { id: 'hero', label: 'Hero', icon: 'M21 15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v3 M3 16l5-5 4 4 3-3 6 6' },
  { id: 'about', label: 'About', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8z' },
  { id: 'skills', label: 'Skills', icon: 'M16 18l6-6-6-6 M8 6l-6 6 6 6' },
  { id: 'projects', label: 'Projects', icon: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z' },
  { id: 'experience', label: 'Experience', icon: 'M12 4v16M4 12h16' },
  { id: 'education', label: 'Education', icon: 'M22 10l-10-5L2 10l10 5 10-5z M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5' },
  { id: 'testimonials', label: 'Testimonials', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { id: 'services', label: 'Services', icon: 'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2' },
  { id: 'blog', label: 'Blog', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8' },
  { id: 'contact', label: 'Contact', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
  { id: 'stats', label: 'Statistics', icon: 'M3 20h18M5 16l3-5 4 4 5-8 4 4' },
  { id: 'faq', label: 'FAQ', icon: 'M8 10h8 M8 14h6 M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z' },
  { id: 'cta', label: 'Call to Action', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M12 18v-6 M9 15h6' },
  { id: 'gallery', label: 'Gallery', icon: 'M15 8h.01 M4 6h16M4 10h16M4 14h16M4 18h16' },
  { id: 'timeline', label: 'Timeline', icon: 'M12 8V4m0 4a4 4 0 100 8 4 4 0 000-8z M12 20v-4' },
  { id: 'certificates', label: 'Certificates', icon: 'M8 21l4-2 4 2-1-4.36L19 12h-5l-2-5-2 5H5l4 4.64L8 21z' },
  { id: 'footer', label: 'Footer', icon: 'M3 12h18M3 6h18M3 18h18' },
];

const DEFAULT_COMPONENT_DATA = {
  hero: { name: '', title: '', introduction: '', avatar: '', socialLinks: [], buttons: [] },
  about: { biography: '', careerJourney: '', stats: [], keyAchievements: [] },
  skills: { categories: [] },
  projects: { title: 'Projects', subtitle: '', items: [] },
  experience: { title: 'Experience', items: [] },
  education: { title: 'Education', items: [] },
  testimonials: { title: 'Testimonials', items: [] },
  services: { title: 'Services', items: [] },
  blog: { title: 'Latest Posts', showCount: 3 },
  contact: { title: 'Get In Touch', email: '', phone: '', address: '' },
  stats: { items: [{ label: 'Projects', value: '0', suffix: '+' }] },
  faq: { title: 'FAQ', items: [{ question: '', answer: '' }] },
  cta: { title: '', description: '', buttonText: '', buttonUrl: '' },
  gallery: { title: 'Gallery', images: [] },
  timeline: { title: 'Timeline', items: [{ date: '', title: '', description: '' }] },
  certificates: { title: 'Certificates', items: [] },
  footer: { copyright: '', text: '' },
};

function Icon({ path, size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg>;
}

export default function PageBuilder() {
  const [pages, setPages] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [activePage, setActivePage] = useState(null);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showAddMenu, setShowAddMenu] = useState(false);

  useEffect(() => { fetchPages(); }, []);

  const fetchPages = async () => {
    try {
      const { data } = await api.get('/pages');
      setPages(data.data || []);
      if (data.data?.length > 0) { loadPage(data.data[0]); }
    } catch { setMessage('Failed to load pages'); }
    finally { setLoading(false); }
  };

  const loadPage = async (page) => {
    setActivePage(page);
    setSelectedSection(null);
    try {
      const { data } = await api.get(`/pages/${page._id}/components`);
      const comps = data.data || [];
      setSections(comps.map(c => ({ ...c, id: c._id || generateId() })));
      pushHistory(comps.map(c => ({ ...c, id: c._id || generateId() })));
    } catch {
      setSections([]);
      pushHistory([]);
    }
  };

  const generateId = () => `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const pushHistory = (newSections) => {
    const snapshot = JSON.parse(JSON.stringify(newSections));
    setHistory(prev => [...prev.slice(0, historyIndex + 1), snapshot]);
    setHistoryIndex(prev => prev + 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setSections(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setSections(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  const addSection = (type) => {
    const newSection = {
      id: generateId(),
      type,
      isVisible: true,
      data: JSON.parse(JSON.stringify(DEFAULT_COMPONENT_DATA[type] || {})),
      styles: {},
      order: sections.length,
    };
    const updated = [...sections, newSection];
    setSections(updated);
    pushHistory(updated);
    setShowAddMenu(false);
  };

  const removeSection = (id) => {
    const updated = sections.filter(s => s.id !== id);
    setSections(updated);
    pushHistory(updated);
    if (selectedSection?.id === id) setSelectedSection(null);
  };

  const duplicateSection = (id) => {
    const source = sections.find(s => s.id === id);
    if (!source) return;
    const copy = JSON.parse(JSON.stringify(source));
    copy.id = generateId();
    copy.data.title = `${copy.data.title || ''} (Copy)`;
    const idx = sections.findIndex(s => s.id === id);
    const updated = [...sections.slice(0, idx + 1), copy, ...sections.slice(idx + 1)];
    setSections(updated);
    pushHistory(updated);
  };

  const toggleVisibility = (id) => {
    const updated = sections.map(s => s.id === id ? { ...s, isVisible: !s.isVisible } : s);
    setSections(updated);
    pushHistory(updated);
  };

  const moveSection = (id, direction) => {
    const idx = sections.findIndex(s => s.id === id);
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === sections.length - 1)) return;
    const target = direction === 'up' ? idx - 1 : idx + 1;
    const updated = [...sections];
    [updated[idx], updated[target]] = [updated[target], updated[idx]];
    setSections(updated);
    pushHistory(updated);
  };

  const updateSectionData = (id, data) => {
    const updated = sections.map(s => s.id === id ? { ...s, data } : s);
    setSections(updated);
    setSelectedSection(prev => prev?.id === id ? { ...prev, data } : prev);
    pushHistory(updated);
  };

  const updateSectionStyle = (id, styles) => {
    const updated = sections.map(s => s.id === id ? { ...s, styles: { ...s.styles, ...styles } } : s);
    setSections(updated);
    setSelectedSection(prev => prev?.id === id ? { ...prev, styles: { ...prev.styles, ...styles } } : prev);
    pushHistory(updated);
  };

  const savePage = async () => {
    setSaving(true); setMessage('');
    try {
      const pageData = { sections: sections.map(s => ({
        type: s.type, data: s.data, styles: s.styles, isVisible: s.isVisible, order: sections.indexOf(s),
      })) };
      if (activePage?._id) {
        await api.put(`/pages/${activePage._id}`, pageData);
      } else {
        const { data } = await api.post('/pages', { title: 'Home', slug: 'home', ...pageData });
        setActivePage(data.data);
      }
      await saveComponents();
      setMessage('Page saved successfully!');
    } catch { setMessage('Failed to save page'); }
    finally { setSaving(false); }
  };

  const saveComponents = async () => {
    if (!activePage?._id) return;
    try {
      await api.put(`/pages/${activePage._id}/components/reorder`, { items: sections.map((s, i) => ({ componentId: s._id, order: i })) });
    } catch {}
  };

  const saveAsTemplate = async () => {
    const name = prompt('Template name:');
    if (!name) return;
    try {
      await api.post('/templates', { name, type: 'page', data: { sections } });
      setMessage('Template saved!');
    } catch { setMessage('Failed to save template'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner" /></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Page Builder</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Drag, edit and arrange sections on your page</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-sm" onClick={undo} disabled={historyIndex <= 0}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" /></svg> Undo
          </button>
          <button className="btn btn-ghost btn-sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" /></svg> Redo
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setPreview(!preview)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z" /></svg> {preview ? 'Edit' : 'Preview'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={saveAsTemplate}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" /></svg> Template
          </button>
          <button className="btn btn-primary" onClick={savePage} disabled={saving}>{saving ? 'Saving...' : 'Publish'}</button>
        </div>
      </div>

      {message && (
        <div className="mb-4 px-4 py-2.5 rounded-lg text-sm font-medium"
          style={{ background: message.includes('Failed') ? 'var(--danger-subtle)' : 'var(--success-subtle)', color: message.includes('Failed') ? 'var(--danger)' : 'var(--success)' }}>
          {message}
        </div>
      )}

      <div className="flex-1 flex gap-6 overflow-hidden">
        <div className="flex-1 overflow-y-auto rounded-xl border p-4" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          {sections.length === 0 && !preview && (
            <div className="flex flex-col items-center justify-center h-64 text-center" style={{ color: 'var(--text-tertiary)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-4" style={{ color: 'var(--gray-300)' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
              </svg>
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-secondary)' }}>No sections yet</h3>
              <p className="text-sm mt-1 mb-4">Click Add Section to start building your page</p>
            </div>
          )}
          {preview ? (
            <div className="space-y-6 p-4" style={{ background: 'var(--bg)' }}>
              {sections.filter(s => s.isVisible !== false).map(section => (
                <div key={section.id} className="rounded-xl border p-8 text-center" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>{section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section</div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{section.data?.title || section.data?.name || `#${section.type}`}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {sections.map((section, idx) => (
                <div key={section.id}
                  className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${selectedSection?.id === section.id ? 'ring-2' : ''}`}
                  style={{ background: selectedSection?.id === section.id ? 'var(--primary-subtle)' : 'var(--card)', borderColor: selectedSection?.id === section.id ? 'var(--primary)' : 'var(--border)', ringColor: 'var(--primary)' }}
                  onClick={() => setSelectedSection(section)}>
                  <div className="flex flex-col gap-0.5">
                    <button className="btn-icon btn-xs" onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'up'); }} disabled={idx === 0}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg>
                    </button>
                    <button className="btn-icon btn-xs" onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'down'); }} disabled={idx === sections.length - 1}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                    </button>
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: 'var(--bg)', color: 'var(--text-secondary)' }}>
                    {section.type.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{section.type.charAt(0).toUpperCase() + section.type.slice(1)}</div>
                    <div className="text-xs truncate mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{section.data?.name || section.data?.title || section.data?.heading || `#${section.type}`}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${section.isVisible !== false ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <button className="btn-icon btn-xs" onClick={(e) => { e.stopPropagation(); toggleVisibility(section.id); }} title="Toggle visibility">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {section.isVisible !== false
                          ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z" /></>
                          : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94 M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19 M14.12 14.12a3 3 0 11-4.24-4.24 M1 1l22 22" /></>}
                      </svg>
                    </button>
                    <button className="btn-icon btn-xs" onClick={(e) => { e.stopPropagation(); duplicateSection(section.id); }} title="Duplicate">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                    </button>
                    <button className="btn-icon btn-xs" onClick={(e) => { e.stopPropagation(); removeSection(section.id); }} title="Delete">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={() => setShowAddMenu(true)}
                className="w-full py-4 rounded-xl border-2 border-dashed text-sm font-medium transition-all"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg)' }}>
                + Add Section
              </button>
            </div>
          )}
        </div>

        {selectedSection && !preview && (
          <div className="w-80 overflow-y-auto rounded-xl border p-4 flex-shrink-0" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Edit {selectedSection.type.charAt(0).toUpperCase() + selectedSection.type.slice(1)}</h3>
              <button className="btn-icon btn-sm" onClick={() => setSelectedSection(null)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="space-y-4">
              {Object.entries(selectedSection.data || {}).map(([key, val]) => (
                <div key={key} className="form-group">
                  <label className="text-xs capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                  {Array.isArray(val) ? (
                    <div className="text-xs p-2 rounded" style={{ background: 'var(--bg)', color: 'var(--text-secondary)' }}>
                      {val.length} items
                    </div>
                  ) : typeof val === 'object' && val !== null ? (
                    <div className="text-xs p-2 rounded" style={{ background: 'var(--bg)', color: 'var(--text-secondary)' }}>
                      {Object.keys(val).join(', ')}
                    </div>
                  ) : (
                    <input value={val || ''} onChange={(e) => updateSectionData(selectedSection.id, { ...selectedSection.data, [key]: e.target.value })}
                      placeholder={key} />
                  )}
                </div>
              ))}
              <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--text)' }}>Section Styles</label>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs block mb-1">Background</label><input type="color" value={selectedSection.styles?.background || '#ffffff'} onChange={(e) => updateSectionStyle(selectedSection.id, { background: e.target.value })} className="w-full h-8 rounded cursor-pointer" /></div>
                  <div><label className="text-xs block mb-1">Text Color</label><input type="color" value={selectedSection.styles?.color || '#000000'} onChange={(e) => updateSectionStyle(selectedSection.id, { color: e.target.value })} className="w-full h-8 rounded cursor-pointer" /></div>
                </div>
                <div className="mt-3">
                  <label className="text-xs block mb-1">Padding</label>
                  <input value={selectedSection.styles?.padding || ''} onChange={(e) => updateSectionStyle(selectedSection.id, { padding: e.target.value })} placeholder="24px" className="w-full px-2.5 py-1.5 text-xs rounded-md border" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }} />
                </div>
                <div className="mt-3">
                  <label className="text-xs block mb-1">Max Width</label>
                  <input value={selectedSection.styles?.maxWidth || ''} onChange={(e) => updateSectionStyle(selectedSection.id, { maxWidth: e.target.value })} placeholder="1200px" className="w-full px-2.5 py-1.5 text-xs rounded-md border" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAddMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowAddMenu(false)}>
          <div className="rounded-2xl p-6 max-w-2xl w-full max-h-[70vh] overflow-y-auto" style={{ background: 'var(--card)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Add Section</h3>
              <button className="modal-close" onClick={() => setShowAddMenu(false)}>&times;</button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {SECTION_TYPES.map(type => (
                <button key={type.id} onClick={() => addSection(type.id)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all hover:shadow-sm"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg)' }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                    <Icon path={type.icon} size={20} />
                  </div>
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
