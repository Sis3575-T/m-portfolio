import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCode, FiMonitor, FiServer, FiSettings, FiGlobe, FiTrendingUp } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const ICON_MAP = {
  code: FiCode,
  monitor: FiMonitor,
  server: FiServer,
  settings: FiSettings,
  globe: FiGlobe,
  'trending-up': FiTrendingUp,
};

const BORDER_COLORS = [
  'rgba(124, 58, 237, 0.25)',
  'rgba(34, 211, 238, 0.25)',
  'rgba(236, 72, 153, 0.25)',
  'rgba(251, 146, 60, 0.25)',
  'rgba(52, 211, 153, 0.25)',
  'rgba(96, 165, 250, 0.25)',
];

const ICON_BG_COLORS = [
  'rgba(124, 58, 237, 0.12)',
  'rgba(34, 211, 238, 0.12)',
  'rgba(236, 72, 153, 0.12)',
  'rgba(251, 146, 60, 0.12)',
  'rgba(52, 211, 153, 0.12)',
  'rgba(96, 165, 250, 0.12)',
];

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

function ServiceIcon({ name }) {
  const Icon = ICON_MAP[name];
  if (!Icon) {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    );
  }
  return <Icon size={26} />;
}

function Services({ services, settings, sectionTitle, sectionSubtitle }) {
  const { theme } = useTheme();
  if (!services || services.length === 0) return null;

  const pageStyles = settings?.pageStyles?.services || {};
  const sectionStyle = {
    ...(theme === 'light' && pageStyles.bgColor ? { backgroundColor: pageStyles.bgColor } : {}),
    ...(pageStyles.textColor ? { color: pageStyles.textColor } : {}),
    ...(pageStyles.fontFamily ? { fontFamily: pageStyles.fontFamily } : {}),
    ...(pageStyles.paddingY === 'small' ? { paddingTop: '2rem', paddingBottom: '2rem' } : {}),
    ...(pageStyles.paddingY === 'medium' ? { paddingTop: '4rem', paddingBottom: '4rem' } : {}),
    ...(pageStyles.paddingY === 'large' ? { paddingTop: '6rem', paddingBottom: '6rem' } : {}),
    ...(pageStyles.paddingY === 'xlarge' ? { paddingTop: '8rem', paddingBottom: '8rem' } : {}),
  };

  useEffect(() => {
    if (pageStyles.customCss) {
      const id = 'services-custom-css';
      let el = document.getElementById(id);
      if (!el) { el = document.createElement('style'); el.id = id; document.head.appendChild(el); }
      el.textContent = pageStyles.customCss;
      return () => { const e = document.getElementById(id); if (e) e.remove(); };
    }
  }, [pageStyles.customCss]);

  return (
    <motion.section
      className="skills section" id="services"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={sectionVariants}
      style={sectionStyle}
    >
      <div className="skills-container" style={{ maxWidth: '1100px' }}>
        <motion.div variants={cardVariants} className="text-center">
          <span className="section-tag">Services</span>
          <h2 className="section-title">{sectionTitle || 'What I Do'}</h2>
          {sectionSubtitle && <p className="section-subtitle">{sectionSubtitle}</p>}
          <div className="section-line" style={{ margin: '0.5rem auto 0' }} />
        </motion.div>

        <div
          style={{
            marginTop: '3rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {services.map((service, idx) => (
            <motion.div
              key={service._id}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="about-card"
              style={{
                padding: '1.75rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                borderColor: BORDER_COLORS[idx % BORDER_COLORS.length],
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '14px',
                  color: BORDER_COLORS[idx % BORDER_COLORS.length].replace('0.25', '1').replace('rgba', 'rgb'),
                  background: ICON_BG_COLORS[idx % ICON_BG_COLORS.length],
                }}
              >
                <ServiceIcon name={service.icon} />
              </div>
              <h4 className="card-title" style={{ fontSize: '1.1rem', margin: 0 }}>{service.title}</h4>
              <p className="card-content" style={{ fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>{service.description}</p>
              {service.features && service.features.length > 0 && (
                <ul style={{
                  margin: '0.25rem 0 0',
                  paddingLeft: '1.1rem',
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
              {service.technologyStack && service.technologyStack.length > 0 && (
                <div className="service-stack" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                  {service.technologyStack.map((tech) => (
                    <span key={tech} style={{
                      fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '6px',
                      background: 'rgba(99,102,241,0.08)', color: 'var(--text-muted)',
                    }}>{tech}</span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default Services;
