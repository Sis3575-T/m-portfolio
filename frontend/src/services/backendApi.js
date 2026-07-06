const API_BASE = import.meta.env.PROD
  ? ((import.meta.env.VITE_API_URL || 'https://m-portfolio-ecby.onrender.com').replace(/\/api$/, '').replace(/\/+$/, '') + '/api')
  : '/api';

function getToken() {
  return localStorage.getItem('portfolio_admin_token');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.message || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const backendApi = {
  // Auth
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  getMe: () =>
    request('/auth/me'),

  // Settings
  getSettings: () =>
    request('/website/settings'),

  updateSettings: (data) =>
    request('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // About
  getAbout: () =>
    request('/website/about'),

  // Hero
  getHero: () =>
    request('/website/hero'),

  updateHero: (data) =>
    request('/hero', { method: 'PUT', body: JSON.stringify(data) }),

  getHeroAdmin: () =>
    request('/hero'),

  // Skills
  getSkills: () =>
    request('/website/skills'),

  getSkillsAdmin: () =>
    request('/skills/all'),

  createSkill: (data) =>
    request('/skills', { method: 'POST', body: JSON.stringify(data) }),

  updateSkill: (id, data) =>
    request(`/skills/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteSkill: (id) =>
    request(`/skills/${id}`, { method: 'DELETE' }),

  // Projects
  getProjects: () =>
    request('/website/projects'),

  getProjectsAdmin: () =>
    request('/projects/all'),

  createProject: (data) =>
    request('/projects', { method: 'POST', body: JSON.stringify(data) }),

  updateProject: (id, data) =>
    request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteProject: (id) =>
    request(`/projects/${id}`, { method: 'DELETE' }),

  // Experience
  getExperience: () =>
    request('/website/experience'),

  getExperienceAdmin: () =>
    request('/experiences/all'),

  createExperience: (data) =>
    request('/experiences', { method: 'POST', body: JSON.stringify(data) }),

  updateExperience: (id, data) =>
    request(`/experiences/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteExperience: (id) =>
    request(`/experiences/${id}`, { method: 'DELETE' }),

  // Education
  getEducation: () =>
    request('/website/education'),

  getEducationAdmin: () =>
    request('/education/all'),

  createEducation: (data) =>
    request('/education', { method: 'POST', body: JSON.stringify(data) }),

  updateEducation: (id, data) =>
    request(`/education/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteEducation: (id) =>
    request(`/education/${id}`, { method: 'DELETE' }),

  // Navigation
  getNavigation: () =>
    request('/navigation'),

  updateNavigation: (id, data) =>
    request(`/navigation/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Sections
  getSections: () =>
    request('/website/sections'),

  getSectionsAdmin: () =>
    request('/sections'),

  updateSection: (id, data) =>
    request(`/sections/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Site config
  getSiteConfig: () =>
    request('/website/site-config'),

  // Contact
  submitContact: (data) =>
    request('/website/contact', { method: 'POST', body: JSON.stringify(data) }),

  getMessages: () =>
    request('/messages'),

  // Services
  getServices: () =>
    request('/website/services'),

  // Testimonials
  getTestimonials: () =>
    request('/website/testimonials'),

  // Certificates
  getCertificates: () =>
    request('/website/certificates'),

  // Blog
  getBlog: () =>
    request('/website/blog'),

  // Health
  checkHealth: () =>
    request('/health'),

  // Theme
  getActiveTheme: () =>
    request('/theme/active'),

  getThemes: () =>
    request('/theme'),

  updateTheme: (id, data) =>
    request(`/theme/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  resetTheme: () =>
    request('/theme/reset', { method: 'POST' }),
};

export default backendApi;
