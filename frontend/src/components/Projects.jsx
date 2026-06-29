import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Projects.css';
import { getProjects } from '../services/api';
import projectPlaceholder from '../assets/images/project.jpg';
import touristImg from '../assets/tourist.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const API_HOST = API_URL.replace(/\/api$/, '');

const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
  viewport: { once: true },
});

const getProjectImage = (project) => {
  const title = (project.title || '').toLowerCase();
  if (title.includes('ethiopian') || title.includes('tourist')) return touristImg;
  if (!project.thumbnail) return projectPlaceholder;
  if (project.thumbnail.startsWith('http://') || project.thumbnail.startsWith('https://')) return project.thumbnail;
  return API_HOST + project.thumbnail;
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects('/public');
        setProjects(data.data || data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) return (
    <section className="projects" id="projects">
      <div className="container">
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)' }}>Loading projects...</div>
      </div>
    </section>
  );

  if (error) return (
    <section className="projects" id="projects">
      <div className="container">
        <motion.div {...inView()}>
          <p className="section-tag">My Work</p>
          <h2 className="section-title">Featured Projects</h2>
        </motion.div>
        <div className="projects-grid">
          {[{
            _id: 1,
            title: 'Ethiopian Tourist Destination',
            description: 'A comprehensive tourist destination platform showcasing Ethiopia\'s highest peak - Ras Dashen (4,560m). Features include destination exploration, smart matching, interactive dashboard, and booking system.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'CSS3'],
            liveUrl: 'https://tourist-destination-2.onrender.com/',
          }].map((p, i) => (
            <motion.div key={p._id} className="project-card" {...inView(0.1)}>
              <div className="project-image-container">
                <img src={touristImg} alt={p.title} className="project-image" />
                <div className="project-overlay">
                  <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="project-link-button">Visit Site ↗</a>
                </div>
              </div>
              <div className="project-info">
                <h3 className="project-title">{p.title}</h3>
                <p className="project-description">{p.description}</p>
                <div className="project-tech-stack">
                  {p.technologies.map((tech, idx) => (<span key={idx} className="tech-badge">{tech}</span>))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <section className="projects" id="projects">
      <div className="container">
        <motion.div {...inView()}>
          <p className="section-tag">My Work</p>
          <h2 className="section-title">Featured Projects</h2>
        </motion.div>

        <div className="projects-grid">
          {projects.filter(p => p.isActive !== false).map((p, i) => (
            <motion.div
              key={p._id || i}
              className="project-card"
              {...inView(0.1)}
            >
              <div className="project-image-container">
                <img src={getProjectImage(p)} alt={p.title} className="project-image" />
                <div className="project-overlay">
                  <a
                    href={p.liveUrl || p.githubUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-link-button"
                  >
                    Visit Site ↗
                  </a>
                </div>
              </div>
              <div className="project-info">
                <h3 className="project-title">{p.title}</h3>
                <p className="project-description">{p.description}</p>
                {p.technologies && p.technologies.length > 0 && (
                  <div className="project-tech-stack">
                    {p.technologies.map((tech, idx) => (
                      <span key={idx} className="tech-badge">{tech}</span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
