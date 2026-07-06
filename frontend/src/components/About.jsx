import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiMail, FiBriefcase, FiClock } from 'react-icons/fi';
import { FaUserTie, FaAward, FaLaptopCode, FaRocket } from 'react-icons/fa';
import { backendApi } from '../services/backendApi';
import { useTheme } from '../context/ThemeContext';

function useSectionStyles(settings, key) {
  const { theme } = useTheme();
  const ps = settings?.pageStyles?.[key] || {};
  useEffect(() => {
    if (ps.customCss) {
      const el = document.createElement('style');
      el.id = `custom-css-${key}`;
      el.textContent = ps.customCss;
      document.head.appendChild(el);
      return () => el.remove();
    }
  }, [ps.customCss, key]);
  if (theme === 'dark') return { ...ps, bgColor: '' };
  return ps;
}

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const cardVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const statIcons = [FaAward, FaLaptopCode, FaRocket, FiClock];

function About({ settings, sectionTitle, sectionSubtitle }) {
  const envCvUrl = import.meta.env.VITE_CV_URL || '/cv.pdf';
  const cvUrl = settings?.cvUrl || envCvUrl;
  const googleViewUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(cvUrl)}`;
  const ps = useSectionStyles(settings, 'about');

  const {
    shortBio, longBio, name,
    city, country, yearsOfExperience, freelanceAvailable,
    email,
  } = settings || {};

  const [aboutData, setAboutData] = useState(null);

  useEffect(() => {
    backendApi.getAbout().then(res => {
      if (res?.data) setAboutData(res.data);
    }).catch(() => {});
  }, []);

  const aboutStats = aboutData?.stats?.length > 0 ? aboutData.stats : [
    { label: 'Years Experience', value: yearsOfExperience || '2', suffix: '+' },
    { label: 'Projects Completed', value: '15', suffix: '+' },
    { label: 'Technologies', value: '20', suffix: '+' },
    { label: 'Commits', value: '500', suffix: '+' },
  ];

  const bioText = aboutData?.biography || longBio || shortBio || '';

  const infoCards = [
    { icon: FiMapPin, title: 'Location', text: `${city || 'Bahir Dar'}, ${country || 'Ethiopia'}` },
    { icon: FiMail, title: 'Email', text: email || 'sisay3575@gmail.com' },
    { icon: FiBriefcase, title: 'Experience', text: `${yearsOfExperience || '2+'} Years` },
    { icon: FiClock, title: 'Status', text: freelanceAvailable !== false ? 'Open for work' : 'Busy' },
  ];

  return (
    <motion.section
      className="about" id="about"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={sectionVariants}
      style={{
        ...(ps.bgColor ? { backgroundColor: ps.bgColor } : {}),
        ...(ps.textColor ? { color: ps.textColor } : {}),
        ...(ps.fontFamily ? { fontFamily: ps.fontFamily } : {}),
        ...(ps.paddingY === 'small' ? { paddingTop: '2rem', paddingBottom: '2rem' } : {}),
        ...(ps.paddingY === 'medium' ? { paddingTop: '4rem', paddingBottom: '4rem' } : {}),
        ...(ps.paddingY === 'large' ? { paddingTop: '6rem', paddingBottom: '6rem' } : {}),
        ...(ps.paddingY === 'xlarge' ? { paddingTop: '8rem', paddingBottom: '8rem' } : {}),
      }}
    >
      <div className="about-container">
        <motion.div variants={itemVariants} className="text-center">
          <span className="section-tag">About</span>
          <h2 className="section-title">{sectionTitle || 'About Me'}</h2>
          {sectionSubtitle && <p className="section-subtitle">{sectionSubtitle}</p>}
          <div className="section-line" style={{ margin: '0.5rem auto 0' }} />
        </motion.div>

        <div className="about-content">
          <motion.div variants={itemVariants} className="about-text">
            <h3 className="about-heading">
              I'm <span className="text-gradient">{name || 'Sisay Temesgen'}</span>
            </h3>
            <div>
              {bioText.split('\n').filter(Boolean).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {!bioText && <p>I build polished digital products that blend thoughtful design with reliable engineering.</p>}
            </div>

            <div className="about-stats">
              {aboutStats.map((stat, i) => (
                <div key={i} className="stat-item">
                  <span className="stat-number">{stat.value}{stat.suffix || ''}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <a href={googleViewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                View CV
              </a>
              <a href={cvUrl} download className="btn btn-primary">
                Download CV
              </a>
            </div>
          </motion.div>

          <motion.div variants={cardVariants} className="about-info-grid">
            {infoCards.map((card, i) => (
              <div key={i} className="about-info-item">
                <div className="info-item-icon"><card.icon size={16} /></div>
                <span className="info-item-label">{card.title}</span>
                <span className="info-item-value">{card.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

export default About;
