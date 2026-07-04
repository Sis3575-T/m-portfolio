import backendApi from '../services/backendApi';

function wrap(data) {
  return Promise.resolve({ data: { data } });
}

function toBackend(items) {
  return Array.isArray(items) ? items : [];
}

export const publicApi = {
  getHero: async () => {
    try {
      const res = await backendApi.getHero();
      return { data: { data: res.data } };
    } catch {
      const { default: pd } = await import('../data/portfolioData');
      return wrap(pd.hero);
    }
  },
  getAbout: async () => {
    try {
      const res = await backendApi.getSettings();
      return { data: { data: res.data } };
    } catch {
      const { default: pd } = await import('../data/portfolioData');
      return wrap(pd.settings);
    }
  },
  getSkills: async () => {
    try {
      const res = await backendApi.getSkills();
      return { data: { data: toBackend(res.data) } };
    } catch {
      const { default: pd } = await import('../data/portfolioData');
      return wrap(pd.skills);
    }
  },
  getProjects: async () => {
    try {
      const res = await backendApi.getProjects();
      return { data: { data: toBackend(res.data) } };
    } catch {
      const { default: pd } = await import('../data/portfolioData');
      return wrap(pd.projects);
    }
  },
  getExperiences: async () => {
    try {
      const res = await backendApi.getExperience();
      return { data: { data: toBackend(res.data) } };
    } catch {
      const { default: pd } = await import('../data/portfolioData');
      return wrap(pd.experience);
    }
  },
  getEducation: async () => {
    try {
      const res = await backendApi.getEducation();
      return { data: { data: toBackend(res.data) } };
    } catch {
      const { default: pd } = await import('../data/portfolioData');
      return wrap(pd.education);
    }
  },
  getServices: async () => {
    try {
      const res = await backendApi.getServices();
      return { data: { data: toBackend(res.data) } };
    } catch {
      return wrap([]);
    }
  },
  getTestimonials: async () => {
    try {
      const res = await backendApi.getTestimonials();
      return { data: { data: toBackend(res.data) } };
    } catch {
      return wrap([]);
    }
  },
  getBlogs: async () => {
    try {
      const res = await backendApi.getBlog();
      return { data: { data: toBackend(res.data) } };
    } catch {
      return wrap([]);
    }
  },
  getBlogBySlug: async (slug) => {
    try {
      const res = await backendApi.getBlog();
      const posts = toBackend(res.data);
      return wrap(posts.find(p => p.slug === slug) || null);
    } catch {
      return wrap(null);
    }
  },
  getCertificates: () => wrap([]),
  getSettings: async () => {
    try {
      const res = await backendApi.getSettings();
      return { data: { data: res.data } };
    } catch {
      const { default: pd } = await import('../data/portfolioData');
      return wrap(pd.settings);
    }
  },
  getHomePage: async () => {
    try {
      const res = await backendApi.getSiteConfig();
      return { data: { data: res.data } };
    } catch {
      const { default: pd } = await import('../data/portfolioData');
      return wrap({ sections: pd.sections, settings: pd.settings, navItems: pd.navItems });
    }
  },
  getPageBySlug: async (slug) => {
    try {
      const res = await backendApi.getNavigation();
      const items = Array.isArray(res.data) ? res.data : [];
      return wrap(items.find(p => p.slug === slug) || items.find(p => (p.name || '').toLowerCase().replace(/\s+/g, '-') === slug) || null);
    } catch {
      return wrap(null);
    }
  },
  getSEO: (page) => wrap({ title: '', description: '' }),
  submitMessage: async (data) => {
    try {
      await backendApi.submitContact(data);
      return { data: { message: 'Message sent successfully!' } };
    } catch {
      const messages = JSON.parse(localStorage.getItem('portfolio_contactMessages') || '[]');
      messages.push({ ...data, _id: Date.now().toString(), createdAt: new Date().toISOString() });
      localStorage.setItem('portfolio_contactMessages', JSON.stringify(messages));
      return { data: { message: 'Message sent successfully!' } };
    }
  },
  searchAll: async (query) => {
    const q = query.toLowerCase();
    try {
      const [projRes, blogRes] = await Promise.all([
        backendApi.getProjects().catch(() => ({ data: [] })),
        backendApi.getBlog().catch(() => ({ data: [] })),
      ]);
      const projects = toBackend(projRes.data).filter(p =>
        p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      );
      const blogs = toBackend(blogRes.data).filter(b =>
        b.title?.toLowerCase().includes(q) || b.excerpt?.toLowerCase().includes(q)
      );
      return wrap({ projects, blogs });
    } catch {
      return wrap({ projects: [], blogs: [] });
    }
  },
  searchProjects: async (query) => {
    const q = query.toLowerCase();
    try {
      const res = await backendApi.getProjects();
      return wrap(toBackend(res.data).filter(p =>
        p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      ));
    } catch {
      return wrap([]);
    }
  },
  searchBlogs: async (query) => {
    const q = query.toLowerCase();
    try {
      const res = await backendApi.getBlog();
      return wrap(toBackend(res.data).filter(b =>
        b.title?.toLowerCase().includes(q) || b.excerpt?.toLowerCase().includes(q)
      ));
    } catch {
      return wrap([]);
    }
  },
  trackVisit: () => Promise.resolve(),
  trackAction: () => Promise.resolve(),
  trackPerformance: () => Promise.resolve(),
  endSession: () => Promise.resolve(),
  getTranslations: () => wrap({}),
};

export function imageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('/src/') || url.startsWith('/')) return url;
  return `/${url}`;
}
