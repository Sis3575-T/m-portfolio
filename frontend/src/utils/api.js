import backendApi from '../services/backendApi';

const API_TRACK_BASE = import.meta.env.PROD
  ? (import.meta.env.VITE_API_URL || 'https://m-portfolio-ecby.onrender.com').replace(/\/api$/, '').replace(/\/+$/, '') + '/api'
  : '/api';

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
      const res = await backendApi.getAbout();
      return { data: { data: res.data } };
    } catch {
      return wrap({});
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
  getCertificates: async () => {
    try {
      const res = await backendApi.getCertificates();
      return { data: { data: toBackend(res.data) } };
    } catch {
      return wrap([]);
    }
  },
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
  getVisitorId: () => {
    let vid = localStorage.getItem('portfolio_visitor_id');
    if (!vid) {
      vid = 'vis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('portfolio_visitor_id', vid);
    }
    return vid;
  },
  trackVisit: async (data) => {
    try {
      const visitorId = publicApi.getVisitorId();
      const body = {
        visitorId, sessionId: data.sessionId,
        browser: data.browser,
        screen: data.screenResolution || data.screen || '',
        viewport: data.viewport || '',
        language: data.language || '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
        referrer: data.referrer || '',
        url: data.page || data.url || '/',
      };
      await fetch(API_TRACK_BASE + '/track/identify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const pageBody = {
        visitorId, sessionId: data.sessionId,
        url: data.page || data.url || '/',
        pageTitle: data.title || document.title || '',
      };
      await fetch(API_TRACK_BASE + '/track/page-view', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pageBody),
      });
    } catch { return Promise.resolve(); }
  },
  trackAction: async (data) => {
    try {
      const visitorId = publicApi.getVisitorId();
      const body = {
        visitorId, sessionId: data.sessionId,
        eventType: data.type || data.eventType || 'click',
        element: data.target || data.element || '',
        value: data.label || data.value || '',
      };
      await fetch(API_TRACK_BASE + '/track/event', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
    } catch { return Promise.resolve(); }
  },
  trackPerformance: async (data) => {
    try {
      const res = await fetch(API_TRACK_BASE + '/performance/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    } catch { return Promise.resolve(); }
  },
  trackVisitLight: async (data) => {
    try {
      const visitorId = publicApi.getVisitorId();
      const deviceInfo = {
        browser: data.browser || '',
        os: data.os || '',
        deviceType: data.device || data.deviceType || '',
        screenResolution: data.screenResolution || data.screen || '',
        language: data.language || navigator.language || '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      };
      const body = { visitorId, sessionId: data.sessionId, url: data.page || '/', referrer: data.referrer || '', ...deviceInfo };
      await fetch(API_TRACK_BASE + '/analytics/visit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
    } catch { return Promise.resolve(); }
  },
  endSession: async (data) => {
    try {
      const visitorId = publicApi.getVisitorId();
      const body = { visitorId, ...data };
      const res = await fetch(API_TRACK_BASE + '/track/exit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return res.json();
    } catch { return Promise.resolve(); }
  },
  getTranslations: () => wrap({}),
};

export function imageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/src/')) return url;
  if (url.startsWith('/uploads/') && import.meta.env.PROD) {
    const base = (import.meta.env.VITE_API_URL || 'https://m-portfolio-ecby.onrender.com').replace(/\/api$/, '').replace(/\/+$/, '');
    return base + url;
  }
  if (url.startsWith('/')) return url;
  return `/${url}`;
}
