import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { publicApi } from '../../utils/api';
import { useI18n } from '../../utils/i18n.jsx';

function ServicesSection() {
  const { t } = useI18n();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getServices()
      .then(({ data }) => setServices(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="services" className="skills">
        <div className="skills-container" style={{ maxWidth: '1000px', textAlign: 'center', padding: '3rem 0' }}>
          <div className="spinner" />
        </div>
      </section>
    );
  }

  if (services.length === 0) return null;

  return (
    <section id="services" className="skills">
      <div className="skills-container" style={{ maxWidth: '1000px' }}>
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="section-tag">{t('services.title')}</span>
          <h2 className="section-title">{t('services.heading')}</h2>
          <div className="section-line" />
          <p className="section-subtitle" style={{ margin: '1rem auto 0' }}>
            {t('services.subtitle')}
          </p>
        </motion.div>

        <div className="about-cards" style={{ marginTop: '3rem' }}>
          {services.map((service, idx) => (
            <motion.div
              key={service._id}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="about-card"
            >
              {service.icon && (
                <div className="card-icon-wrap" style={{ fontSize: '1.5rem' }}>{service.icon}</div>
              )}
              <h4 className="card-title">{service.title}</h4>
              <p className="card-content">{service.description}</p>
              {service.features && service.features.length > 0 && (
                <ul style={{ marginTop: '0.75rem', paddingLeft: '1.25rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  {service.features.slice(0, 4).map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
