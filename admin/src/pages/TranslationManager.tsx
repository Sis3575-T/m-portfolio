import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Icons, Icon } from '../lib/icons';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const getAuthHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('admin_token')}` });

const translationApi = {
  getAll: (params: any) => axios.get(`${API_URL}/translations`, { headers: getAuthHeaders(), params }),
  getLanguages: () => axios.get(`${API_URL}/translations/languages`, { headers: getAuthHeaders() }),
  create: (data: any) => axios.post(`${API_URL}/translations`, data, { headers: getAuthHeaders() }),
  update: (id: string, data: any) => axios.put(`${API_URL}/translations/${id}`, data, { headers: getAuthHeaders() }),
  delete: (id: string) => axios.delete(`${API_URL}/translations/${id}`, { headers: getAuthHeaders() }),
  importBulk: (data: any) => axios.post(`${API_URL}/translations/import`, data, { headers: getAuthHeaders() }),
};

interface Translation {
  _id: string;
  key: string;
  language: string;
  value: string;
  namespace: string;
}

const LANGUAGES = ['en', 'am'];
const NAMESPACES = ['General', 'Hero', 'Nav', 'Home', 'About', 'Skills', 'Projects', 'Contact', 'Footer'];

export default function TranslationManager() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeLang, setActiveLang] = useState('en');
  const [namespaceFilter, setNamespaceFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 15;

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Translation | null>(null);
  const [form, setForm] = useState({ key: '', language: 'en', value: '', namespace: 'General' });
  const [saving, setSaving] = useState(false);

  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: string }>>([]);
  const toastId = useRef(0);

  const [editingValues, setEditingValues] = useState<Record<string, string>>({});

  const addToast = useCallback((message: string, type: string = 'success') => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const fetchTranslations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {};
      if (namespaceFilter !== 'All') params.namespace = namespaceFilter;
      if (activeLang) params.language = activeLang;
      const { data } = await translationApi.getAll(params);
      setTranslations(data.data || data.translations || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load translations');
    } finally {
      setLoading(false);
    }
  }, [activeLang, namespaceFilter]);

  useEffect(() => { fetchTranslations(); }, [fetchTranslations]);

  const filtered = translations.filter(t =>
    !search || t.key?.toLowerCase().includes(search.toLowerCase()) ||
    t.value?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const openCreate = () => {
    setEditing(null);
    setForm({ key: '', language: activeLang, value: '', namespace: 'General' });
    setShowModal(true);
  };

  const openEdit = (t: Translation) => {
    setEditing(t);
    setForm({ key: t.key, language: t.language, value: t.value, namespace: t.namespace });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.key || !form.value) return;
    setSaving(true);
    try {
      if (editing) {
        await translationApi.update(editing._id, { value: form.value, namespace: form.namespace });
      } else {
        await translationApi.create(form);
      }
      await fetchTranslations();
      setShowModal(false);
      addToast(editing ? 'Translation updated' : 'Translation created');
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to save translation', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this translation?')) return;
    try {
      await translationApi.delete(id);
      setTranslations(prev => prev.filter(t => t._id !== id));
      addToast('Translation deleted');
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to delete', 'error');
    }
  };

  const handleInlineSave = async (t: Translation) => {
    const newValue = editingValues[t._id];
    if (newValue === undefined || newValue === t.value) return;
    try {
      await translationApi.update(t._id, { value: newValue });
      setTranslations(prev => prev.map(x => x._id === t._id ? { ...x, value: newValue } : x));
      addToast('Translation updated');
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to update', 'error');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      await translationApi.importBulk(json);
      await fetchTranslations();
      addToast('Translations imported successfully');
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to import translations', 'error');
    }
    e.target.value = '';
  };

  const handleExport = async () => {
    try {
      const { data } = await translationApi.getAll({});
      const blob = new Blob([JSON.stringify(data.data || data.translations || data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'translations.json';
      a.click();
      URL.revokeObjectURL(url);
      addToast('Translations exported');
    } catch (err: any) {
      addToast('Failed to export translations', 'error');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Translation Manager</h2>
          <p>Manage i18n translations for English and Amharic ({translations.length} total)</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={handleExport}><Icon path={Icons.download} size={16} /> Export</button>
          <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
            <Icon path={Icons.upload} size={16} /> Import
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
          <button className="btn btn-primary" onClick={openCreate}><Icon path={Icons.plus} size={16} /> Add Translation</button>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="tabs" style={{ marginRight: 12 }}>
              {LANGUAGES.map(lang => (
                <button key={lang} className={`tab ${activeLang === lang ? 'active' : ''}`} onClick={() => { setActiveLang(lang); setPage(1); }}>
                  {lang === 'en' ? 'English' : 'አማርኛ'} <span style={{ textTransform: 'uppercase', fontSize: 10, opacity: 0.7 }}>({lang})</span>
                </button>
              ))}
            </div>
            <div className="filter-tabs" style={{ marginRight: 12 }}>
              <button className={`filter-tab ${namespaceFilter === 'All' ? 'active' : ''}`} onClick={() => { setNamespaceFilter('All'); setPage(1); }}>All</button>
              {NAMESPACES.map(ns => (
                <button key={ns} className={`filter-tab ${namespaceFilter === ns ? 'active' : ''}`} onClick={() => { setNamespaceFilter(ns); setPage(1); }}>{ns}</button>
              ))}
            </div>
          </div>
          <div className="table-toolbar-right" style={{ gap: 12 }}>
            <div className="table-search">
              <Icon path={Icons.search} size={14} />
              <input type="text" placeholder="Search by key or value..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{filtered.length} results</span>
          </div>
        </div>

        {error && (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</div>
            <button className="btn btn-outline btn-sm" style={{ marginTop: 12 }} onClick={fetchTranslations}>Retry</button>
          </div>
        )}

        {!error && (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Key</th>
                <th style={{ width: '40%' }}>Value</th>
                <th>Namespace</th>
                <th style={{ width: 80 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(t => (
                <tr key={t._id}>
                  <td>
                    <code style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text)', background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 4 }}>{t.key}</code>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        type="text"
                        value={editingValues[t._id] ?? t.value}
                        onChange={(e) => setEditingValues({ ...editingValues, [t._id]: e.target.value })}
                        style={{
                          flex: 1, padding: '6px 10px', border: '1.5px solid var(--border)',
                          borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--text)',
                          background: editingValues[t._id] !== undefined && editingValues[t._id] !== t.value ? 'var(--primary-subtle)' : 'var(--card)',
                          outline: 'none', transition: 'all var(--transition-fast)',
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                      />
                      {editingValues[t._id] !== undefined && editingValues[t._id] !== t.value && (
                        <button className="btn btn-primary btn-xs" onClick={() => handleInlineSave(t)} data-tooltip="Save">
                          <Icon path={Icons.check} size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td><span className="badge badge-gray">{t.namespace}</span></td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-edit" onClick={() => openEdit(t)} data-tooltip="Edit"><Icon path={Icons.edit} size={14} /></button>
                      <button className="btn-delete" onClick={() => handleDelete(t._id)} data-tooltip="Delete"><Icon path={Icons.trash2} size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={4}>
                  <div className="empty-state">
                    <Icon path={Icons.globe} size={40} />
                    <h3>No translations found</h3>
                    <p>{search ? `No translations matching "${search}"` : 'Add your first translation to get started.'}</p>
                    {!search && <button className="btn btn-primary" onClick={openCreate}><Icon path={Icons.plus} size={16} /> Add Translation</button>}
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        )}

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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Translation' : 'Add Translation'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><Icon path={Icons.x} size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Key</label>
                <input
                  value={form.key}
                  onChange={(e) => setForm({ ...form, key: e.target.value })}
                  placeholder="e.g. hero.title"
                  disabled={!!editing}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Language</label>
                  <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} disabled={!!editing}>
                    <option value="en">English (en)</option>
                    <option value="am">አማርኛ (am)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Namespace</label>
                  <select value={form.namespace} onChange={(e) => setForm({ ...form, namespace: e.target.value })}>
                    {NAMESPACES.map(ns => <option key={ns} value={ns}>{ns}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Value</label>
                <textarea
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  placeholder="Translation text..."
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.key || !form.value}>
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`toast ${t.type}`}>
              <Icon path={t.type === 'success' ? Icons.check : Icons['alert-circle']} size={16} />
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
