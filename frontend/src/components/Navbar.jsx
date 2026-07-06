import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

function Navbar({ settings: propSettings, navItems: propNavItems }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return true;
  });
  const location = useLocation();

  const settings = propSettings || {};
  const pages = propNavItems || [];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const name = settings?.name || 'Sisay Temesgen';
  const github = settings?.github || '#';
  const linkedin = settings?.linkedin || '#';
  const twitter = settings?.twitter || '#';
  const navItems = pages.length > 0 ? pages : [
    { name: 'Home', slug: '' },
    { name: 'About', slug: 'about' },
    { name: 'Skills', slug: 'skills' },
    { name: 'Experience', slug: 'experience' },
    { name: 'Projects', slug: 'projects' },
    { name: 'Contact', slug: 'contact' },
  ];

  const isHomePage = location.pathname === '/';

  const handleNavClick = (e, slug) => {
    setMenuOpen(false);
    if (slug === '' || slug === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (isHomePage) {
      e.preventDefault();
      const el = document.getElementById(slug);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`} style={{ background: '#000000', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent' }}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, background: '#7c3aed', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width={18} height={18} viewBox="0 0 36 32">
                <text x="18" y="25" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="22" fill="white" textAnchor="middle" letterSpacing="-1">ST</text>
              </svg>
            </div>
            <span className="logo-text">{name}</span>
          </div>
        </Link>

        <ul className={`navbar-links${menuOpen ? ' active' : ''}`}>
          {navItems.map((page) => {
            const slug = page.slug || page.slug === '' ? page.slug : '';
            const path = slug === '' ? '/' : `/${slug}`;
            const isActive = location.pathname === path;
            return (
              <li key={page._id || page.slug || page.name}>
                <Link
                  to={path}
                  className={isActive ? 'active' : ''}
                  onClick={(e) => handleNavClick(e, slug)}
                >
                  {page.name}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="navbar-right">
          <span className="navbar-social">
            <a href={github} target="_blank" rel="noopener noreferrer" title="GitHub">
              <FaGithub size={18} />
            </a>
            <a href={linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn">
              <FaLinkedin size={18} />
            </a>
            <a href={twitter} target="_blank" rel="noopener noreferrer" title="Twitter">
              <FaTwitter size={18} />
            </a>
          </span>
          <button
            className="theme-toggle"
            onClick={() => setDarkMode(prev => !prev)}
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
