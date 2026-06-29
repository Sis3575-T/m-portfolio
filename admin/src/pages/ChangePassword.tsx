import React, { useState } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      await adminApi.changePassword(currentPassword, newPassword);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({ value, onChange, placeholder, show, onToggle }: {
    value: string; onChange: (v: string) => void; placeholder: string; show: boolean; onToggle: () => void;
  }) => (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ paddingRight: '40px', width: '100%' }}
      />
      <button
        type="button"
        onClick={onToggle}
        style={{
          position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '4px',
        }}
        tabIndex={-1}
      >
        {show ? <Icon path={Icons['eye-off']} size={16} /> : <Icon path={Icons.eye} size={16} />}
      </button>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Change Password</h2>
          <p>Update your admin account password</p>
        </div>
      </div>

      <div style={{ maxWidth: 480 }}>
        {message && (
          <div style={{
            padding: '10px 16px',
            background: message.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
            color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
            borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 500, marginBottom: 16,
          }}>
            {message.text}
          </div>
        )}

        <div className="settings-section">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Current Password</label>
              <PasswordInput
                value={currentPassword}
                onChange={setCurrentPassword}
                placeholder="Enter current password"
                show={showCurrent}
                onToggle={() => setShowCurrent(!showCurrent)}
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <PasswordInput
                value={newPassword}
                onChange={setNewPassword}
                placeholder="Enter new password (min 8 chars)"
                show={showNew}
                onToggle={() => setShowNew(!showNew)}
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type={showNew ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Icon path={Icons.save} size={16} /> {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        <div style={{ padding: 16, background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text)', display: 'block', marginBottom: 4 }}>Password Requirements:</strong>
          <ul style={{ paddingLeft: 16, lineHeight: 1.8 }}>
            <li>Minimum 8 characters</li>
            <li>Should be different from your current password</li>
            <li>Use a combination of letters, numbers, and symbols</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
