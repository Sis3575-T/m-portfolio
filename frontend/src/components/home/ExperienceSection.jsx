import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBookOpen, FiCode, FiAward, FiTarget, FiBriefcase } from 'react-icons/fi';
import { publicApi } from '../../utils/api';
import { useI18n } from '../../utils/i18n.jsx';

const fallbackIcon = <FiBriefcase size={18} />;

function experienceIcon(iconName) {
  const map = {
    FiCode: <FiCode size={18} />,
    FiBookOpen: <FiBookOpen size={18} />,
    FiTarget: <FiTarget size={18} />,
    FiAward: <FiAward size={18} />,
    FiBriefcase: <FiBriefcase size={18} />,
  };
  return map[iconName] || fallbackIcon;
}

function ExperienceSection() {
  const { t } = useI18n();

  const formatDate = (d) => {
    if (!d) return t('experience.present');
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getExperiences()
      .then(({ data }) => {
        const items = data.data || [];
        items.sort((a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0));
        setExperiences(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="experience" className="resume">
        <div className="resume-container" style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div className="spinner" />
        </div>
      </section>
    );
  }

  if (experiences.length === 0) return null;

  return (
    <section id="experience" className="resume">
      <div className="resume-container">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="section-tag">{t('experience.title')}</span>
          <h2 className="section-title">{t('experience.heading')}</h2>
          <div className="section-line" />
          <p className="section-subtitle" style={{ margin: '1rem auto 0' }}>
            {t('experience.subtitle')}
          </p>
        </motion.div>

        <div className="resume-grid">
          <div className="w-full" style={{ maxWidth: '600px' }}>
            <div className="timeline">
              {experiences.map((item, idx) => {
                const period = `${formatDate(item.startDate)} - ${formatDate(item.endDate)}`;
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
                      <div className="timeline-company">{item.company}{item.location ? ` — ${item.location}` : ''}</div>
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

export default ExperienceSection;
