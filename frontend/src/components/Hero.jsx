import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../api';
import Terminal from './Terminal';

function Hero({ hero, settings }) {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const name = hero?.name || settings?.name || 'Sisay Temesgen';
  const [firstName, ...lastNameParts] = name.trim().split(' ');
  const lastName = lastNameParts.join(' ');
  const greeting = hero?.greeting || "Hello, I'm";
  const role = hero?.role || hero?.title || settings?.professionalTitle || 'Full Stack Developer';
  const headline = hero?.headline || hero?.description || hero?.introduction || hero?.shortBio || '';
  const avatar = settings?.profilePhoto || hero?.avatar || null;
  const buttons = hero?.buttons || [];
  const socialLinks = hero?.socialLinks || [];
  const availability = hero?.availability || {};
  const city = settings?.city || 'Your City';
  const country = settings?.country || 'Your Country';

  const roles = hero?.roles || [role];
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentRole = roles[roleIndex];
    if (!currentRole) return;

    const speed = isDeleting ? 40 : 80;
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentRole.length) {
          setDisplayText(currentRole.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(currentRole.slice(0, displayText.length - 1));
        } else {
          setIsDeleting(false);
          setRoleIndex((i) => (i + 1) % roles.length);
        }
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, roleIndex, roles]);

  return (
    <section className="hero section" id="home">
      <div className="hero-blob hero-blob-1" />
      <div className="hero-blob hero-blob-2" />
      <div className="container hero-layout">
        <div className="hero-photo-wrapper">
          <div className="photo-ring-outer" />
          <div className="photo-ring-inner" />
          <div className="hero-photo-frame">
            {avatar && !imgError ? (
              <img className="hero-photo-img" src={getImageUrl(avatar)} alt={name} onError={() => setImgError(true)} />
            ) : (
              <div className="hero-photo-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'var(--primary-color)', fontWeight: 700 }}>
                {name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="photo-dot photo-dot-1" />
          <div className="photo-dot photo-dot-2" />
          <div className="photo-dot photo-dot-3" />
        </div>
        <div className="hero-intro">
          <p className="hero-greeting">{greeting}</p>
          <h1 className="hero-name">{firstName} <span className="hero-name-accent">{lastName}</span></h1>
          <p className="hero-role">
            {displayText}
            <span className="typing-cursor">|</span>
          </p>
          <p className="hero-desc">{headline}</p>
        </div>
        <div className="hero-terminal-col">
          {terminalOpen ? (
            <Terminal onClose={() => setTerminalOpen(false)} inline />
          ) : (
            <div className="hero-terminal" onClick={() => setTerminalOpen(true)} style={{ cursor: 'pointer' }}>
              <div className="hero-terminal-header">
                <div className="hero-terminal-dots">
                  <span className="hero-terminal-dot red" />
                  <span className="hero-terminal-dot yellow" />
                  <span className="hero-terminal-dot green" />
                </div>
                <span className="hero-terminal-title">portfolio — zsh</span>
              </div>
              <div className="hero-terminal-body">
                <div className="hero-terminal-line">
                  <span className="hero-terminal-prompt">$ </span>
                  <span className="hero-terminal-command">cat about.md</span>
                </div>
                <div className="hero-terminal-line">
                  <span className="hero-terminal-output">{name} — {role}</span>
                </div>
                <div className="hero-terminal-line">
                  <span className="hero-terminal-dim">Based in {city}, {country}</span>
                </div>
                <div className="hero-terminal-line">
                  <span className="hero-terminal-prompt">$ </span>
                  <span className="hero-terminal-command">./skills --list</span>
                </div>
                <div className="hero-terminal-line">
                  <span className="hero-terminal-highlight">React  JavaScript  Node.js  Python</span>
                </div>
                <div className="hero-terminal-line" style={{ marginTop: '0.5rem' }}>
                  <span className="hero-terminal-prompt">$ </span>
                  <span className="hero-terminal-command">echo $STATUS</span>
                </div>
                <div className="hero-terminal-line">
                  <span className="hero-terminal-output">{availability?.text || 'Open for opportunities'}</span>
                </div>
                <div className="hero-terminal-line" style={{ marginTop: '0.75rem' }}>
                  <span className="hero-terminal-dim">Click anywhere to open interactive terminal →</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="hero-bottom">
          {buttons.length > 0 && (
            <div className="hero-buttons">
              {buttons.map((btn, i) => (
                <a
                  key={i}
                  href={btn.url || '#projects'}
                  className={btn.type === 'primary' ? 'btn btn-primary' : 'btn btn-secondary'}
                  target={btn.url ? '_blank' : undefined}
                  rel="noopener noreferrer"
                >
                  {btn.label}
                </a>
              ))}
            </div>
          )}
          {socialLinks.length > 0 && (
            <div className="hero-social">
              {socialLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  className="hero-social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.platform}
                >
                  {link.platform === 'github' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                    </svg>
                  )}
                  {link.platform === 'linkedin' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  )}
                  {link.platform === 'twitter' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  )}
                  {!['github', 'linkedin', 'twitter'].includes(link.platform) && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {link.platform.slice(0, 2)}
                    </span>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="scroll-indicator">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
        </svg>
      </div>

      
    </section>
  );
}

export default Hero;
