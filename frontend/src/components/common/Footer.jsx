import React, { useState, useEffect, useMemo } from 'react';
import {
  FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaArrowUp,
  FaRocket, FaMapMarkerAlt, FaPhone, FaTelegram,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { useI18n } from '../../utils/i18n.jsx';
import { publicApi } from '../../utils/api';

function Footer() {
  const { t } = useI18n();
  const navLinks = useMemo(() => [
    { label: t('nav.home'), href: '#home' },
    { label: t('nav.about'), href: '#about' },
    { label: t('nav.skills'), href: '#skills' },
    { label: t('nav.projects'), href: '#projects' },
    { label: t('nav.experience'), href: '#experience' },
    { label: t('nav.contact'), href: '#contact' },
  ], [t]);

  const [showScroll, setShowScroll] = useState(false);
  const [settings, setSettings] = useState(null);
  const [hero, setHero] = useState(null);
  const [about, setAbout] = useState(null);
  const year = new Date().getFullYear();

  useEffect(() => {
    Promise.all([
      publicApi.getSettings().catch(() => ({ data: null })),
      publicApi.getHero().catch(() => ({ data: null })),
      publicApi.getAbout().catch(() => ({ data: null })),
    ]).then(([settingsRes, heroRes, aboutRes]) => {
      const s = settingsRes?.data?.data || settingsRes?.data || null;
      const h = heroRes?.data?.data || heroRes?.data || null;
      const a = aboutRes?.data?.data || aboutRes?.data || null;
      setSettings(Array.isArray(s) ? s[0] : s);
      setHero(Array.isArray(h) ? h[0] : h);
      setAbout(Array.isArray(a) ? a[0] : a);
    });
  }, []);

  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const s = settings || {};
  const h = hero || {};
  const a = about || {};

  const socialLinks = [
    ...(s.github ? [{ icon: <FaGithub size={18} />, url: s.github, label: 'GitHub' }] : []),
    ...(s.linkedin ? [{ icon: <FaLinkedin size={18} />, url: s.linkedin, label: 'LinkedIn' }] : []),
    ...(s.twitter ? [{ icon: <FaTwitter size={18} />, url: s.twitter, label: 'Twitter' }] : []),
    ...(s.telegram ? [{ icon: <FaTelegram size={18} />, url: s.telegram, label: 'Telegram' }] : []),
    ...(s.email ? [{ icon: <FaEnvelope size={18} />, url: `mailto:${s.email}`, label: 'Email' }] : []),
  ];

  const footerStats = a.stats || [];

  return (
    <>
      <footer className="footer">
        <div className="footer-waves">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="var(--primary-color)" opacity="0.08" />
            <path d="M0,80 C360,40 1080,100 1440,80 L1440,120 L0,120 Z" fill="var(--primary-color)" opacity="0.05" />
          </svg>
        </div>

        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-col-brand">
              <div className="footer-brand">
                <span className="footer-logo">
                  <svg width={22} height={22} viewBox="0 0 36 32">
                    <text x="18" y="25" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="22" fill="white" textAnchor="middle" letterSpacing="-1">ST</text>
                  </svg>
                </span>
                <div>
                  <p className="footer-name">{h.name || 'Sisay Temesgen'}</p>
                  <p className="footer-role">{h.title || 'Full Stack Developer'}</p>
                </div>
              </div>
              {a.biography && (
                <p className="footer-bio">{a.biography}</p>
              )}
              {footerStats.length > 0 && (
                <div className="footer-stats">
                  {footerStats.slice(0, 3).map((stat, i) => (
                    <div key={i} className="footer-stat">
                      <span className="footer-stat-num">{stat.value}{stat.suffix || ''}</span>
                      <span className="footer-stat-label">{stat.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">{t('footer.navigation')}</h4>
              <nav className="footer-nav">
                {navLinks.map(link => (
                  <a key={link.href} href={link.href} className="footer-nav-link">
                    <span className="footer-nav-dot" />
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">{t('footer.quickLinks')}</h4>
              <div className="footer-quick-links">
                {socialLinks.slice(0, 4).map(link => (
                  <a key={link.label} href={link.url} target="_blank" rel="noreferrer" className="footer-quick-link">
                    {link.icon}
                    {link.label}
                    <FaExternalLinkAlt size={9} className="footer-external-icon" />
                  </a>
                ))}
              </div>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">{t('footer.getInTouch')}</h4>
              <div className="footer-contact-items">
                {s.email && (
                  <div className="footer-contact-item">
                    <FaEnvelope size={14} className="footer-contact-icon" />
                    <a href={`mailto:${s.email}`} className="footer-contact-text">{s.email}</a>
                  </div>
                )}
                {s.phone && (
                  <div className="footer-contact-item">
                    <FaPhone size={14} className="footer-contact-icon" />
                    <span className="footer-contact-text">{s.phone}</span>
                  </div>
                )}
                {s.address && (
                  <div className="footer-contact-item">
                    <FaMapMarkerAlt size={14} className="footer-contact-icon" />
                    <span className="footer-contact-text">{s.address}</span>
                  </div>
                )}
              </div>
              {socialLinks.length > 0 && (
                <div className="footer-social">
                  {socialLinks.map(link => (
                    <a key={link.label} href={link.url} target="_blank" rel="noreferrer" className="footer-social-link" aria-label={link.label}>
                      {link.icon}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <div className="footer-container footer-bottom-inner">
            <p className="footer-copyright">
              {s.copyrightText || `© ${year} ${h.name || 'Sisay Temesgen'}. All rights reserved.`}
            </p>
            <p className="footer-tech-stack">
              <FaRocket size={12} /> {s.footerText || 'Always learning, always building.'}
            </p>
          </div>
        </div>
      </footer>

      {showScroll && (
        <button
          onClick={scrollToTop}
          className="scroll-top-btn"
          aria-label="Scroll to top"
        >
          <FaArrowUp size={18} />
        </button>
      )}
    </>
  );
}

export default Footer;
