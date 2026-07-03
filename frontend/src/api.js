import axios from 'axios';

const defaultApiUrl = 'https://my-portfolio-4-s0bb.onrender.com/api/website';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl,
});

export const websiteApi = {
  getSiteConfig: () => api.get('/site-config'),
  getPages: () => api.get('/pages'),
  getPageBySlug: (slug) => api.get(`/pages/${slug}`),
  getSections: () => api.get('/sections'),
  getSettings: () => api.get('/settings'),
  getAbout: () => api.get('/about'),
  getHero: () => api.get('/hero'),
  getProjects: () => api.get('/projects'),
  getSkills: () => api.get('/skills'),
  getExperience: () => api.get('/experience'),
  getEducation: () => api.get('/education'),
  getCertificates: () => api.get('/certificates'),
  getTestimonials: () => api.get('/testimonials'),
  getServices: () => api.get('/services'),
  getBlog: () => api.get('/blog'),
  getTimeline: () => api.get('/timeline'),
  submitContact: (data) => api.post('/contact', data),
};

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const base = import.meta.env.VITE_API_URL?.replace('/api/website', '') || 'https://my-portfolio-4-s0bb.onrender.com';
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default api;
