import React, { useEffect } from 'react';
import { getImageUrl } from '../api';
import { useTheme } from '../context/ThemeContext';

function Testimonials({ testimonials, settings, sectionTitle, sectionSubtitle }) {
  const { theme } = useTheme();
  if (!testimonials || testimonials.length === 0) return null;

  const featured = testimonials.filter(t => t.featured);
  const display = featured.length > 0 ? featured : testimonials;

  const pageStyles = settings?.pageStyles?.testimonials || {};
  const sectionStyle = {
    ...(theme === 'light' && pageStyles.bgColor ? { backgroundColor: pageStyles.bgColor } : {}),
    ...(pageStyles.textColor ? { color: pageStyles.textColor } : {}),
    ...(pageStyles.fontFamily ? { fontFamily: pageStyles.fontFamily } : {}),
    ...(pageStyles.paddingY === 'small' ? { paddingTop: '2rem', paddingBottom: '2rem' } : {}),
    ...(pageStyles.paddingY === 'medium' ? { paddingTop: '4rem', paddingBottom: '4rem' } : {}),
    ...(pageStyles.paddingY === 'large' ? { paddingTop: '6rem', paddingBottom: '6rem' } : {}),
    ...(pageStyles.paddingY === 'xlarge' ? { paddingTop: '8rem', paddingBottom: '8rem' } : {}),
  };

  useEffect(() => {
    if (pageStyles.customCss) {
      const id = 'testimonials-custom-css';
      let el = document.getElementById(id);
      if (!el) { el = document.createElement('style'); el.id = id; document.head.appendChild(el); }
      el.textContent = pageStyles.customCss;
      return () => { const e = document.getElementById(id); if (e) e.remove(); };
    }
  }, [pageStyles.customCss]);

  return (
    <section className="testimonials section" id="testimonials" style={sectionStyle}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{sectionTitle || 'Testimonials'}</h2>
          {sectionSubtitle && <p className="section-subtitle">{sectionSubtitle}</p>}
          <div className="section-divider" />
        </div>
        <div className="testimonials-grid">
          {display.map(item => (
            <div key={item._id} className="testimonial-card">
              <div className="testimonial-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < item.rating ? 'var(--primary)' : 'none'} stroke="var(--primary)" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className="testimonial-text">"{item.content}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">
                  {item.avatar ? (
                    <img src={getImageUrl(item.avatar)} alt={item.name} />
                  ) : (
                    <div className="testimonial-avatar-placeholder">
                      {item.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="testimonial-name">{item.name}</p>
                  <p className="testimonial-role">{item.role}{item.company ? ` · ${item.company}` : ''}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
