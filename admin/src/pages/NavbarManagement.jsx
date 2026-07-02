import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import PageLayout from '../components/PageLayout';
import SectionStyles from '../components/SectionStyles';

const itemTypes = [
  { value: 'link', label: 'Link' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'megamenu', label: 'Mega Menu' },
];

const targets = ['_self', '_blank'];
const roles = ['All', 'Admin', 'Editor', 'Viewer'];

const defaultItem = {
  label: '', url: '', type: 'link', icon: '', parent: '', order: 0,
  target: '_self', cssClass: '', visible: true, permissions: 'All', children: [],
};

export default function NavbarManagement() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menus, setMenus] = useState([]);
  const [pages, setPages] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteItemTarget, setDeleteItemTarget] = useState(null);
  const [showNewMenuModal, setShowNewMenuModal] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');
  const [itemForm, setItemForm] = useState({ ...defaultItem });
  const [editingItemIdx, setEditingItemIdx] = useState(null);
  const [expandedMenus, setExpandedMenus] = useState({});

  const [activeTab, setActiveTab] = useState('menus');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsRes, pagesRes] = await Promise.all([
        adminApi.getSettings(), adminApi.getPages(),
      ]);
      const settings = settingsRes.data?.data || settingsRes.data?.settings || {};
      setMenus(settings.navigation?.menus || []);
      setPages(pagesRes.data?.data || []);
      if (!selectedMenu && (settings.navigation?.menus || []).length > 0) {
        setSelectedMenu(settings.navigation.menus[0]);
      }
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const saveNavigation = async (updatedMenus) => {
    setSaving(true);
    try {
      const settingsRes = await adminApi.getSettings();
      const current = settingsRes.data?.data || settingsRes.data?.settings || {};
      await adminApi.updateSettings({ ...current, navigation: { menus: updatedMenus } });
      setMenus(updatedMenus);
      toast.success('Navigation saved');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const createMenu = () => {
    if (!newMenuName.trim()) { toast.error('Menu name required'); return; }
    const menu = { id: 'menu_' + Date.now(), name: newMenuName.trim(), items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), active: false };
    saveNavigation([...menus, menu]);
    setSelectedMenu(menu);
    setNewMenuName('');
    setShowNewMenuModal(false);
  };

  const deleteMenu = async () => {
    if (!deleteTarget) return;
    const updated = menus.filter(m => m.id !== deleteTarget.id);
    await saveNavigation(updated);
    if (selectedMenu?.id === deleteTarget.id) setSelectedMenu(updated.length > 0 ? updated[0] : null);
    setDeleteTarget(null);
  };

  const duplicateMenu = (menu) => {
    const dup = { ...menu, id: 'menu_' + Date.now(), name: menu.name + ' (Copy)', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), active: false };
    saveNavigation([...menus, dup]);
  };

  const toggleActive = (menu) => {
    saveNavigation(menus.map(m => ({ ...m, active: m.id === menu.id ? !m.active : m.active })));
  };

  const updateMenuName = (menu, name) => {
    const updated = menus.map(m => m.id === menu.id ? { ...m, name, updatedAt: new Date().toISOString() } : m);
    saveNavigation(updated);
    setSelectedMenu({ ...menu, name });
  };

  const flattenItems = (items, parent = '') => {
    let result = [];
    (items || []).forEach((item, idx) => {
      const path = parent ? `${parent}.children.${idx}` : `${idx}`;
      result.push({ ...item, _path: path, _depth: parent ? parent.split('.').length / 2 : 0 });
      if (item.children?.length) result = result.concat(flattenItems(item.children, path));
    });
    return result;
  };

  const getItemByPath = (items, path) => {
    const parts = path.split('.');
    let current = items;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (p === 'children') continue;
      const idx = parseInt(p);
      if (i + 1 < parts.length && parts[i + 1] === 'children') { current = current[idx].children; i++; }
      else return current[idx];
    }
    return null;
  };

  const setItemByPath = (items, path, value) => {
    const parts = path.split('.');
    let current = items;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (p === 'children') continue;
      const idx = parseInt(p);
      if (i + 1 < parts.length && parts[i + 1] === 'children') { current = current[idx].children; i++; }
      else { current[idx] = value; return; }
    }
  };

  const removeItemByPath = (items, path) => {
    const parts = path.split('.');
    let current = items;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (p === 'children') continue;
      const idx = parseInt(p);
      if (i + 1 < parts.length && parts[i + 1] === 'children') { current = current[idx].children; i++; }
      else { current.splice(idx, 1); return; }
    }
  };

  const moveItem = (fromPath, toPath) => {
    if (!selectedMenu) return;
    const items = [...selectedMenu.items];
    const item = getItemByPath(items, fromPath);
    if (!item) return;
    removeItemByPath(items, fromPath);
    const targetIdx = parseInt(toPath.split('.').pop());
    const targetArr = toPath.includes('children') ? getItemByPath(items, toPath.substring(0, toPath.lastIndexOf('.children')))?.children || items : items;
    targetArr.splice(targetIdx, 0, item);
    const updated = menus.map(m => m.id === selectedMenu.id ? { ...m, items, updatedAt: new Date().toISOString() } : m);
    saveNavigation(updated);
    setSelectedMenu({ ...selectedMenu, items });
  };

  const addItem = () => {
    if (!selectedMenu || !itemForm.label.trim()) { toast.error('Label is required'); return; }
    const items = [...selectedMenu.items];
    if (itemForm.parent) { const parent = getItemByPath(items, itemForm.parent); if (parent) { if (!parent.children) parent.children = []; parent.children.push({ ...itemForm, children: [] }); } }
    else items.push({ ...itemForm, children: [] });
    const updated = menus.map(m => m.id === selectedMenu.id ? { ...m, items, updatedAt: new Date().toISOString() } : m);
    saveNavigation(updated);
    setSelectedMenu({ ...selectedMenu, items });
    setShowAddItem(false);
    setItemForm({ ...defaultItem });
    setEditingItemIdx(null);
  };

  const updateItem = () => {
    if (!selectedMenu || !itemForm.label.trim()) { toast.error('Label is required'); return; }
    const items = [...selectedMenu.items];
    setItemByPath(items, editingItemIdx, { ...itemForm });
    const updated = menus.map(m => m.id === selectedMenu.id ? { ...m, items, updatedAt: new Date().toISOString() } : m);
    saveNavigation(updated);
    setSelectedMenu({ ...selectedMenu, items });
    setShowAddItem(false);
    setItemForm({ ...defaultItem });
    setEditingItemIdx(null);
  };

  const deleteItem = () => {
    if (!selectedMenu || !deleteItemTarget) return;
    const items = [...selectedMenu.items];
    removeItemByPath(items, deleteItemTarget);
    const updated = menus.map(m => m.id === selectedMenu.id ? { ...m, items, updatedAt: new Date().toISOString() } : m);
    saveNavigation(updated);
    setSelectedMenu({ ...selectedMenu, items });
    setDeleteItemTarget(null);
    if (selectedItem?._path === deleteItemTarget) setSelectedItem(null);
  };

  const openEditItem = (item) => {
    setEditingItemIdx(item._path);
    setItemForm({
      label: item.label || '', url: item.url || '', type: item.type || 'link', icon: item.icon || '',
      parent: item.parent || '', order: item.order || 0, target: item.target || '_self',
      cssClass: item.cssClass || '', visible: item.visible !== false, permissions: item.permissions || 'All', children: item.children || [],
    });
    setShowAddItem(true);
  };

  const flatItems = selectedMenu ? flattenItems(selectedMenu.items) : [];
  const stats = [
    { label: 'Total Menu Items', value: flatItems.length, icon: Icons.list, color: 'blue' },
    { label: 'Top Level Items', value: selectedMenu?.items?.length || 0, icon: Icons['chevron-right'], color: 'green' },
    { label: 'Dropdowns', value: flatItems.filter(i => i.type === 'dropdown').length, icon: Icons['chevron-down'], color: 'yellow' },
    { label: 'External Links', value: flatItems.filter(i => i.url?.startsWith('http')).length, icon: Icons['external-link'], color: 'purple' },
  ];

  const renderTreeItem = (item) => {
    const isSelected = selectedItem?._path === item._path;
    const indent = item._depth * 24;
    return (
      <div key={item._path} onClick={() => setSelectedItem(item)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', paddingLeft: 12 + indent, borderRadius: 8, cursor: 'pointer', background: isSelected ? 'var(--color-primary-subtle)' : 'transparent', color: isSelected ? 'var(--color-primary)' : 'var(--color-text)', transition: 'background 0.15s', userSelect: 'none' }}
        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--color-bg-subtle)'; }}
        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ cursor: 'grab', color: 'var(--color-text-tertiary)', display: 'flex' }}><Icon path={Icons.menu} size={14} /></span>
        <span style={{ fontSize: '0.85rem', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.icon && <span style={{ marginRight: 4 }}>{item.icon}</span>}{item.label || 'Untitled'}</span>
        <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: 4, fontWeight: 600, background: item.type === 'dropdown' ? 'var(--color-warning-light)' : item.type === 'megamenu' ? 'var(--color-danger-light)' : 'var(--color-primary-light)', color: item.type === 'dropdown' ? 'var(--color-warning)' : item.type === 'megamenu' ? 'var(--color-danger)' : 'var(--color-primary)' }}>
          {itemTypes.find(t => t.value === item.type)?.label || 'Link'}
        </span>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.visible ? 'var(--color-success)' : 'var(--color-text-tertiary)', flexShrink: 0 }} />
      </div>
    );
  };

  if (loading) {
    return (
      <PageLayout title="Navbar Management" description="Edit navigation menu and navbar styles">
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>Loading...</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Navbar Management" description="Edit navigation menu and navbar styles" stats={stats}>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        <button className={`btn ${activeTab === 'menus' ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setActiveTab('menus')}><Icon path={Icons.list} size={14} /> Menu Items</button>
        <button className={`btn ${activeTab === 'styles' ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setActiveTab('styles')}><Icon path={Icons.palette} size={14} /> Style Settings</button>
      </div>

      {activeTab === 'menus' && (
        <>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '0 0 40%', minWidth: 300 }}>
              <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)' }}>
                  <select value={selectedMenu?.id || ''} onChange={(e) => { const menu = menus.find(m => m.id === e.target.value); setSelectedMenu(menu || null); setSelectedItem(null); }}
                    style={{ padding: '0.4rem 0.5rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.85rem', flex: 1 }}>
                    {menus.length === 0 && <option value="">No menus</option>}
                    {menus.map(m => <option key={m.id} value={m.id}>{m.name}{m.active ? ' (Active)' : ''}</option>)}
                  </select>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowNewMenuModal(true)} style={{ marginLeft: 8 }}><Icon path={Icons.plus} size={14} /></button>
                </div>
                <div style={{ padding: '0.5rem' }}>
                  {selectedMenu && flatItems.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>No items yet</div>
                  )}
                  {selectedMenu && flatItems.map(renderTreeItem)}
                </div>
                {selectedMenu && (
                  <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--color-border)' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => { setItemForm({ ...defaultItem }); setEditingItemIdx(null); setShowAddItem(true); }}>
                      <Icon path={Icons.plus} size={14} /> Add New Item
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ flex: '0 0 58%', minWidth: 350 }}>
              <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  {selectedItem ? 'Edit Item' : 'Menu Item Editor'}
                </div>
                {selectedItem ? (
                  <div style={{ padding: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label>Label</label>
                        <input value={selectedItem.label} onChange={(e) => { const items = [...selectedMenu.items]; const updated = { ...selectedItem, label: e.target.value }; setItemByPath(items, selectedItem._path, updated); setSelectedMenu({ ...selectedMenu, items }); setSelectedItem(updated); }} placeholder="Menu label" />
                      </div>
                      <div className="form-group">
                        <label>URL or Page</label>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <input value={selectedItem.url} onChange={(e) => { const items = [...selectedMenu.items]; const updated = { ...selectedItem, url: e.target.value }; setItemByPath(items, selectedItem._path, updated); setSelectedMenu({ ...selectedMenu, items }); setSelectedItem(updated); }} placeholder="/about" style={{ flex: 1 }} />
                          <select value="" onChange={(e) => { if (!e.target.value) return; const items = [...selectedMenu.items]; const updated = { ...selectedItem, url: e.target.value }; setItemByPath(items, selectedItem._path, updated); setSelectedMenu({ ...selectedMenu, items }); setSelectedItem(updated); }}
                            style={{ width: 100, padding: '0.4rem 0.5rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.85rem' }}>
                            <option value="">Pages</option>
                            {pages.map(p => <option key={p._id} value={`/${p.slug || ''}`}>{p.title || p.slug}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Type</label>
                        <select value={selectedItem.type} onChange={(e) => { const items = [...selectedMenu.items]; const updated = { ...selectedItem, type: e.target.value }; setItemByPath(items, selectedItem._path, updated); setSelectedMenu({ ...selectedMenu, items }); setSelectedItem(updated); }}>
                          {itemTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Icon (emoji or SVG)</label>
                        <input value={selectedItem.icon} onChange={(e) => { const items = [...selectedMenu.items]; const updated = { ...selectedItem, icon: e.target.value }; setItemByPath(items, selectedItem._path, updated); setSelectedMenu({ ...selectedMenu, items }); setSelectedItem(updated); }} placeholder="🚀" />
                      </div>
                      <div className="form-group">
                        <label>Target</label>
                        <select value={selectedItem.target} onChange={(e) => { const items = [...selectedMenu.items]; const updated = { ...selectedItem, target: e.target.value }; setItemByPath(items, selectedItem._path, updated); setSelectedMenu({ ...selectedMenu, items }); setSelectedItem(updated); }}>
                          {targets.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Order</label>
                        <input type="number" value={selectedItem.order} onChange={(e) => { const items = [...selectedMenu.items]; const updated = { ...selectedItem, order: Number(e.target.value) }; setItemByPath(items, selectedItem._path, updated); setSelectedMenu({ ...selectedMenu, items }); setSelectedItem(updated); }} />
                      </div>
                      <div className="form-group">
                        <label>CSS Class</label>
                        <input value={selectedItem.cssClass || ''} onChange={(e) => { const items = [...selectedMenu.items]; const updated = { ...selectedItem, cssClass: e.target.value }; setItemByPath(items, selectedItem._path, updated); setSelectedMenu({ ...selectedMenu, items }); setSelectedItem(updated); }} placeholder="nav-item" />
                      </div>
                      <div className="form-group">
                        <label>Permissions</label>
                        <select value={selectedItem.permissions || 'All'} onChange={(e) => { const items = [...selectedMenu.items]; const updated = { ...selectedItem, permissions: e.target.value }; setItemByPath(items, selectedItem._path, updated); setSelectedMenu({ ...selectedMenu, items }); setSelectedItem(updated); }}>
                          {roles.map(r => <option key={r}>{r}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Visibility</label>
                        <label className="form-check">
                          <input type="checkbox" checked={selectedItem.visible !== false} onChange={(e) => { const items = [...selectedMenu.items]; const updated = { ...selectedItem, visible: e.target.checked }; setItemByPath(items, selectedItem._path, updated); setSelectedMenu({ ...selectedMenu, items }); setSelectedItem(updated); }} />
                          <span>{selectedItem.visible !== false ? 'Visible' : 'Hidden'}</span>
                        </label>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => setSelectedItem(null)}>Cancel</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteItemTarget(selectedItem._path)}>Delete</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>Select an item from the tree to edit</div>
                )}
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Saved Menu Configurations</div>
            <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
              {menus.length === 0 && <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>No menus configured yet</div>}
              {menus.map(menu => (
                <div key={menu.id} style={{ padding: '1rem', borderRadius: 10, border: '1px solid var(--color-border)', background: menu.active ? 'var(--color-primary-subtle)' : 'var(--color-bg)', transition: 'box-shadow 0.15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{menu.name}</strong>
                    <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: 4, fontWeight: 600, background: menu.active ? 'var(--color-success-light)' : 'var(--color-gray-100)', color: menu.active ? 'var(--color-success)' : 'var(--color-text-tertiary)' }}>
                      {menu.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>{menu.items?.length || 0} items</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>{menu.updatedAt ? new Date(menu.updatedAt).toLocaleDateString() : '-'}</div>
                  <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.75rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(menu)}><Icon path={menu.active ? Icons['eye-off'] : Icons.eye} size={12} /> {menu.active ? 'Deactivate' : 'Activate'}</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedMenu(menu); setSelectedItem(null); }}><Icon path={Icons.edit} size={12} /> Edit</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => duplicateMenu(menu)}><Icon path={Icons.copy} size={12} /></button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => setDeleteTarget(menu)}><Icon path={Icons.trash2} size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {showNewMenuModal && (
            <div className="modal-overlay" onClick={() => setShowNewMenuModal(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
                <div className="modal-header"><h3>Create New Menu</h3><button className="modal-close" onClick={() => setShowNewMenuModal(false)}>&times;</button></div>
                <div className="modal-body"><div className="form-group"><label>Menu Name</label><input value={newMenuName} onChange={(e) => setNewMenuName(e.target.value)} placeholder="Main Navigation" autoFocus /></div></div>
                <div className="modal-footer"><button className="btn btn-outline" onClick={() => setShowNewMenuModal(false)}>Cancel</button><button className="btn btn-primary" onClick={createMenu}>Create</button></div>
              </div>
            </div>
          )}

          {showAddItem && (
            <div className="modal-overlay" onClick={() => setShowAddItem(false)}>
              <div className="modal modal-lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
                <div className="modal-header"><h3>{editingItemIdx ? 'Edit Item' : 'Add New Item'}</h3><button className="modal-close" onClick={() => setShowAddItem(false)}>&times;</button></div>
                <div className="modal-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group"><label>Label</label><input value={itemForm.label} onChange={(e) => setItemForm({ ...itemForm, label: e.target.value })} placeholder="Menu label" /></div>
                    <div className="form-group"><label>URL</label><input value={itemForm.url} onChange={(e) => setItemForm({ ...itemForm, url: e.target.value })} placeholder="/about" /></div>
                    <div className="form-group"><label>Type</label><select value={itemForm.type} onChange={(e) => setItemForm({ ...itemForm, type: e.target.value })}>{itemTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
                    <div className="form-group"><label>Icon</label><input value={itemForm.icon} onChange={(e) => setItemForm({ ...itemForm, icon: e.target.value })} placeholder="🚀" /></div>
                    <div className="form-group"><label>Target</label><select value={itemForm.target} onChange={(e) => setItemForm({ ...itemForm, target: e.target.value })}>{targets.map(t => <option key={t}>{t}</option>)}</select></div>
                    <div className="form-group"><label>Order</label><input type="number" value={itemForm.order} onChange={(e) => setItemForm({ ...itemForm, order: Number(e.target.value) })} /></div>
                    <div className="form-group"><label>CSS Class</label><input value={itemForm.cssClass} onChange={(e) => setItemForm({ ...itemForm, cssClass: e.target.value })} /></div>
                    <div className="form-group"><label>Permissions</label><select value={itemForm.permissions} onChange={(e) => setItemForm({ ...itemForm, permissions: e.target.value })}>{roles.map(r => <option key={r}>{r}</option>)}</select></div>
                    <div className="form-group"><label>Parent Item</label><select value={itemForm.parent} onChange={(e) => setItemForm({ ...itemForm, parent: e.target.value })}><option value="">None (Top Level)</option>{flatItems.map(i => <option key={i._path} value={i._path}>{'  '.repeat(i._depth)}{i.label}</option>)}</select></div>
                    <div className="form-group"><label>Visibility</label><label className="form-check"><input type="checkbox" checked={itemForm.visible} onChange={(e) => setItemForm({ ...itemForm, visible: e.target.checked })} /><span>Visible</span></label></div>
                  </div>
                </div>
                <div className="modal-footer"><button className="btn btn-outline" onClick={() => setShowAddItem(false)}>Cancel</button><button className="btn btn-primary" onClick={editingItemIdx ? updateItem : addItem}>{editingItemIdx ? 'Update' : 'Add'} Item</button></div>
              </div>
            </div>
          )}

          <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={deleteMenu} title="Delete Menu" message={`Are you sure you want to delete "${deleteTarget?.name}"?`} confirmText="Delete" type="danger" />
          <ConfirmDialog open={!!deleteItemTarget} onClose={() => setDeleteItemTarget(null)} onConfirm={deleteItem} title="Delete Item" message="Are you sure you want to delete this menu item?" confirmText="Delete" type="danger" />
        </>
      )}

      {activeTab === 'styles' && (
        <div style={{ maxWidth: 700 }}>
          <SectionStyles sectionKey="navbar" label="Navbar Style Settings" />
        </div>
      )}
    </PageLayout>
  );
}
