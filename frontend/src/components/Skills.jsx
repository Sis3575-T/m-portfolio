import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaReact, FaNodeJs, FaHtml5, FaCss3Alt, FaJs, FaPython, FaGitAlt, FaDocker, FaFigma,
  FaAngular, FaVuejs, FaAws, FaJava,
} from 'react-icons/fa';
import {
  SiTailwindcss, SiMongodb, SiPostgresql, SiExpress, SiNextdotjs, SiRedux, SiVite, SiPostman,
  SiFirebase, SiRedis, SiKubernetes, SiTypescript, SiSass, SiWebpack, SiBabel,
  SiFlutter, SiGo, SiRust, SiMysql, SiGraphql, SiJenkins,
} from 'react-icons/si';
import { DiMsqlServer } from 'react-icons/di';
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

const ICON_MAP = {
  react: <FaReact />,
  angular: <FaAngular />,
  vue: <FaVuejs />,
  vuejs: <FaVuejs />,
  javascript: <FaJs />,
  js: <FaJs />,
  typescript: <SiTypescript />,
  ts: <SiTypescript />,
  html: <FaHtml5 />,
  html5: <FaHtml5 />,
  css: <FaCss3Alt />,
  css3: <FaCss3Alt />,
  tailwind: <SiTailwindcss />,
  tailwindcss: <SiTailwindcss />,
  nodejs: <FaNodeJs />,
  node: <FaNodeJs />,
  express: <SiExpress />,
  python: <FaPython />,
  java: <FaJava />,
  go: <SiGo />,
  rust: <SiRust />,
  mongodb: <SiMongodb />,
  mongo: <SiMongodb />,
  postgresql: <SiPostgresql />,
  postgres: <SiPostgresql />,
  mysql: <SiMysql />,
  sqlite: <DiMsqlServer />,
  redis: <SiRedis />,
  firebase: <SiFirebase />,
  aws: <FaAws />,
  git: <FaGitAlt />,
  docker: <FaDocker />,
  kubernetes: <SiKubernetes />,
  k8s: <SiKubernetes />,
  figma: <FaFigma />,
  nextjs: <SiNextdotjs />,
  next: <SiNextdotjs />,
  redux: <SiRedux />,
  vite: <SiVite />,
  postman: <SiPostman />,
  graphql: <SiGraphql />,
  sass: <SiSass />,
  scss: <SiSass />,
  webpack: <SiWebpack />,
  babel: <SiBabel />,
  flutter: <SiFlutter />,
  dart: <SiFlutter />,
  jenkins: <SiJenkins />,
  csharp: <SiJenkins />,
  dotnet: <SiJenkins />,
};

function resolveIcon(skill) {
  const icon = skill.icon?.trim();
  const name = skill.name?.trim().toLowerCase();

  if (icon) {
    const key = icon.toLowerCase().replace(/^(fa|si|di)/, '');
    if (ICON_MAP[key]) return ICON_MAP[key];
    if (ICON_MAP[icon.toLowerCase()]) return ICON_MAP[icon.toLowerCase()];
    if (icon.length <= 4) return <span style={{ fontSize: '1.3rem' }}>{icon}</span>;
  }

  if (name && ICON_MAP[name]) return ICON_MAP[name];

  return <FaReact />;
}

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

function Skills({ skills, settings, sectionTitle, sectionSubtitle }) {
  const ps = useSectionStyles(settings, 'skills');
  if (!skills || skills.length === 0) return null;

  const groupedSkills = skills.reduce((acc, skill) => {
    const cat = skill.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  return (
    <motion.section
      className="skills section" id="skills"
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
      <div className="skills-container">
        <motion.div variants={itemVariants} className="text-center">
          <span className="section-tag">Skills</span>
          <h2 className="section-title">{sectionTitle || 'Skills & Technologies'}</h2>
          {sectionSubtitle && <p className="section-subtitle">{sectionSubtitle}</p>}
          <div className="section-line" style={{ margin: '0.5rem auto 0' }} />
        </motion.div>

        <div className="skill-groups" style={{ marginTop: '3rem' }}>
          {Object.entries(groupedSkills).map(([category, catSkills]) => (
            <motion.div key={category} variants={itemVariants}>
              <div className="skill-group-label">{category}</div>
              <div className="skill-cards">
                {catSkills.map((skill, i) => (
                  <motion.div
                    key={skill._id || i}
                    className="skill-card"
                    whileHover={{ y: -6, scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  >
                    <span className="skill-svg" style={{ color: 'var(--primary-color)' }}>
                      {resolveIcon(skill)}
                    </span>
                    <span className="skill-card-name">{skill.name}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default Skills;
