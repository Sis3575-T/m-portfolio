import React, { useState, useEffect, useRef } from 'react';
import { adminApi, imageUrl } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import PageLayout from '../components/PageLayout';
import Toolbar from '../components/Toolbar';

const SECTIONS = [
  { key: 'personal', label: 'Personal Info', icon: Icons.user },
  { key: 'summary', label: 'Summary', icon: Icons['file-text'] },
  { key: 'skills', label: 'Skills', icon: Icons.code },
  { key: 'experience', label: 'Experience', icon: Icons.briefcase },
  { key: 'education', label: 'Education', icon: Icons['graduation-cap'] },
  { key: 'certificates', label: 'Certificates', icon: Icons.award },
  { key: 'cv', label: 'CV / Resume', icon: Icons['file-text'] },
  { key: 'languages', label: 'Languages', icon: Icons.globe },
];

export default function ResumeManagement() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState(['personal']);
  const [analytics, setAnalytics] = useState(null);

  const [hero, setHero] = useState(null);
  const [about, setAbout] = useState(null);
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [education, setEducation] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [settings, setSettings] = useState(null);

  const [saving, setSaving] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const cvInputRef = useRef(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [heroRes, aboutRes, skillsRes, expRes, eduRes, certRes, analyticsRes, settingsRes] = await Promise.all([
        adminApi.getHero().catch(() => ({ data: { data: null } })),
        adminApi.getAbout().catch(() => ({ data: { data: null } })),
        adminApi.getSkills().catch(() => ({ data: { data: [] } })),
        adminApi.getExperiences().catch(() => ({ data: { data: [] } })),
        adminApi.getEducation().catch(() => ({ data: { data: [] } })),
        adminApi.getCertificates().catch(() => ({ data: { data: [] } })),
        adminApi.getResumeAnalytics().catch(() => ({ data: { data: null } })),
        adminApi.getSettings().catch(() => ({ data: { data: {} } })),
      ]);
      setHero(heroRes.data.data || heroRes.data);
      setAbout(aboutRes.data.data || aboutRes.data);
      setSkills(skillsRes.data.data || []);
      setExperiences(expRes.data.data || []);
      setEducation(eduRes.data.data || []);
      setCertificates(certRes.data.data || []);
      setAnalytics(analyticsRes.data.data || null);
      setSettings(settingsRes.data.data || settingsRes.data || {});
    } catch {
      toast.error('Failed to load resume data');
    } finally {
      setLoading(false);
    }
  };

  const handleCvUpload = async (file) => {
    const fd = new FormData();
    fd.append('cv', file);
    try {
      await adminApi.updateSettings(fd);
      const { data } = await adminApi.getSettings();
      const s = data.data || data || {};
      setSettings(s);
      toast.success('CV uploaded successfully');
    } catch {
      toast.error('CV upload failed');
    }
  };

  const handleCvRemove = async () => {
    const fd = new FormData();
    fd.append('cvUrl', '');
    try {
      await adminApi.updateSettings(fd);
      setSettings(prev => ({ ...prev, cvUrl: '' }));
      toast.success('CV removed');
    } catch {
      toast.error('Failed to remove CV');
    }
  };

  const toggleSection = (key) => {
    setExpandedSections(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const openEditPersonal = () => {
    const h = hero || {};
    setEditModal('personal');
    setEditForm({
      name: h.name || '',
      email: h.email || '',
      phone: h.phone || '',
      location: h.location || '',
      title: h.title || '',
      linkedinUrl: h.linkedinUrl || '',
      portfolioUrl: h.portfolioUrl || '',
      photo: h.photo || '',
    });
  };

  const openEditSummary = () => {
    const a = about || {};
    setEditModal('summary');
    setEditForm({ summary: a.summary || a.description || '' });
  };

  const handleSavePersonal = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.keys(editForm).forEach(k => {
        if (k === 'photo' && editForm[k] instanceof File) {
          formData.append('photo', editForm[k]);
        } else if (k !== 'photo' || !(editForm[k] instanceof File)) {
          formData.append(k, editForm[k]);
        }
      });
      const { data } = await adminApi.updateHero(formData);
      setHero(data.data || data);
      toast.success('Personal info updated');
      setEditModal(null);
    } catch {
      toast.error('Failed to update personal info');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSummary = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('summary', editForm.summary);
      formData.append('description', editForm.summary);
      const { data } = await adminApi.updateAbout(formData);
      setAbout(data.data || data);
      toast.success('Summary updated');
      setEditModal(null);
    } catch {
      toast.error('Failed to update summary');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setEditForm({ ...editForm, photo: file, _photoPreview: reader.result });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const totalSections = SECTIONS.length;
  const skillsCount = skills.length;
  const experienceYears = experiences.length > 0
    ? Math.max(...experiences.map(e => {
        if (e.endDate) {
          return new Date(e.endDate).getFullYear() - new Date(e.startDate).getFullYear();
        }
        return new Date().getFullYear() - new Date(e.startDate).getFullYear();
      }))
    : 0;
  const downloadCount = analytics?.downloads || 0;

  const stats = [
    { label: 'Total Sections', value: totalSections, icon: Icons['file-text'], color: 'blue' },
    { label: 'Skills Count', value: skillsCount, icon: Icons.code, color: 'green' },
    { label: 'Experience Years', value: experienceYears, icon: Icons.briefcase, color: 'purple' },
    { label: 'Download Count', value: downloadCount, icon: Icons.download, color: 'yellow' },
  ];

  const getSectionPreview = (key) => {
    switch (key) {
      case 'personal':
        return hero ? `${hero.name || 'Not set'} · ${hero.title || ''}` : 'Not configured';
      case 'summary':
        return about ? (about.summary || about.description || '').substring(0, 100) : 'Not configured';
      case 'skills':
        return skills.length > 0 ? `${skills.length} skills` : 'No skills added';
      case 'experience':
        return experiences.length > 0 ? `${experiences.length} positions` : 'No experience added';
      case 'education':
        return education.length > 0 ? `${education.length} entries` : 'No education added';
      case 'certificates':
        return certificates.length > 0 ? `${certificates.length} certificates` : 'No certificates added';
      case 'cv':
        return settings?.cvUrl ? 'CV uploaded' : 'No CV uploaded';
      case 'languages':
        return 'Languages section';
      default:
        return '';
    }
  };

  const renderSectionEditButton = (key) => {
    if (key === 'personal') return <button className="btn btn-ghost btn-sm" onClick={openEditPersonal}><Icon path={Icons.edit} size={14} /> Edit</button>;
    if (key === 'summary') return <button className="btn btn-ghost btn-sm" onClick={openEditSummary}><Icon path={Icons.edit} size={14} /> Edit</button>;
    return null;
  };

  return (
    <PageLayout
      title="Resume / CV Management"
      description="Manage your resume content and sections"
      stats={stats}
    >
      <Toolbar onRefresh={fetchAll} />

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton" style={{ height: 60, borderRadius: 10 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {SECTIONS.map(section => {
            const isExpanded = expandedSections.includes(section.key);
            return (
              <div key={section.key} style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
                <div
                  onClick={() => toggleSection(section.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', cursor: 'pointer',
                    transition: 'background 0.15s', userSelect: 'none',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-subtle)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', flexShrink: 0,
                  }}>
                    <Icon path={section.icon} size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>{section.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {getSectionPreview(section.key)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    {renderSectionEditButton(section.key)}
                    <Icon path={Icons['chevron-down']} size={16} style={{ color: 'var(--color-text-tertiary)', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>
                </div>
                {isExpanded && (
                  <div style={{ padding: '0 1.25rem 1rem 4.25rem', borderTop: '1px solid var(--color-border-light)' }}>
                    <div style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
                      {section.key === 'personal' && hero && (
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                          {hero.photo && (
                            <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid var(--color-border)' }}>
                              <img src={imageUrl(hero.photo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                          <div>
                            <p><strong>Name:</strong> {hero.name || '-'}</p>
                            <p><strong>Title:</strong> {hero.title || '-'}</p>
                            <p><strong>Email:</strong> {hero.email || '-'}</p>
                            <p><strong>Phone:</strong> {hero.phone || '-'}</p>
                            <p><strong>Location:</strong> {hero.location || '-'}</p>
                            {hero.linkedinUrl && <p><strong>LinkedIn:</strong> <a href={hero.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>{hero.linkedinUrl}</a></p>}
                            {hero.portfolioUrl && <p><strong>Portfolio:</strong> <a href={hero.portfolioUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>{hero.portfolioUrl}</a></p>}
                          </div>
                        </div>
                      )}
                      {section.key === 'summary' && about && (
                        <p style={{ whiteSpace: 'pre-wrap' }}>{about.summary || about.description || 'No summary set.'}</p>
                      )}
                      {section.key === 'skills' && (
                        skills.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {skills.map((skill, i) => (
                              <span key={skill._id || i} style={{ padding: '4px 12px', background: 'var(--color-bg-subtle)', borderRadius: 6, fontSize: '0.82rem', color: 'var(--color-text)' }}>
                                {skill.name || skill.skill} {skill.level ? `(${skill.level}%)` : ''}
                              </span>
                            ))}
                          </div>
                        ) : <p style={{ color: 'var(--color-text-tertiary)' }}>No skills added yet.</p>
                      )}
                      {section.key === 'experience' && (
                        experiences.length > 0 ? experiences.map((exp, i) => (
                          <div key={exp._id || i} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--color-border-light)' }}>
                            <strong>{exp.position || exp.title}</strong> at {exp.company}
                            <br /><span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.8rem' }}>{exp.startDate ? new Date(exp.startDate).toLocaleDateString() : ''} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}</span>
                          </div>
                        )) : <p style={{ color: 'var(--color-text-tertiary)' }}>No experience added yet.</p>
                      )}
                      {section.key === 'education' && (
                        education.length > 0 ? education.map((edu, i) => (
                          <div key={edu._id || i} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--color-border-light)' }}>
                            <strong>{edu.degree}</strong> at {edu.institution || edu.school}
                            <br /><span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.8rem' }}>{edu.field || edu.major} · {edu.startDate ? new Date(edu.startDate).getFullYear() : ''} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}</span>
                          </div>
                        )) : <p style={{ color: 'var(--color-text-tertiary)' }}>No education added yet.</p>
                      )}
                      {section.key === 'certificates' && (
                        certificates.length > 0 ? certificates.map((cert, i) => (
                          <div key={cert._id || i} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--color-border-light)' }}>
                            <strong>{cert.name || cert.title}</strong> from {cert.issuer || cert.organization}
                            <br /><span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.8rem' }}>{cert.date ? new Date(cert.date).toLocaleDateString() : ''}</span>
                          </div>
                        )) : <p style={{ color: 'var(--color-text-tertiary)' }}>No certificates added yet.</p>
                      )}
                      {section.key === 'cv' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                            Upload your CV/resume file (PDF, DOC, DOCX). It will be available for visitors to view and download.
                          </p>
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            {settings?.cvUrl ? (
                              <>
                                <a href={imageUrl(settings.cvUrl)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                                  <Icon path={Icons['external-link']} size={14} /> View CV
                                </a>
                                <button className="btn btn-ghost btn-sm" onClick={() => {
                                  const a = document.createElement('a');
                                  a.href = imageUrl(settings.cvUrl);
                                  a.download = 'cv.pdf';
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                }}>
                                  <Icon path={Icons.download} size={14} /> Download
                                </button>
                                <button className="btn btn-ghost btn-sm" onClick={handleCvRemove} style={{ color: 'var(--color-danger)' }}>
                                  <Icon path={Icons.trash2} size={14} /> Remove
                                </button>
                              </>
                            ) : (
                              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)' }}>No CV uploaded</span>
                            )}
                            <button className="btn btn-primary btn-sm" onClick={() => cvInputRef.current?.click()}>
                              <Icon path={Icons.upload} size={14} /> Upload CV
                            </button>
                            <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && handleCvUpload(e.target.files[0])} />
                          </div>
                        </div>
                      )}
                      {section.key === 'languages' && (
                        <p style={{ color: 'var(--color-text-tertiary)' }}>Languages can be managed in the Skills section.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editModal === 'personal' && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h3>Edit Personal Info</h3>
              <button className="modal-close" onClick={() => setEditModal(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', background: 'var(--color-bg-subtle)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {editForm._photoPreview ? (
                    <img src={editForm._photoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : editForm.photo && typeof editForm.photo === 'string' ? (
                    <img src={imageUrl(editForm.photo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Icon path={Icons.user} size={28} style={{ color: 'var(--color-text-tertiary)' }} />
                  )}
                </div>
                <label style={{ padding: '0.5rem 1rem', border: '2px dashed var(--color-border)', borderRadius: 8, cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.85rem', background: 'var(--color-bg-subtle)' }}>
                  <Icon path={Icons.upload} size={14} /> Upload Photo
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group"><label>Full Name</label><input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
                <div className="form-group"><label>Title</label><input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /></div>
                <div className="form-group"><label>Email</label><input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></div>
                <div className="form-group"><label>Phone</label><input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></div>
                <div className="form-group"><label>Location</label><input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} /></div>
                <div className="form-group"><label>LinkedIn URL</label><input value={editForm.linkedinUrl} onChange={(e) => setEditForm({ ...editForm, linkedinUrl: e.target.value })} placeholder="https://linkedin.com/in/..." /></div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Portfolio URL</label><input value={editForm.portfolioUrl} onChange={(e) => setEditForm({ ...editForm, portfolioUrl: e.target.value })} placeholder="https://..." /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSavePersonal} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {editModal === 'summary' && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Professional Summary</h3>
              <button className="modal-close" onClick={() => setEditModal(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Professional Summary</label>
                <textarea
                  value={editForm.summary}
                  onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                  placeholder="Write a brief professional summary..."
                  rows={8}
                  style={{ fontFamily: 'inherit', lineHeight: 1.7 }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveSummary} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
