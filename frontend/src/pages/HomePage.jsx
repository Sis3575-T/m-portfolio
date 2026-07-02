import React, { useState, useEffect, useCallback } from 'react';
import { websiteApi } from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import Experience from '../components/Experience';
import Education from '../components/Education';
import Projects from '../components/Projects';
import Testimonials from '../components/Testimonials';
import Services from '../components/Services';
import Blog from '../components/Blog';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const SECTION_MAP = {
  hero: [Hero, 'hero'],
  about: [About, null],
  skills: [Skills, 'skills'],
  experience: [Experience, 'experience'],
  education: [Education, 'education'],
  projects: [Projects, 'projects'],
  testimonials: [Testimonials, 'testimonials'],
  services: [Services, 'services'],
  blog: [Blog, 'posts'],
  contact: [Contact, null],
  certificates: [null, null],
};

function HomePage() {
  const [data, setData] = useState({
    loading: true,
    error: null,
    sections: null,
    settings: null,
    hero: null,
    projects: [],
    skills: [],
    experience: [],
    education: [],
    testimonials: [],
    services: [],
    blog: [],
  });

  const fetchData = useCallback(() => {
    setData(prev => ({ ...prev, loading: true, error: null }));

    const resolveData = (promise, fallback = null) =>
      promise
        .then((res) => res?.data?.data ?? fallback)
        .catch(() => fallback);

    Promise.all([
      resolveData(websiteApi.getSiteConfig(), null),
      resolveData(websiteApi.getHero(), null),
      resolveData(websiteApi.getProjects(), []),
      resolveData(websiteApi.getSkills(), []),
      resolveData(websiteApi.getExperience(), []),
      resolveData(websiteApi.getEducation(), []),
      resolveData(websiteApi.getTestimonials(), []),
      resolveData(websiteApi.getServices(), []),
      resolveData(websiteApi.getBlog(), []),
    ])
      .then(([config, hero, projects, skills, experience, education, testimonials, services, blog]) => {
        setData({
          loading: false,
          error: null,
          sections: config?.sections || null,
          settings: config?.settings || null,
          navItems: config?.navItems || [],
          hero,
          projects,
          skills,
          experience,
          education,
          testimonials,
          services,
          blog,
        });
      })
      .catch(err => {
        setData(prev => ({ ...prev, loading: false, error: err.message || 'Failed to load portfolio content.' }));
      });
  }, []);

  useEffect(() => {
    fetchData();
    const onFocus = () => fetchData();
    const interval = setInterval(fetchData, 30000);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) fetchData();
    });
    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, [fetchData]);

  if (data.loading) {
    return (
      <div className="page">
        <div className="navbar-placeholder" />
        <div className="container" style={{ padding: '4rem 0' }}>
          <LoadingSkeleton variant="card" count={6} />
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="page">
        <div className="navbar-placeholder" />
        <div className="container" style={{ padding: '4rem 0' }}>
          <ErrorState message={data.error} onRetry={fetchData} />
        </div>
      </div>
    );
  }

  const { sections, settings, hero, projects, skills, experience, education, testimonials, services, blog, navItems } = data;

  const dataMap = { hero, projects, skills, experience, education, testimonials, services, blog };

  const sectionsToRender = sections && sections.length > 0
    ? sections.filter(s => s.visible !== false && s.status === 'published')
    : null;
  const hasSections = sectionsToRender && sectionsToRender.length > 0;

  return (
    <div className="page">
      <Navbar navItems={navItems} settings={settings} />
      <main>
        {hasSections ? (
          sectionsToRender.map(section => {
            const mapping = SECTION_MAP[section.type];
            if (!mapping) return null;
            const [Comp, dataKey] = mapping;
            if (!Comp) return null;
            const content = section.content || {};
            const extraProps = dataKey ? { [dataKey]: dataMap[dataKey] } : {};
            return (
              <Comp
                key={section.type}
                {...extraProps}
                settings={settings}
                sectionTitle={content.title}
                sectionSubtitle={content.subtitle}
                navItems={navItems}
              />
            );
          })
        ) : (
          <>
            <Hero hero={hero} settings={settings} />
            <About settings={settings} />
            <Skills skills={skills} settings={settings} />
            <Experience experience={experience} settings={settings} />
            <Education education={education} settings={settings} />
            <Projects projects={projects} settings={settings} />
            <Testimonials testimonials={testimonials} settings={settings} />
            <Services services={services} settings={settings} />
            <Blog posts={blog} settings={settings} />
            <Contact settings={settings} />
          </>
        )}
      </main>
      <Footer settings={settings} navItems={navItems} />
    </div>
  );
}

export default HomePage;
