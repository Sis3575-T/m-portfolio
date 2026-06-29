import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCode, FiLayers, FiDatabase, FiTrendingUp, FiAward, FiTarget } from 'react-icons/fi';
import profilePhoto from '../../assets/profile-photo.jpg';
import { publicApi, imageUrl } from '../../utils/api';
import { useI18n } from '../../utils/i18n.jsx';

function AboutSection() {
  const { t } = useI18n();
  const [about, setAbout] = useState(null);
  const [heroAvatar, setHeroAvatar] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      publicApi.getAbout().catch(() => ({ data: null })),
      publicApi.getHero().catch(() => ({ data: null })),
    ]).then(([aboutRes, heroRes]) => {
      const a = aboutRes?.data?.data;
      const h = heroRes?.data?.data;
      setAbout(Array.isArray(a) ? a[0] : a || null);
      if (h) {
        const hero = Array.isArray(h) ? h[0] : h;
        if (hero?.avatar) setHeroAvatar(imageUrl(hero.avatar));
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="about" className="about">
        <div className="about-container" style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div className="spinner" />
        </div>
      </section>
    );
  }

  const biography = about?.biography || '';
  const careerJourney = about?.careerJourney || '';
  const stats = about?.stats || [
    { value: '2', suffix: '+', label: 'Years Learning' },
    { value: '3', suffix: '+', label: 'Projects Built' },
    { value: '5', suffix: '+', label: 'Technologies' },
    { value: '∞', label: 'Curiosity' },
  ];
  const keyAchievements = about?.keyAchievements || [];

  const bioParagraphs = biography ? biography.split('\n').filter(Boolean) : [
    'I am a <span class="highlight">Full-Stack Developer</span> and Computer Science student at Bahir Dar University with a genuine passion for building software that solves real problems.',
    'I chose Computer Science because I wanted to understand the fundamental principles behind the technology we use every day. Through coursework and hands-on projects, I\'ve developed practical skills in frontend and backend development, database management, API design, and responsive UI.',
    'What drives me is the ability to transform ideas into working products. I enjoy the complete development cycle — from planning and design to implementation and deployment.',
  ];

  const detailCards = keyAchievements.length > 0 ? keyAchievements.map((achievement, i) => ({
    icon: [<FiCode size={22} />, <FiLayers size={22} />, <FiDatabase size={22} />, <FiTrendingUp size={22} />, <FiAward size={22} />, <FiTarget size={22} />][i % 6],
    title: [t('about.cardFocus'), t('about.cardApproach'), t('about.cardEducation'), t('about.cardGoal'), t('about.cardAchievement'), t('about.cardMilestone')][i % 6],
    content: achievement,
  })) : [
    { icon: <FiCode size={22} />, title: 'Focus', content: 'Full-Stack Web Development with modern JavaScript/TypeScript ecosystems.' },
    { icon: <FiLayers size={22} />, title: 'Approach', content: 'Break problems down, research solutions, iterate to quality, and ship with confidence.' },
    { icon: <FiDatabase size={22} />, title: 'Education', content: 'B.Sc. Computer Science at Bahir Dar University — building a strong CS foundation.' },
    { icon: <FiTrendingUp size={22} />, title: 'Goal', content: 'Create software that makes a meaningful impact through clean architecture.' },
  ];

  return (
    <section id="about" className="about">
      <div className="about-container">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="section-header"
        >
          <span className="section-tag">{t('about.title')}</span>
          <h2 className="section-title">{t('about.subtitle')}</h2>
          <div className="section-line" />
        </motion.div>

        <div className="about-content">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="about-image-wrapper"
          >
            <div className="about-img-frame">
              <img src={heroAvatar || profilePhoto} alt="About" className="about-img" />
              <div className="img-corner img-corner-tl" />
              <div className="img-corner img-corner-br" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="about-text"
          >
            {about?.heading && (
              <h3 className="about-heading" dangerouslySetInnerHTML={{ __html: about.heading }} />
            )}
            {bioParagraphs.map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
            ))}
            {careerJourney && (
              <div className="about-career-journey">
                <h4 className="about-subheading">{t('about.myJourney')}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{careerJourney}</p>
              </div>
            )}
            <div className="about-stats">
              {stats.map((stat) => (
                <div key={stat.label} className="stat-item">
                  <span className="stat-number">{stat.value}{stat.suffix || ''}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="about-cards">
          {detailCards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="about-card"
            >
              <div className="card-icon-wrap">{card.icon}</div>
              <h4 className="card-title">{card.title}</h4>
              <p className="card-content">{card.content}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
