import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiExternalLink, FiDownload, FiAward, FiCheck } from 'react-icons/fi';
import { publicApi, imageUrl } from '../../utils/api';
import { useI18n } from '../../utils/i18n.jsx';

function CertificatesSection() {
  const { t } = useI18n();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getCertificates()
      .then(({ data }) => {
        const items = (data.data || []).slice(2);
        if (items.length > 0) {
          setCertificates(items.map(c => ({
            ...c,
            image: c.image ? imageUrl(c.image) : null,
          })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="certificates" className="skills">
        <div className="skills-container" style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div className="spinner" />
        </div>
      </section>
    );
  }

  if (certificates.length === 0) return null;

  return (
    <section id="certificates" className="skills">
      <div className="skills-container">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="section-tag">{t('certificates.title')}</span>
          <h2 className="section-title">{t('certificates.heading')}</h2>
          <div className="section-line" />
          <p className="section-subtitle" style={{ margin: '1rem auto 0' }}>
            {t('certificates.subtitle')}
          </p>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginTop: '2.5rem',
          }}
        >
          {certificates.map((cert, idx) => (
            <motion.div
              key={cert._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              style={{
                background: 'var(--card-bg)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  height: 160,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg-secondary, #f8f9fa)',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                {cert.image ? (
                  <img src={cert.image} alt={cert.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: '1rem' }} />
                ) : (
                  <FiAward size={48} style={{ color: 'var(--text-light)' }} />
                )}
              </div>
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{cert.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{cert.issuer}</p>
                {cert.date && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '0.75rem' }}>{cert.date}</p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto' }}>
                  {cert.credentialUrl && (
                    <a href={cert.credentialUrl} target="_blank" rel="noreferrer"
                      style={{ fontSize: '0.75rem', color: 'var(--primary-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, padding: '0.25rem 0.5rem', borderRadius: 6, border: '1px solid var(--border-color)' }}>
                      <FiExternalLink size={11} /> Verify
                    </a>
                  )}
                  {cert.fileUrl && (
                    <a href={cert.fileUrl} download
                      style={{ fontSize: '0.75rem', color: 'var(--primary-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, padding: '0.25rem 0.5rem', borderRadius: 6, border: '1px solid var(--border-color)' }}>
                      <FiDownload size={11} /> Download
                    </a>
                  )}
                  {!cert.credentialUrl && !cert.fileUrl && (
                    <span style={{ fontSize: '0.75rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FiCheck size={12} /> Completed
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CertificatesSection;
