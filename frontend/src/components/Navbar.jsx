import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { websiteApi, getImageUrl } from '../api';

function Navbar({ settings: propSettings, navItems: propNavItems }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settings, setSettings] = useState(propSettings || null);
  const [pages, setPages] = useState(propNavItems || []);
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const location = useLocation();

  const navStyles = settings?.pageStyles?.navbar || {};
  const navbarStyle = {
    ...(navStyles.bgColor ? { '--navbar-bg': navStyles.bgColor } : {}),
    ...(navStyles.textColor ? { '--navbar-text': navStyles.textColor } : {}),
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    if (!propSettings) websiteApi.getSettings().then(res => setSettings(res.data.data)).catch(() => {});
    if (!propNavItems) websiteApi.getPages().then(res => setPages(res.data.data || [])).catch(() => {});
  }, [propSettings, propNavItems]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const logo = settings?.logo;
  const siteTitle = settings?.siteTitle || 'Portfolio';
  const navItems = [{ name: 'Home', slug: '' }, ...(pages.length > 0 ? pages : [
    { name: 'Blog', slug: 'blog' },
    { name: 'Gallery', slug: 'gallery' },
    { name: 'Contact', slug: 'contact' },
  ])];

  useEffect(() => {
    if (navStyles.customCss) {
      const id = 'navbar-custom-css';
      let el = document.getElementById(id);
      if (!el) { el = document.createElement('style'); el.id = id; document.head.appendChild(el); }
      el.textContent = navStyles.customCss;
      return () => { const e = document.getElementById(id); if (e) e.remove(); };
    }
  }, [navStyles.customCss]);

  return (
    <nav className={`navbar${scrolled ? ' navbar-scrolled' : ''}`} style={navbarStyle}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          {logo ? (
            <img src={getImageUrl(logo)} alt={siteTitle} className="navbar-logo-img" />
          ) : (
            <span className="navbar-logo-text">{siteTitle}</span>
          )}
        </Link>

        <div className={`navbar-menu${menuOpen ? ' open' : ''}`}>
          {navItems.map((page) => {
            const slug = page.slug || page.slug === '' ? page.slug : '';
            const path = slug === '' ? '/' : `/${slug}`;
            const isActive = location.pathname === path;
            return (
              <Link
                key={page._id || page.slug || page.name}
                to={path}
                className={`navbar-link${isActive ? ' active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {page.name}
              </Link>
            );
          })}
        </div>

        <div className="navbar-actions">
          <button
            className="theme-toggle-btn"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          <button
            className={`hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
