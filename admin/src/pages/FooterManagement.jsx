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

  useEffect(() => { fetchFooter(); }, []);

  const fetchFooter = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSettings();
      const settings = res.data?.data || res.data?.settings || {};
      const merged = { ...defaultFooter, ...(settings.footer || {}) };
      setFooter(merged);
    } catch { toast.error('Failed to load footer settings'); }
    finally { setLoading(false); }
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
