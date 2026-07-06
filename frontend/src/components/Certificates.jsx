function Certificates({ certificates, settings, sectionTitle, sectionSubtitle }) {
  if (!certificates || certificates.length === 0) return null;

  return (
    <section className="section" id="certificates">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Certificates</span>
          <h2 className="section-title">{sectionTitle || 'Certifications'}</h2>
          {sectionSubtitle && <p className="section-subtitle">{sectionSubtitle}</p>}
          <div className="section-line" />
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginTop: '2.5rem',
        }}>
          {certificates.map((cert) => (
            <div key={cert._id} className="project-card" style={{
              background: 'var(--card-bg)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {cert.image && (
                <div style={{
                  height: 160,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg-secondary)',
                  borderBottom: '1px solid var(--border-color)',
                }}>
                  <img src={cert.image} alt={cert.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: '1rem' }} />
                </div>
              )}
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{cert.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{cert.issuer}</p>
                {cert.date && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '0.75rem' }}>{new Date(cert.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto' }}>
                  {cert.credentialUrl && (
                    <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="project-link" style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}>
                      Verify
                    </a>
                  )}
                  {cert.fileUrl && (
                    <a href={cert.fileUrl} download className="project-link" style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}>
                      Download
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Certificates;
