import { motion } from 'framer-motion';
import './Skills.css';

const categories = [
  {
    icon: '🎨',
    title: 'Frontend',
    bg: '#eef2ff',
    skills: ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'TypeScript', 'React', 'Angular', 'Next.js', 'Responsive Design', 'Framer Motion'],
  },
  {
    icon: '⚙️',
    title: 'Backend',
    bg: '#ecfeff',
    skills: ['Node.js', 'Express.js', 'C#', '.NET', 'Ruby', 'Ruby on Rails', 'REST APIs'],
  },
  {
    icon: '📚',
    title: 'Libraries',
    bg: '#fef3c7',
    skills: ['Redux', 'Axios', 'Bootstrap', 'Tailwind CSS', 'jQuery'],
  },
  {
    icon: '🛠️',
    title: 'Tools & DevOps',
    bg: '#f5f3ff',
    skills: ['Git & GitHub', 'VS Code', 'Vite', 'Vercel', 'Render', 'Docker', 'CI/CD', 'Postman'],
  },
  {
    icon: '🔗',
    title: 'Blockchain & More',
    bg: '#ecfdf5',
    skills: ['Solidity', 'Web3', 'Smart Contracts', 'dApps'],
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const card = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const Skills = () => (
  <section className="skills" id="skills">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <p className="section-tag">What I Know</p>
        <h2 className="section-title">Technical Skills</h2>
        <p className="section-subtitle">
          Technologies and tools I use to build modern, scalable web applications.
        </p>
      </motion.div>

      <motion.div
        className="skills-grid"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {categories.map((cat, i) => (
          <motion.div className="skill-card" key={i} variants={card}>
            <div className="skill-card-header" style={{ '--cat-bg': cat.bg }}>
              <span className="skill-card-icon">{cat.icon}</span>
              <h3 className="skill-card-title">{cat.title}</h3>
            </div>
            <div className="skill-tags">
              {cat.skills.map((s, j) => (
                <span key={j} className="skill-tag">{s}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default Skills;
