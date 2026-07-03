import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import PageLayout from '../components/PageLayout';
import SectionStyles from '../components/SectionStyles';

const defaultFooter = {
  bgColor: '#1f2937',
  textColor: '#f9fafb',
  columns: 3,
  showSocial: true,
  showCopyright: true,
  copyrightText: '© 2026 All rights reserved.',
  footerText: 'Built with React, Node.js, and care for the user experience.',
  showNewsletter: false,
  newsletterText: 'Follow along for product updates and project highlights.',
  columnsLayout: [
    { title: 'Quick Links', type: 'links' },
    { title: 'Contact', type: 'contact' },
    { title: 'Stay Connected', type: 'newsletter' },
  ],
};

export default function FooterManagement() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [footer, setFooter] = useState(defaultFooter);
  const [footerStats, setFooterStats] = useState([]);

  useEffect(() => { fetchFooter(); }, []);

  const fetchFooter = async () => {
    setLoading(true);
    try {
      const [settingsRes, aboutRes] = await Promise.all([
        adminApi.getSettings(),
        adminApi.getAbout().catch(() => ({ data: { data: {} } })),
      ]);
      const settings = settingsRes.data?.data || settingsRes.data?.settings || {};
      const about = aboutRes.data?.data || aboutRes.data || {};
      const merged = { ...defaultFooter, ...(settings.footer || {}) };
      setFooter(merged);
      setFooterStats(about.stats || []);
    } catch { toast.error('Failed to load footer settings'); }
    finally { setLoading(false); }
  };

  const saveStats = async (updatedStats) => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('stats', JSON.stringify(updatedStats));
      await adminApi.updateAbout(fd);
      setFooterStats(updatedStats);
      toast.success('Stats saved');
    } catch { toast.error('Failed to save stats'); }
    finally { setSaving(false); }
  };

  const saveFooter = async (updated) => {
    setSaving(true);
    try {
      const res = await adminApi.getSettings();
      const current = res.data?.data || res.data?.settings || {};
      await adminApi.updateSettings({ ...current, footer: updated, footerText: updated.footerText, copyrightText: updated.copyrightText });
      setFooter(updated);
      toast.success('Footer saved');
    } catch { toast.error('Failed to save footer'); }
    finally { setSaving(false); }
  };

  const update = (key, value) => {
    const updated = { ...footer, [key]: value };
    setFooter(updated);
    saveFooter(updated);
  };

  const updateColumn = (idx, key, value) => {
    const columnsLayout = [...footer.columnsLayout];
    columnsLayout[idx] = { ...columnsLayout[idx], [key]: value };
    const updated = { ...footer, columnsLayout };
    setFooter(updated);
    saveFooter(updated);
  };

  const addColumn = () => {
    const columnsLayout = [...footer.columnsLayout, { title: 'New Column', type: 'custom', content: '' }];
    update('columnsLayout', columnsLayout);
  };

  const removeColumn = (idx) => {
    const columnsLayout = footer.columnsLayout.filter((_, i) => i !== idx);
    update('columnsLayout', columnsLayout);
  };

  const addStat = () => setFooterStats([...footerStats, { label: '', value: '' }]);
  const removeStat = (i) => {
    const updated = footerStats.filter((_, idx) => idx !== i);
    setFooterStats(updated);
    saveStats(updated);
  };
  const updateStat = (i, field, val) => {
    const copy = [...footerStats];
    copy[i] = { ...copy[i], [field]: val };
    setFooterStats(copy);
  };
  const saveStatRow = () => saveStats(footerStats);

  const stats = [
    { label: 'Columns', value: footer.columnsLayout?.length || footer.columns, icon: Icons.grid, color: 'blue' },
    { label: 'Social Links', value: footer.showSocial ? 'Visible' : 'Hidden', icon: Icons.users, color: 'green' },
    { label: 'Copyright', value: footer.showCopyright ? 'Visible' : 'Hidden', icon: Icons['file-text'], color: 'yellow' },
    { label: 'Newsletter', value: footer.showNewsletter ? 'On' : 'Off', icon: Icons.mail, color: 'purple' },
  ];

  if (loading) {
    return (
      <PageLayout title="Footer Management" description="Customize footer content and styles">
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>Loading...</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Footer Management" description="Customize footer content and styles" stats={stats}>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        <button className={`btn ${activeTab === 'content' ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setActiveTab('content')}><Icon path={Icons['file-text']} size={14} /> Content</button>
        <button className={`btn ${activeTab === 'stats' ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setActiveTab('stats')}><Icon path={Icons['bar-chart-3']} size={14} /> Stats</button>
        <button className={`btn ${activeTab === 'columns' ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setActiveTab('columns')}><Icon path={Icons.grid} size={14} /> Columns</button>
        <button className={`btn ${activeTab === 'styles' ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setActiveTab('styles')}><Icon path={Icons.palette} size={14} /> Style Settings</button>
      </div>

      {activeTab === 'content' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 600 }}>
          <div style={{ padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Footer Text</h3>
            <div className="form-group">
              <label>Footer Tagline</label>
              <input value={footer.footerText} onChange={(e) => update('footerText', e.target.value)} placeholder="Built with React, Node.js..." />
            </div>
            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label>Copyright Text</label>
              <input value={footer.copyrightText} onChange={(e) => update('copyrightText', e.target.value)} placeholder="© 2026 All rights reserved." />
            </div>
          </div>

          <div style={{ padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Social Links</h3>
            <div className="form-group">
              <label className="form-check">
                <input type="checkbox" checked={footer.showSocial} onChange={(e) => update('showSocial', e.target.checked)} />
                <span>Show social media links in footer</span>
              </label>
            </div>
          </div>

          <div style={{ padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Copyright</h3>
            <div className="form-group">
              <label className="form-check">
                <input type="checkbox" checked={footer.showCopyright} onChange={(e) => update('showCopyright', e.target.checked)} />
                <span>Show copyright bar</span>
              </label>
            </div>
          </div>

          <div style={{ padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Newsletter Section</h3>
            <div className="form-group">
              <label className="form-check">
                <input type="checkbox" checked={footer.showNewsletter} onChange={(e) => update('showNewsletter', e.target.checked)} />
                <span>Show newsletter signup area</span>
              </label>
            </div>
            {footer.showNewsletter && (
              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label>Newsletter Text</label>
                <input value={footer.newsletterText} onChange={(e) => update('newsletterText', e.target.value)} placeholder="Follow along for updates..." />
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Biography / Description</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-tertiary)', marginBottom: '0.75rem' }}>
              This text appears in the footer. Clear it to remove.
            </p>
            <div className="form-group">
              <textarea
                rows={4}
                value={footerStats.length > 0 ? footerStats[0]._bio || '' : ''}
                onChange={(e) => {
                  const copy = footerStats.length > 0 ? [...footerStats] : [{ _bio: '' }];
                  if (copy[0]) copy[0]._bio = e.target.value;
                  setFooterStats(copy);
                }}
                placeholder="Footer description text..."
                style={{ width: '100%', resize: 'vertical', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Stats Boxes</h3>
              <button className="btn btn-ghost btn-sm" onClick={addStat}><Icon path={Icons.plus} size={14} /> Add Stat</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {footerStats.filter(s => !s._bio).map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <input value={s.label} onChange={(e) => updateStat(i, 'label', e.target.value)} placeholder="Label (e.g. Projects)" />
                  </div>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <input value={s.value} onChange={(e) => updateStat(i, 'value', e.target.value)} placeholder="Value (e.g. 50+)" />
                  </div>
                  <button onClick={() => removeStat(i)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--color-danger)', background: 'transparent', flexShrink: 0 }}>
                    <Icon path={Icons.trash2} size={14} />
                  </button>
                </div>
              ))}
            </div>
            {footerStats.filter(s => !s._bio).length > 0 && (
              <button className="btn btn-primary btn-sm" onClick={saveStatRow} style={{ marginTop: '1rem' }} disabled={saving}>
                {saving ? 'Saving...' : 'Save Stats'}
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === 'columns' && (
        <div style={{ maxWidth: 700 }}>
          <div style={{ padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Footer Columns</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>{footer.columns} columns</span>
                <button className="btn btn-ghost btn-sm" onClick={addColumn}><Icon path={Icons.plus} size={14} /> Add Column</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(footer.columnsLayout || []).map((col, i) => (
                <div key={i} style={{ padding: '1rem', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-bg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', fontWeight: 600, minWidth: 20 }}>#{i + 1}</span>
                    <div className="form-group" style={{ flex: 1, margin: 0 }}>
                      <input value={col.title} onChange={(e) => updateColumn(i, 'title', e.target.value)} placeholder="Column Title" />
                    </div>
                    <div className="form-group" style={{ flex: 1, margin: 0 }}>
                      <select value={col.type} onChange={(e) => updateColumn(i, 'type', e.target.value)}>
                        <option value="links">Quick Links</option>
                        <option value="contact">Contact Info</option>
                        <option value="newsletter">Newsletter</option>
                        <option value="custom">Custom Content</option>
                      </select>
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => removeColumn(i)}><Icon path={Icons.trash2} size={14} /></button>
                  </div>
                  {col.type === 'custom' && (
                    <div className="form-group" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                      <textarea value={col.content || ''} onChange={(e) => updateColumn(i, 'content', e.target.value)} placeholder="Custom HTML/text content..." rows={3} style={{ fontSize: '0.82rem', resize: 'vertical' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'styles' && (
        <div style={{ maxWidth: 700 }}>
          <SectionStyles sectionKey="footer" label="Footer Style Settings" />
        </div>
      )}
    </PageLayout>
  );
}
