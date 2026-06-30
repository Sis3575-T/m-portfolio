import { useState, useEffect } from 'react';
import { publicApi } from '../utils/api';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();
  const [hero, setHero] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    Promise.all([
      publicApi.getHero().catch(() => ({ data: null })),
      publicApi.getSettings().catch(() => ({ data: null })),
    ]).then(([heroRes, settingsRes]) => {
      const h = heroRes?.data?.data;
      setHero(Array.isArray(h) ? h[0] : h || null);
      const s = settingsRes?.data?.data;
      setSettings(Array.isArray(s) ? s[0] : s || null);
    });
  }, []);

  const name = hero?.name || 'Sisay Temesgen';
  const title = hero?.title || 'Full Stack Developer';
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const s = settings || {};

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-mark">{initials}</span>
            <div>
              <p className="footer-name">{name}</p>
              <p className="footer-role">{title?.split(',')[0] || title}</p>
            </div>
          </div>

          <nav className="footer-nav" aria-label="Footer navigation">
            {['Home','About','Skills','Projects','Contact'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`}>{item}</a>
            ))}
          </nav>

          <div className="footer-social">
            {(s.github || hero?.socialLinks?.find(l => l.platform?.toLowerCase() === 'github')) && (
              <a href={s.github || hero.socialLinks.find(l => l.platform?.toLowerCase() === 'github').url} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="footer-social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            )}
            <a href={`mailto:${s.email || 'sisay3575@gmail.com'}`} aria-label="Email" className="footer-social-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {year} {s.copyrightText || `${name}. All rights reserved.`}</p>
          <p>{s.footerText || 'Designed &amp; Built with React &amp; Vite'}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
