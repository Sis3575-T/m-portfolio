import React, { useEffect } from 'react';
import { getImageUrl } from '../api';

function About({ settings, sectionTitle, sectionSubtitle }) {
  const { profilePhoto, shortBio, longBio, professionalTitle, name, city, country, yearsOfExperience, freelanceAvailable, email } = settings || {};

  const pageStyles = settings?.pageStyles?.about || {};
  const sectionStyle = {
    ...(pageStyles.bgColor ? { backgroundColor: pageStyles.bgColor } : {}),
    ...(pageStyles.textColor ? { color: pageStyles.textColor } : {}),
    ...(pageStyles.textAlign ? { textAlign: pageStyles.textAlign } : {}),
    ...(pageStyles.fontFamily ? { fontFamily: pageStyles.fontFamily } : {}),
    ...(pageStyles.paddingY === 'small' ? { paddingTop: '2rem', paddingBottom: '2rem' } : {}),
    ...(pageStyles.paddingY === 'medium' ? { paddingTop: '4rem', paddingBottom: '4rem' } : {}),
    ...(pageStyles.paddingY === 'large' ? { paddingTop: '6rem', paddingBottom: '6rem' } : {}),
    ...(pageStyles.paddingY === 'xlarge' ? { paddingTop: '8rem', paddingBottom: '8rem' } : {}),
  };

  useEffect(() => {
    if (pageStyles.customCss) {
      const id = 'about-custom-css';
      let el = document.getElementById(id);
      if (!el) { el = document.createElement('style'); el.id = id; document.head.appendChild(el); }
      el.textContent = pageStyles.customCss;
      return () => { const e = document.getElementById(id); if (e) e.remove(); };
    }
  }, [pageStyles.customCss]);

  const summary = longBio || shortBio || 'I am a software engineer focused on building modern, accessible, and maintainable web applications with a strong emphasis on quality and user experience.';
  const highlights = [
    'I enjoy designing systems that are simple to maintain and pleasant to use.',
    'My work spans front-end experiences, back-end APIs, and full product delivery.',
    'I value clear communication, thoughtful architecture, and continuous improvement.',
  ];

  return (
    <section className="about section" id="about" style={sectionStyle}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{sectionTitle || 'About Me'}</h2>
          {sectionSubtitle && <p className="section-subtitle">{sectionSubtitle}</p>}
          <div className="section-divider" />
        </div>
        <div className="about-content">
          <div className="about-image-col">
            <div className="about-image-wrapper">
              {profilePhoto ? (
                <img src={getImageUrl(profilePhoto)} alt={name || 'About'} className="about-image" />
              ) : (
                <div className="about-image-placeholder">
                  {name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'ME'}
                </div>
              )}
            </div>
          </div>
          <div className="about-text-col">
            {name && <h3 className="about-name">{name}</h3>}
            {professionalTitle && <p className="about-role">{professionalTitle}</p>}
            <p className="about-bio">{summary}</p>
            <ul className="about-highlights">
              {highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="about-stats-grid">
              {yearsOfExperience && (
                <div className="about-stat">
                  <span className="about-stat-number">{yearsOfExperience}</span>
                  <span className="about-stat-label">Years Experience</span>
                </div>
              )}
              {freelanceAvailable !== undefined && (
                <div className="about-stat">
                  <span className="about-stat-number">{freelanceAvailable ? 'Open' : 'Busy'}</span>
                  <span className="about-stat-label">Availability</span>
                </div>
              )}
              {city && country && (
                <div className="about-stat">
                  <span className="about-stat-number">{city}</span>
                  <span className="about-stat-label">{country}</span>
                </div>
              )}
              {email && (
                <div className="about-stat">
                  <span className="about-stat-number">Email</span>
                  <span className="about-stat-label">Available</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
