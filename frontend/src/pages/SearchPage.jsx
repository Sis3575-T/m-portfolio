import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiSearch, FiArrowRight, FiFileText, FiCode } from 'react-icons/fi';
import { FaFolder, FaGithub, FaExternalLinkAlt, FaBlog } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { publicApi, imageUrl } from '../utils/api';
import { useI18n } from '../utils/i18n.jsx';

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [projects, setProjects] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const { t, language, setLanguage } = useI18n();

  useEffect(() => {
    const fetch = async () => {
      try {
        if (query.trim()) {
          const [projRes, blogRes, skillRes] = await Promise.all([
            publicApi.searchProjects(query),
            publicApi.searchBlogs(query),
            publicApi.getSkills(),
          ]);
          setProjects(projRes.data.data || projRes.data || []);
          setBlogs(blogRes.data.data || blogRes.data || []);
          setSkills((skillRes.data.data || skillRes.data || []).filter(s =>
            s.name?.toLowerCase().includes(query.toLowerCase())
          ));
        } else {
          const [projRes, blogRes, skillRes] = await Promise.all([
            publicApi.getProjects({ limit: 50 }),
            publicApi.getBlogs({ limit: 50 }),
            publicApi.getSkills(),
          ]);
          setProjects(projRes.data.data || []);
          setBlogs(blogRes.data.data || []);
          setSkills(skillRes.data.data || []);
        }
      } catch { /* ignore */ }
      setLoaded(true);
    };
    fetch();
  }, [query]);

  const results = useMemo(() => {
    if (!query.trim()) return { projects, blogs, skills: [] };
    const q = query.toLowerCase();
    return {
      projects: projects.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        (p.technologies || []).some(t => t.toLowerCase().includes(q))
      ),
      blogs: blogs.filter(b =>
        b.title?.toLowerCase().includes(q) ||
        b.content?.toLowerCase().includes(q) ||
        (b.tags || []).some(t => t.toLowerCase().includes(q))
      ),
      skills: skills.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        (s.category || '').toLowerCase().includes(q)
      ),
    };
  }, [query, projects, blogs, skills]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    } else {
      setSearchParams({});
    }
  }, [query, setSearchParams]);

  const totalResults = results.projects.length + results.blogs.length + results.skills.length;

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <Helmet>
        <title>{query ? `${t('search.title')}: ${query} | Sisay Temesgen` : `${t('search.title')} | Sisay Temesgen`}</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSearch} className="mb-10">
          <div className="flex items-center gap-3 p-4 rounded-xl"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <FiSearch size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className="flex-1 bg-transparent border-none outline-none text-base"
              style={{ color: 'var(--text-white)', fontFamily: 'inherit' }}
              autoFocus
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm font-semibold border-none cursor-pointer transition-all"
              style={{
                background: 'var(--primary-color)',
                color: '#fff',
              }}
            >
              {t('search.title')}
            </button>
          </div>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          {loaded && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {query
                ? `${totalResults} ${t('search.noResults')} "${query}"`
                : `Showing all ${totalResults} items`
              }
            </p>
          )}
          <button
            onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold border-none cursor-pointer transition-all"
            style={{
              background: 'var(--primary-color)',
              color: '#fff',
              opacity: 0.9,
            }}
            title={`Switch to ${language === 'en' ? 'Amharic' : 'English'}`}
          >
            {language === 'en' ? 'አማርኛ' : 'EN'}
          </button>
        </div>

        {loaded && totalResults === 0 && (
          <div className="text-center py-20">
            <p className="text-xl mb-2" style={{ color: 'var(--text-white)' }}>{t('search.noResults')} "{query}"</p>
            <p style={{ color: 'var(--text-muted)' }}>Try searching for different keywords or browse all projects above.</p>
          </div>
        )}

        {results.projects.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--text-white)' }}>
              <FaFolder size={18} style={{ color: 'var(--primary-color)' }} /> Projects ({results.projects.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {results.projects.map((project, idx) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="rounded-xl overflow-hidden transition-all duration-300"
                  style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <div className="h-40 overflow-hidden" style={{ background: 'rgba(124, 58, 237, 0.06)' }}>
                    {project.thumbnail ? (
                      <img src={imageUrl(project.thumbnail)} alt={project.title} className="w-full h-full object-cover" />
                    ) : project.images && project.images.length > 0 ? (
                      <img src={imageUrl(project.images[0])} alt={project.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaFolder size={40} style={{ color: 'var(--primary-color)', opacity: 0.3 }} />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-white)' }}>{project.title}</h3>
                    <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-light)', lineHeight: 1.6 }}>{project.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {(project.technologies || []).slice(0, 3).map(tech => (
                        <span key={tech} className="px-2 py-0.5 text-xs font-medium rounded"
                          style={{
                            background: 'rgba(34, 211, 238, 0.1)',
                            color: 'var(--primary-color)',
                            border: '1px solid rgba(34, 211, 238, 0.15)',
                          }}
                        >{tech}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <Link to={`/project/${project._id}`} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold no-underline transition-all"
                        style={{
                          background: 'var(--primary-color)',
                          color: '#fff',
                        }}
                      >
                        View Details <FiArrowRight size={13} />
                      </Link>
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--text-light)' }}>
                          <FaGithub size={18} />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--text-light)' }}>
                          <FaExternalLinkAlt size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {results.blogs.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--text-white)' }}>
              <FaBlog size={18} style={{ color: 'var(--primary-color)' }} /> Blog Posts ({results.blogs.length})
            </h2>
            <div className="space-y-4">
              {results.blogs.map((blog, idx) => (
                <motion.div
                  key={blog._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="p-5 rounded-xl"
                  style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <Link to={`/blog/${blog.slug}`} style={{ textDecoration: 'none' }}>
                    <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-white)' }}>{blog.title}</h3>
                  </Link>
                  <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                    {new Date(blog.createdAt || blog.date).toLocaleDateString()} · {(blog.tags || []).join(', ')}
                  </p>
                  <p className="text-sm line-clamp-2" style={{ color: 'var(--text-light)' }}>{blog.excerpt || blog.content}</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {results.skills.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--text-white)' }}>
              <FiCode size={18} style={{ color: 'var(--primary-color)' }} /> Skills ({results.skills.length})
            </h2>
            <div className="flex flex-wrap gap-3">
              {results.skills.map((skill, idx) => (
                <motion.span
                  key={skill._id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.03 }}
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{
                    background: 'rgba(34, 211, 238, 0.1)',
                    color: 'var(--primary-color)',
                    border: '1px solid rgba(34, 211, 238, 0.15)',
                  }}
                >
                  {skill.name}
                </motion.span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default SearchPage;