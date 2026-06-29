import React, { useState, useEffect } from 'react';
import { useI18n } from '../../utils/i18n.jsx';
import { Helmet } from 'react-helmet-async';
import { FiArrowRight, FiMail, FiDownload, FiChevronDown, FiMapPin } from 'react-icons/fi';
import { FaGithub, FaLinkedin, FaTwitter, FaTelegram, FaGlobe, FaYoutube } from 'react-icons/fa';
import { motion } from 'framer-motion';
import profilePhoto from '../../assets/profile-photo.jpg';
import CommandBar from '../CommandBar';
import HeroTerminal from './HeroTerminal';
import { publicApi, imageUrl } from '../../utils/api';

function TypeWriter({ phrases }) {
  const [text, setText] = useState('');
  const [idx, setIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[idx];
    let timeout;

    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => {
        setText(current.slice(0, charIdx + 1));
        setCharIdx(c => c + 1);
      }, 80);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), 2500);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => {
        setText(current.slice(0, charIdx - 1));
        setCharIdx(c => c - 1);
      }, 40);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setIdx((i) => (i + 1) % phrases.length);
    }

    return () => clearTimeout(timeout);
  }, [charIdx, deleting, idx, phrases]);

  return (
    <span>
      {text}<span className="typing-cursor">|</span>
    </span>
  );
}

function socialIcon(platform) {
  const map = {
    github: <FaGithub size={18} />,
    linkedin: <FaLinkedin size={18} />,
    twitter: <FaTwitter size={18} />,
    telegram: <FaTelegram size={18} />,
    email: <FiMail size={18} />,
    youtube: <FaYoutube size={18} />,
    website: <FaGlobe size={18} />,
  };
  return map[platform?.toLowerCase()] || <FaGlobe size={18} />;
}

function HeroSection() {
  const { t } = useI18n();
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getHero().then(({ data }) => {
      const h = data?.data;
      if (Array.isArray(h)) {
        setHero(h[0] || null);
      } else {
        setHero(h || null);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const name = hero?.name || 'Sisay Temesgen';
  const title = hero?.title || 'Full Stack Developer';
  const role = hero?.role || '';
  const roles = title.includes(',') ? title.split(',').map(r => r.trim()) : [title];
  const introduction = hero?.introduction || 'Computer Science student at Bahir Dar University — building modern, accessible web applications with React, Node.js & MongoDB.';
  const location = hero?.location || '';
  const availability = hero?.availability || {};
  const avatar = hero?.avatar ? imageUrl(hero.avatar) : null;
  const socialLinks = hero?.socialLinks || [];
  const buttons = hero?.buttons || [];

  if (loading) {
    return (
      <section id="home" className="hero" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner" />
      </section>
    );
  }

  return (
    <section id="home" className="hero">
      <Helmet>
        <title>{name} | {title}</title>
        <meta name="description" content={introduction} />
      </Helmet>

      <div className="hero-blob hero-blob-1" />
      <div className="hero-blob hero-blob-2" />

      <div className="hero-inner hero-layout">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="hero-photo-wrapper"
        >
          <div className="photo-ring-outer" />
          <div className="photo-ring-inner" />
          <div className="hero-photo-frame">
            <img src={avatar || profilePhoto} alt={name} className="hero-photo-img" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="hero-intro"
        >
          <span className="hero-greeting">{t('hero.greeting')}</span>
          <h1 className="hero-name">{name}</h1>
          {role && <p style={{ fontSize: '0.85rem', color: 'var(--accent-color)', fontWeight: 600, marginBottom: '0.5rem' }}>{role}</p>}
          <p className="hero-role"><TypeWriter phrases={roles} /></p>
          <p className="hero-desc">{introduction}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', marginTop: '0.75rem' }}>
            {location && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <FiMapPin size={13} /> {location}
              </span>
            )}
            {availability.status === 'available' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: '#22c55e', fontWeight: 500 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                {availability.text || t('hero.available')}
              </span>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hero-terminal-col"
        >
          <HeroTerminal />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="hero-bottom"
        >
          <div className="hero-buttons">
            {buttons.length > 0 ? buttons.map((btn, i) => {
              const href = btn.file ? imageUrl(btn.file) : btn.url;
              if (btn.type === 'outline' || (btn.url && !btn.file)) {
                return (
                  <a key={i} href={href || '#projects'} onClick={!href ? (e) => { e.preventDefault(); scrollToSection('projects'); } : undefined}
                    className={`btn ${btn.type === 'outline' ? 'btn-outline' : 'btn-primary'}`}
                    style={btn.type === 'outline' ? { background: 'transparent', border: '1.5px solid var(--accent-color)', color: 'var(--accent-color)' } : {}}
                    {...(btn.file ? { download: true } : { target: '_blank', rel: 'noreferrer' })}
                  >
                    {btn.label} {btn.file ? <FiDownload /> : <FiArrowRight />}
                  </a>
                );
              }
              return (
                <a key={i} href={href || '#'} download={!!btn.file} target={btn.file ? undefined : '_blank'} rel={btn.file ? undefined : 'noreferrer'}
                  className={`btn ${btn.type === 'outline' ? 'btn-outline' : 'btn-primary'}`}
                  style={btn.type === 'outline' ? { background: 'transparent', border: '1.5px solid var(--accent-color)', color: 'var(--accent-color)' } : {}}
                >
                  {btn.label} {btn.file ? <FiDownload /> : <FiArrowRight />}
                </a>
              );
            }) : (
              <>
                <button onClick={() => scrollToSection('projects')} className="btn btn-secondary">
                  {t('hero.viewProjects')} <FiArrowRight />
                </button>
                <button onClick={() => scrollToSection('contact')} className="btn btn-primary">
                  {t('hero.contactMe')} <FiMail />
                </button>
              </>
            )}
          </div>

          {socialLinks.length > 0 && (
            <div className="hero-social">
              {socialLinks.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noreferrer" className="hero-social-link" aria-label={link.platform}>
                  {socialIcon(link.platform)}
                </a>
              ))}
            </div>
          )}

          <div className="hero-command-area">
            <CommandBar />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="scroll-indicator"
        onClick={() => scrollToSection('about')}
      >
        <FiChevronDown size={20} />
      </motion.div>
    </section>
  );
}

export default HeroSection;
