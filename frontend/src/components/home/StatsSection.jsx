import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { publicApi } from '../../utils/api';

function StatsSection() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getAbout()
      .then(({ data }) => {
        const about = data.data;
        if (about && about.stats) {
          setStats(about.stats);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="stats" className="skills">
        <div className="skills-container" style={{ textAlign: 'center', padding: '2rem 0' }}>
          <div className="spinner" />
        </div>
      </section>
    );
  }

  if (stats.length === 0) return null;

  return (
    <section id="stats" className="skills" style={{ padding: '3rem 0' }}>
      <div className="skills-container">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                style={{
                  textAlign: 'center',
                  padding: '1.5rem 1rem',
                  background: 'var(--card-bg)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-color)', lineHeight: 1 }}>
                  {stat.value}{stat.suffix || ''}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default StatsSection;
