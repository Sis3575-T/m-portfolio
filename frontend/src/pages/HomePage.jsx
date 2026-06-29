import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageSection } from '../utils/componentMapper';
import { publicApi } from '../utils/api';

import HeroSection from '../components/home/HeroSection';
import AboutSection from '../components/home/AboutSection';
import StatsSection from '../components/home/StatsSection';
import SkillsSection from '../components/home/SkillsSection';
import ProjectsSection from '../components/home/ProjectsSection';
import ExperienceSection from '../components/home/ExperienceSection';
import EducationSection from '../components/home/EducationSection';
import CertificatesSection from '../components/home/CertificatesSection';
import ServicesSection from '../components/home/ServicesSection';
import ContactSection from '../components/home/ContactSection';

const fallbackSections = [
  { _id: 'hero', type: 'hero' },
  { _id: 'about', type: 'about' },
  { _id: 'stats', type: 'stats' },
  { _id: 'skills', type: 'skills' },
  { _id: 'projects', type: 'projects' },
  { _id: 'experience', type: 'experience' },
  { _id: 'education', type: 'education' },
  { _id: 'certificates', type: 'certificates' },
  { _id: 'services', type: 'services' },
  { _id: 'contact', type: 'contact' },
];

const keyToComponent = {
  hero: HeroSection,
  about: AboutSection,
  stats: StatsSection,
  skills: SkillsSection,
  projects: ProjectsSection,
  experience: ExperienceSection,
  education: EducationSection,
  certificates: CertificatesSection,
  services: ServicesSection,
  contact: ContactSection,
};

function FallbackSection({ component }) {
  const Comp = keyToComponent[component.type];
  return Comp ? <Comp /> : null;
}

function HomePage() {
  const [components, setComponents] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getHomePage()
      .then(({ data }) => {
        const page = data?.data;
        if (page?.components?.length > 0) {
          setComponents(page.components);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div className="spinner" />
      </div>
    );
  }

  const visible = components?.filter((c) => c.isVisible !== false) ?? fallbackSections;
  const useFallback = !components;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {visible.map((comp) => {
        if (useFallback) {
          return <FallbackSection key={comp._id} component={comp} />;
        }
        return <PageSection key={comp._id} component={comp} />;
      })}
    </motion.div>
  );
}

export default HomePage;
