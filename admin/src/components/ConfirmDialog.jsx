import React from 'react';
import { Icons, Icon } from '../lib/icons';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = 'Delete', cancelText = 'Cancel', type = 'danger', loading = false }) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: '32px 28px' }}>
          <div className={`confirm-dialog-icon ${type}`}>
            {type === 'danger' && <Icon path={Icons['alert-triangle']} size={24} />}
            {type === 'warning' && <Icon path={Icons['alert-circle']} size={24} />}
            {type === 'info' && <Icon path={Icons['info']} size={24} />}
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{title}</h3>
          <p className="confirm-dialog-text">{message}</p>
          <div className="modal-footer" style={{ justifyContent: 'center', padding: 0 }}>
            <button className="btn btn-outline" onClick={onClose} disabled={loading}>{cancelText}</button>
            <button className={`btn btn-${type === 'danger' ? 'danger' : type === 'warning' ? 'warning' : 'primary'}`} onClick={onConfirm} disabled={loading}>
              {loading ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
