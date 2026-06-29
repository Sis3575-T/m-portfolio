import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { publicApi } from '../utils/api';
import './Header.css';

const NAV = ['Home', 'About', 'Skills', 'Projects', 'Contact'];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('home');
  const [hero, setHero] = useState(null);

  useEffect(() => {
    publicApi.getHero().then(({ data }) => {
      const h = data?.data;
      setHero(Array.isArray(h) ? h[0] : h || null);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      const sections = NAV.map(n => document.getElementById(n.toLowerCase())).filter(Boolean);
      const current = sections.find(s => {
        const rect = s.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom >= 100;
      });
      if (current) setActive(current.id);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = () => setMenuOpen(false);

  const name = hero?.name || 'Sisay Temesgen';
  const title = hero?.title || 'Full Stack Developer';
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.header
      className={`header${scrolled ? ' header--scrolled' : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="header-inner">
        <a href="#home" className="brand" onClick={close}>
          <span className="brand-mark">{initials}</span>
          <div className="brand-text">
            <span className="brand-name">{name}</span>
            <span className="brand-role">{title?.split(',')[0] || title}</span>
          </div>
        </a>

        <nav className={`nav${menuOpen ? ' nav--open' : ''}`} aria-label="Main navigation">
          {NAV.map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className={`nav-link${active === item.toLowerCase() ? ' nav-link--active' : ''}`}
              onClick={close}
            >
              {item}
            </a>
          ))}
        </nav>

        <button
          className={`hamburger${menuOpen ? ' hamburger--open' : ''}`}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(v => !v)}
        >
          <span /><span /><span />
        </button>
      </div>
    </motion.header>
  );
};

export default Header;
