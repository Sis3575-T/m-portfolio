import React, { useMemo, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getImageUrl } from '../api';

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

function Projects({ projects, settings, sectionTitle, sectionSubtitle }) {
  const ps = useSectionStyles(settings, 'projects');
  const filtered = useMemo(() => {
    if (!projects) return [];
    return projects.filter(p => p.isVisible !== false && p.status !== 'draft');
  }, [projects]);

  if (!projects || filtered.length === 0) return null;

  return (
    <section className="projects section" id="projects" style={{
      ...(ps.bgColor ? { backgroundColor: ps.bgColor } : {}),
      ...(ps.textColor ? { color: ps.textColor } : {}),
      ...(ps.fontFamily ? { fontFamily: ps.fontFamily } : {}),
      ...(ps.paddingY === 'small' ? { paddingTop: '2rem', paddingBottom: '2rem' } : {}),
      ...(ps.paddingY === 'medium' ? { paddingTop: '4rem', paddingBottom: '4rem' } : {}),
      ...(ps.paddingY === 'large' ? { paddingTop: '6rem', paddingBottom: '6rem' } : {}),
      ...(ps.paddingY === 'xlarge' ? { paddingTop: '8rem', paddingBottom: '8rem' } : {}),
    }}>
      <div className="container projects-container">
        <div className="section-header">
          <span className="section-tag">Portfolio</span>
          <h2 className="section-title">{sectionTitle || 'Featured Projects'}</h2>
          {sectionSubtitle && <p className="section-subtitle">{sectionSubtitle}</p>}
          <div className="section-line" />
        </div>
        <div className="projects-grid">
          {filtered.map(project => (
            <div key={project._id} className="project-card">
              <div className="project-image">
                <div className="project-image-placeholder">
                  {project.thumbnail ? (
                    <img src={getImageUrl(project.thumbnail)} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    project.title?.charAt(0) || 'P'
                  )}
                  <div className="project-image-overlay">
                    {project.liveUrl && <a href={project.liveUrl} className="project-link-primary" target="_blank" rel="noopener noreferrer">Live Demo →</a>}
                    {project.githubUrl && <a href={project.githubUrl} className="project-link" target="_blank" rel="noopener noreferrer">GitHub</a>}
                  </div>
                </div>
              </div>
              <div className="project-content">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
                <div className="project-tech">
                  {project.technologies?.map((tech, i) => (
                    <span key={i} className="tech-badge">{tech}</span>
                  ))}
                </div>
                <div className="project-links">
                  {project.liveUrl && <a href={project.liveUrl} className="project-link-primary" target="_blank" rel="noopener noreferrer">Live Demo →</a>}
                  {project.githubUrl && <a href={project.githubUrl} className="project-link" target="_blank" rel="noopener noreferrer">GitHub</a>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Projects;
