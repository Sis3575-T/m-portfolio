import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export const publicApi = {
  getHero: () => api.get('/hero/public'),
  getAbout: () => api.get('/about/public'),
  getSkills: (params) => api.get('/skills/public', { params }),
  getProjects: (params) => api.get('/projects/public', { params }),
  getExperiences: () => api.get('/experiences/public'),
  getEducation: () => api.get('/education/public'),
  getServices: () => api.get('/services/public'),
  getTestimonials: (params) => api.get('/testimonials/public', { params }),
  getBlogs: (params) => api.get('/blogs/public', { params }),
  getBlogBySlug: (slug) => api.get(`/blogs/slug/${slug}`),
  getCertificates: () => api.get('/certificates'),
  getSettings: () => api.get('/settings'),
  getHomePage: () => api.get('/pages/home'),
  getPageBySlug: (slug) => api.get(`/pages/slug/${slug}`),
  getSEO: (page) => api.get(`/seo/${page}`),
  submitMessage: (data) => api.post('/messages', data),

  searchAll: (query) => api.get(`/search/all?q=${encodeURIComponent(query)}`),
  searchProjects: (query) => api.get(`/search/projects?q=${encodeURIComponent(query)}`),
  searchBlogs: (query) => api.get(`/search/blogs?q=${encodeURIComponent(query)}`),

  trackVisit: (data) => api.post('/analytics/track/visit', data),
  trackAction: (data) => api.post('/analytics/track/action', data),
  trackPerformance: (data) => api.post('/performance/track', data),
  endSession: (data) => api.post('/analytics/end-session', data),

  getTranslations: (language) => api.get(`/translations?language=${language}`),
};

export const adminApi = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getVisitorStats: () => api.get('/analytics/visitors'),

  getHero: () => api.get('/hero'),
  updateHero: (id, data) => api.put(`/hero/${id}`, data),

  getAbout: () => api.get('/about'),
  updateAbout: (id, data) => api.put(`/about/${id}`, data),

  getSkills: () => api.get('/skills/all'),
  createSkill: (data) => api.post('/skills', data),
  updateSkill: (id, data) => api.put(`/skills/${id}`, data),
  deleteSkill: (id) => api.delete(`/skills/${id}`),

  getProjects: () => api.get('/projects/all'),
  createProject: (data) => api.post('/projects', data),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  toggleProject: (id) => api.patch(`/projects/${id}/toggle`),

  getExperiences: () => api.get('/experiences/all'),
  createExperience: (data) => api.post('/experiences', data),
  updateExperience: (id, data) => api.put(`/experiences/${id}`, data),
  deleteExperience: (id) => api.delete(`/experiences/${id}`),

  getEducation: () => api.get('/education/all'),
  createEducation: (data) => api.post('/education', data),
  updateEducation: (id, data) => api.put(`/education/${id}`, data),
  deleteEducation: (id) => api.delete(`/education/${id}`),

  getServices: () => api.get('/services/all'),
  createService: (data) => api.post('/services', data),
  updateService: (id, data) => api.put(`/services/${id}`, data),
  deleteService: (id) => api.delete(`/services/${id}`),

  getTestimonials: () => api.get('/testimonials/all'),
  createTestimonial: (data) => api.post('/testimonials', data),
  updateTestimonial: (id, data) => api.put(`/testimonials/${id}`, data),
  deleteTestimonial: (id) => api.delete(`/testimonials/${id}`),

  getBlogs: () => api.get('/blogs/all'),
  createBlog: (data) => api.post('/blogs', data),
  updateBlog: (id, data) => api.put(`/blogs/${id}`, data),
  deleteBlog: (id) => api.delete(`/blogs/${id}`),

  getMessages: (params) => api.get('/messages', { params }),
  getMessage: (id) => api.get(`/messages/${id}`),
  replyMessage: (id, data) => api.put(`/messages/${id}/reply`, data),
  deleteMessage: (id) => api.delete(`/messages/${id}`),
  markAsRead: (id) => api.patch(`/messages/${id}/read`),

  getMedia: (params) => api.get('/media', { params }),
  getMediaStats: () => api.get('/media/stats'),
  uploadMedia: (formData) => api.post('/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteMedia: (id) => api.delete(`/media/${id}`),

  getSEO: () => api.get('/seo'),
  updateSEO: (page, data) => api.put(`/seo/${page}`, data),
};

const apiHost = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api$/, '');

export function imageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return apiHost + url;
}

export default api;
