import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../api';

function Blog({ posts, settings, sectionTitle, sectionSubtitle }) {
  if (!posts || posts.length === 0) return null;

  const latest = posts.slice(0, 3);

  const pageStyles = settings?.pageStyles?.blog || {};
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
      const id = 'blog-custom-css';
      let el = document.getElementById(id);
      if (!el) { el = document.createElement('style'); el.id = id; document.head.appendChild(el); }
      el.textContent = pageStyles.customCss;
      return () => { const e = document.getElementById(id); if (e) e.remove(); };
    }
  }, [pageStyles.customCss]);

  return (
    <section className="blog section" id="blog" style={sectionStyle}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{sectionTitle || 'Latest Posts'}</h2>
          {sectionSubtitle && <p className="section-subtitle">{sectionSubtitle}</p>}
          <div className="section-divider" />
        </div>
        <div className="blog-grid">
          {latest.map(post => (
            <Link to={`/blog/${post.slug}`} key={post._id} className="blog-card">
              <div className="blog-card-image">
                {post.coverImage ? (
                  <img src={getImageUrl(post.coverImage)} alt={post.title} loading="lazy" />
                ) : (
                  <div className="blog-card-placeholder">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="blog-card-body">
                <div className="blog-card-meta">
                  {post.category && <span className="blog-card-category">{post.category}</span>}
                  {post.readingTime && <span className="blog-card-read">{post.readingTime} min read</span>}
                </div>
                <h3 className="blog-card-title">{post.title}</h3>
                <p className="blog-card-excerpt">{post.excerpt?.substring(0, 120)}{post.excerpt?.length > 120 ? '...' : ''}</p>
                <div className="blog-card-footer">
                  <span className="blog-card-date">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}
                  </span>
                  <span className="blog-card-readmore">Read More</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {posts.length > 3 && (
          <div className="blog-view-all">
            <Link to="/blog" className="btn btn-outline">View All Posts</Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default Blog;
