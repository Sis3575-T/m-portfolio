function formatDate(dateStr) {
  if (!dateStr) return 'Present';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

function Education({ education, settings, sectionTitle, sectionSubtitle }) {
  if (!education || education.length === 0) return null;

  return (
    <section className="resume-section section" id="education">
      <div className="container resume-container">
        <div className="section-header">
          <span className="section-tag">Education</span>
          <h2 className="section-title">{sectionTitle || 'Education'}</h2>
          {sectionSubtitle && <p className="section-subtitle">{sectionSubtitle}</p>}
          <div className="section-line" />
        </div>
        <div className="resume-grid">
          <div className="timeline">
            {education.map((item) => (
              <div key={item._id} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <div className="timeline-period">
                    {formatDate(item.startDate)} — {item.current ? 'Present' : formatDate(item.endDate)}
                  </div>
                  <h3 className="timeline-role">{item.degree}</h3>
                  <p className="timeline-company">{item.institution}</p>
                  {item.field && <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{item.field}</p>}
                  {item.description && <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{item.description}</p>}
                  {item.achievements && item.achievements.length > 0 && (
                    <ul className="timeline-points">
                      {item.achievements.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  )}
                  {item.gpa && <p style={{ color: 'var(--primary-color)', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 600 }}>GPA: {item.gpa}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Education;
