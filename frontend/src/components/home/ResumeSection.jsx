import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import backendApi from '../../services/backendApi';
import { imageUrl } from '../../utils/api';

function ResumeSection() {
  const [cvUrl, setCvUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    backendApi.getSettings().then(res => {
      const s = res?.data || {};
      setCvUrl(s.cvUrl || '');
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!cvUrl) return null;

  const googleViewUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(imageUrl(cvUrl))}`;

  return (
    <section id="resume" className="resume-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="section-header"
        >
          <span className="section-tag">Resume</span>
          <h2 className="section-title">My Curriculum Vitae</h2>
          <div className="section-line" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}
        >
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>
            Download my CV to learn more about my skills, experience, and education.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={googleViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              View CV
            </a>
            <a
              href={imageUrl(cvUrl)}
              download
              className="btn btn-primary"
              data-track="resume-download"
            >
              Download CV
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default ResumeSection;
