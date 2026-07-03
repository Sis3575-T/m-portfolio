import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
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
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api(\/website)?$/, '');
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default api;
