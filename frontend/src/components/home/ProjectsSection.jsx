import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaExternalLinkAlt, FaGithub, FaFolder, FaSearch } from 'react-icons/fa';
import { publicApi } from '../../utils/api';
import { useI18n } from '../../utils/i18n.jsx';

const fallbackProjects = [
  {
    _id: 'fallback-p-1',
    title: 'Ethiopian Tourist Destination',
    description: 'A comprehensive tourist destination platform showcasing Ethiopia\'s highest peaks, national parks, and cultural heritage sites. Features interactive guides, travel tips, and curated recommendations for travelers exploring Ethiopia.',
    technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'CSS3'],
    liveUrl: 'https://tourist-destination-2.onrender.com/',
    githubUrl: '',
    category: 'Full Stack',
  },
  {
    _id: 'fallback-p-2',
    title: 'Abay Grand Hotel',
    description: 'A modern hotel booking and information platform built with Next.js and Tailwind CSS. Features room listings, booking functionality, and a responsive design optimized for all devices.',
    technologies: ['React', 'Next.js', 'Tailwind CSS', 'Vercel'],
    liveUrl: 'https://abay-grand-hotel-1.vercel.app/',
    githubUrl: '',
    category: 'Full Stack',
  },
  {
    _id: 'fallback-p-3',
    title: 'Portfolio CMS',
    description: 'A full-featured content management system with admin dashboard, authentication, and media management. Built with the MERN stack, featuring real-time updates and a modern UI.',
    technologies: ['React', 'Express', 'MongoDB', 'Node.js', 'Cloudinary'],
    liveUrl: '',
    githubUrl: '',
    category: 'Full Stack',
  },
];

function ProjectsSection() {
  const { t } = useI18n();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    publicApi.getProjects()
      .then(({ data }) => setProjects(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const items = projects.length > 0 ? projects : fallbackProjects;
  const categories = ['All', ...new Set(items.map(p => p.category).filter(Boolean))];

  const filtered = items.filter(p => {
    const matchSearch = !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      (p.technologies || []).some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchSearch && matchCategory;
  });

  if (loading) {
    return (
      <section id="projects" className="projects">
        <div className="projects-container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p style={{ color: 'var(--text-muted)' }}>{t('projects.loading')}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="projects">
      <div className="projects-container">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="section-tag">{t('projects.title')}</span>
          <h2 className="section-title">{t('projects.heading')}</h2>
          <div className="section-line" />
          <p className="section-subtitle" style={{ margin: '1rem auto 0' }}>
            {t('projects.subtitle')}
          </p>
        </motion.div>

        <div className="project-filters">
          <div className="project-search-wrapper">
            <FaSearch className="project-search-icon" size={14} />
            <input
              type="text"
              placeholder={t('projects.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="project-search-input"
            />
          </div>
          <div className="project-category-filters">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`category-filter-btn ${activeCategory === cat ? 'active' : ''}`}
              >
                {cat === 'All' ? t('projects.all') : cat}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '3rem' }}>
            {t('projects.none')}
          </p>
        ) : (
          <div className="projects-grid">
            {filtered.map((project, idx) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="project-card"
              >
                <div className="project-image">
                  {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : project.images && project.images.length > 0 ? (
                    <img src={project.images[0]} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="project-image-placeholder">
                      <FaFolder size={48} style={{ color: 'var(--primary-color)', opacity: 0.4 }} />
                    </div>
                  )}
                </div>
                <div className="project-content">
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-description">{project.description}</p>
                  <div className="project-tech">
                    {(project.technologies || []).slice(0, 4).map((tech) => (
                      <span key={tech} className="tech-badge">{tech}</span>
                    ))}
                  </div>
                  <div className="project-links">
                    {project.liveUrl && project.liveUrl !== '#' && (
                      <a href={project.liveUrl} target="_blank" rel="noreferrer" className="project-link project-link-primary">
                        <FaExternalLinkAlt size={13} /> {t('projects.visitSite')}
                      </a>
                    )}
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noreferrer" className="project-link">
                        <FaGithub size={14} /> {t('projects.github')}
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ProjectsSection;
