import React, { useEffect } from 'react';

function formatDate(dateStr) {
  if (!dateStr) return 'Present';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

function Education({ education, settings, sectionTitle, sectionSubtitle }) {
  if (!education || education.length === 0) return null;

  const pageStyles = settings?.pageStyles?.education || {};
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
      const id = 'education-custom-css';
      let el = document.getElementById(id);
      if (!el) { el = document.createElement('style'); el.id = id; document.head.appendChild(el); }
      el.textContent = pageStyles.customCss;
      return () => { const e = document.getElementById(id); if (e) e.remove(); };
    }
  }, [pageStyles.customCss]);

  return (
    <section className="education section" id="education" style={sectionStyle}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{sectionTitle || 'Education'}</h2>
          {sectionSubtitle && <p className="section-subtitle">{sectionSubtitle}</p>}
          <div className="section-divider" />
        </div>
        <div className="education-grid">
          {education.map(item => (
            <div key={item._id} className="education-card">
              <div className="education-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <h3 className="education-degree">{item.degree}</h3>
              <p className="education-field">{item.field}</p>
              <p className="education-school">{item.institution}</p>
              <div className="education-meta">
                <span className="education-date">
                  {formatDate(item.startDate)} — {item.current ? 'Present' : formatDate(item.endDate)}
                </span>
                {item.gpa && <span className="education-gpa">GPA: {item.gpa}</span>}
              </div>
              {item.description && <p className="education-desc">{item.description}</p>}
              {item.achievements && item.achievements.length > 0 && (
                <ul className="education-achievements">
                  {item.achievements.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Education;
