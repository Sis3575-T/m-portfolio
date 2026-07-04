import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function formatDate(d) {
  if (!d) return 'Present';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

function Experience({ experience, settings, sectionTitle, sectionSubtitle }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (experience && experience.length > 0) {
      const sorted = [...experience].sort((a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0));
      setItems(sorted);
    }
  }, [experience]);

  if (items.length === 0) return null;

  return (
    <section className="resume section" id="experience">
      <div className="container resume-container">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-header">
            <span className="section-tag">Experience</span>
            <h2 className="section-title">{sectionTitle || 'My Journey'}</h2>
            {sectionSubtitle && <p className="section-subtitle">{sectionSubtitle}</p>}
            <div className="section-line" />
          </div>
        </motion.div>
        <div className="resume-grid">
          <div className="w-full" style={{ maxWidth: '600px' }}>
            <div className="timeline">
              {items.map((item, idx) => {
                const period = `${formatDate(item.startDate)} — ${formatDate(item.endDate)}`;
                const points = item.responsibilities?.length > 0
                  ? item.responsibilities
                  : item.achievements?.length > 0
                    ? item.achievements
                    : item.description
                      ? [item.description]
                      : [];

                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="timeline-item"
                  >
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <span className="timeline-date">{period}</span>
                      <h3 className="timeline-role">{item.position}</h3>
                      <div className="timeline-company">
                        {item.company}{item.location ? ` — ${item.location}` : ''}
                      </div>
                      {points.length > 0 && (
                        <ul className="timeline-points">
                          {points.slice(0, 5).map((point, i) => (
                            <li key={i}>{point}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Experience;
