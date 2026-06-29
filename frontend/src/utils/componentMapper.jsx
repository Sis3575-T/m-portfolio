import React from 'react';
import { motion } from 'framer-motion';
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

const componentMap = {
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

function getAnimationProps(advanced) {
  if (!advanced || !advanced.animationType || advanced.animationType === 'none') return {};
  const duration = parseFloat(advanced.animationDuration) || 0.6;
  const shared = { viewport: { once: true, margin: '-80px' }, transition: { duration } };
  switch (advanced.animationType) {
    case 'fade':
      return { initial: { opacity: 0 }, whileInView: { opacity: 1 }, ...shared };
    case 'slide-up':
      return { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, ...shared };
    case 'slide-left':
      return { initial: { opacity: 0, x: -40 }, whileInView: { opacity: 1, x: 0 }, ...shared };
    case 'zoom':
      return { initial: { opacity: 0, scale: 0.95 }, whileInView: { opacity: 1, scale: 1 }, ...shared };
    default:
      return { initial: { opacity: 0, y: 36 }, whileInView: { opacity: 1, y: 0 }, ...shared };
  }
}

function getStyleProps(styles) {
  if (!styles) return {};
  const s = {};
  if (styles.backgroundColor) s.backgroundColor = styles.backgroundColor;
  if (styles.textColor) s.color = styles.textColor;
  if (styles.padding) s.padding = styles.padding;
  if (styles.borderRadius) s.borderRadius = styles.borderRadius;
  if (styles.fontFamily) s.fontFamily = styles.fontFamily;
  if (styles.fontSize) s.fontSize = styles.fontSize;
  if (styles.alignment) s.textAlign = styles.alignment;
  return s;
}

function PageSection({ component }) {
  const Component = componentMap[component.type];
  if (!Component) return null;

  const animProps = getAnimationProps(component.advanced);
  const styleProps = getStyleProps(component.styles);
  const customClass = component.advanced?.customClasses || '';
  const hasAnimation = animProps.initial && component.type !== 'hero';

  if (hasAnimation) {
    return (
      <motion.section className={customClass} style={styleProps} {...animProps}>
        <Component />
      </motion.section>
    );
  }

  return (
    <section className={customClass} style={styleProps}>
      <Component />
    </section>
  );
}

export { componentMap, PageSection };
