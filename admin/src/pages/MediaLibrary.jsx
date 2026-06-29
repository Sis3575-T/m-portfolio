import React, { useState, useEffect, useRef } from 'react';
import { adminApi, imageUrl } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';

export default function MediaLibrary() {
  const toast = useToast();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef();
  const perPage = 8;

  useEffect(() => { fetchMedia(); }, []);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getMedia({ limit: 50 });
      setMedia(data.data || []);
    } catch { toast.error('Failed to load media'); }
    finally { setLoading(false); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', file.type.startsWith('image/') ? 'image' : 'document');
    try {
      await adminApi.uploadMedia(formData);
      toast.success('File uploaded');
      await fetchMedia();
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteMedia(deleteTarget._id);
      toast.success('File deleted');
      setMedia(prev => prev.filter(m => m._id !== deleteTarget._id));
    } catch { toast.error('Failed to delete file'); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const totalPages = Math.ceil(media.length / perPage);
  const paged = media.slice((page - 1) * perPage, page * perPage);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Media Library</h2>
          <p>Manage your uploaded files ({media.length} files)</p>
        </div>
        <div className="page-actions">
          <input type="file" ref={fileRef} onChange={handleUpload} style={{ display: 'none' }} />
          <button className="btn btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Icon path={Icons.upload} size={16} /> {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      </div>

      <div className="media-grid">
        {paged.map((item) => (
          <div key={item._id} className="media-card" style={{ position: 'relative' }}>
            <div className="media-preview">
              {item.mimeType?.startsWith('image/') && item.url ? (
                <img src={imageUrl(item.url)} alt={item.originalName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Icon path={Icons.file} size={36} />
              )}
            </div>
            <div className="media-info">
              <div className="media-name">{item.originalName || item.name}</div>
              <div className="media-meta">
                {item.size ? `${(item.size / 1024).toFixed(0)} KB` : '-'} · {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>
            <button
              onClick={() => setDeleteTarget(item)}
              className="btn-icon"
              style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 6, border: 'none', background: 'rgba(0,0,0,0.5)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon path={Icons.trash2} size={12} />
            </button>
          </div>
        ))}
        <div className="media-upload" onClick={() => fileRef.current?.click()} style={{ cursor: 'pointer' }}>
          <Icon path={Icons['cloud-upload']} size={36} />
          <p>Drop files here or click to upload</p>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <span className="pagination-info">Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, media.length)} of {media.length}</span>
          <div className="pagination-btns">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><Icon path={Icons['chevron-left']} size={14} /></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
              <button key={i} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><Icon path={Icons['chevron-right']} size={14} /></button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete File"
        message={`Delete "${deleteTarget?.originalName || deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}
