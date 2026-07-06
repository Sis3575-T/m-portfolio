import React, { useState, useEffect } from 'react';
import backendApi from '../services/backendApi';
import portfolioData from '../data/portfolioData';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import Experience from '../components/Experience';
import Education from '../components/Education';
import Services from '../components/Services';
import Certificates from '../components/Certificates';
import Projects from '../components/Projects';
import Contact from '../components/Contact';
import Blog from '../components/Blog';
import Footer from '../components/Footer';

export function applyTheme(theme) {
  if (!theme) return;
  const root = document.documentElement;
  const c = theme.colors || {};
  if (c.primary) root.style.setProperty('--primary-color', c.primary);
  if (c.secondary) root.style.setProperty('--secondary-color', c.secondary);
  if (c.background) root.style.setProperty('--bg-color', c.background);
  if (c.surface) root.style.setProperty('--surface-color', c.surface);
  if (c.card) root.style.setProperty('--card-bg', c.card);
  if (c.border) root.style.setProperty('--border-color', c.border);
  if (c.text) root.style.setProperty('--text-color', c.text);
  if (c.heading) root.style.setProperty('--heading-color', c.heading);
  if (c.link) root.style.setProperty('--link-color', c.link);
  if (c.success) root.style.setProperty('--success-color', c.success);
  if (c.warning) root.style.setProperty('--warning-color', c.warning);
  if (c.danger) root.style.setProperty('--danger-color', c.danger);
  if (theme.customCSS) {
    const existing = document.getElementById('theme-custom-css');
    if (existing) existing.remove();
    const style = document.createElement('style');
    style.id = 'theme-custom-css';
    style.textContent = theme.customCSS;
    document.head.appendChild(style);
  }
}

function setMetaTag(name, content) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    if (name.startsWith('og:')) el.setAttribute('property', name);
    else el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

const SECTION_MAP = {
  hero: [Hero, 'hero'],
  about: [About, null],
  skills: [Skills, 'skills'],
  experience: [Experience, 'experience'],
  education: [Education, 'education'],
  services: [Services, 'services'],
  certificates: [Certificates, 'certificates'],
  projects: [Projects, 'projects'],
  blog: [Blog, 'blog'],
  contact: [Contact, null],
};

function HomePage() {
  const [data, setData] = useState({
    loading: true,
    sections: null, settings: null, hero: null,
    navItems: [], projects: [], skills: [], experience: [],
    education: [], services: [], certificates: [], blog: [],
  });

  useEffect(() => {
    const load = async () => {
      try {
        const config = await backendApi.getSiteConfig();
        if (config?.success && config?.data) {
          const d = config.data;
          const [heroRes, projectsRes, skillsRes, expRes, eduRes, svcRes, certRes, blogRes] = await Promise.all([
            backendApi.getHero().catch(() => ({ data: null })),
            backendApi.getProjects().catch(() => ({ data: [] })),
            backendApi.getSkills().catch(() => ({ data: [] })),
            backendApi.getExperience().catch(() => ({ data: [] })),
            backendApi.getEducation().catch(() => ({ data: [] })),
            backendApi.getServices().catch(() => ({ data: [] })),
            backendApi.getCertificates().catch(() => ({ data: [] })),
            backendApi.getBlog().catch(() => ({ data: [] })),
          ]);
          setData({
            loading: false,
            sections: d.sections || null,
            settings: d.settings || null,
            navItems: (d.navItems || []).map(p => ({ _id: p._id, name: p.name || p.label, slug: p.slug })),
            hero: heroRes.data || null,
            projects: Array.isArray(projectsRes.data) ? projectsRes.data : [],
            skills: Array.isArray(skillsRes.data) ? skillsRes.data : [],
            experience: Array.isArray(expRes.data) ? expRes.data : [],
            education: Array.isArray(eduRes.data) ? eduRes.data : [],
            services: Array.isArray(svcRes.data) ? svcRes.data : [],
            certificates: Array.isArray(certRes.data) ? certRes.data : [],
            blog: Array.isArray(blogRes.data) ? blogRes.data : [],
          });
          return;
        }
      } catch {}
      // Fallback to static data
      const pd = portfolioData;
      setData({
        loading: false,
        sections: pd.sections || null,
        settings: pd.settings || null,
        navItems: pd.navItems || [],
        hero: pd.hero || null,
        projects: pd.projects || [],
        skills: pd.skills || [],
        experience: pd.experience || [],
        education: pd.education || [],
        services: pd.services || [],
        certificates: pd.certificates || [],
        blog: pd.blog || [],
      });
    };
    load();
  }, []);

  useEffect(() => {
    backendApi.getActiveTheme().then(res => {
      if (res.success && res.data) applyTheme(res.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (data.settings) {
      document.title = data.settings.seoTitle || data.settings.siteTitle || 'Sisay Temesgen — Portfolio';
      const desc = data.settings.seoDescription || data.settings.siteDescription || 'Full Stack Developer & AI Enthusiast';
      setMetaTag('description', desc);
      setMetaTag('og:title', document.title);
      setMetaTag('og:description', desc);
      if (data.settings.profilePhoto) setMetaTag('og:image', data.settings.profilePhoto);
    }
  }, [data.settings]);

  if (data.loading) return null;

  const { sections, settings, hero, projects, skills, experience, education, services, certificates, blog, navItems } = data;
  const dataMap = { hero, projects, skills, experience, education, services, certificates, blog };
  const sectionsToRender = sections?.filter(s => s.visible !== false && s.status === 'published' && SECTION_MAP[s.type]) || null;
  const hasSections = sectionsToRender?.length > 0;

  return (
    <div className="page">
      <Navbar navItems={navItems} settings={settings} />
      <main>
        {hasSections ? sectionsToRender.map(section => {
          const mapping = SECTION_MAP[section.type];
          if (!mapping) return null;
          const [Comp, dataKey] = mapping;
          const content = section.content || {};
          const extraProps = dataKey ? { [dataKey]: dataMap[dataKey] } : {};
          return <Comp key={section.type} {...extraProps} settings={settings} sectionTitle={content.title} sectionSubtitle={content.subtitle} navItems={navItems} />;
        }) : (
          <>
            <Hero hero={hero} settings={settings} />
            <About settings={settings} />
            <Skills skills={skills} settings={settings} />
            <Services services={services} settings={settings} />
            <Experience experience={experience} settings={settings} />
            <Projects projects={projects} settings={settings} />
            <Blog blog={blog} settings={settings} />
            <Contact settings={settings} />
          </>
        )}
      </main>
      <Footer settings={settings} />
    </div>
  );
}

export default HomePage;
