import React, { useState, useEffect, useRef } from 'react';
import { adminApi, imageUrl } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import PageLayout from '../components/PageLayout';
import SectionStyles from '../components/SectionStyles';
import Toolbar from '../components/Toolbar';

const categoryOptions = ['Frontend', 'Backend', 'Database', 'Tools', 'Other'];

const techIcons = [
  { label: 'React', icon: 'react' }, { label: 'Vue', icon: 'vue' }, { label: 'Angular', icon: 'angular' },
  { label: 'JavaScript', icon: 'javascript' }, { label: 'TypeScript', icon: 'typescript' }, { label: 'HTML', icon: 'html' },
  { label: 'CSS', icon: 'css' }, { label: 'Node.js', icon: 'nodejs' }, { label: 'Python', icon: 'python' },
  { label: 'Java', icon: 'java' }, { label: 'Go', icon: 'go' }, { label: 'Rust', icon: 'rust' },
  { label: 'Docker', icon: 'docker' }, { label: 'Git', icon: 'git' }, { label: 'Linux', icon: 'linux' },
  { label: 'MongoDB', icon: 'mongodb' }, { label: 'PostgreSQL', icon: 'postgresql' }, { label: 'MySQL', icon: 'mysql' },
  { label: 'Redis', icon: 'redis' }, { label: 'Firebase', icon: 'firebase' }, { label: 'AWS', icon: 'aws' },
  { label: 'Figma', icon: 'figma' }, { label: 'Sass', icon: 'sass' }, { label: 'Tailwind', icon: 'tailwind' },
  { label: 'Next.js', icon: 'nextjs' }, { label: 'GraphQL', icon: 'graphql' }, { label: 'Webpack', icon: 'webpack' },
  { label: 'Vite', icon: 'vite' }, { label: 'Electron', icon: 'electron' }, { label: 'Flutter', icon: 'flutter' },
  { label: 'Django', icon: 'django' }, { label: 'Kubernetes', icon: 'kubernetes' }, { label: 'Nginx', icon: 'nginx' },
  { label: 'Postman', icon: 'postman' }, { label: 'Jest', icon: 'jest' }, { label: 'C++', icon: 'cpp' },
];

const isCustomCategory = (cat) => cat && !['Frontend', 'Backend', 'Database', 'Tools', 'Other'].includes(cat);

const getCategoryColor = (cat) => {
  const colors = { Frontend: '#3B82F6', Backend: '#10B981', Database: '#F59E0B', Tools: '#8B5CF6', Other: '#6B7280' };
  return colors[cat] || '#6B7280';
};

export default function SkillsManagement() {
  const toast = useToast();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [filterVal, setFilterVal] = useState({ category: '' });
  const [form, setForm] = useState({ name: '', category: 'Frontend', icon: '', iconFile: null, order: 0, customCategory: '' });
  const iconInputRef = useRef(null);

  useEffect(() => { fetchSkills(); }, []);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getSkills();
      setSkills(data.data || []);
    } catch {
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', category: 'Frontend', icon: '', iconFile: null, order: 0, customCategory: '' });
    setShowModal(true);
  };

  const openEdit = (skill) => {
    const cat = skill.category || 'Frontend';
    const isCustom = isCustomCategory(cat);
    setEditing(skill);
    setForm({
      name: skill.name || '',
      category: isCustom ? 'Other' : cat,
      icon: skill.icon || '',
      iconFile: null,
      order: skill.order ?? 0,
      customCategory: isCustom ? cat : '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('category', form.category === 'Other' && form.customCategory.trim() ? form.customCategory.trim() : form.category);
    fd.append('order', form.order);
    fd.append('status', 'published');
    if (form.icon && !form.iconFile) fd.append('icon', form.icon);
    if (form.iconFile) fd.append('icon', form.iconFile);
    try {
      if (editing) await adminApi.updateSkill(editing._id, fd);
      else await adminApi.createSkill(fd);
      toast.success(editing ? 'Skill updated' : 'Skill created');
      await fetchSkills();
      setShowModal(false);
    } catch {
      toast.error('Failed to save skill');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteSkill(deleteTarget._id);
      toast.success('Skill deleted');
      setSkills(prev => prev.filter(s => s._id !== deleteTarget._id));
    } catch {
      toast.error('Failed to delete skill');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const moveSkill = (index, direction) => {
    const newSkills = [...skills];
    const target = index + direction;
    if (target < 0 || target >= newSkills.length) return;
    [newSkills[index], newSkills[target]] = [newSkills[target], newSkills[index]];
    setSkills(newSkills);
  };

  const filteredSkills = skills.filter(s => {
    const q = searchVal.toLowerCase();
    if (q && !s.name?.toLowerCase().includes(q)) return false;
    if (filterVal.category && s.category !== filterVal.category) return false;
    return true;
  });

  const stats = [
    { label: 'Total Skills', value: skills.length, icon: Icons.code, color: 'blue' },
    { label: 'Frontend', value: skills.filter(s => s.category === 'Frontend').length, icon: Icons.code, color: 'blue' },
    { label: 'Backend', value: skills.filter(s => s.category === 'Backend').length, icon: Icons.database, color: 'green' },
    { label: 'Database', value: skills.filter(s => s.category === 'Database').length, icon: Icons.database, color: 'yellow' },
    { label: 'Tools', value: skills.filter(s => s.category === 'Tools').length, icon: Icons.settings, color: 'purple' },
    { label: 'Other', value: skills.filter(s => s.category === 'Other' || !categoryOptions.includes(s.category)).length, icon: Icons.grid, color: 'gray' },
  ];

  return (
    <PageLayout
      title="Skills Management"
      description="Manage your technical skills"
      stats={stats}
    >
      <Toolbar
        searchValue={searchVal}
        onSearchChange={setSearchVal}
        searchPlaceholder="Search skills..."
        filters={[
          { key: 'category', label: 'Category', type: 'select', options: categoryOptions },
        ]}
        filterValues={filterVal}
        onFilterChange={(key, val) => {
          if (key === '__reset__' || val === '__reset__') setFilterVal({ category: '' });
          else setFilterVal({ ...filterVal, [key]: val });
        }}
        onAddNew={openCreate}
        onRefresh={fetchSkills}
      />

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
              <div className="skeleton" style={{ width: '60%', height: 20, marginBottom: 12, borderRadius: 6, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              <div className="skeleton" style={{ width: '40%', height: 14, marginBottom: 16, borderRadius: 6, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              <div className="skeleton" style={{ width: '100%', height: 10, borderRadius: 5, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
            </div>
          ))}
        </div>
      ) : filteredSkills.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '4rem 2rem', color: 'var(--color-text-tertiary)' }}>
          <Icon path={Icons.code} size={48} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0 }}>No skills found</h3>
          <p style={{ margin: 0, fontSize: '0.88rem' }}>Click 'Add New' to add your first skill.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {filteredSkills.map((skill, index) => (
            <div
              key={skill._id}
              style={{
                padding: '1.25rem', borderRadius: 14, border: '1px solid var(--color-border)',
                background: 'var(--color-card)', transition: 'box-shadow 0.2s, transform 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${getCategoryColor(skill.category)}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                    {skill.icon ? (
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase', color: getCategoryColor(skill.category) }}>{skill.icon.slice(0, 3)}</span>
                    ) : <Icon path={Icons.code} size={20} style={{ color: getCategoryColor(skill.category) }} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text)' }}>{skill.name}</div>
                    <span className="badge" style={{ background: `${getCategoryColor(skill.category)}18`, color: getCategoryColor(skill.category), fontSize: '0.7rem', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{skill.category || 'Other'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 2 }}>
                  <button onClick={() => moveSkill(index, -1)} disabled={index === 0} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: index === 0 ? 'default' : 'pointer', color: index === 0 ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)', background: 'transparent', opacity: index === 0 ? 0.3 : 1 }}>
                    <Icon path={Icons['chevron-up']} size={14} />
                  </button>
                  <button onClick={() => moveSkill(index, 1)} disabled={index >= filteredSkills.length - 1} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: index >= filteredSkills.length - 1 ? 'default' : 'pointer', color: index >= filteredSkills.length - 1 ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)', background: 'transparent', opacity: index >= filteredSkills.length - 1 ? 0.3 : 1 }}>
                    <Icon path={Icons['chevron-down']} size={14} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Order: {skill.order ?? index + 1}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => openEdit(skill)} style={{ width: 30, height: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--color-text-secondary)', background: 'transparent', transition: 'background 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-subtle)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <Icon path={Icons.edit} size={14} />
                  </button>
                  <button onClick={() => setDeleteTarget(skill)} style={{ width: 30, height: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--color-danger)', background: 'transparent', transition: 'background 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-subtle)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <Icon path={Icons.trash2} size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Skill' : 'Add Skill'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input value={form.name} onChange={(e) => {
                  const name = e.target.value;
                  const match = techIcons.find(t => t.label.toLowerCase() === name.trim().toLowerCase());
                  setForm({ ...form, name, icon: match ? match.icon : form.icon, iconFile: match ? null : form.iconFile });
                }} placeholder="React, Node.js, etc." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, customCategory: '' })}>
                    {categoryOptions.map(c => <option key={c}>{c}</option>)}
                  </select>
                  {form.category === 'Other' && (
                    <input
                      value={form.customCategory}
                      onChange={(e) => setForm({ ...form, customCategory: e.target.value })}
                      placeholder="Type custom category..."
                      style={{ marginTop: 8 }}
                    />
                  )}
                </div>
                <div className="form-group">
                  <label>Order</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
                </div>
              </div>
              <div className="form-group">
                <label>Icon <span style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', fontWeight: 400 }}>(upload image or pick emoji)</span></label>
                <div
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'var(--color-primary-subtle)'; }}
                  onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-bg)'; }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.background = 'var(--color-bg)';
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) {
                      setForm({ ...form, icon: URL.createObjectURL(file), iconFile: file });
                    } else { toast.error('Please drop an image file'); }
                  }}
                  onClick={() => iconInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${form.iconFile || (form.icon && form.icon.startsWith('blob:')) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 12, padding: '1.5rem', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                    background: form.iconFile || (form.icon && form.icon.startsWith('blob:')) ? 'var(--color-primary-subtle)' : 'var(--color-bg)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                  }}
                >
                  {form.iconFile || (form.icon && form.icon.startsWith('blob:')) ? (
                    <img src={form.icon} alt="icon preview" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 8 }} />
                  ) : form.icon ? (
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, textTransform: 'uppercase' }}>{form.icon.slice(0, 3)}</span>
                  ) : null}
                  <input ref={iconInputRef} type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) setForm({ ...form, icon: URL.createObjectURL(file), iconFile: file }); }} style={{ display: 'none' }} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>
                    {form.iconFile || form.icon ? 'Click or drag to replace' : 'Click or drag image here'}
                  </span>
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', marginBottom: 6, fontWeight: 500 }}>Or pick an emoji:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {techIcons.map(t => (
                      <button
                        key={t.icon}
                        type="button"
                        onClick={() => setForm({ ...form, icon: t.icon, iconFile: null })}
                        title={t.label}
                        style={{
                          width: 36, height: 36, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: form.icon === t.icon && !form.iconFile ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                          borderRadius: 8, cursor: 'pointer', background: form.icon === t.icon && !form.iconFile ? 'var(--color-primary-subtle)' : 'var(--color-bg)',
                          transition: 'all 0.15s',
                        }}
                      >
                        {t.icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update Skill' : 'Create Skill'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Skill"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />

      <SectionStyles sectionKey="skills" label="Skills Section Styles" />
    </PageLayout>
  );
}
