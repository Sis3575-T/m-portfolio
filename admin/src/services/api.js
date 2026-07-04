import axios from 'axios';

function getApiUrl() {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://m-portfolio-ecby.onrender.com/api';
  }
  return localStorage.getItem('api_url') || 'http://localhost:5001/api';
}

const api = axios.create({
  baseURL: getApiUrl(),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  config.baseURL = getApiUrl();
  const token = localStorage.getItem('admin_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const adminApi = {
  // Auth
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
  updatePreferences: (data) => api.put('/auth/preferences', data),
  updateNotifications: (data) => api.put('/auth/notifications', data),
  getSessions: () => api.get('/auth/sessions'),
  terminateSession: (id) => api.delete(`/auth/sessions/${id}`),
  terminateOtherSessions: () => api.post('/auth/sessions/terminate-other'),
  logoutAllSessions: () => api.post('/auth/sessions/logout-all'),
  connectAccount: (provider, data) => api.post(`/auth/connect/${provider}`, data),
  disconnectAccount: (provider) => api.delete(`/auth/connect/${provider}`),
  deleteAccount: () => api.delete('/auth/account'),
  deactivateAccount: () => api.post('/auth/deactivate'),
  updateTwoFactor: (enabled) => api.put('/auth/two-factor', { enabled }),

  // Dashboard & Analytics
  getDashboardStats: (params) => api.get('/analytics/dashboard', { params }),
  getVisitorStats: (params) => api.get('/analytics/visitors', { params }),
  getAnalyticsOverview: (params) => api.get('/analytics/overview', { params }),
  getVisitorLocations: () => api.get('/analytics/locations'),
  getDeviceStats: (params) => api.get('/analytics/devices', { params }),
  getBrowserStats: (params) => api.get('/analytics/browsers', { params }),
  getOSStats: (params) => api.get('/analytics/os', { params }),
  getPageStats: (params) => api.get('/analytics/pages', { params }),
  getReferrerStats: (params) => api.get('/analytics/referrers', { params }),
  getSessionStats: (params) => api.get('/analytics/sessions', { params }),
  getActiveVisitors: () => api.get('/analytics/active'),
  getLiveFeed: () => api.get('/analytics/live-feed'),
  getVisitorDetails: (params) => api.get('/analytics/visitor-details', { params }),
  getProjectAnalytics: () => api.get('/analytics/projects'),
  getResumeAnalytics: (params) => api.get('/analytics/resume', { params }),
  getContactAnalytics: (params) => api.get('/analytics/contact', { params }),
  getExportData: (params) => api.get('/analytics/export', { params, responseType: params.format === 'csv' ? 'blob' : 'json' }),

  // New Visitor Analytics API
  getLiveVisitors: () => api.get('/analytics/live'),
  getVisitorsList: (params) => api.get('/analytics/visitors-list', { params }),
  getVisitorById: (id) => api.get(`/analytics/visitors/${id}`),
  getVisitorEvents: (id) => api.get(`/analytics/visitors/${id}/events`),
  getCountries: () => api.get('/analytics/countries'),
  getBrowserStatsNew: () => api.get('/analytics/browsers-stats'),
  getDeviceStatsNew: () => api.get('/analytics/devices-stats'),
  getOSStatsNew: () => api.get('/analytics/os-stats'),
  getSources: () => api.get('/analytics/sources'),
  getPagesStats: () => api.get('/analytics/pages-stats'),
  getEventsStats: () => api.get('/analytics/events-stats'),
  getBounceRate: (params) => api.get('/analytics/bounce-rate', { params }),
  getSessionDuration: (params) => api.get('/analytics/duration', { params }),
  getReport: (params) => api.get('/analytics/report', { params, responseType: params?.format === 'csv' ? 'blob' : 'json' }),

  // Hero
  getHero: () => api.get('/hero'),
  updateHero: (data) => api.put('/hero', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // About
  getAbout: () => api.get('/about'),
  updateAbout: (data) => api.put('/about', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Skills
  getSkills: () => api.get('/skills/all'),
  createSkill: (data) => api.post('/skills', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateSkill: (id, data) => api.put(`/skills/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteSkill: (id) => api.delete(`/skills/${id}`),
  reorderSkills: (items) => api.put('/skills/reorder', { items }),

  // Projects
  getProjects: () => api.get('/projects/all'),
  createProject: (data) => api.post('/projects', data),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  toggleProject: (id) => api.patch(`/projects/${id}/toggle`),

  // Experience
  getExperiences: () => api.get('/experiences/all'),
  createExperience: (data) => api.post('/experiences', data),
  updateExperience: (id, data) => api.put(`/experiences/${id}`, data),
  deleteExperience: (id) => api.delete(`/experiences/${id}`),

  // Education
  getEducation: () => api.get('/education/all'),
  createEducation: (data) => api.post('/education', data),
  updateEducation: (id, data) => api.put(`/education/${id}`, data),
  deleteEducation: (id) => api.delete(`/education/${id}`),

  // Certificates
  getCertificates: () => api.get('/certificates?all=true'),
  createCertificate: (data) => api.post('/certificates', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateCertificate: (id, data) => api.put(`/certificates/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteCertificate: (id) => api.delete(`/certificates/${id}`),

  // Blog
  getBlogs: () => api.get('/blogs/all'),
  createBlog: (data) => api.post('/blogs', data),
  updateBlog: (id, data) => api.put(`/blogs/${id}`, data),
  deleteBlog: (id) => api.delete(`/blogs/${id}`),

  // Services
  getServices: () => api.get('/services/all'),
  createService: (data) => api.post('/services', data),
  updateService: (id, data) => api.put(`/services/${id}`, data),
  deleteService: (id) => api.delete(`/services/${id}`),

  // Testimonials
  getTestimonials: () => api.get('/testimonials/all'),
  createTestimonial: (data) => api.post('/testimonials', data),
  updateTestimonial: (id, data) => api.put(`/testimonials/${id}`, data),
  deleteTestimonial: (id) => api.delete(`/testimonials/${id}`),

  // Messages
  getMessages: (params) => api.get('/messages', { params }),
  getMessage: (id) => api.get(`/messages/${id}`),
  replyMessage: (id, data) => api.put(`/messages/${id}/reply`, data),
  deleteMessage: (id) => api.delete(`/messages/${id}`),
  markAsRead: (id) => api.patch(`/messages/${id}/read`),

  // Media
  getMedia: (params) => api.get('/media', { params }),
  getMediaStats: () => api.get('/media/stats'),
  uploadMedia: (formData) => api.post('/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteMedia: (id) => api.delete(`/media/${id}`),
  updateMedia: (id, data) => api.put(`/media/${id}`, data),

  // SEO
  getSEO: () => api.get('/seo'),
  updateSEO: (page, data) => api.put(`/seo/${page}`, data),

  // Settings
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Pages (Dynamic Page Builder)
  getPages: () => api.get('/pages'),
  createPage: (data) => api.post('/pages', data),
  updatePage: (id, data) => api.put(`/pages/${id}`, data),
  deletePage: (id) => api.delete(`/pages/${id}`),
  duplicatePage: (id) => api.post(`/pages/${id}/duplicate`),
  reorderPages: (items) => api.put('/pages/reorder', { items }),
  togglePage: (id) => api.patch(`/pages/${id}/toggle`),

  // Components
  getPageComponents: (pageId) => api.get(`/pages/${pageId}/components`),
  addComponent: (pageId, data) => api.post(`/pages/${pageId}/components`, data),
  updateComponent: (pageId, componentId, data) => api.put(`/pages/${pageId}/components/${componentId}`, data),
  deleteComponent: (pageId, componentId) => api.delete(`/pages/${pageId}/components/${componentId}`),
  duplicateComponent: (pageId, componentId) => api.post(`/pages/${pageId}/components/${componentId}/duplicate`),
  reorderComponents: (pageId, items) => api.put(`/pages/${pageId}/components/reorder`, { items }),
  toggleComponent: (pageId, componentId) => api.patch(`/pages/${pageId}/components/${componentId}/toggle`),
  moveComponent: (pageId, componentId, targetPageId) => api.post(`/pages/${pageId}/components/${componentId}/move`, { targetPageId }),

  // Sections (Component Builder)
  getSections: (params) => api.get('/sections', { params }),
  getSection: (id) => api.get(`/sections/${id}`),
  createSection: (data) => api.post('/sections', data),
  updateSection: (id, data) => api.put(`/sections/${id}`, data),
  deleteSection: (id) => api.delete(`/sections/${id}`),
  duplicateSection: (id) => api.post(`/sections/${id}/duplicate`),
  getSectionStats: () => api.get('/sections/stats'),
  updateSectionStatus: (id, status) => api.put(`/sections/${id}/status`, { status }),
  reorderSection: (id, order) => api.put(`/sections/${id}/reorder`, { order }),
  toggleSectionLock: (id, locked) => api.put(`/sections/${id}/lock`, { locked }),
  saveSectionVersion: (id, data) => api.post(`/sections/${id}/versions`, data),
  getSectionVersions: (id) => api.get(`/sections/${id}/versions`),
  restoreSectionVersion: (id, versionId) => api.post(`/sections/${id}/restore/${versionId}`),
  exportSection: (id) => api.get(`/sections/export/${id}`),
  importSections: (components) => api.post('/sections/import', { components }),
  bulkSectionAction: (action, ids) => api.post('/sections/bulk', { action, ids }),

  // Theme
  getTheme: () => api.get('/theme'),
  updateTheme: (data) => api.put('/theme', data),
  resetTheme: () => api.post('/theme/reset'),

  // Backups
  getBackups: () => api.get('/backups'),
  createBackup: (data) => api.post('/backups', data || {}),
  restoreBackup: (id) => api.post(`/backups/${id}/restore`),
  deleteBackup: (id) => api.delete(`/backups/${id}`),
  exportData: (type) => api.get(`/backups/export/${type}`, { responseType: 'blob' }),
  importData: (formData) => api.post('/backups/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Activity Logs
  getActivityLogs: (params) => api.get('/activity-logs', { params }),
  getRecentActivity: () => api.get('/activity-logs/recent'),

  // Notifications
  getNotifications: (params) => api.get('/notifications', { params }),
  markNotificationRead: (id) => api.put(`/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),

  // Auth
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
};

const apiHost = (import.meta.env.VITE_API_URL || '').replace(/\/api$/, '') || '';

export function imageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return apiHost + url;
}

export default api;
