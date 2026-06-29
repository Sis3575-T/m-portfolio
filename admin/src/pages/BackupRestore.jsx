import React, { useState, useEffect, useRef } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { formatDateTime } from '../lib/utils';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';

export default function BackupRestore() {
  const toast = useToast();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef(null);

  const fetchBackups = async () => {
    try {
      const { data } = await adminApi.getBackups();
      setBackups(data.data || []);
    } catch { toast.error('Failed to load backups'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBackups(); }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await adminApi.createBackup({ name: `Manual backup ${new Date().toLocaleDateString()}` });
      toast.success('Backup created');
      await fetchBackups();
    } catch { toast.error('Failed to create backup'); }
    finally { setCreating(false); }
  };

  const handleRestore = async () => {
    if (!restoreTarget) return;
    setRestoring(true);
    try {
      await adminApi.restoreBackup(restoreTarget._id);
      toast.success('Backup restored');
      setRestoreTarget(null);
    } catch { toast.error('Failed to restore backup'); }
    finally { setRestoring(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteBackup(deleteTarget._id);
      toast.success('Backup deleted');
      setBackups(prev => prev.filter(b => b._id !== deleteTarget._id));
    } catch { toast.error('Failed to delete backup'); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const handleExport = async (type) => {
    setExporting(true);
    try {
      const res = await adminApi.exportData(type);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-${type}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch { toast.error('Failed to export'); }
    finally { setExporting(false); }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      await adminApi.importData(fd);
      toast.success('Data imported');
      await fetchBackups();
    } catch { toast.error('Failed to import'); }
    finally { setImporting(false); }
  };

  const stats = {
    total: backups.length,
    manual: backups.filter(b => b.type === 'manual').length,
    auto: backups.filter(b => b.type === 'automatic').length,
    completed: backups.filter(b => b.status === 'completed').length,
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Backup & Restore</h2>
          <p>Manage your site backups and data export/import</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleCreate} disabled={creating}>
            <Icon path={Icons['plus-circle']} size={16} /> {creating ? 'Creating...' : 'Create Backup'}
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          <button className="btn btn-outline" onClick={() => fileRef.current?.click()} disabled={importing}>
            <Icon path={Icons.upload} size={16} /> {importing ? 'Importing...' : 'Import JSON'}
          </button>
          <div className="tabs">
            <button className="tab active" onClick={() => handleExport('all')} disabled={exporting}>
              <Icon path={Icons.download} size={14} /> Export All
            </button>
            <button className="tab" onClick={() => handleExport('settings')} disabled={exporting}>Settings</button>
            <button className="tab" onClick={() => handleExport('content')} disabled={exporting}>Content</button>
          </div>
        </div>
      </div>

      <div className="backup-stats">
        <div className="backup-card">
          <div className="backup-card-value">{stats.total}</div>
          <div className="backup-card-label">Total Backups</div>
        </div>
        <div className="backup-card">
          <div className="backup-card-value">{stats.completed}</div>
          <div className="backup-card-label">Completed</div>
        </div>
        <div className="backup-card">
          <div className="backup-card-value">{stats.auto}</div>
          <div className="backup-card-label">Automatic Backups</div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <span style={{ fontSize: 14, fontWeight: 600 }}>Backup History</span>
        </div>
        <table className="data-table">
          <thead><tr><th>Name</th><th>Size</th><th>Type</th><th>Status</th><th>Created</th><th style={{ width: 120 }}>Actions</th></tr></thead>
          <tbody>
            {backups.map(b => (
              <tr key={b._id}>
                <td><div className="cell-title">{b.name}</div></td>
                <td>{b.size || '-'}</td>
                <td><span className={`badge ${b.type === 'manual' ? 'badge-blue' : 'badge-gray'}`}>{b.type}</span></td>
                <td>
                  <span className={`badge ${
                    b.status === 'completed' ? 'badge-green' :
                    b.status === 'failed' ? 'badge-red' : 'badge-orange'
                  }`}>{b.status}</span>
                </td>
                <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{formatDateTime(b.createdAt)}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn-view" onClick={() => setRestoreTarget(b)}>
                      <Icon path={Icons['refresh-cw']} size={14} />
                    </button>
                    <button className="btn-delete" onClick={() => setDeleteTarget(b)}>
                      <Icon path={Icons.trash2} size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {backups.length === 0 && (
              <tr><td colSpan={6}><div className="empty-state"><Icon path={Icons.database} size={40} /><h3>No backups yet</h3><p>Create your first backup to protect your data.</p></div></td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!restoreTarget}
        onClose={() => setRestoreTarget(null)}
        onConfirm={handleRestore}
        title="Restore Backup"
        message={`Restore "${restoreTarget?.name}"? Current data will be overwritten.`}
        confirmText="Restore"
        type="warning"
        loading={restoring}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Backup"
        message={`Delete "${deleteTarget?.name}"?`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}
