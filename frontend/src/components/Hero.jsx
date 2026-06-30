import React from 'react';
import { getImageUrl } from '../api';

function Hero({ hero, settings }) {
  const name = hero?.name || settings?.name || 'Sisay Temesgen';
  const title = hero?.title || settings?.professionalTitle || 'Full Stack Developer';
  const avatar = hero?.avatar;
  const buttons = hero?.buttons || [];
  const socialLinks = hero?.socialLinks || [];
  const availability = hero?.availability || {};
  const role = hero?.role || title || 'Full Stack Developer';
  const greeting = hero?.greeting || 'Hello, I\'m';
  const headline = hero?.headline || 'I build polished digital products that blend thoughtful design with reliable engineering.';
  const description = hero?.description || settings?.shortBio || 'I specialize in creating responsive, accessible web experiences with React, Node.js, and modern full-stack architecture.';

  const settingsSocial = settings ? {
    github: settings.github,
    linkedin: settings.linkedin,
    twitter: settings.twitter,
    telegram: settings.telegram,
    facebook: settings.facebook,
    instagram: settings.instagram,
    youtube: settings.youtube,
  } : {};

  const allSocialLinks = [
    ...socialLinks,
    ...Object.entries(settingsSocial)
      .filter(([_, v]) => v)
      .map(([platform, url]) => ({ platform, url })),
  ];

  const uniqueSocials = allSocialLinks.filter((item, index, self) =>
    index === self.findIndex(s => s.platform === item.platform)
  );

  const highlights = [
    { value: '2+', label: 'Years building' },
    { value: '15+', label: 'Projects shipped' },
    { value: '100%', label: 'Remote-ready' },
  ];

  return (
    <section className="hero section" id="home">
      <div className="hero-bg-shapes">
        <div className="hero-shape hero-shape-1" />
        <div className="hero-shape hero-shape-2" />
        <div className="hero-shape hero-shape-3" />
      </div>
      <div className="container hero-container">
        <div className="hero-content">
          <div className="hero-text-col">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              {availability?.text || 'Available for freelance and collaboration'}
            </div>
            <h1 className="hero-title">
              <span className="hero-greeting">{greeting}</span>
              <span className="hero-name">{name}</span>
            </h1>
            <p className="hero-subtitle">{role}</p>
            <p className="hero-headline">{headline}</p>
            <p className="hero-description">{description}</p>
            <div className="hero-highlights">
              {highlights.map((item) => (
                <div key={item.label} className="hero-highlight-card">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            {buttons.length > 0 && (
              <div className="hero-buttons">
                {buttons.map((btn, i) => (
                  <a key={i} href={btn.url || btn.file || '#projects'} className={`btn ${btn.type === 'primary' ? 'btn-primary' : 'btn-outline'}`} target={btn.url ? '_blank' : undefined} rel="noopener noreferrer" data-track="hero-cta" data-track-value={btn.label}>
                    {btn.label}
                  </a>
                ))}
              </div>
            )}
            {uniqueSocials.length > 0 && (
              <div className="hero-social">
                {uniqueSocials.map((link, i) => (
                  <a key={i} href={link.url} className="hero-social-link" target="_blank" rel="noopener noreferrer" title={link.platform}>
                    {link.platform === 'github' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                    )}
                    {link.platform === 'linkedin' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    )}
                    {link.platform === 'twitter' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                    )}
                    {!['github','linkedin','twitter'].includes(link.platform) && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8.56 2.69c1.58.58 3.1 1.78 4.34 3.31 1.24 1.53 2.1 3.28 2.1 5.5 0 2.22-.86 3.97-2.1 5.5-1.24 1.53-2.76 2.73-4.34 3.31"/><path d="M15.44 2.69c-1.58.58-3.1 1.78-4.34 3.31-1.24 1.53-2.1 3.28-2.1 5.5 0 2.22.86 3.97 2.1 5.5 1.24 1.53 2.76 2.73 4.34 3.31"/></svg>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="hero-image-col">
            {avatar ? (
              <div className="hero-avatar-wrapper">
                <div className="hero-avatar-ring" />
                <img src={getImageUrl(avatar)} alt={name} className="hero-avatar" />
                {hero.availability?.status === 'available' && (
                  <span className="hero-status-dot" />
                )}
              </div>
            ) : (
              <div className="hero-avatar-wrapper">
                <div className="hero-avatar-ring" />
                <div className="hero-avatar-placeholder">
                  {name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
