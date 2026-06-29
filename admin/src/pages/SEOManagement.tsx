import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';

interface SEOData {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
  ogTitle: string;
  ogDescription: string;
  canonicalUrl: string;
  schemaMarkup: string;
  noIndex: boolean;
}

const defaultSEO: SEOData = {
  metaTitle: '', metaDescription: '', metaKeywords: '',
  ogImage: '', ogTitle: '', ogDescription: '', canonicalUrl: '',
  schemaMarkup: '', noIndex: false,
};

interface SEOEntry {
  page: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl?: string;
  schemaMarkup?: string;
  noIndex?: boolean;
  updatedAt?: string;
}

function computeSEOScore(seo: SEOData): { score: number; label: string; color: string; checks: { label: string; pass: boolean }[] } {
  const checks: { label: string; pass: boolean }[] = [];
  let points = 0;

  const tLen = seo.metaTitle.length;
  const titleGood = tLen >= 50 && tLen <= 60;
  if (titleGood) { points += 25; }
  checks.push({ label: `Title length (${tLen}/50-60)`, pass: titleGood });

  const dLen = seo.metaDescription.length;
  const descGood = dLen >= 150 && dLen <= 160;
  if (descGood) { points += 25; }
  checks.push({ label: `Description length (${dLen}/150-160)`, pass: descGood });

  const hasOG = !!seo.ogImage;
  if (hasOG) { points += 20; }
  checks.push({ label: 'OG Image set', pass: hasOG });

  const hasKeywords = !!seo.metaKeywords;
  if (hasKeywords) { points += 15; }
  checks.push({ label: 'Meta Keywords set', pass: hasKeywords });

  const hasCanonical = !!seo.canonicalUrl;
  if (hasCanonical) { points += 15; }
  checks.push({ label: 'Canonical URL set', pass: hasCanonical });

  let label: string;
  let color: string;
  if (points >= 80) { label = 'Great'; color = 'var(--success)'; }
  else if (points >= 50) { label = 'Good'; color = 'var(--warning)'; }
  else { label = 'Needs Work'; color = 'var(--danger)'; }

  return { score: points, label, color, checks };
}

function truncateText(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 3) + '...';
}

export default function SEOManagement() {
  const [pages, setPages] = useState<{ _id: string; title: string; slug: string }[]>([]);
  const [selectedPage, setSelectedPage] = useState('home');
  const [seo, setSEO] = useState<SEOData>(defaultSEO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [seoEntries, setSeoEntries] = useState<SEOEntry[]>([]);

  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [schemaValid, setSchemaValid] = useState(false);

  const [sitemapGenerating, setSitemapGenerating] = useState(false);
  const [sitemapGenerated, setSitemapGenerated] = useState<string | null>(null);

  const sitemapUrl = `${window.location.origin}/api/sitemap.xml`;

  const siteTitle = seo.metaTitle || 'Page Title';
  const siteDesc = seo.metaDescription || 'Description for search results will appear here...';
  const siteUrl = `${window.location.origin}/${selectedPage === 'home' ? '' : selectedPage}`;

  useEffect(() => {
    Promise.all([
      adminApi.getPages().catch(() => ({ data: { data: [] } })),
    ]).then(([pagesRes]) => {
      setPages(pagesRes.data.data || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedPage) return;
    adminApi.getSEO()
      .then(({ data }) => {
        const allSEO = (data.data || []) as SEOEntry[];
        setSeoEntries(allSEO);
        const pageSEO = allSEO.find((s) => s.page === selectedPage);
        if (pageSEO) {
          setSEO({
            metaTitle: pageSEO.metaTitle || '',
            metaDescription: pageSEO.metaDescription || '',
            metaKeywords: pageSEO.metaKeywords || '',
            ogImage: pageSEO.ogImage || '',
            ogTitle: pageSEO.ogTitle || '',
            ogDescription: pageSEO.ogDescription || '',
            canonicalUrl: pageSEO.canonicalUrl || '',
            schemaMarkup: pageSEO.schemaMarkup || '',
            noIndex: pageSEO.noIndex || false,
          });
          if (pageSEO.schemaMarkup) {
            try {
              JSON.parse(pageSEO.schemaMarkup);
              setSchemaValid(true);
              setSchemaError(null);
            } catch {
              setSchemaValid(false);
              setSchemaError('Invalid JSON in existing schema markup');
            }
          } else {
            setSchemaValid(false);
            setSchemaError(null);
          }
        } else {
          setSEO(defaultSEO);
          setSchemaValid(false);
          setSchemaError(null);
        }
      })
      .catch(() => setSEO(defaultSEO));
  }, [selectedPage]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const payload: Record<string, unknown> = { ...seo };
      if (seo.schemaMarkup) {
        try {
          JSON.parse(seo.schemaMarkup);
          payload.schemaMarkup = seo.schemaMarkup;
        } catch {
          setSchemaError('Fix JSON before saving');
          setSaving(false);
          return;
        }
      }
      await adminApi.updateSEO(selectedPage, payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error('Failed to save SEO', err); }
    finally { setSaving(false); }
  };

  const handleValidateJSON = () => {
    if (!seo.schemaMarkup.trim()) {
      setSchemaError('No JSON to validate');
      setSchemaValid(false);
      return;
    }
    try {
      JSON.parse(seo.schemaMarkup);
      setSchemaValid(true);
      setSchemaError(null);
    } catch (e: unknown) {
      setSchemaValid(false);
      setSchemaError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  const handleGenerateSitemap = async () => {
    setSitemapGenerating(true);
    try {
      const resp = await fetch(sitemapUrl, { method: 'GET' });
      if (resp.ok) {
        setSitemapGenerated(new Date().toLocaleString());
      } else {
        setSitemapGenerated('Failed to generate');
      }
    } catch {
      setSitemapGenerated('Failed to generate');
    } finally {
      setSitemapGenerating(false);
    }
  };

  const ogTitle = seo.ogTitle || seo.metaTitle || 'Page Title';
  const ogDesc = seo.ogDescription || seo.metaDescription || '';
  const ogImg = seo.ogImage || '';

  const seoScore = computeSEOScore(seo);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>SEO Management</h2>
          <p>Edit search engine optimization settings per page</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Icon path={Icons.save} size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {saved && (
        <div style={{ padding: '10px 16px', background: 'var(--success-light)', color: 'var(--success)', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 500, marginBottom: 16 }}>
          SEO settings saved successfully!
        </div>
      )}

      <div className="settings-section">
        <div className="form-group">
          <label>Select Page</label>
          <select value={selectedPage} onChange={(e) => setSelectedPage(e.target.value)}>
            <option value="home">Home</option>
            {pages.map(p => <option key={p._id} value={p.slug}>{p.title}</option>)}
          </select>
        </div>
      </div>

      <div className="settings-section">
        <h3>SEO Score</h3>
        <p>Overall SEO health assessment for this page</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 800, color: '#fff',
            background: `conic-gradient(${seoScore.color} ${seoScore.score}%, var(--gray-200) ${seoScore.score}%)`,
            position: 'relative',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--card)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 20, fontWeight: 800,
              color: seoScore.color,
            }}>{seoScore.score}</div>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: seoScore.color }}>{seoScore.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>out of 100</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {seoScore.checks.map((check, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <span style={{ color: check.pass ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                {check.pass ? '\u2713' : '\u2717'}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>{check.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="settings-section" style={{ marginBottom: 0 }}>
          <h3>Meta Tags</h3>
          <p>Standard meta information for search engines</p>
          <div className="form-group">
            <label>Meta Title</label>
            <input value={seo.metaTitle} onChange={(e) => setSEO({ ...seo, metaTitle: e.target.value })} placeholder="Page title for SEO" />
            <div className="form-help">{seo.metaTitle.length} characters {seo.metaTitle.length >= 50 && seo.metaTitle.length <= 60 ? <span style={{ color: 'var(--success)' }}>(ideal range)</span> : <span style={{ color: 'var(--warning)' }}>(recommended: 50-60)</span>}</div>
          </div>
          <div className="form-group">
            <label>Meta Description</label>
            <textarea value={seo.metaDescription} onChange={(e) => setSEO({ ...seo, metaDescription: e.target.value })} placeholder="Brief description for search results..." rows={3} />
            <div className="form-help">{seo.metaDescription.length} characters {seo.metaDescription.length >= 150 && seo.metaDescription.length <= 160 ? <span style={{ color: 'var(--success)' }}>(ideal range)</span> : <span style={{ color: 'var(--warning)' }}>(recommended: 150-160)</span>}</div>
          </div>
          <div className="form-group">
            <label>Meta Keywords</label>
            <input value={seo.metaKeywords} onChange={(e) => setSEO({ ...seo, metaKeywords: e.target.value })} placeholder="keyword1, keyword2, keyword3" />
          </div>
        </div>

        <div className="settings-section" style={{ marginBottom: 0 }}>
          <h3>SEO Preview</h3>
          <p>Google-style search result preview</p>
          <div style={{
            background: 'var(--bg)', borderRadius: 'var(--radius-lg)',
            padding: 16, border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>
              {truncateText(siteUrl, 60)}
              <span style={{ color: 'var(--gray-300)' }}> &#9660;</span>
            </div>
            <div style={{ fontSize: 18, color: '#1a0dab', fontWeight: 400, lineHeight: 1.3, cursor: 'pointer', marginBottom: 2 }}>
              {truncateText(siteTitle, 60)}
            </div>
            <div style={{ fontSize: 12, color: '#006621', lineHeight: 1.5 }}>
              {truncateText(siteDesc, 160)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="settings-section" style={{ marginBottom: 0 }}>
          <h3>Open Graph</h3>
          <p>Social media preview settings (Facebook, LinkedIn, etc.)</p>
          <div className="form-group">
            <label>OG Title</label>
            <input value={seo.ogTitle} onChange={(e) => setSEO({ ...seo, ogTitle: e.target.value })} placeholder="Title for social sharing" />
          </div>
          <div className="form-group">
            <label>OG Description</label>
            <textarea value={seo.ogDescription} onChange={(e) => setSEO({ ...seo, ogDescription: e.target.value })} placeholder="Description for social sharing..." rows={2} />
          </div>
          <div className="form-group">
            <label>OG Image URL</label>
            <input value={seo.ogImage} onChange={(e) => setSEO({ ...seo, ogImage: e.target.value })} placeholder="https://example.com/image.jpg" />
            {ogImg && (
              <div style={{ marginTop: 8, borderRadius: 'var(--radius)', overflow: 'hidden', width: 200, height: 104, border: '1px solid var(--border)' }}>
                <img src={ogImg} alt="OG preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
          </div>
        </div>

        <div className="settings-section" style={{ marginBottom: 0 }}>
          <h3>Social Share Preview</h3>
          <p>How this page appears when shared on social media</p>
          <div style={{
            background: '#fff', borderRadius: 'var(--radius-lg)',
            overflow: 'hidden', border: '1px solid var(--border)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}>
            {ogImg && (
              <div style={{ width: '100%', height: 160, background: 'var(--gray-100)', overflow: 'hidden' }}>
                <img src={ogImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
            <div style={{ padding: '12px 16px' }}>
              <div style={{ fontSize: 11, color: '#606770', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                {truncateText(siteUrl.replace(/^https?:\/\//, ''), 40)}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1d2129', lineHeight: 1.3, marginBottom: 4 }}>
                {truncateText(ogTitle, 70)}
              </div>
              <div style={{ fontSize: 13, color: '#606770', lineHeight: 1.4 }}>
                {truncateText(ogDesc, 200)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>Technical</h3>
        <p>Advanced SEO settings</p>
        <div className="form-group">
          <label>Canonical URL</label>
          <input value={seo.canonicalUrl} onChange={(e) => setSEO({ ...seo, canonicalUrl: e.target.value })} placeholder="https://example.com/page" />
          <div className="form-help">Leave empty to auto-generate</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--border)', marginTop: 8 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>No-Index</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>Prevent search engines from indexing this page</div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={seo.noIndex} onChange={(e) => setSEO({ ...seo, noIndex: e.target.checked })} />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3>Schema Markup</h3>
        <p>Structured data in JSON-LD format for rich search results</p>
        <div className="form-group">
          <label>JSON-LD Schema</label>
          <textarea
            value={seo.schemaMarkup}
            onChange={(e) => { setSEO({ ...seo, schemaMarkup: e.target.value }); setSchemaError(null); setSchemaValid(false); }}
            placeholder='{"@context": "https://schema.org", "@type": "WebPage", ...}'
            rows={8}
            style={{ fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.6 }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
            <button className="btn btn-outline btn-sm" onClick={handleValidateJSON}>
              <Icon path={Icons.code} size={14} /> Validate JSON
            </button>
            {schemaValid && (
              <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
                <Icon path={Icons.check} size={14} /> Valid JSON
              </span>
            )}
            {schemaError && (
              <span style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 500 }}>
                <Icon path={Icons['alert-circle']} size={14} /> {schemaError}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>Sitemap</h3>
        <p>XML sitemap for search engine crawling</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={handleGenerateSitemap} disabled={sitemapGenerating}>
            <Icon path={Icons['refresh-cw']} size={16} /> {sitemapGenerating ? 'Generating...' : 'Generate Sitemap'}
          </button>
          <a href={sitemapUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon path={Icons['external-link']} size={14} /> View Sitemap
          </a>
          {sitemapGenerated && (
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              Last generated: {sitemapGenerated}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
