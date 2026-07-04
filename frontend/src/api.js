import backendApi from './services/backendApi';

export const websiteApi = {
  getSiteConfig: async () => {
    try {
      const res = await backendApi.getSiteConfig();
      return { data: { data: res.data } };
    } catch {
      const { default: pd } = await import('./data/portfolioData');
      return Promise.resolve({ data: { data: { sections: pd.sections, settings: pd.settings, navItems: pd.navItems } } });
    }
  },
  getPages: async () => {
    try {
      const res = await backendApi.getSiteConfig();
      return { data: { data: res.data?.navItems || [] } };
    } catch {
      const { default: pd } = await import('./data/portfolioData');
      return Promise.resolve({ data: { data: pd.navItems } });
    }
  },
  getPageBySlug: async (slug) => {
    try {
      const res = await backendApi.getSiteConfig();
      const pages = res.data?.navItems || [];
      return { data: { data: pages.find(p => p.slug === slug) || null } };
    } catch {
      const { default: pd } = await import('./data/portfolioData');
      return Promise.resolve({ data: { data: pd.navItems.find(p => p.slug === slug) || null } });
    }
  },
  getSections: async () => {
    try {
      const res = await backendApi.getSiteConfig();
      return { data: { data: res.data?.sections || [] } };
    } catch {
      const { default: pd } = await import('./data/portfolioData');
      return Promise.resolve({ data: { data: pd.sections } });
    }
  },
  getSettings: async () => {
    try {
      const res = await backendApi.getSettings();
      return { data: { data: res.data } };
    } catch {
      const { default: pd } = await import('./data/portfolioData');
      return Promise.resolve({ data: { data: pd.settings } });
    }
  },
  getAbout: async () => {
    try {
      const res = await backendApi.getSettings();
      return { data: { data: res.data } };
    } catch {
      const { default: pd } = await import('./data/portfolioData');
      return Promise.resolve({ data: { data: pd.settings } });
    }
  },
  getHero: async () => {
    try {
      const res = await backendApi.getHero();
      return { data: { data: res.data } };
    } catch {
      const { default: pd } = await import('./data/portfolioData');
      return Promise.resolve({ data: { data: pd.hero } });
    }
  },
  getProjects: async () => {
    try {
      const res = await backendApi.getProjects();
      return { data: { data: res.data } };
    } catch {
      const { default: pd } = await import('./data/portfolioData');
      return Promise.resolve({ data: { data: pd.projects } });
    }
  },
  getSkills: async () => {
    try {
      const res = await backendApi.getSkills();
      return { data: { data: res.data } };
    } catch {
      const { default: pd } = await import('./data/portfolioData');
      return Promise.resolve({ data: { data: pd.skills } });
    }
  },
  getExperience: async () => {
    try {
      const res = await backendApi.getExperience();
      return { data: { data: res.data } };
    } catch {
      const { default: pd } = await import('./data/portfolioData');
      return Promise.resolve({ data: { data: pd.experience } });
    }
  },
  getEducation: async () => {
    try {
      const res = await backendApi.getEducation();
      return { data: { data: res.data } };
    } catch {
      const { default: pd } = await import('./data/portfolioData');
      return Promise.resolve({ data: { data: pd.education } });
    }
  },
  getCertificates: async () => {
    try {
      const res = await backendApi.getSiteConfig();
      return { data: { data: [] } };
    } catch {
      return Promise.resolve({ data: { data: [] } });
    }
  },
  getTestimonials: async () => {
    try {
      const res = await backendApi.getTestimonials();
      return { data: { data: res.data } };
    } catch {
      return Promise.resolve({ data: { data: [] } });
    }
  },
  getServices: async () => {
    try {
      const res = await backendApi.getServices();
      return { data: { data: res.data } };
    } catch {
      return Promise.resolve({ data: { data: [] } });
    }
  },
  getBlog: async () => {
    try {
      const res = await backendApi.getBlog();
      return { data: { data: res.data } };
    } catch {
      return Promise.resolve({ data: { data: [] } });
    }
  },
  getTimeline: () => Promise.resolve({ data: { data: [] } }),
  submitContact: async (data) => {
    try {
      const res = await backendApi.submitContact(data);
      return { data: { message: res.message || 'Message sent!' } };
    } catch {
      const messages = JSON.parse(localStorage.getItem('portfolio_contactMessages') || '[]');
      messages.push({ ...data, _id: Date.now().toString(), createdAt: new Date().toISOString() });
      localStorage.setItem('portfolio_contactMessages', JSON.stringify(messages));
      return Promise.resolve({ data: { message: 'Message sent successfully!' } });
    }
  },
};

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/src/')) return path;
  if (path.startsWith('/uploads/') && import.meta.env.PROD) {
    const base = (import.meta.env.VITE_API_URL || 'https://m-portfolio-ecby.onrender.com').replace(/\/api$/, '').replace(/\/+$/, '');
    return base + path;
  }
  if (path.startsWith('/')) return path;
  return `/${path}`;
};
