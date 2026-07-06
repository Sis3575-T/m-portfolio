import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCode, FiMonitor, FiServer, FiSettings, FiGlobe, FiTrendingUp } from 'react-icons/fi';
import { publicApi } from '../../utils/api';
import { useI18n } from '../../utils/i18n.jsx';

const ICON_MAP = {
  code: FiCode,
  monitor: FiMonitor,
  server: FiServer,
  settings: FiSettings,
  globe: FiGlobe,
  'trending-up': FiTrendingUp,
};

const BORDER_COLORS = [
  'rgba(124, 58, 237, 0.3)',
  'rgba(34, 211, 238, 0.3)',
  'rgba(236, 72, 153, 0.3)',
  'rgba(251, 146, 60, 0.3)',
  'rgba(52, 211, 153, 0.3)',
  'rgba(96, 165, 250, 0.3)',
];

function ServiceIcon({ name }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon size={28} />;
}

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
      <div className="skills-container" style={{ maxWidth: '1100px' }}>
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

        <div
          style={{
            marginTop: '3rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {services.map((service, idx) => (
            <motion.div
              key={service._id}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="about-card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                borderColor: BORDER_COLORS[idx % BORDER_COLORS.length],
              }}
            >
              {service.icon && (
                <div
                  className="card-icon-wrap"
                  style={{
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    background: 'var(--primary-color-alpha, rgba(99,102,241,0.1))',
                  }}
                >
                  <ServiceIcon name={service.icon} />
                </div>
              )}
              <h4 className="card-title" style={{ fontSize: '1.1rem', margin: 0 }}>{service.title}</h4>
              <p className="card-content" style={{ fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>{service.description}</p>
              {service.features && service.features.length > 0 && (
                <ul style={{
                  margin: '0.25rem 0 0',
                  paddingLeft: '1.25rem',
                  textAlign: 'left',
                  fontSize: '0.83rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 2,
                }}>
                  {service.features.map((f, i) => (
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
