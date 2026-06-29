import React, { useState, useEffect, useRef } from 'react';
import { adminApi, imageUrl } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { formatDate } from '../lib/utils';

export default function ResumeManagement() {
  const [media, setMedia] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      adminApi.getMedia({ category: 'resume', limit: 10 }),
      adminApi.getMediaStats(),
    ])
      .then(([mediaRes, statsRes]) => {
        setMedia(mediaRes.data.data || []);
        setStats(statsRes.data.data || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'resume');
    try {
      const { data } = await adminApi.uploadMedia(formData);
      const mediaRes = await adminApi.getMedia({ category: 'resume', limit: 10 });
      setMedia(mediaRes.data.data || []);
    } catch (err) { console.error('Upload failed', err); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this resume file?')) return;
    try { await adminApi.deleteMedia(id); setMedia(prev => prev.filter(m => m._id !== id)); }
    catch (err) { console.error('Delete failed', err); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Resume / CV</h2>
          <p>Upload and manage your resume files</p>
        </div>
        <div className="page-actions">
          <input type="file" ref={fileRef} onChange={handleUpload} accept=".pdf,.doc,.docx" style={{ display: 'none' }} />
          <button className="btn btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Icon path={Icons.upload} size={16} /> {uploading ? 'Uploading...' : 'Upload CV'}
          </button>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-card-top">
            <div>
              <div className="stat-card-label">Total Files</div>
              <div className="stat-card-value">{stats?.resumes || media.length}</div>
            </div>
            <div className="stat-card-icon blue"><Icon path={Icons['file-text']} size={20} /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div>
              <div className="stat-card-label">Total Downloads</div>
              <div className="stat-card-value">{stats?.downloads || 0}</div>
            </div>
            <div className="stat-card-icon green"><Icon path={Icons.download} size={20} /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div>
              <div className="stat-card-label">Total Media</div>
              <div className="stat-card-value">{stats?.total || 0}</div>
            </div>
            <div className="stat-card-icon purple"><Icon path={Icons['bar-chart']} size={20} /></div>
          </div>
        </div>
      </div>

      <div className="table-container" style={{ marginTop: 24 }}>
        <div className="table-toolbar">
          <span style={{ fontSize: 14, fontWeight: 600 }}>Resume Files</span>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Size</th><th>Uploaded</th><th>Type</th><th style={{ width: 80 }}>Actions</th></tr>
          </thead>
          <tbody>
            {media.map(item => (
              <tr key={item._id}>
                <td><div className="cell-title">{item.originalName || item.name}</div></td>
                <td>{(item.size / 1024 / 1024).toFixed(2)} MB</td>
                <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{formatDate(item.createdAt)}</td>
                <td><span className="badge badge-blue">{item.mimeType?.split('/')[1] || 'file'}</span></td>
                <td>
                  <div className="table-actions">
                    <a href={imageUrl(item.url)} target="_blank" rel="noopener noreferrer" className="btn-view" data-tooltip="Download">
                      <Icon path={Icons.download} size={14} />
                    </a>
                    <button className="btn-delete" onClick={() => handleDelete(item._id)} data-tooltip="Delete">
                      <Icon path={Icons.trash2} size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {media.length === 0 && (
              <tr><td colSpan={5}>
                <div className="empty-state">
                  <Icon path={Icons['file-text']} size={40} />
                  <h3>No resume files</h3>
                  <p>Upload your CV/resume to allow visitors to download it.</p>
                  <button className="btn btn-primary" onClick={() => fileRef.current?.click()}>
                    <Icon path={Icons.upload} size={16} /> Upload CV
                  </button>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
