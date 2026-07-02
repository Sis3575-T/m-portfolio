import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { websiteApi, getImageUrl } from '../api';

function Footer({ settings: propSettings, navItems: propNavItems }) {
  const [settings, setSettings] = useState(propSettings || null);
  const [pages, setPages] = useState(propNavItems || []);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const footerStyles = settings?.pageStyles?.footer || {};
  const footerStyle = {
    ...(footerStyles.bgColor ? { '--footer-bg': footerStyles.bgColor } : {}),
    ...(footerStyles.textColor ? { '--footer-text': footerStyles.textColor } : {}),
  };

  useEffect(() => {
    if (!propSettings) websiteApi.getSettings().then((res) => setSettings(res.data.data)).catch(() => {});
    if (!propNavItems) websiteApi.getPages().then((res) => setPages(res.data.data || [])).catch(() => {});
  }, [propSettings, propNavItems]);

  useEffect(() => {
    if (footerStyles.customCss) {
      const id = 'footer-custom-css';
      let el = document.getElementById(id);
      if (!el) { el = document.createElement('style'); el.id = id; document.head.appendChild(el); }
      el.textContent = footerStyles.customCss;
      return () => { const e = document.getElementById(id); if (e) e.remove(); };
    }
  }, [footerStyles.customCss]);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const socialLinks = settings ? [
    { platform: 'GitHub', url: settings.github },
    { platform: 'LinkedIn', url: settings.linkedin },
    { platform: 'Twitter', url: settings.twitter },
    { platform: 'Telegram', url: settings.telegram },
    { platform: 'Instagram', url: settings.instagram },
    { platform: 'YouTube', url: settings.youtube },
  ].filter((s) => s.url) : [];

  const navItems = [{ name: 'Home', slug: '' }, ...(pages.length > 0 ? pages : [
    { name: 'Blog', slug: 'blog' },
    { name: 'Gallery', slug: 'gallery' },
    { name: 'Contact', slug: 'contact' },
  ])];

  const year = new Date().getFullYear();

  return (
    <>
      <footer className="footer" style={footerStyle}>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col footer-brand-col">
              <div className="footer-brand">
                {settings?.logo ? (
                  <img src={getImageUrl(settings.logo)} alt={settings.siteTitle} className="footer-logo-img" />
                ) : (
                  <div className="footer-logo-placeholder">
                    {settings?.siteTitle?.charAt(0) || 'P'}
                  </div>
                )}
                <div>
                  <h3 className="footer-site-name">{settings?.siteTitle || 'Portfolio'}</h3>
                  <p className="footer-site-tagline">{settings?.siteDescription || ''}</p>
                </div>
              </div>
              <p className="footer-bio">
                {settings?.shortBio || settings?.longBio?.substring(0, 150) || 'Building thoughtful web experiences with modern tools, reliability, and a strong user focus.'}
              </p>
              {socialLinks.length > 0 && (
                <div className="footer-social">
                  {socialLinks.map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="footer-social-link" title={s.platform} data-track="social-link" data-track-value={s.platform}>
                      {s.platform === 'GitHub' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                      )}
                      {s.platform === 'LinkedIn' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      )}
                      {s.platform === 'Twitter' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                      )}
                      {!['GitHub', 'LinkedIn', 'Twitter', 'Telegram', 'Instagram', 'YouTube'].includes(s.platform) && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8.56 2.69c1.58.58 3.1 1.78 4.34 3.31 1.24 1.53 2.1 3.28 2.1 5.5 0 2.22-.86 3.97-2.1 5.5-1.24 1.53-2.76 2.73-4.34 3.31"/><path d="M15.44 2.69c-1.58.58-3.1 1.78-4.34 3.31-1.24 1.53-2.1 3.28-2.1 5.5 0 2.22.86 3.97 2.1 5.5 1.24 1.53 2.76 2.73 4.34 3.31"/></svg>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title">Quick Links</h4>
              <nav className="footer-nav">
                {navItems.map((page) => (
                  <Link
                    key={page._id || page.slug || page.name}
                    to={page.slug === '' || page.slug === undefined ? '/' : `/${page.slug}`}
                    className="footer-link"
                  >
                    {page.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title">Contact</h4>
              <div className="footer-contact">
                {settings?.email && <a href={`mailto:${settings.email}`} className="footer-contact-item">{settings.email}</a>}
                {settings?.phone && <span className="footer-contact-item">{settings.phone}</span>}
                {settings?.address && <span className="footer-contact-item">{settings.address}</span>}
              </div>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title">Stay Connected</h4>
              <p className="footer-newsletter-text">Follow along for product updates, project highlights, and technical notes.</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copyright">{settings?.copyrightText || `© ${year} All rights reserved.`}</p>
            <p className="footer-text">{settings?.footerText || 'Built with React, Node.js, and care for the user experience.'}</p>
          </div>
        </div>
      </footer>
      {showBackToTop && (
        <button className="back-to-top" onClick={scrollToTop} aria-label="Back to top">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      )}
    </>
  );
}

export default Footer;
