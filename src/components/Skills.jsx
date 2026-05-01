import { motion } from 'framer-motion';
import './Skills.css';

const Skills = () => {
  const categories = [
    {
      title: 'Frontend',
      icon: '🎨',
      skills: ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'React'],
    },
    {
      title: 'Backend',
      icon: '⚙️',
      skills: ['Node.js', 'Express.js', 'MongoDB', 'REST APIs'],
    },
    {
      title: 'Tools & Others',
      icon: '🛠️',
      skills: ['Git & GitHub', 'VS Code', 'Vite', 'Responsive Design'],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <motion.section
      className="skills"
      id="skills"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
    >
      <div className="container">
        <h2 className="section-heading">Technical Skills</h2>
        <div className="section-divider"></div>
        <p className="section-subheading">
          Technologies and tools I work with to build modern web applications.
        </p>

        <motion.div
          className="skills-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {categories.map((cat, i) => (
            <motion.div className="skill-category" key={i} variants={cardVariants}>
              <div className="category-header">
                <span className="category-icon">{cat.icon}</span>
                <h3>{cat.title}</h3>
              </div>
              <div className="skill-tags">
                {cat.skills.map((skill, j) => (
                  <span key={j} className="skill-tag">{skill}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Skills;
