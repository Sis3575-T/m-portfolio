import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaExternalLinkAlt, FaGithub } from 'react-icons/fa';
import { getImageUrl } from '../api';
import './Projects.css';

const statusColors = {
  'Completed': '#10b981',
  'In Progress': '#f59e0b',
  'Featured': '#8b5cf6',
  'Open Source': '#3b82f6',
};

function Projects({ projects, settings, sectionTitle, sectionSubtitle }) {
  const pageStyles = settings?.pageStyles?.projects || {};
  const defaultCardBorderRadius = pageStyles.cardBorderRadius || 16;
  const defaultOverlayOpacity = pageStyles.overlayOpacity || 0.6;

  const sectionStyle = {
    ...(pageStyles.bgColor ? { backgroundColor: pageStyles.bgColor } : {}),
    ...(pageStyles.textColor ? { color: pageStyles.textColor } : {}),
    ...(pageStyles.fontFamily ? { fontFamily: pageStyles.fontFamily } : {}),
    ...(pageStyles.paddingY === 'small' ? { paddingTop: '2rem', paddingBottom: '2rem' } : {}),
    ...(pageStyles.paddingY === 'medium' ? { paddingTop: '4rem', paddingBottom: '4rem' } : {}),
    ...(pageStyles.paddingY === 'large' ? { paddingTop: '6rem', paddingBottom: '6rem' } : {}),
    ...(pageStyles.paddingY === 'xlarge' ? { paddingTop: '8rem', paddingBottom: '8rem' } : {}),
  };

  useEffect(() => {
    if (pageStyles.customCss) {
      const id = 'projects-custom-css';
      let el = document.getElementById(id);
      if (!el) { el = document.createElement('style'); el.id = id; document.head.appendChild(el); }
      el.textContent = pageStyles.customCss;
      return () => { const e = document.getElementById(id); if (e) e.remove(); };
    }
  }, [pageStyles.customCss]);

  const [filter, setFilter] = useState('All');

  const categories = useMemo(() => {
    if (!projects || projects.length === 0) return ['All'];
    return ['All', ...new Set(projects.map(p => p.category).filter(Boolean))];
  }, [projects]);

  const filtered = useMemo(() => {
    if (!projects) return [];
    const visible = projects.filter(p => p.isVisible !== false && p.status !== 'draft');
    if (filter === 'All') return visible;
    return visible.filter(p => p.category === filter);
  }, [projects, filter]);

  if (!projects || projects.length === 0) return null;

  return (
    <section className="projects section" id="projects" style={sectionStyle}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="section-header"
        >
          <span className="section-tag">Portfolio</span>
          <h2 className="section-title">{sectionTitle || 'Featured Projects'}</h2>
          {sectionSubtitle && <p className="section-subtitle">{sectionSubtitle}</p>}
          <div className="section-line" />
        </motion.div>

        {categories.length > 1 && (
          <div className="projects-filters">
            {categories.map(cat => (
              <motion.button
                key={cat}
                className={`projects-filter-btn${filter === cat ? ' active' : ''}`}
                onClick={() => setFilter(cat)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        )}

        <div className="projects-grid">
          {filtered.map((project, idx) => {
            const badge = project.statusBadge || 'Completed';
            const bgColor = statusColors[badge] || statusColors['Completed'];
            const cardRadius = project.cardBorderRadius || defaultCardBorderRadius;
            const overlayOpacity = project.overlayOpacity !== undefined ? project.overlayOpacity : defaultOverlayOpacity;
            const hoverScale = project.hoverScale || 1.05;
            const showStatusBadge = project.showStatusBadge !== false;
            const showTechStack = project.showTechStack !== false;
            const maxTech = project.maxTechDisplay || 6;
            const descLines = project.descriptionLines || 3;

            return (
              <motion.div
                key={project._id}
                className="project-card-wrapper"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
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
                          src={getImageUrl(project.thumbnail)}
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
                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="project-btn project-btn-primary"
                              title={project.liveLabel || 'Live Demo'}
                            >
                              {project.liveLabel || 'Live Demo'}
                            </a>
                          )}
                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="project-btn project-btn-secondary"
                              title={project.githubLabel || 'GitHub'}
                            >
                              {project.githubLabel || 'GitHub'}
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
      </div>
    </section>
  );
}

export default Projects;
