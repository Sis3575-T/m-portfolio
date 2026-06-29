import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { publicApi, imageUrl } from '../../utils/api';
import { useI18n } from '../../utils/i18n.jsx';
import { FaGraduationCap, FaCalendarAlt, FaTrophy } from 'react-icons/fa';

const fallbackEducations = [
  {
    _id: 'fallback-edu-1',
    institution: 'Bahir Dar University',
    degree: 'Bachelor of Science',
    field: 'Computer Science',
    startDate: '2023-01-01',
    endDate: null,
    description: 'Pursuing a B.Sc. in Computer Science with coursework in data structures, algorithms, database systems, and web technologies.',
    achievements: [
      'Building a strong foundation in computer science theory and practice',
      'Developing full-stack applications as part of coursework and personal projects',
      'Exploring AI and machine learning concepts alongside core curriculum',
    ],
    order: 0,
    isActive: true,
  },
];

function EducationSection() {
  const { t } = useI18n();
  const [educations, setEducations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getEducation()
      .then(({ data }) => setEducations(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="education" className="skills">
        <div className="skills-container" style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div className="spinner" />
        </div>
      </section>
    );
  }

  const items = educations.length > 0 ? educations : fallbackEducations;

  const formatDate = (d) => {
    if (!d) return t('education.present');
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <section id="education" className="skills">
      <div className="skills-container" style={{ maxWidth: '900px' }}>
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="section-tag">{t('education.title')}</span>
          <h2 className="section-title">{t('education.heading')}</h2>
          <div className="section-line" />
        </motion.div>

        <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {items.map((edu, idx) => (
            <motion.div
              key={edu._id}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              style={{
                display: 'flex',
                gap: '1rem',
                background: 'var(--card-bg)',
                borderRadius: '14px',
                padding: '1.5rem',
                border: '1px solid var(--border-color)',
              }}
            >
              <div
                style={{
                  width: 48, height: 48, borderRadius: '12px',
                  background: 'var(--primary-color-alpha, rgba(99,102,241,0.1))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, color: 'var(--primary-color)', fontSize: '1.25rem',
                }}
              >
                {edu.logo ? (
                  <img src={imageUrl(edu.logo)} alt={edu.institution} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'contain' }} />
                ) : (
                  <FaGraduationCap size={22} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
                  {edu.degree} in {edu.field}
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: 500, marginBottom: '0.35rem' }}>
                  {edu.institution}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FaCalendarAlt size={11} /> {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </span>
                  {edu.gpa && <span>GPA: {edu.gpa}</span>}
                </div>
                {edu.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                    {edu.description}
                  </p>
                )}
                {edu.achievements && edu.achievements.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    {edu.achievements.slice(0, 3).map((a, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <FaTrophy size={10} style={{ color: '#f59e0b', marginTop: 3, flexShrink: 0 }} />
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default EducationSection;
