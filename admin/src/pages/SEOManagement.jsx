import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';

function SEOManagement() {
  const [seoPages, setSeoPages] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ metaTitle: '', metaDescription: '', metaKeywords: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await adminApi.getSEO();
        setSeoPages(data.data || []);
      } catch (err) {
        console.error('Failed to load SEO');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEdit = (seo) => {
    setEditing(seo);
    setForm({
      metaTitle: seo.metaTitle || '',
      metaDescription: seo.metaDescription || '',
      metaKeywords: (seo.metaKeywords || []).join(', '),
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      await adminApi.updateSEO(editing.page, {
        ...form,
        metaKeywords: form.metaKeywords.split(',').map(k => k.trim()).filter(Boolean),
      });
      setSeoPages(prev => prev.map(s => s.page === editing.page ? { ...s, ...form, metaKeywords: form.metaKeywords.split(',').map(k => k.trim()) } : s));
      setEditing(null);
    } catch (err) {
      console.error('Failed to save SEO', err);
    }
  };

  if (loading) return <div className="placeholder-page"><p>Loading SEO settings...</p></div>;

  return (
    <div>
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
        {seoPages.map(seo => (
          <div key={seo._id} style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{seo.page}</h4>
              <button className="btn btn-outline btn-sm" onClick={() => handleEdit(seo)}>
                <i className="fa-regular fa-pen"></i> Edit
              </button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--gray-600)' }}>
              <p><strong style={{ color: 'var(--dark)' }}>Title:</strong> {seo.metaTitle || '—'}</p>
              <p style={{ marginTop: 4 }}><strong style={{ color: 'var(--dark)' }}>Description:</strong> {seo.metaDescription || '—'}</p>
              <p style={{ marginTop: 4 }}><strong style={{ color: 'var(--dark)' }}>Keywords:</strong> {(seo.metaKeywords || []).join(', ') || '—'}</p>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit SEO — {editing.page}</h3>
              <button className="modal-close" onClick={() => setEditing(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Meta Title</label>
                <input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Meta Description</label>
                <textarea value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Meta Keywords (comma-separated)</label>
                <input value={form.metaKeywords} onChange={(e) => setForm({ ...form, metaKeywords: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SEOManagement;
