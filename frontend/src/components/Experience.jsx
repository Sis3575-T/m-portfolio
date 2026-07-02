import React, { useEffect } from 'react';

function formatDate(dateStr) {
  if (!dateStr) return 'Present';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

function Experience({ experience, settings, sectionTitle, sectionSubtitle }) {
  if (!experience || experience.length === 0) return null;

  const pageStyles = settings?.pageStyles?.experience || {};
  const sectionStyle = {
    ...(pageStyles.bgColor ? { backgroundColor: pageStyles.bgColor } : {}),
    ...(pageStyles.textColor ? { color: pageStyles.textColor } : {}),
    ...(pageStyles.fontFamily ? { fontFamily: pageStyles.fontFamily } : {}),
    ...(pageStyles.paddingY === 'small' ? { paddingTop: '2rem', paddingBottom: '2rem' } : {}),
    ...(pageStyles.paddingY === 'medium' ? { paddingTop: '4rem', paddingBottom: '4rem' } : {}),
    ...(pageStyles.paddingY === 'large' ? { paddingTop: '6rem', paddingBottom: '6rem' } : {}),
    ...(pageStyles.paddingY === 'xlarge' ? { paddingTop: '8rem', paddingBottom: '8rem' } : {}),
  };

  useEffect(() => {
    if (pageStyles.customCss) {
      const id = 'experience-custom-css';
      let el = document.getElementById(id);
      if (!el) { el = document.createElement('style'); el.id = id; document.head.appendChild(el); }
      el.textContent = pageStyles.customCss;
      return () => { const e = document.getElementById(id); if (e) e.remove(); };
    }
  }, [pageStyles.customCss]);

  return (
    <section className="experience section" id="experience" style={sectionStyle}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{sectionTitle || 'Experience'}</h2>
          {sectionSubtitle && <p className="section-subtitle">{sectionSubtitle}</p>}
          <div className="section-divider" />
        </div>
        <div className="timeline">
          {experience.map((item, index) => (
            <div key={item._id} className={`timeline-item${index % 2 === 0 ? ' left' : ' right'}`}>
              <div className="timeline-dot" />
              <div className="timeline-content">
                <div className="timeline-header">
                  {item.logo && (
                    <img src={item.logo.startsWith('http') ? item.logo : item.logo} alt={item.company} className="timeline-logo" />
                  )}
                  <div>
                    <h3 className="timeline-position">{item.position}</h3>
                    <p className="timeline-company">{item.company}</p>
                  </div>
                </div>
                <div className="timeline-date">
                  {formatDate(item.startDate)} — {item.current ? 'Present' : formatDate(item.endDate)}
                </div>
                {item.description && <p className="timeline-desc">{item.description}</p>}
                {item.responsibilities && item.responsibilities.length > 0 && (
                  <ul className="timeline-list">
                    {item.responsibilities.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                )}
                {item.technologies && item.technologies.length > 0 && (
                  <div className="timeline-tags">
                    {item.technologies.map((tech, i) => (
                      <span key={i} className="tag">{tech}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Experience;
