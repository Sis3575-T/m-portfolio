import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import backendApi from '../../services/backendApi';
import { imageUrl } from '../../utils/api';

function ResumeSection() {
  const [cvUrl, setCvUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.PROD
    ? ((import.meta.env.VITE_API_URL || 'https://m-portfolio-ecby.onrender.com').replace(/\/api$/, '').replace(/\/+$/, '') + '/api')
    : '/api';

  useEffect(() => {
    backendApi.getSettings().then(res => {
      const s = res?.data || {};
      setCvUrl(s.cvUrl || '');
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!cvUrl) return null;

  const viewUrl = imageUrl(cvUrl);
  const downloadUrl = `${API_BASE}/website/cv`;

  const handleDownload = async () => {
    try {
      const res = await fetch(downloadUrl);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cv.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {}
  };

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
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              View CV
            </a>
            <button
              onClick={handleDownload}
              className="btn btn-primary"
              style={{ border: 'none', cursor: 'pointer' }}
              data-track="resume-download"
            >
              Download CV
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default ResumeSection;
