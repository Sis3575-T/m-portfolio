import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { publicApi, imageUrl } from '../utils/api';
import { useI18n } from '../utils/i18n.jsx';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';

function ProjectDetail() {
  const { id } = useParams();
  const { t } = useI18n();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data } = await publicApi.getProjects();
        const found = data.data.find(p => p._id === id);
        setProject(found);
      } catch (err) {
        console.error('Failed to load project');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] text-text-secondary">
      {t('projectDetail.loading')}
    </div>
  );
  if (!project) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <p className="text-lg text-text-secondary">{t('projectDetail.notFound')}</p>
      <Link to="/" className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-all">
        {t('projectDetail.backHome')}
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-surface">
      <div className="max-w-3xl mx-auto">
        <Helmet>
          <title>{project.title} — Sisay Temesgen</title>
        </Helmet>
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors mb-8">
          &larr; {t('projectDetail.backHome')}
        </Link>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
          {project.title}
        </h1>
        <div className="flex flex-wrap gap-2 mt-4 mb-8">
          {(project.technologies || project.techs || []).map(t => (
            <span key={t} className="px-2.5 py-1 rounded text-xs font-medium bg-accent/10 text-text-secondary border border-accent/20">
              {t}
            </span>
          ))}
        </div>
        <p className="text-base text-text-secondary leading-relaxed">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-3 mt-8">
          {(project.thumbnail || project.images?.length > 0) && (
            <div className="w-full mb-4">
              <img src={imageUrl(project.thumbnail || project.images[0])} alt={project.title} className="w-full rounded-xl border border-border" style={{ maxHeight: 400, objectFit: 'cover' }} />
            </div>
          )}
          {project.images && project.images.length > 1 && (
            <div className="w-full flex flex-wrap gap-2 mb-4">
              {project.images.slice(1).map((img, i) => (
                <img key={i} src={imageUrl(img)} alt={''} className="rounded-lg border border-border" style={{ width: 120, height: 80, objectFit: 'cover' }} />
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-3 w-full">
            {project.githubUrl ? (
              <a href={project.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-all">
                <FaGithub size={14} /> {t('projectDetail.github')}
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed">
                <FaGithub size={14} /> {t('projectDetail.github')}
              </span>
            )}
            {project.liveUrl ? (
              <a href={project.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-text-primary text-sm font-medium hover:border-border-hover transition-all">
                <FaExternalLinkAlt size={12} /> {t('projectDetail.liveDemo')}
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-200 text-gray-400 text-sm font-medium cursor-not-allowed">
                <FaExternalLinkAlt size={12} /> {t('projectDetail.liveDemo')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;
