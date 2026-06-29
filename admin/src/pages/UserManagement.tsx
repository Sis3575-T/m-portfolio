import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Icon, Icons } from '../lib/icons';

const API_URL: string = import.meta.env.VITE_API_URL || '/api';

const userApi = {
  getUsers: () => axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } }),
  createUser: (data: Record<string, unknown>) => axios.post(`${API_URL}/users`, data, { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } }),
  updateUser: (id: string, data: Record<string, unknown>) => axios.put(`${API_URL}/users/${id}`, data, { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } }),
  deleteUser: (id: string) => axios.delete(`${API_URL}/users/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } }),
};

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
  createdAt: string;
}

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'editor';
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'editor'>('all');
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>({ name: '', email: '', password: '', role: 'editor' });
  const [saving, setSaving] = useState(false);

  const currentUserId = (() => {
    try {
      const u = localStorage.getItem('admin_user');
      return u ? JSON.parse(u)._id : null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await userApi.getUsers();
      setUsers(data.data || []);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', password: '', role: 'editor' });
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) return;
    if (!editing && form.password.length < 8) return;
    setSaving(true);
    try {
      if (editing) {
        const payload: Record<string, unknown> = { name: form.name, email: form.email, role: form.role };
        if (form.password) payload.password = form.password;
        await userApi.updateUser(editing._id, payload);
      } else {
        await userApi.createUser(form);
      }
      await loadUsers();
      setShowModal(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save user';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await userApi.deleteUser(confirmDelete._id);
      setUsers(prev => prev.filter(u => u._id !== confirmDelete._id));
      setConfirmDelete(null);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete user';
      alert(msg);
      setConfirmDelete(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

  if (error) return (
    <div>
      <div className="page-header"><div><h2>User Management</h2><p>Manage admin and editor accounts</p></div></div>
      <div className="empty-state">
        <Icon path={Icons['alert-circle']} size={40} />
        <h3>Failed to Load Users</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={loadUsers}>Retry</button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>User Management</h2>
          <p>Manage admin and editor accounts ({filtered.length} of {users.length})</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreate}><Icon path={Icons.plus} size={16} /> Add User</button>
        </div>
      </div>

      <div className="table-toolbar">
        <div className="search-input">
          <Icon path={Icons.search} size={14} />
          <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="search-clear" onClick={() => setSearch('')}><Icon path={Icons.x} size={14} /></button>}
        </div>
        <div className="filter-tabs">
          {(['all', 'admin', 'editor'] as const).map(role => (
            <button key={role} className={`filter-tab ${roleFilter === role ? 'active' : ''}`} onClick={() => setRoleFilter(role)}>
              {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Icon path={Icons.users} size={40} />
          <h3>{search || roleFilter !== 'all' ? 'No matching users' : 'No users yet'}</h3>
          <p>{search || roleFilter !== 'all' ? 'Try a different search or filter' : 'Create your first user to get started'}</p>
          {!search && roleFilter === 'all' && <button className="btn btn-primary" onClick={openCreate}><Icon path={Icons.plus} size={16} /> Add User</button>}
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created Date</th>
                <th style={{ width: 80 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u._id}>
                  <td>
                    <div className="cell-title">
                      <span className="avatar-sm">{u.name.charAt(0).toUpperCase()}</span>
                      {u.name}
                      {u._id === currentUserId && <span className="badge badge-blue" style={{ marginLeft: 8, fontSize: 10 }}>You</span>}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-light)', fontSize: 13 }}>{formatDate(u.createdAt)}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-edit" onClick={() => openEdit(u)} data-tooltip="Edit"><Icon path={Icons.edit} size={14} /></button>
                      <button className="btn-delete" onClick={() => setConfirmDelete(u)} disabled={u._id === currentUserId} data-tooltip={u._id === currentUserId ? 'Cannot delete yourself' : 'Delete'}><Icon path={Icons.trash2} size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit User' : 'Add User'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><Icon path={Icons.x} size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Full name"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div className="form-group">
                <label>Password {editing && <span style={{ fontWeight: 400, color: 'var(--text-light)' }}>(leave empty to keep current)</span>}</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder={editing ? 'Leave empty to keep current' : 'Min 8 characters'}
                  minLength={editing ? 0 : 8}
                />
                {!editing && form.password.length > 0 && form.password.length < 8 && (
                  <span style={{ color: 'var(--danger)', fontSize: 12 }}>Password must be at least 8 characters</span>
                )}
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as 'admin' | 'editor' })}>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={
                  saving ||
                  !form.name.trim() ||
                  !form.email.trim() ||
                  (!editing && form.password.length < 8)
                }
              >
                {saving ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : null}
                {editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}><Icon path={Icons.x} size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Are you sure you want to delete <strong>{confirmDelete.name}</strong> ({confirmDelete.email})?
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
