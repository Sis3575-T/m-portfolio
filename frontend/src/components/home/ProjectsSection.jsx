import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaExternalLinkAlt, FaGithub, FaSearch } from 'react-icons/fa';
import { publicApi, imageUrl } from '../../utils/api';
import { useI18n } from '../../utils/i18n.jsx';
import '../Projects.css';

const statusColors = {
  'Completed': '#10b981',
  'In Progress': '#f59e0b',
  'Featured': '#8b5cf6',
  'Open Source': '#3b82f6',
};

const fallbackProjects = [
  {
    _id: 'fallback-p-1',
    title: 'Ethiopian Tourist Destination',
    description: 'A comprehensive tourist destination platform showcasing Ethiopia\'s highest peaks, national parks, and cultural heritage sites. Features interactive guides, travel tips, and curated recommendations.',
    technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'CSS3'],
    liveUrl: 'https://tourist-destination-2.onrender.com/',
    githubUrl: '',
    category: 'Full Stack',
    statusBadge: 'Completed',
    overlayOpacity: 0.6,
    cardBorderRadius: 16,
  },
  {
    _id: 'fallback-p-2',
    title: 'Abay Grand Hotel',
    description: 'A modern hotel booking and information platform with room listings, booking functionality, and responsive design optimized for all devices.',
    technologies: ['React', 'Next.js', 'Tailwind CSS', 'Vercel'],
    liveUrl: 'https://abay-grand-hotel-1.vercel.app/',
    githubUrl: '',
    category: 'Full Stack',
    statusBadge: 'Completed',
    overlayOpacity: 0.6,
    cardBorderRadius: 16,
  },
  {
    _id: 'fallback-p-3',
    title: 'Portfolio CMS',
    description: 'A full-featured content management system with admin dashboard, authentication, and media management. Built with the MERN stack, featuring real-time updates and a modern UI.',
    technologies: ['React', 'Express', 'MongoDB', 'Node.js', 'Cloudinary'],
    liveUrl: '',
    githubUrl: '',
    category: 'Full Stack',
    statusBadge: 'Featured',
    overlayOpacity: 0.6,
    cardBorderRadius: 16,
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

  const filtered = items
    .filter(p => p.isVisible !== false && p.status !== 'draft')
    .filter(p => {
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
              <motion.button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`category-filter-btn ${activeCategory === cat ? 'active' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {cat === 'All' ? t('projects.all') : cat}
              </motion.button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '3rem' }}>
            {t('projects.none')}
          </p>
        ) : (
          <div className="projects-grid">
            {filtered.map((project, idx) => {
              const badge = project.statusBadge || 'Completed';
              const bgColor = statusColors[badge] || statusColors['Completed'];
              const cardRadius = project.cardBorderRadius || 16;
              const overlayOpacity = project.overlayOpacity !== undefined ? project.overlayOpacity : 0.6;
              const showStatusBadge = project.showStatusBadge !== false;
              const showTechStack = project.showTechStack !== false;
              const maxTech = project.maxTechDisplay || 6;
              const descLines = project.descriptionLines || 3;

              return (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="project-card-wrapper"
                >
                  <div
                    className="project-card"
                    style={{ borderRadius: `${cardRadius}px` }}
                  >
                    {/* Card Image Container */}
                    <div
                      className="project-card-image-container"
                      style={{ borderRadius: `${cardRadius}px` }}
                    >
                      {project.thumbnail ? (
                        <>
                          <img
                            src={imageUrl(project.thumbnail)}
                            alt={project.title}
                            className="project-card-image"
                            style={{ objectPosition: project.objectPosition || 'center' }}
                          />
                          <div
                            className="project-card-overlay"
                            style={{ background: `rgba(0, 0, 0, ${overlayOpacity})` }}
                          />
                        </>
                      ) : (
                        <>
                          <div className="project-card-placeholder">
                            {project.title?.charAt(0) || 'P'}
                          </div>
                          <div className="project-card-overlay" style={{ background: `rgba(0, 0, 0, ${overlayOpacity})` }} />
                        </>
                      )}

                      {/* Overlay Content */}
                      <div className="project-card-content">
                        {/* Status Badge */}
                        {showStatusBadge && (
                          <div
                            className="project-status-badge"
                            style={{ background: bgColor }}
                          >
                            {badge}
                          </div>
                        )}

                        {/* Main Content */}
                        <div className="project-content-main">
                          <h3 className="project-card-title">{project.title}</h3>
                          <p
                            className="project-card-desc"
                            style={{ '--desc-lines': descLines }}
                          >
                            {project.description}
                          </p>

                          {/* Technology Stack */}
                          {showTechStack && project.technologies && project.technologies.length > 0 && (
                            <div className="project-tech-stack">
                              {project.technologies.slice(0, maxTech).map((tech, i) => (
                                <span key={i} className="project-tech-badge">
                                  {tech}
                                </span>
                              ))}
                              {project.technologies.length > maxTech && (
                                <span className="project-tech-badge project-tech-more">
                                  +{project.technologies.length - maxTech}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="project-card-actions">
                            {project.liveUrl && project.liveUrl !== '#' && (
                              <a
                                href={project.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="project-btn project-btn-primary"
                                title={project.liveLabel || t('projects.visitSite')}
                              >
                                {project.liveLabel || t('projects.visitSite')}
                              </a>
                            )}
                            {project.githubUrl && (
                              <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="project-btn project-btn-secondary"
                                title={project.githubLabel || t('projects.github')}
                              >
                                {project.githubLabel || t('projects.github')}
                              </a>
                            )}
                            {project.projectUrl && (
                              <a
                                href={project.projectUrl}
                                className="project-btn project-btn-ghost"
                                title={project.detailsLabel || 'Details'}
                              >
                                {project.detailsLabel || 'Details'}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Border */}
                    <div
                      className="project-card-border"
                      style={{ borderRadius: `${cardRadius}px` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default ProjectsSection;
