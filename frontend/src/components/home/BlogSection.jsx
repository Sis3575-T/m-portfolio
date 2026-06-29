import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { publicApi, imageUrl } from '../../utils/api';
import { FaClock, FaArrowRight } from 'react-icons/fa';

function BlogSection() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getBlogs()
      .then(({ data }) => setBlogs(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="blog" className="skills">
        <div className="skills-container" style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div className="spinner" />
        </div>
      </section>
    );
  }

  if (blogs.length === 0) return null;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <section id="blog" className="skills">
      <div className="skills-container">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="section-tag">Blog</span>
          <h2 className="section-title">Latest Posts</h2>
          <div className="section-line" />
          <p className="section-subtitle" style={{ margin: '1rem auto 0' }}>
            Thoughts, tutorials, and insights on web development.
          </p>
        </motion.div>

        <div className="project-grid" style={{ marginTop: '2.5rem' }}>
          {blogs.slice(0, 6).map((blog, idx) => (
            <motion.a
              key={blog._id}
              href={`/blog/${blog.slug}`}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="project-card blog-card"
              style={{ textDecoration: 'none', cursor: 'pointer' }}
            >
              {blog.coverImage && (
                <div className="project-img-wrap">
                  <img src={imageUrl(blog.coverImage)} alt={blog.title} className="project-img" />
                </div>
              )}
              <div className="project-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  {blog.category && <span className="project-tag">{blog.category}</span>}
                  {blog.readingTime && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FaClock size={11} /> {blog.readingTime} min read
                    </span>
                  )}
                </div>
                <h3 className="project-title" style={{ fontSize: '1rem', marginBottom: '0.4rem' }}>{blog.title}</h3>
                <p className="project-desc" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>{blog.excerpt}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                    {formatDate(blog.publishedAt || blog.createdAt)}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Read More <FaArrowRight size={10} />
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BlogSection;
