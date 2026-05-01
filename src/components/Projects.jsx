import { motion } from 'framer-motion';
import projectImg from '../assets/images/project.jpg';
import './Projects.css';

const Projects = () => {
  const project = {
    title: 'Ethiopian Tourist Destination',
    description:
      'A full-featured web application showcasing Ethiopia\'s most breathtaking tourist destinations. The platform provides rich information about historical sites, natural wonders, cultural landmarks, and travel tips to help visitors explore the beauty of Ethiopia.',
    longDescription:
      'Built with a modern tech stack, this project delivers an immersive experience for travelers and tourism enthusiasts. It features destination listings, detailed location pages, interactive content, and a clean, responsive interface optimized for all devices.',
    tech: ['React', 'Node.js', 'MongoDB', 'Express.js', 'CSS3'],
    link: 'https://tourist-destination-2.onrender.com/',
    category: 'Full Stack Web App',
    status: 'Live',
    highlights: [
      'Responsive design for all screen sizes',
      'Rich destination content & imagery',
      'Modern, accessible UI/UX',
      'Deployed on Render',
    ],
  };

  return (
    <motion.section
      className="projects"
      id="projects"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
    >
      <div className="container">
        <h2 className="section-heading">Featured Project</h2>
        <div className="section-divider"></div>
        <p className="section-subheading">
          A showcase of my most recent and impactful work.
        </p>

        <motion.div
          className="featured-card"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          viewport={{ once: true }}
        >
          {/* Card header */}
          <div className="card-header">
            <div className="card-meta">
              <span className="project-category">{project.category}</span>
              <span className="project-status">
                <span className="status-dot"></span>
                {project.status}
              </span>
            </div>
            <h3 className="project-title">{project.title}</h3>
          </div>

          {/* Card body */}
          <div className="card-body">
            <div className="card-left">
              <div className="project-preview" aria-label="Ethiopian Tourist Destination preview">
                <a href={project.link} target="_blank" rel="noopener noreferrer">
                  <img src={projectImg} alt="Ethiopian Tourist Destination screenshot" className="preview-img" />
                </a>
              </div>
            </div>

            <div className="card-right">
              <p className="project-desc">{project.description}</p>
              <p className="project-desc">{project.longDescription}</p>

              <div className="project-highlights">
                <h4>Key Features</h4>
                <ul>
                  {project.highlights.map((h, i) => (
                    <li key={i}>
                      <span className="check">✓</span> {h}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="tech-stack">
                {project.tech.map((t, i) => (
                  <span key={i} className="tech-tag">{t}</span>
                ))}
              </div>

              <div className="card-actions">
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-live"
                >
                  🌐 View Live Project
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Projects;
