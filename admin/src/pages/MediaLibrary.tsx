import React, { useState, useEffect, useRef, useCallback } from 'react';
import { adminApi, imageUrl } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import type { Media } from '../types';
import { formatDate } from '../lib/utils';

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'done' | 'error';
}

interface FolderItem {
  _id: string;
  name: string;
  count?: number;
}

const CATEGORIES = ['All', 'Images', 'Documents', 'Resumes', 'Certificates', 'Other'] as const;

function getFileCategory(mime: string): string {
  if (!mime) return 'Other';
  if (mime.startsWith('image/')) return 'Images';
  if (mime.includes('pdf')) return 'Documents';
  if (mime.includes('resume') || mime.includes('cv')) return 'Resumes';
  if (mime.includes('certificate')) return 'Certificates';
  if (mime.includes('word') || mime.includes('document') || mime.includes('sheet') || mime.includes('presentation')) return 'Documents';
  return 'Other';
}

function getFileIcon(mime: string) {
  if (!mime) return { icon: Icons.file, color: 'var(--gray-400)' };
  if (mime.startsWith('image/')) return { icon: Icons.image, color: 'var(--primary)' };
  if (mime.includes('pdf')) return { icon: Icons['file-text'], color: 'var(--danger)' };
  if (mime.includes('word') || mime.includes('document')) return { icon: Icons['file-text'], color: '#2563EB' };
  if (mime.includes('sheet') || mime.includes('excel') || mime.includes('spreadsheet')) return { icon: Icons['bar-chart'], color: '#16A34A' };
  if (mime.includes('video') || mime.includes('mp4') || mime.includes('webm')) return { icon: Icons['play'], color: '#9333EA' };
  if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar') || mime.includes('gz')) return { icon: Icons['file-archive'], color: '#F59E0B' };
  if (mime.includes('json') || mime.includes('xml') || mime.includes('code')) return { icon: Icons['file-json'], color: '#6B7280' };
  return { icon: Icons.file, color: 'var(--gray-400)' };
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + units[i];
}

export default function MediaLibrary() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const perPage = 12;

  // Search & filters
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeFolder, setActiveFolder] = useState<string>('');

  // Folders
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [movingFileId, setMovingFileId] = useState<string | null>(null);

  // Rename
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameRef = useRef<HTMLInputElement>(null);

  // Details panel
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number } | null>(null);

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchMedia = useCallback(async () => {
    try {
      const params: Record<string, unknown> = { limit: 50 };
      if (activeCategory && activeCategory !== 'All') {
        params.category = activeCategory.toLowerCase();
      }
      if (activeFolder) {
        params.folder = activeFolder;
      }
      const { data } = await adminApi.getMedia(params);
      setMedia(data.data || []);
    } catch (err) {
      console.error('Failed to fetch media', err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeFolder]);

  const fetchFolders = useCallback(async () => {
    try {
      const { data } = await adminApi.getFolders();
      setFolders((data.data || []).map((f: string) => ({ _id: f, name: f })));
    } catch (err) {
      console.error('Failed to fetch folders', err);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
    fetchFolders();
  }, [fetchMedia, fetchFolders]);

  // Refresh media after upload
  const refreshMedia = useCallback(async () => {
    try {
      const params: Record<string, unknown> = { limit: 50 };
      if (activeCategory && activeCategory !== 'All') {
        params.category = activeCategory.toLowerCase();
      }
      if (activeFolder) {
        params.folder = activeFolder;
      }
      const { data } = await adminApi.getMedia(params);
      setMedia(data.data || []);
    } catch (err) {
      console.error('Failed to refresh media', err);
    }
  }, [activeCategory, activeFolder]);

  const handleUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setUploading(true);
    const progressList: UploadProgress[] = fileArray.map((f) => ({
      fileName: f.name,
      progress: 0,
      status: 'uploading' as const,
    }));
    setUploadProgress(progressList);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const formData = new FormData();
      formData.append('file', file);

      let category = 'document';
      if (file.type.startsWith('image/')) category = 'image';
      else if (file.type.includes('pdf')) category = 'document';
      else if (file.name.match(/\.(doc|docx|txt|md)$/i)) category = 'document';
      else if (file.name.match(/\.(xls|xlsx|csv)$/i)) category = 'document';

      if (activeFolder) {
        formData.append('folder', activeFolder);
      }
      formData.append('category', category);

      try {
        await adminApi.uploadMedia(formData);
        setUploadProgress((prev) =>
          prev.map((p, idx) =>
            idx === i ? { ...p, progress: 100, status: 'done' as const } : p
          )
        );
      } catch {
        setUploadProgress((prev) =>
          prev.map((p, idx) =>
            idx === i ? { ...p, status: 'error' as const } : p
          )
        );
      }
    }

    await refreshMedia();
    await fetchFolders();
    setUploading(false);
    setTimeout(() => setUploadProgress([]), 3000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleUpload(e.dataTransfer.files);
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await handleUpload(files);
    e.target.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this file permanently?')) return;
    try {
      await adminApi.deleteMedia(id);
      setMedia((prev) => prev.filter((m) => m._id !== id));
      if (selectedMedia?._id === id) setSelectedMedia(null);
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleCopyUrl = async (item: Media) => {
    const url = imageUrl(item.url);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(item._id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedId(item._id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Folder management
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await adminApi.uploadMedia(new FormData());
      await fetchFolders();
      setNewFolderName('');
      setShowCreateFolder(false);
    } catch {
      // Fallback: create via media update
    }
  };

  const handleMoveToFolder = async (fileId: string, folder: string) => {
    try {
      await adminApi.updateMedia(fileId, { folder });
      setMedia((prev) =>
        prev.map((m) => (m._id === fileId ? { ...m, folder } : m))
      );
      setMovingFileId(null);
      await fetchFolders();
    } catch (err) {
      console.error('Move failed', err);
    }
  };

  // Rename
  const startRename = (item: Media) => {
    setRenamingId(item._id);
    setRenameValue(item.originalName || item.name);
    setTimeout(() => renameRef.current?.select(), 50);
  };

  const handleRename = async (id: string) => {
    if (!renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    try {
      await adminApi.updateMedia(id, { name: renameValue.trim() });
      setMedia((prev) =>
        prev.map((m) =>
          m._id === id ? { ...m, name: renameValue.trim(), originalName: renameValue.trim() } : m
        )
      );
      setRenamingId(null);
    } catch (err) {
      console.error('Rename failed', err);
    }
  };

  // Details panel
  const openDetails = (item: Media) => {
    setSelectedMedia(item);
    setImgDimensions(null);
    if (item.mimeType?.startsWith('image/')) {
      const img = new Image();
      img.onload = () => setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      img.src = imageUrl(item.url);
    }
  };

  // Filtered + searched
  const filtered = media.filter((item) => {
    const name = (item.originalName || item.name || '').toLowerCase();
    const matchesSearch = !search || name.includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === 'All' || getFileCategory(item.mimeType) === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, activeCategory, activeFolder]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      {/* Folder Sidebar */}
      <div
        style={{
          width: 220,
          flexShrink: 0,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: 16,
          height: 'fit-content',
          position: 'sticky',
          top: 28,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Folders
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowCreateFolder(true)}
            style={{ padding: '4px 8px', fontSize: 11 }}
            data-tooltip="New Folder"
          >
            <Icon path={Icons['plus']} size={12} />
          </button>
        </div>

        {showCreateFolder && (
          <div style={{ marginBottom: 12, display: 'flex', gap: 4 }}>
            <input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') { setShowCreateFolder(false); setNewFolderName(''); }
              }}
              style={{
                flex: 1, padding: '6px 10px', fontSize: 12,
                border: '1.5px solid var(--border)', borderRadius: 'var(--radius)',
                background: 'var(--bg)', color: 'var(--text)', outline: 'none',
              }}
              autoFocus
            />
            <button className="btn btn-primary btn-sm" onClick={handleCreateFolder} style={{ padding: '4px 8px' }}>
              <Icon path={Icons.check} size={12} />
            </button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button
            onClick={() => setActiveFolder('')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 10px', borderRadius: 'var(--radius)',
              border: 'none', background: activeFolder === '' ? 'var(--primary-subtle)' : 'transparent',
              color: activeFolder === '' ? 'var(--primary)' : 'var(--text-secondary)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', width: '100%', textAlign: 'left',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Icon path={Icons['folder']} size={14} />
            All Files
          </button>
          {folders.map((f) => (
            <div key={f._id} style={{ position: 'relative' }}>
              <button
                onClick={() => setActiveFolder(f.name)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', borderRadius: 'var(--radius)',
                  border: 'none', background: activeFolder === f.name ? 'var(--primary-subtle)' : 'transparent',
                  color: activeFolder === f.name ? 'var(--primary)' : 'var(--text-secondary)',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer', width: '100%', textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Icon path={Icons['folder']} size={14} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="page-header">
          <div>
            <h2>Media Library</h2>
            <p>{media.length} files total</p>
          </div>
          <div className="page-actions">
            <input
              type="file"
              ref={fileRef}
              onChange={handleInputChange}
              multiple
              style={{ display: 'none' }}
            />
            <button
              className="btn btn-primary"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              <Icon path={Icons.upload} size={16} />
              {uploading ? 'Uploading...' : 'Upload Files'}
            </button>
          </div>
        </div>

        {/* Upload progress */}
        {uploadProgress.length > 0 && (
          <div
            style={{
              marginBottom: 20, padding: 16,
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>
              Uploading {uploadProgress.filter((p) => p.status === 'uploading').length} file(s)...
            </div>
            {uploadProgress.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.fileName}
                </div>
                <div
                  style={{
                    width: 120, height: 6,
                    background: 'var(--gray-100)',
                    borderRadius: 3, overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: p.status === 'error' ? '100%' : `${p.progress}%`,
                      background: p.status === 'error' ? 'var(--danger)' : p.status === 'done' ? 'var(--success)' : 'var(--primary)',
                      borderRadius: 3,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <span style={{ fontSize: 11, color: p.status === 'error' ? 'var(--danger)' : p.status === 'done' ? 'var(--success)' : 'var(--text-tertiary)', width: 40, textAlign: 'right' }}>
                  {p.status === 'error' ? 'Failed' : p.status === 'done' ? 'Done' : `${p.progress}%`}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Upload zone */}
        <div
          className={`media-upload-zone${dragging ? ' dragging' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{ marginBottom: 20 }}
        >
          <Icon path={Icons.upload} size={36} />
          <p>Drop files here or click to upload</p>
          <span>Supports images, PDFs, documents, and more</span>
        </div>

        {/* Search + Category filters */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
          <div className="search-input" style={{ maxWidth: 280 }}>
            <Icon path={Icons.search} size={14} />
            <input
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>
                <Icon path={Icons.x} size={14} />
              </button>
            )}
          </div>

          <div className="filter-tabs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`filter-tab${activeCategory === cat ? ' active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Move to folder dropdown */}
        {movingFileId && (
          <div
            style={{
              marginBottom: 16, padding: '12px 16px',
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}
          >
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Move file to:</span>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) handleMoveToFolder(movingFileId, e.target.value);
              }}
              style={{
                padding: '6px 12px', fontSize: 13,
                border: '1.5px solid var(--border)', borderRadius: 'var(--radius)',
                background: 'var(--card)', color: 'var(--text)',
              }}
            >
              <option value="">Select folder...</option>
              {folders.map((f) => (
                <option key={f._id} value={f.name}>{f.name}</option>
              ))}
            </select>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setMovingFileId(null)}
            >
              Cancel
            </button>
          </div>
        )}

        <div className="media-grid">
          {paged.map((item) => {
            const iconInfo = getFileIcon(item.mimeType);
            const isImage = item.mimeType?.startsWith('image/');
            return (
              <div
                key={item._id}
                className={`media-card${selectedMedia?._id === item._id ? ' selected' : ''}`}
                onClick={() => openDetails(item)}
              >
                <div className="media-preview" style={{ position: 'relative' }}>
                  {isImage ? (
                    <img src={imageUrl(item.url)} alt={item.originalName || item.name} style={{ objectFit: 'cover' }} />
                  ) : (
                    <Icon path={iconInfo.icon} size={36} style={{ color: iconInfo.color }} />
                  )}
                </div>
                <div className="media-info">
                  {renamingId === item._id ? (
                    <input
                      ref={renameRef}
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => handleRename(item._id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(item._id);
                        if (e.key === 'Escape') setRenamingId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: '100%', padding: '2px 6px', fontSize: 12,
                        border: '1.5px solid var(--primary)', borderRadius: 'var(--radius-sm)',
                        background: 'var(--card)', color: 'var(--text)',
                        outline: 'none',
                      }}
                    />
                  ) : (
                    <div
                      className="media-name"
                      onDoubleClick={(e) => { e.stopPropagation(); startRename(item); }}
                      style={{ cursor: 'pointer' }}
                    >
                      {item.originalName || item.name}
                    </div>
                  )}
                  <div className="media-meta">
                    {formatFileSize(item.size)} &middot; {formatDate(item.createdAt)}
                  </div>
                </div>
                <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
                  <button
                    className="media-delete-btn"
                    onClick={(e) => { e.stopPropagation(); handleCopyUrl(item); }}
                    data-tooltip={copiedId === item._id ? 'Copied!' : 'Copy URL'}
                    style={{ opacity: 1, position: 'static', width: 28, height: 28, background: copiedId === item._id ? 'var(--success)' : 'rgba(0,0,0,0.6)' }}
                  >
                    <Icon path={copiedId === item._id ? Icons.check : Icons.copy} size={12} />
                  </button>
                  <button
                    className="media-delete-btn"
                    onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                    data-tooltip="Delete"
                    style={{ opacity: 1, position: 'static', width: 28, height: 28 }}
                  >
                    <Icon path={Icons.trash2} size={12} />
                  </button>
                </div>
              </div>
            );
          })}
          {paged.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <Icon path={Icons.image} size={48} />
              <h3>No media files</h3>
              <p>
                {search
                  ? 'No files match your search.'
                  : activeFolder
                    ? 'This folder is empty.'
                    : 'Upload your first file to get started.'}
              </p>
            </div>
          )}
        </div>

        {filtered.length > perPage && (
          <div className="pagination" style={{ marginTop: 16 }}>
            <span className="pagination-info">
              Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, filtered.length)} of {filtered.length}
            </span>
            <div className="pagination-buttons">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                <Icon path={Icons['chevron-left']} size={14} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                <button
                  key={i}
                  className={page === i + 1 ? 'active' : ''}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <Icon path={Icons['chevron-right']} size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Details Side Panel */}
        {selectedMedia && (
          <div
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: 380,
              background: 'var(--card)', borderLeft: '1px solid var(--border)',
              boxShadow: 'var(--shadow-xl)', zIndex: 200,
              display: 'flex', flexDirection: 'column',
              animation: 'slideIn 200ms ease-out',
            }}
          >
            <style>{`
              @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
            `}</style>
            <div
              className="modal-header"
              style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}
            >
              <h3 style={{ fontSize: 16 }}>File Details</h3>
              <button className="modal-close" onClick={() => setSelectedMedia(null)}>
                <Icon path={Icons.x} size={18} />
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
              {/* Preview */}
              <div
                style={{
                  width: '100%', height: 200,
                  background: 'var(--bg)', borderRadius: 'var(--radius-lg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', marginBottom: 20, border: '1px solid var(--border)',
                }}
              >
                {selectedMedia.mimeType?.startsWith('image/') ? (
                  <img
                    src={imageUrl(selectedMedia.url)}
                    alt={selectedMedia.originalName || selectedMedia.name}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <Icon
                    path={getFileIcon(selectedMedia.mimeType).icon}
                    size={48}
                    style={{ color: getFileIcon(selectedMedia.mimeType).color }}
                  />
                )}
              </div>

              {/* File name with rename button */}
              <div style={{ marginBottom: 20 }}>
                {renamingId === selectedMedia._id ? (
                  <input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => handleRename(selectedMedia._id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(selectedMedia._id);
                      if (e.key === 'Escape') setRenamingId(null);
                    }}
                    style={{
                      width: '100%', padding: '8px 12px', fontSize: 14, fontWeight: 600,
                      border: '1.5px solid var(--primary)', borderRadius: 'var(--radius)',
                      background: 'var(--bg)', color: 'var(--text)',
                      outline: 'none',
                    }}
                    autoFocus
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', flex: 1, wordBreak: 'break-all' }}>
                      {selectedMedia.originalName || selectedMedia.name}
                    </span>
                    <button
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={() => startRename(selectedMedia)}
                      data-tooltip="Rename"
                    >
                      <Icon path={Icons.edit} size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Details table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Name</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{selectedMedia.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Size</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{formatFileSize(selectedMedia.size)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Type</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selectedMedia.mimeType || 'Unknown'}</div>
                </div>
                {selectedMedia.mimeType?.startsWith('image/') && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Dimensions</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {imgDimensions ? `${imgDimensions.width} x ${imgDimensions.height} px` : 'Loading...'}
                    </div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Category</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selectedMedia.category || 'Uncategorized'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Folder</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selectedMedia.folder || 'Root'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Upload Date</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{formatDate(selectedMedia.createdAt)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Uploaded By</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selectedMedia.uploadedBy?.name || 'Unknown'}</div>
                </div>
              </div>
            </div>

            <div
              className="modal-footer"
              style={{ borderTop: '1px solid var(--border)', padding: '16px 24px' }}
            >
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  if (selectedMedia) handleCopyUrl(selectedMedia);
                }}
              >
                <Icon path={Icons.copy} size={14} />
                {copiedId === selectedMedia._id ? 'Copied!' : 'Copy URL'}
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setMovingFileId(selectedMedia._id)}
              >
                <Icon path={Icons.move} size={14} />
                Move
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(selectedMedia._id)}
              >
                <Icon path={Icons.trash2} size={14} />
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Overlay for side panel */}
        {selectedMedia && (
          <div
            onClick={() => setSelectedMedia(null)}
            style={{
              position: 'fixed', inset: 0, background: 'transparent', zIndex: 199,
            }}
          />
        )}
      </div>
    </div>
  );
}
