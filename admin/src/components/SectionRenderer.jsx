import React, { useState, useEffect } from 'react';
import { Icons, Icon } from '../lib/icons';
import { imageUrl, adminApi } from '../services/api';

const animationStyles = {
  fade: { opacity: 0, animation: 'sectionFadeIn var(--anim-duration, 1s) var(--anim-delay, 0s) forwards' },
  slide: { transform: 'translateY(30px)', opacity: 0, animation: 'sectionSlideIn var(--anim-duration, 1s) var(--anim-delay, 0s) forwards' },
  zoom: { transform: 'scale(0.95)', opacity: 0, animation: 'sectionZoomIn var(--anim-duration, 1s) var(--anim-delay, 0s) forwards' },
  flip: { transform: 'perspective(400px) rotateX(-10deg)', opacity: 0, animation: 'sectionFlipIn var(--anim-duration, 1s) var(--anim-delay, 0s) forwards' },
  rotate: { transform: 'rotate(-5deg) scale(0.9)', opacity: 0, animation: 'sectionRotateIn var(--anim-duration, 1s) var(--anim-delay, 0s) forwards' },
  bounce: { transform: 'translateY(-20px)', opacity: 0, animation: 'sectionBounceIn var(--anim-duration, 1s) var(--anim-delay, 0s) forwards' },
  scale: { transform: 'scale(0.8)', opacity: 0, animation: 'sectionScaleIn var(--anim-duration, 1s) var(--anim-delay, 0s) forwards' },
};

export function HeroSection({ section, data }) {
  const s = section;
  const c = s.content || {};
  const st = s.style || {};
  const l = s.layout || {};
  const m = s.media || {};
  const anim = s.animation || {};
  const animStyle = animationStyles[anim.type] || {};

  return (
    <div style={{
      padding: l.padding || '80px 0',
      background: m.backgroundImage ? `url(${imageUrl(m.backgroundImage)}) center/cover no-repeat` : st.background || '#ffffff',
      color: st.textColor || '#1a1a2e',
      textAlign: l.alignment || 'center',
      position: 'relative',
      minHeight: l.sectionHeight === 'fullscreen' ? '100vh' : l.sectionHeight === 'min-height' ? '400px' : 'auto',
      ...animStyle,
      '--anim-duration': `${anim.duration || 1}s`,
      '--anim-delay': `${anim.delay || 0}s`,
    }}>
      {m.overlayColor && (
        <div style={{ position: 'absolute', inset: 0, background: m.overlayColor, opacity: (m.overlayOpacity || 0) / 100, pointerEvents: 'none' }} />
      )}
      <div style={{
        maxWidth: l.containerWidth === 'boxed' ? 1100 : '100%',
        margin: '0 auto',
        padding: '0 24px',
        position: 'relative',
        zIndex: 1,
      }}>
        {c.title && <h1 style={{ fontSize: '2.8rem', fontWeight: 800, color: st.headingColor || st.textColor, margin: '0 0 16px', lineHeight: 1.15 }}>{c.title}</h1>}
        {c.subtitle && <p style={{ fontSize: '1.25rem', opacity: 0.85, margin: '0 0 12px', maxWidth: 600, marginLeft: l.alignment === 'center' ? 'auto' : 0, marginRight: l.alignment === 'center' ? 'auto' : 0 }}>{c.subtitle}</p>}
        {c.description && <p style={{ fontSize: '1rem', opacity: 0.75, margin: '0 0 24px', maxWidth: 600, marginLeft: l.alignment === 'center' ? 'auto' : 0, marginRight: l.alignment === 'center' ? 'auto' : 0, lineHeight: 1.7 }}>{c.description}</p>}
        {c.buttons && c.buttons.length > 0 && (
          <div style={{ display: 'flex', gap: 12, justifyContent: l.alignment === 'center' ? 'center' : l.alignment === 'right' ? 'flex-end' : 'flex-start', flexWrap: 'wrap' }}>
            {c.buttons.map((btn, i) => (
              <a key={i} href={btn.url || '#'} style={{
                padding: '12px 28px',
                borderRadius: st.buttonStyle === 'pill' ? 50 : st.buttonStyle === 'square' ? 4 : 8,
                background: btn.style === 'outline' ? 'transparent' : btn.style === 'ghost' ? 'transparent' : st.linkColor || '#3b82f6',
                color: btn.style === 'outline' ? st.linkColor || '#3b82f6' : btn.style === 'ghost' ? st.linkColor || '#3b82f6' : '#fff',
                border: btn.style === 'outline' ? `2px solid ${st.linkColor || '#3b82f6'}` : 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s',
              }}>
                {btn.icon && <Icon path={Icons[btn.icon] || Icons['external-link']} size={16} />}
                {btn.text}
              </a>
            ))}
          </div>
        )}
        {c.socialLinks && c.socialLinks.length > 0 && (
          <div style={{ display: 'flex', gap: 12, justifyContent: l.alignment === 'center' ? 'center' : l.alignment === 'right' ? 'flex-end' : 'flex-start', marginTop: 24 }}>
            {c.socialLinks.map((link, i) => (
              <a key={i} href={link.url || '#'} target="_blank" rel="noopener" style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: st.textColor, textDecoration: 'none', fontSize: '1.1rem' }}>
                {link.icon || link.platform?.charAt(0).toUpperCase()}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function AboutSection({ section, data }) {
  const s = section; const c = s.content || {}; const st = s.style || {}; const l = s.layout || {}; const m = s.media || {}; const anim = s.animation || {};
  const animStyle = animationStyles[anim.type] || {};
  return (
    <div style={{ padding: l.padding || '80px 0', background: m.backgroundImage ? `url(${imageUrl(m.backgroundImage)}) center/cover no-repeat` : st.background || '#f8f9fa', color: st.textColor || '#333', position: 'relative', ...animStyle, '--anim-duration': `${anim.duration || 1}s`, '--anim-delay': `${anim.delay || 0}s` }}>
      {m.overlayColor && <div style={{ position: 'absolute', inset: 0, background: m.overlayColor, opacity: (m.overlayOpacity || 0) / 100, pointerEvents: 'none' }} />}
      <div style={{ maxWidth: l.containerWidth === 'boxed' ? 1100 : '100%', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        {c.title && <h2 style={{ fontSize: '2rem', fontWeight: 700, color: st.headingColor || st.textColor, textAlign: 'center', margin: '0 0 8px' }}>{c.title}</h2>}
        {c.subtitle && <p style={{ textAlign: 'center', opacity: 0.7, margin: '0 0 32px', fontSize: '1.05rem' }}>{c.subtitle}</p>}
        <div style={{ display: 'flex', flexDirection: l.flexDirection === 'column' ? 'column' : 'row', gap: l.gap || '40px', alignItems: 'center' }}>
          {c.image && (
            <div style={{ flex: 1, maxWidth: 400 }}>
              <img src={imageUrl(c.image)} alt="" style={{ width: '100%', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
            </div>
          )}
          <div style={{ flex: 1 }}>
            {c.description && <p style={{ lineHeight: 1.8, fontSize: '0.95rem', opacity: 0.85, margin: '0 0 24px' }}>{c.description}</p>}
            {c.stats && c.stats.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(c.stats.length, 3)}, 1fr)`, gap: 16 }}>
                {c.stats.map((stat, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '16px', borderRadius: 10, background: 'rgba(255,255,255,0.5)' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: st.headingColor || st.textColor }}>{stat.value}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
            {c.buttons && c.buttons.length > 0 && (
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                {c.buttons.map((btn, i) => (
                  <a key={i} href={btn.url || '#'} style={{ padding: '10px 24px', borderRadius: st.buttonStyle === 'pill' ? 50 : 8, background: btn.style === 'outline' ? 'transparent' : st.linkColor || '#3b82f6', color: btn.style === 'outline' ? st.linkColor || '#3b82f6' : '#fff', border: btn.style === 'outline' ? `2px solid ${st.linkColor || '#3b82f6'}` : 'none', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    {btn.icon && <Icon path={Icons[btn.icon] || Icons.download} size={14} />}{btn.text}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectsSection({ section, data }) {
  const s = section; const c = s.content || {}; const st = s.style || {}; const l = s.layout || {}; const m = s.media || {}; const anim = s.animation || {};
  const animStyle = animationStyles[anim.type] || {};
  const projects = Array.isArray(data) ? data : [];
  const cols = l.columns || c.columns || 3;
  return (
    <div style={{ padding: l.padding || '80px 0', background: m.backgroundImage ? `url(${imageUrl(m.backgroundImage)}) center/cover no-repeat` : st.background || '#fff', color: st.textColor || '#333', ...animStyle, '--anim-duration': `${anim.duration || 1}s`, '--anim-delay': `${anim.delay || 0}s` }}>
      {m.overlayColor && <div style={{ position: 'absolute', inset: 0, background: m.overlayColor, opacity: (m.overlayOpacity || 0) / 100, pointerEvents: 'none' }} />}
      <div style={{ maxWidth: l.containerWidth === 'boxed' ? 1100 : '100%', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        {c.title && <h2 style={{ fontSize: '2rem', fontWeight: 700, color: st.headingColor || st.textColor, textAlign: 'center', margin: '0 0 8px' }}>{c.title}</h2>}
        {c.subtitle && <p style={{ textAlign: 'center', opacity: 0.7, margin: '0 0 32px' }}>{c.subtitle}</p>}
        {projects.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)' }}>No projects to display</p>}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: l.gap || '24px' }}>
          {projects.slice(0, 12).map((project, i) => (
            <div key={project._id || i} style={{ borderRadius: st.borderRadius ? `${st.borderRadius}px` : '12px', overflow: 'hidden', border: `1px solid ${st.cardStyle === 'bordered' ? 'var(--color-border)' : 'transparent'}`, boxShadow: st.shadow === 'none' ? 'none' : st.shadow === 'small' ? '0 2px 8px rgba(0,0,0,0.06)' : st.shadow === 'medium' ? '0 4px 16px rgba(0,0,0,0.08)' : '0 8px 32px rgba(0,0,0,0.1)', background: st.cardStyle === 'flat' ? 'transparent' : '#fff', transition: 'transform 0.2s' }}>
              {project.thumbnail && <img src={imageUrl(project.thumbnail)} alt="" style={{ width: '100%', height: 180, objectFit: 'cover' }} />}
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: st.headingColor || st.textColor, margin: '0 0 8px' }}>{project.title || 'Untitled'}</h3>
                <p style={{ fontSize: '0.85rem', opacity: 0.75, margin: '0 0 12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{project.description || ''}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(project.tags || []).slice(0, 3).map((tag, ti) => (
                    <span key={ti} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 4, background: st.linkColor ? `${st.linkColor}18` : '#eef2ff', color: st.linkColor || '#3b82f6' }}>{tag}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  {project.projectUrl && <a href={project.projectUrl} target="_blank" rel="noopener" style={{ color: st.linkColor || '#3b82f6', fontSize: '0.8rem', textDecoration: 'none' }}>Live →</a>}
                  {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener" style={{ color: st.linkColor || '#3b82f6', fontSize: '0.8rem', textDecoration: 'none' }}>GitHub →</a>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkillsSection({ section, data }) {
  const s = section; const c = s.content || {}; const l = s.layout || {}; const m = s.media || {}; const anim = s.animation || {};
  const animStyle = animationStyles[anim.type] || {};
  const [pageStyles, setPageStyles] = useState({});
  useEffect(() => {
    adminApi.getSettings().then(res => {
      const settings = res.data?.data || res.data?.settings || {};
      setPageStyles(settings.pageStyles?.skills || {});
    }).catch(() => {});
  }, []);
  const st = { ...s.style, ...pageStyles };
  const skills = Array.isArray(data) ? data : [];
  const cols = l.columns || c.columns || 2;
  return (
    <div style={{ padding: l.padding || '80px 0', background: pageStyles.bgColor || (m.backgroundImage ? `url(${imageUrl(m.backgroundImage)}) center/cover no-repeat` : st.background || '#f8f9fa'), color: st.textColor || '#333', ...animStyle, '--anim-duration': `${anim.duration || 1}s`, '--anim-delay': `${anim.delay || 0}s` }}>
      <div style={{ maxWidth: l.containerWidth === 'boxed' ? 1100 : '100%', margin: '0 auto', padding: '0 24px' }}>
        {c.title && <h2 style={{ fontSize: '2rem', fontWeight: 700, color: st.headingColor || st.textColor, textAlign: 'center', margin: '0 0 8px' }}>{c.title}</h2>}
        {c.subtitle && <p style={{ textAlign: 'center', opacity: 0.7, margin: '0 0 32px' }}>{c.subtitle}</p>}
        {skills.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)' }}>No skills to display</p>}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${c.layout === 'bars' ? 1 : cols}, 1fr)`, gap: '16px' }}>
          {skills.map((skill, i) => (
            <div key={skill._id || i} style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.7)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                {skill.icon && <span style={{ fontSize: '1.3rem' }}>{skill.icon}</span>}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{skill.name || 'Skill'}</div>
                  <div style={{ fontSize: '0.72rem', opacity: 0.6 }}>{skill.category || ''}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ExperienceSection({ section, data }) {
  const s = section; const c = s.content || {}; const st = s.style || {}; const l = s.layout || {}; const m = s.media || {}; const anim = s.animation || {};
  const animStyle = animationStyles[anim.type] || {};
  const items = Array.isArray(data) ? data : [];
  const layout = c.layout || 'alternating';
  return (
    <div style={{ padding: l.padding || '80px 0', background: m.backgroundImage ? `url(${imageUrl(m.backgroundImage)}) center/cover no-repeat` : st.background || '#fff', color: st.textColor || '#333', ...animStyle }}>
      <div style={{ maxWidth: l.containerWidth === 'boxed' ? 1100 : '100%', margin: '0 auto', padding: '0 24px' }}>
        {c.title && <h2 style={{ fontSize: '2rem', fontWeight: 700, color: st.headingColor || st.textColor, textAlign: 'center', margin: '0 0 8px' }}>{c.title}</h2>}
        {c.subtitle && <p style={{ textAlign: 'center', opacity: 0.7, margin: '0 0 32px' }}>{c.subtitle}</p>}
        {items.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)' }}>No experience entries</p>}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: st.linkColor || '#3b82f6', transform: 'translateX(-50%)', opacity: 0.3 }} />
          {items.map((item, i) => {
            const isLeft = layout === 'alternating' ? i % 2 === 0 : true;
            return (
              <div key={item._id || i} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 32, flexDirection: isLeft ? 'row' : 'row-reverse', position: 'relative' }}>
                <div style={{ flex: 1, padding: isLeft ? '0 40px 0 0' : '0 0 0 40px', textAlign: isLeft ? 'right' : 'left' }}>
                  <div style={{ padding: '16px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.8)', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: st.linkColor || '#3b82f6', marginBottom: 4 }}>{item.startDate || ''} - {item.endDate || 'Present'}</div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: st.headingColor || st.textColor, margin: '0 0 4px' }}>{item.position || item.title || ''}</h3>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.8, marginBottom: 8 }}>{item.company || ''}</div>
                    {item.description && <p style={{ fontSize: '0.85rem', opacity: 0.75, margin: 0, lineHeight: 1.6 }}>{item.description}</p>}
                  </div>
                </div>
                <div style={{ position: 'absolute', left: '50%', top: 24, width: 14, height: 14, borderRadius: '50%', background: st.linkColor || '#3b82f6', transform: 'translateX(-50%)', border: '3px solid #fff', zIndex: 1 }} />
                <div style={{ flex: 1 }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function EducationSection({ section, data }) {
  const s = section; const c = s.content || {}; const st = s.style || {}; const l = s.layout || {}; const m = s.media || {}; const anim = s.animation || {};
  const animStyle = animationStyles[anim.type] || {};
  const items = Array.isArray(data) ? data : [];
  const cols = l.columns || 2;
  return (
    <div style={{ padding: l.padding || '80px 0', background: m.backgroundImage ? `url(${imageUrl(m.backgroundImage)}) center/cover no-repeat` : st.background || '#f8f9fa', color: st.textColor || '#333', ...animStyle }}>
      <div style={{ maxWidth: l.containerWidth === 'boxed' ? 1100 : '100%', margin: '0 auto', padding: '0 24px' }}>
        {c.title && <h2 style={{ fontSize: '2rem', fontWeight: 700, color: st.headingColor || st.textColor, textAlign: 'center', margin: '0 0 8px' }}>{c.title}</h2>}
        {c.subtitle && <p style={{ textAlign: 'center', opacity: 0.7, margin: '0 0 32px' }}>{c.subtitle}</p>}
        {items.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)' }}>No education entries</p>}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: l.gap || '24px' }}>
          {items.map((item, i) => (
            <div key={item._id || i} style={{ padding: '20px', borderRadius: st.borderRadius ? `${st.borderRadius}px` : '12px', border: '1px solid var(--color-border)', background: '#fff', boxShadow: st.shadow === 'none' ? 'none' : '0 2px 8px rgba(0,0,0,0.06)' }}>
              {item.logo && <img src={imageUrl(item.logo)} alt="" style={{ width: 48, height: 48, borderRadius: 8, marginBottom: 12, objectFit: 'cover' }} />}
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: st.headingColor || st.textColor, margin: '0 0 4px' }}>{item.degree || item.title || ''}</h3>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.8, marginBottom: 4 }}>{item.school || item.institution || ''}</div>
              <div style={{ fontSize: '0.78rem', color: st.linkColor || '#3b82f6', marginBottom: 8 }}>{item.startDate || ''} - {item.endDate || ''}</div>
              {item.description && <p style={{ fontSize: '0.82rem', opacity: 0.75, margin: 0, lineHeight: 1.6 }}>{item.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CertificatesSection({ section, data }) {
  const s = section; const c = s.content || {}; const st = s.style || {}; const l = s.layout || {}; const anim = s.animation || {};
  const animStyle = animationStyles[anim.type] || {};
  const items = Array.isArray(data) ? data : [];
  const cols = l.columns || c.columns || 3;
  return (
    <div style={{ padding: l.padding || '80px 0', background: st.background || '#fff', color: st.textColor || '#333', ...animStyle }}>
      <div style={{ maxWidth: l.containerWidth === 'boxed' ? 1100 : '100%', margin: '0 auto', padding: '0 24px' }}>
        {c.title && <h2 style={{ fontSize: '2rem', fontWeight: 700, color: st.headingColor || st.textColor, textAlign: 'center', margin: '0 0 8px' }}>{c.title}</h2>}
        {c.subtitle && <p style={{ textAlign: 'center', opacity: 0.7, margin: '0 0 32px' }}>{c.subtitle}</p>}
        {items.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)' }}>No certificates</p>}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: l.gap || '24px' }}>
          {items.map((item, i) => (
            <div key={item._id || i} style={{ borderRadius: st.borderRadius ? `${st.borderRadius}px` : '12px', overflow: 'hidden', border: '1px solid var(--color-border)', background: '#fff', boxShadow: st.shadow === 'none' ? 'none' : '0 2px 8px rgba(0,0,0,0.06)' }}>
              {item.image && <img src={imageUrl(item.image)} alt="" style={{ width: '100%', height: 150, objectFit: 'cover' }} />}
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: st.headingColor || st.textColor, margin: '0 0 4px' }}>{item.title || 'Certificate'}</h3>
                <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: 4 }}>{item.issuer || ''}</div>
                <div style={{ fontSize: '0.75rem', color: st.linkColor || '#3b82f6' }}>{item.date ? new Date(item.date).toLocaleDateString() : ''}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection({ section, data }) {
  const s = section; const c = s.content || {}; const st = s.style || {}; const l = s.layout || {}; const anim = s.animation || {};
  const animStyle = animationStyles[anim.type] || {};
  const items = Array.isArray(data) ? data : [];
  const cols = l.columns || 2;
  return (
    <div style={{ padding: l.padding || '80px 0', background: st.background || '#f8f9fa', color: st.textColor || '#333', ...animStyle }}>
      <div style={{ maxWidth: l.containerWidth === 'boxed' ? 1100 : '100%', margin: '0 auto', padding: '0 24px' }}>
        {c.title && <h2 style={{ fontSize: '2rem', fontWeight: 700, color: st.headingColor || st.textColor, textAlign: 'center', margin: '0 0 8px' }}>{c.title}</h2>}
        {c.subtitle && <p style={{ textAlign: 'center', opacity: 0.7, margin: '0 0 32px' }}>{c.subtitle}</p>}
        {items.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)' }}>No testimonials</p>}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: l.gap || '24px' }}>
          {items.map((item, i) => (
            <div key={item._id || i} style={{ padding: '24px', borderRadius: st.borderRadius ? `${st.borderRadius}px` : '12px', border: '1px solid var(--color-border)', background: '#fff', boxShadow: st.shadow === 'none' ? 'none' : '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', color: st.linkColor || '#3b82f6', marginBottom: 12, opacity: 0.3 }}>"</div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.8, margin: '0 0 16px', fontStyle: 'italic' }}>{item.quote || item.content || ''}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                {item.avatar && <img src={imageUrl(item.avatar)} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />}
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: st.headingColor || st.textColor }}>{item.name || 'Anonymous'}</div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.6 }}>{item.role || ''}</div>
                </div>
              </div>
              {item.rating && (
                <div style={{ marginTop: 12, color: '#f59e0b', fontSize: '0.9rem' }}>
                  {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ServicesSection({ section, data }) {
  const s = section; const c = s.content || {}; const st = s.style || {}; const l = s.layout || {}; const anim = s.animation || {};
  const animStyle = animationStyles[anim.type] || {};
  const items = Array.isArray(data) ? data : [];
  const cols = l.columns || c.columns || 3;
  return (
    <div style={{ padding: l.padding || '80px 0', background: st.background || '#fff', color: st.textColor || '#333', ...animStyle }}>
      <div style={{ maxWidth: l.containerWidth === 'boxed' ? 1100 : '100%', margin: '0 auto', padding: '0 24px' }}>
        {c.title && <h2 style={{ fontSize: '2rem', fontWeight: 700, color: st.headingColor || st.textColor, textAlign: 'center', margin: '0 0 8px' }}>{c.title}</h2>}
        {c.subtitle && <p style={{ textAlign: 'center', opacity: 0.7, margin: '0 0 32px' }}>{c.subtitle}</p>}
        {items.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)' }}>No services</p>}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: l.gap || '24px' }}>
          {items.map((item, i) => (
            <div key={item._id || i} style={{ padding: '28px 20px', borderRadius: st.borderRadius ? `${st.borderRadius}px` : '12px', border: '1px solid var(--color-border)', background: '#fff', boxShadow: st.shadow === 'none' ? 'none' : '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
              {item.icon && <div style={{ fontSize: '2.5rem', marginBottom: 16, color: st.linkColor || '#3b82f6' }}>{item.icon}</div>}
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: st.headingColor || st.textColor, margin: '0 0 8px' }}>{item.title || 'Service'}</h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.75, margin: 0, lineHeight: 1.6 }}>{item.description || ''}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BlogSection({ section, data }) {
  const s = section; const c = s.content || {}; const st = s.style || {}; const l = s.layout || {}; const anim = s.animation || {};
  const animStyle = animationStyles[anim.type] || {};
  const posts = Array.isArray(data) ? data : [];
  const count = c.showCount || 3;
  const cols = c.columns || 3;
  const visible = posts.slice(0, count);
  return (
    <div style={{ padding: l.padding || '80px 0', background: st.background || '#f8f9fa', color: st.textColor || '#333', ...animStyle }}>
      <div style={{ maxWidth: l.containerWidth === 'boxed' ? 1100 : '100%', margin: '0 auto', padding: '0 24px' }}>
        {c.title && <h2 style={{ fontSize: '2rem', fontWeight: 700, color: st.headingColor || st.textColor, textAlign: 'center', margin: '0 0 8px' }}>{c.title}</h2>}
        {c.subtitle && <p style={{ textAlign: 'center', opacity: 0.7, margin: '0 0 32px' }}>{c.subtitle}</p>}
        {visible.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)' }}>No blog posts</p>}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: l.gap || '24px' }}>
          {visible.map((post, i) => (
            <div key={post._id || i} style={{ borderRadius: st.borderRadius ? `${st.borderRadius}px` : '12px', overflow: 'hidden', border: '1px solid var(--color-border)', background: '#fff', boxShadow: st.shadow === 'none' ? 'none' : '0 2px 8px rgba(0,0,0,0.06)' }}>
              {post.image && <img src={imageUrl(post.image)} alt="" style={{ width: '100%', height: 180, objectFit: 'cover' }} />}
              <div style={{ padding: '16px' }}>
                {c.showDate && post.createdAt && <div style={{ fontSize: '0.72rem', color: st.linkColor || '#3b82f6', marginBottom: 8 }}>{new Date(post.createdAt).toLocaleDateString()}</div>}
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: st.headingColor || st.textColor, margin: '0 0 8px' }}>{post.title || 'Untitled'}</h3>
                {c.showExcerpt && post.excerpt && <p style={{ fontSize: '0.82rem', opacity: 0.75, margin: '0 0 12px', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.excerpt}</p>}
                {c.showReadMore && <a href={post.slug ? `/blog/${post.slug}` : '#'} style={{ color: st.linkColor || '#3b82f6', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>Read More →</a>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ContactSection({ section, data }) {
  const s = section; const c = s.content || {}; const st = s.style || {}; const l = s.layout || {}; const anim = s.animation || {};
  const animStyle = animationStyles[anim.type] || {};
  return (
    <div style={{ padding: l.padding || '80px 0', background: st.background || '#fff', color: st.textColor || '#333', ...animStyle }}>
      <div style={{ maxWidth: l.containerWidth === 'boxed' ? 1100 : '100%', margin: '0 auto', padding: '0 24px' }}>
        {c.title && <h2 style={{ fontSize: '2rem', fontWeight: 700, color: st.headingColor || st.textColor, textAlign: 'center', margin: '0 0 8px' }}>{c.title}</h2>}
        {c.subtitle && <p style={{ textAlign: 'center', opacity: 0.7, margin: '0 0 32px' }}>{c.subtitle}</p>}
        <div style={{ display: 'flex', flexDirection: l.flexDirection === 'column' ? 'column' : 'row', gap: l.gap || '40px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input placeholder="Your Name" style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: '0.9rem', background: '#fff', color: '#333' }} />
              <input placeholder="Your Email" style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: '0.9rem', background: '#fff', color: '#333' }} />
              <textarea placeholder="Your Message" rows={5} style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: '0.9rem', background: '#fff', color: '#333', resize: 'vertical', fontFamily: 'inherit' }} />
              <button style={{ padding: '12px 28px', borderRadius: st.buttonStyle === 'pill' ? 50 : 8, background: st.linkColor || '#3b82f6', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', alignSelf: 'flex-start' }}>Send Message</button>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            {c.description && <p style={{ lineHeight: 1.8, opacity: 0.8, fontSize: '0.9rem', margin: '0 0 24px' }}>{c.description}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {c.email && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon path={Icons.mail} size={16} /> <span>{c.email}</span></div>}
              {c.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon path={Icons.phone} size={16} /> <span>{c.phone}</span></div>}
              {c.address && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon path={Icons['map-pin']} size={16} /> <span>{c.address}</span></div>}
            </div>
            {c.socialLinks && c.socialLinks.length > 0 && (
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                {c.socialLinks.map((link, i) => (
                  <a key={i} href={link.url || '#'} target="_blank" rel="noopener" style={{ width: 40, height: 40, borderRadius: '50%', background: st.linkColor || '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontSize: '0.9rem' }}>
                    {link.platform?.charAt(0).toUpperCase()}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function GallerySection({ section, data }) {
  const s = section; const c = s.content || {}; const st = s.style || {}; const l = s.layout || {}; const anim = s.animation || {};
  const animStyle = animationStyles[anim.type] || {};
  const images = Array.isArray(data) ? data : [];
  const cols = l.columns || c.columns || 3;
  return (
    <div style={{ padding: l.padding || '80px 0', background: st.background || '#f8f9fa', color: st.textColor || '#333', ...animStyle }}>
      <div style={{ maxWidth: l.containerWidth === 'boxed' ? 1100 : '100%', margin: '0 auto', padding: '0 24px' }}>
        {c.title && <h2 style={{ fontSize: '2rem', fontWeight: 700, color: st.headingColor || st.textColor, textAlign: 'center', margin: '0 0 8px' }}>{c.title}</h2>}
        {c.subtitle && <p style={{ textAlign: 'center', opacity: 0.7, margin: '0 0 32px' }}>{c.subtitle}</p>}
        {images.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)' }}>No images</p>}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: l.gap || '12px' }}>
          {images.map((img, i) => (
            <div key={i} style={{ borderRadius: st.borderRadius ? `${st.borderRadius}px` : '8px', overflow: 'hidden', aspectRatio: c.aspectRatio?.replace('/', '/') || '4/3', background: 'var(--color-bg-subtle)' }}>
              <img src={imageUrl(img.url || img.path || img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TimelineSection({ section, data }) {
  const s = section; const c = s.content || {}; const st = s.style || {}; const l = s.layout || {}; const anim = s.animation || {};
  const animStyle = animationStyles[anim.type] || {};
  const items = Array.isArray(data) ? data : [];
  return (
    <div style={{ padding: l.padding || '80px 0', background: st.background || '#fff', color: st.textColor || '#333', ...animStyle }}>
      <div style={{ maxWidth: l.containerWidth === 'boxed' ? 900 : '100%', margin: '0 auto', padding: '0 24px' }}>
        {c.title && <h2 style={{ fontSize: '2rem', fontWeight: 700, color: st.headingColor || st.textColor, textAlign: 'center', margin: '0 0 8px' }}>{c.title}</h2>}
        {c.subtitle && <p style={{ textAlign: 'center', opacity: 0.7, margin: '0 0 32px' }}>{c.subtitle}</p>}
        {items.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)' }}>No timeline events</p>}
        <div style={{ position: 'relative', paddingLeft: 30 }}>
          <div style={{ position: 'absolute', left: 12, top: 0, bottom: 0, width: 2, background: st.linkColor || '#3b82f6', opacity: 0.3 }} />
          {items.map((item, i) => (
            <div key={item._id || i} style={{ position: 'relative', paddingBottom: 24, paddingLeft: 20 }}>
              <div style={{ position: 'absolute', left: -26, top: 4, width: 12, height: 12, borderRadius: '50%', background: st.linkColor || '#3b82f6', border: '2px solid #fff' }} />
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: st.linkColor || '#3b82f6', marginBottom: 4 }}>{item.date || item.year || ''}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: st.headingColor || st.textColor, margin: '0 0 4px' }}>{item.title || item.event || ''}</h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.75, margin: 0, lineHeight: 1.6 }}>{item.description || ''}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FAQSection({ section, data }) {
  const s = section; const c = s.content || {}; const st = s.style || {}; const l = s.layout || {}; const anim = s.animation || {};
  const animStyle = animationStyles[anim.type] || {};
  const [openIdx, setOpenIdx] = useState(null);
  const items = c.items || (Array.isArray(data) ? data : []);
  return (
    <div style={{ padding: l.padding || '80px 0', background: st.background || '#f8f9fa', color: st.textColor || '#333', ...animStyle }}>
      <div style={{ maxWidth: l.containerWidth === 'boxed' ? 800 : '100%', margin: '0 auto', padding: '0 24px' }}>
        {c.title && <h2 style={{ fontSize: '2rem', fontWeight: 700, color: st.headingColor || st.textColor, textAlign: 'center', margin: '0 0 8px' }}>{c.title}</h2>}
        {c.subtitle && <p style={{ textAlign: 'center', opacity: 0.7, margin: '0 0 32px' }}>{c.subtitle}</p>}
        {items.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)' }}>No FAQs</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((item, i) => (
            <div key={i} style={{ borderRadius: st.borderRadius ? `${st.borderRadius}px` : '8px', overflow: 'hidden', border: '1px solid var(--color-border)', background: '#fff' }}>
              <button onClick={() => setOpenIdx(openIdx === i ? null : i)} style={{ width: '100%', padding: '14px 18px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600, color: st.headingColor || st.textColor, fontFamily: 'inherit', textAlign: 'left' }}>
                <span>{item.question || 'Question'}</span>
                <Icon path={Icons['chevron-down']} size={16} style={{ transform: openIdx === i ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }} />
              </button>
              {openIdx === i && (
                <div style={{ padding: '0 18px 14px', fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.7 }}>{item.answer || ''}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CTASection({ section, data }) {
  const s = section; const c = s.content || {}; const st = s.style || {}; const l = s.layout || {}; const m = s.media || {}; const anim = s.animation || {};
  const animStyle = animationStyles[anim.type] || {};
  return (
    <div style={{ padding: l.padding || '80px 0', background: m.backgroundImage ? `url(${imageUrl(m.backgroundImage)}) center/cover no-repeat` : st.background || '#1a1a2e', color: st.textColor || '#fff', textAlign: 'center', position: 'relative', ...animStyle }}>
      {m.overlayColor && <div style={{ position: 'absolute', inset: 0, background: m.overlayColor, opacity: (m.overlayOpacity || 0) / 100, pointerEvents: 'none' }} />}
      <div style={{ maxWidth: l.containerWidth === 'boxed' ? 800 : '100%', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        {c.title && <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: st.headingColor || st.textColor, margin: '0 0 12px' }}>{c.title}</h2>}
        {c.description && <p style={{ fontSize: '1.05rem', opacity: 0.85, margin: '0 0 24px', lineHeight: 1.7 }}>{c.description}</p>}
        {c.buttonText && (
          <a href={c.buttonUrl || '#'} style={{ padding: '14px 36px', borderRadius: st.buttonStyle === 'pill' ? 50 : 8, background: st.linkColor || '#3b82f6', color: '#fff', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', display: 'inline-block', border: 'none', cursor: 'pointer' }}>
            {c.buttonText}
          </a>
        )}
      </div>
    </div>
  );
}

export function StatisticsSection({ section, data }) {
  const s = section; const c = s.content || {}; const st = s.style || {}; const l = s.layout || {}; const anim = s.animation || {};
  const animStyle = animationStyles[anim.type] || {};
  const items = c.items && c.items.length > 0 ? c.items : (Array.isArray(data) ? data : []);
  const cols = l.columns || c.columns || 4;
  return (
    <div style={{ padding: l.padding || '80px 0', background: st.background || '#f8f9fa', color: st.textColor || '#333', ...animStyle }}>
      <div style={{ maxWidth: l.containerWidth === 'boxed' ? 1100 : '100%', margin: '0 auto', padding: '0 24px' }}>
        {c.title && <h2 style={{ fontSize: '2rem', fontWeight: 700, color: st.headingColor || st.textColor, textAlign: 'center', margin: '0 0 8px' }}>{c.title}</h2>}
        {c.subtitle && <p style={{ textAlign: 'center', opacity: 0.7, margin: '0 0 32px' }}>{c.subtitle}</p>}
        {items.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)' }}>No statistics</p>}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: l.gap || '24px' }}>
          {items.map((item, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '24px 16px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: st.headingColor || st.textColor, lineHeight: 1.1, marginBottom: 8 }}>
                {item.value || '0'}{item.suffix || ''}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>{item.label || ''}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CustomSection({ section, data }) {
  const s = section; const c = s.content || {}; const st = s.style || {}; const l = s.layout || {}; const anim = s.animation || {};
  const animStyle = animationStyles[anim.type] || {};
  return (
    <div style={{ padding: l.padding || '80px 0', background: st.background || '#fff', color: st.textColor || '#333', ...animStyle }}>
      <div style={{ maxWidth: l.containerWidth === 'boxed' ? 1100 : '100%', margin: '0 auto', padding: '0 24px' }}>
        {c.title && <h2 style={{ fontSize: '2rem', fontWeight: 700, color: st.headingColor || st.textColor, textAlign: 'center', margin: '0 0 24px' }}>{c.title}</h2>}
        <div dangerouslySetInnerHTML={{ __html: c.html || '' }} />
      </div>
    </div>
  );
}

const sectionComponentMap = {
  hero: HeroSection,
  about: AboutSection,
  projects: ProjectsSection,
  skills: SkillsSection,
  experience: ExperienceSection,
  education: EducationSection,
  certificates: CertificatesSection,
  testimonials: TestimonialsSection,
  services: ServicesSection,
  blog: BlogSection,
  contact: ContactSection,
  gallery: GallerySection,
  timeline: TimelineSection,
  faq: FAQSection,
  cta: CTASection,
  statistics: StatisticsSection,
  custom: CustomSection,
};

export default function SectionRenderer({ section, data, editable, onEdit }) {
  const Component = sectionComponentMap[section?.type];
  if (!Component) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-text-tertiary)', border: '1px dashed var(--color-border)', borderRadius: 8, margin: 8 }}>
        Unknown section type: {section?.type}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }} className="section-renderer-wrapper">
      <Component section={section} data={data} />
      {editable && (
        <div
          className="section-edit-overlay"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            padding: '6px 12px',
            background: 'var(--color-primary)',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 600,
            borderBottomLeftRadius: 8,
            cursor: 'pointer',
            opacity: 0,
            transition: 'opacity 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            zIndex: 10,
          }}
          onClick={(e) => { e.stopPropagation(); onEdit && onEdit(section); }}
        >
          <Icon path={Icons.edit} size={12} /> Edit
        </div>
      )}
      <style>{`
        .section-renderer-wrapper:hover .section-edit-overlay {
          opacity: 1;
        }
        @keyframes sectionFadeIn {
          to { opacity: 1; }
        }
        @keyframes sectionSlideIn {
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes sectionZoomIn {
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes sectionFlipIn {
          to { transform: perspective(400px) rotateX(0); opacity: 1; }
        }
        @keyframes sectionRotateIn {
          to { transform: rotate(0) scale(1); opacity: 1; }
        }
        @keyframes sectionBounceIn {
          0% { transform: translateY(-20px); opacity: 0; }
          50% { transform: translateY(5px); opacity: 0.5; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes sectionScaleIn {
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
