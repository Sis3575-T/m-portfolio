import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { websiteApi, getImageUrl } from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function ProjectsPage() {
  const [data, setData] = useState({ loading: true, error: null, projects: [] });

  useEffect(() => {
    websiteApi.getProjects()
      .then(res => {
        const projects = res.data.data || [];
        setData({ loading: false, error: null, projects: projects.filter(p => p.isVisible !== false && p.status !== 'draft') });
      })
      .catch(err => {
        setData({ loading: false, error: err.message, projects: [] });
      });
  }, []);

  if (data.loading) {
    return (
      <div className="page">
        <Navbar />
        <div className="container" style={{ padding: '6rem 0' }}>
          <LoadingSkeleton variant="card" count={6} />
        </div>
        <Footer />
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="page">
        <Navbar />
        <div className="container" style={{ padding: '6rem 0' }}>
          <ErrorState message={data.error} onRetry={() => window.location.reload()} />
        </div>
        <Footer />
      </div>
    );
  }

  const { projects } = data;

  return (
    <div className="page">
      <Navbar />
      <main className="projects-page">
        <div className="container">
          <div className="projects-page-header">
            <Link to="/" className="back-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Back to Home
            </Link>
            <span className="section-tag">Portfolio</span>
            <h1 className="projects-page-title">My Projects</h1>
            <p className="projects-page-subtitle">A collection of projects I've built and contributed to.</p>
            <div className="section-line" />
          </div>

          {projects.length === 0 ? (
            <div className="projects-empty">
              <p>No projects to display yet. Check back soon!</p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map(project => (
                <div key={project._id} className="project-card">
                  <div className="project-image">
                    <div className="project-image-placeholder">
                      {project.thumbnail ? (
                        <img src={getImageUrl(project.thumbnail)} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        project.title?.charAt(0) || 'P'
                      )}
                      <div className="project-image-overlay">
                        {project.liveUrl && <a href={project.liveUrl} className="project-link-primary" target="_blank" rel="noopener noreferrer">Live Demo</a>}
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
                      <Link to={`/projects/${project._id}`} className="project-link-primary">View Details</Link>
                      {project.githubUrl && <a href={project.githubUrl} className="project-link" target="_blank" rel="noopener noreferrer">GitHub</a>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ProjectsPage;
