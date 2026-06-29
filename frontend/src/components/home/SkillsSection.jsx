import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { publicApi } from '../../utils/api';
import { useI18n } from '../../utils/i18n.jsx';
import {
  FaReact, FaNodeJs, FaHtml5, FaCss3Alt, FaJs, FaPython, FaGitAlt, FaDocker, FaFigma, FaNpm,
  FaAngular, FaVuejs, FaAws, FaLinux, FaJava
} from 'react-icons/fa';
import {
  SiTailwindcss, SiMongodb, SiPostgresql, SiExpress, SiTypescript, SiVite, SiPostman,
  SiNextdotjs, SiRedux, SiGraphql, SiFirebase, SiRedis, SiKubernetes, SiJenkins,
  SiTerraform, SiGo, SiRust, SiSwift, SiKotlin, SiFlutter, SiDart, SiMysql,
  SiSqlite, SiPrisma, SiOracle, SiMui, SiBootstrap, SiSass, SiJquery, SiWebpack,
  SiBabel, SiEslint, SiPrettier, SiNginx, SiHeroku, SiNetlify,
  SiCsharp, SiRuby, SiRubyonrails, SiDotnet, SiSolidity
} from 'react-icons/si';

function skillIcon(name) {
  const map = {
    'React': <FaReact />,
    'Angular': <FaAngular />,
    'Vue.js': <FaVuejs />,
    'TypeScript': <SiTypescript />,
    'JavaScript': <FaJs />,
    'HTML5': <FaHtml5 />,
    'CSS3': <FaCss3Alt />,
    'Tailwind CSS': <SiTailwindcss />,
    'Node.js': <FaNodeJs />,
    'Express': <SiExpress />,
    'Python': <FaPython />,
    'Java': <FaJava />,
    'Go': <SiGo />,
    'Rust': <SiRust />,
    'MongoDB': <SiMongodb />,
    'PostgreSQL': <SiPostgresql />,
    'MySQL': <SiMysql />,
    'SQLite': <SiSqlite />,
    'Redis': <SiRedis />,
    'Prisma': <SiPrisma />,
    'Oracle': <SiOracle />,
    'Git': <FaGitAlt />,
    'Docker': <FaDocker />,
    'Kubernetes': <SiKubernetes />,
    'AWS': <FaAws />,
    'Linux': <FaLinux />,
    'Nginx': <SiNginx />,
    'Firebase': <SiFirebase />,
    'GraphQL': <SiGraphql />,
    'Next.js': <SiNextdotjs />,
    'Redux': <SiRedux />,
    'Vite': <SiVite />,
    'Postman': <SiPostman />,
    'Figma': <FaFigma />,
    'npm': <FaNpm />,
    'Jenkins': <SiJenkins />,
    'Terraform': <SiTerraform />,
    'Swift': <SiSwift />,
    'Kotlin': <SiKotlin />,
    'Flutter': <SiFlutter />,
    'Dart': <SiDart />,
    'MUI': <SiMui />,
    'Bootstrap': <SiBootstrap />,
    'Sass': <SiSass />,
    'jQuery': <SiJquery />,
    'Webpack': <SiWebpack />,
    'Babel': <SiBabel />,
    'ESLint': <SiEslint />,
    'Prettier': <SiPrettier />,
    'Heroku': <SiHeroku />,
    'Netlify': <SiNetlify />,
    'Axios': <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>A</div>,
    'C#': <SiCsharp />,
    'Ruby': <SiRuby />,
    '.NET': <SiDotnet />,
    'Ruby on Rails': <SiRubyonrails />,
    'Solidity': <SiSolidity />,
    'Web3': <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>W3</div>,
    'CI/CD': <SiJenkins />,
    'Containerization': <FaDocker />,
  };
  if (map[name]) return map[name];
  return <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-color)' }}>{name.charAt(0)}</div>;
}

function skillColor(name) {
  const map = {
    'React': '#61DAFB',
    'Angular': '#DD0031',
    'Vue.js': '#4FC08D',
    'TypeScript': '#3178C6',
    'JavaScript': '#F7DF1E',
    'HTML5': '#E34F26',
    'CSS3': '#1572B6',
    'Tailwind CSS': '#06B6D4',
    'Node.js': '#339933',
    'Express': '#FFFFFF',
    'Python': '#3776AB',
    'Java': '#ED8B00',
    'Go': '#00ADD8',
    'Rust': '#000000',
    'MongoDB': '#47A248',
    'PostgreSQL': '#4169E1',
    'MySQL': '#4479A1',
    'SQLite': '#003B57',
    'Redis': '#DC382D',
    'Prisma': '#2D3748',
    'Git': '#F05032',
    'Docker': '#2496ED',
    'AWS': '#FF9900',
    'Linux': '#FCC624',
    'Firebase': '#FFCA28',
    'GraphQL': '#E10098',
    'Next.js': '#000000',
    'Redux': '#764ABC',
    'Vite': '#646CFF',
    'Postman': '#FF6C37',
    'Figma': '#F24E1E',
    'npm': '#CB3837',
    'Flutter': '#02569B',
    'Dart': '#0175C2',
    'Bootstrap': '#7952B3',
    'Sass': '#CC6699',
    'Axios': '#5A29E4',
    'C#': '#239120',
    'Ruby': '#CC342D',
    '.NET': '#512BD4',
    'Ruby on Rails': '#CC0000',
    'Solidity': '#363636',
    'Web3': '#F16822',
    'CI/CD': '#D24939',
    'Containerization': '#2496ED',
  };
  return map[name] || 'var(--primary-color)';
}

function SkillsSection() {
  const { t } = useI18n();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getSkills()
      .then(({ data }) => {
        const items = data.data || [];
        const grouped = {};
        items.forEach(s => {
          const cat = s.category || 'Other';
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(s);
        });
        setSkills(Object.entries(grouped));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="skills" className="skills">
        <div className="skills-container" style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div className="spinner" />
        </div>
      </section>
    );
  }

  if (skills.length === 0) return null;

  return (
    <section id="skills" className="skills">
      <div className="skills-container">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="section-tag">{t('skills.title')}</span>
          <h2 className="section-title">{t('skills.heading')}</h2>
          <div className="section-line" />
          <p className="section-subtitle" style={{ margin: '1rem auto 0' }}>
            {t('skills.subtitle')}
          </p>
        </motion.div>

        <div className="skill-groups">
          {skills.map(([category, items], groupIdx) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: groupIdx * 0.1 }}
            >
              <div className="skill-group-label">{category}</div>
              <div className="skill-cards">
                {items.map((skill) => (
                  <div key={skill._id} className="skill-card" title={`${skill.name} (${skill.proficiency || 0}%)`}>
                    <div className="skill-svg" style={{ color: skillColor(skill.name) }}>
                      {skillIcon(skill.name)}
                    </div>
                    <span className="skill-card-name">{skill.name}</span>
                    {skill.proficiency != null && (
                      <div style={{ width: '100%', height: 3, background: 'var(--border-color)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${skill.proficiency}%`, height: '100%', background: skillColor(skill.name), borderRadius: 2 }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SkillsSection;
