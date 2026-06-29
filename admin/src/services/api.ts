import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type {
  User, Project, Skill, Experience, Education, Certificate,
  Blog, Message, Media, Setting, Hero, About, Service, Testimonial,
  PortfolioPage, PageComponent, DashboardStats, VisitorData, ActivityLog,
  ThemeSettings, Backup, AnalyticsOverview,
} from '../types';

const API_URL: string = import.meta.env.VITE_API_URL || '/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
  page?: number;
  pages?: number;
}

export const adminApi = {
  // Auth
  login: (email: string, password: string) =>
    api.post<{ success: boolean; token: string; user: User }>('/auth/login', { email, password }),
  getMe: () => api.get<{ success: boolean; user: User }>('/auth/me'),
  updateProfile: (data: Partial<User>) =>
    api.put<{ success: boolean; user: User }>('/auth/profile', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put<ApiResponse<null>>('/auth/change-password', { currentPassword, newPassword }),

  // Dashboard & Analytics
  getDashboardStats: () => api.get<ApiResponse<DashboardStats>>('/analytics/dashboard'),
  getVisitorStats: () => api.get<ApiResponse<VisitorData[]>>('/analytics/visitors'),
  getAnalyticsOverview: () => api.get<ApiResponse<AnalyticsOverview>>('/analytics/overview'),
  getVisitorLocations: () => api.get<ApiResponse<{ country: string; count: number; percentage: number }[]>>('/analytics/locations'),
  getDeviceStats: () => api.get<ApiResponse<{ name: string; value: number; percentage: number }[]>>('/analytics/devices'),
  getBrowserStats: () => api.get<ApiResponse<{ name: string; value: number; percentage: number }[]>>('/analytics/browsers'),

  // Hero
  getHero: () => api.get<ApiResponse<Hero>>('/hero'),
  updateHero: (data: FormData) => api.put<ApiResponse<Hero>>('/hero', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // About
  getAbout: () => api.get<ApiResponse<About>>('/about'),
  updateAbout: (data: FormData) => api.put<ApiResponse<About>>('/about', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Skills
  getSkills: () => api.get<ApiResponse<Skill[]>>('/skills/all'),
  createSkill: (data: Partial<Skill>) => api.post<ApiResponse<Skill>>('/skills', data),
  updateSkill: (id: string, data: Partial<Skill>) => api.put<ApiResponse<Skill>>(`/skills/${id}`, data),
  deleteSkill: (id: string) => api.delete<ApiResponse<null>>(`/skills/${id}`),
  reorderSkills: (items: { _id: string; order: number }[]) =>
    api.put<ApiResponse<null>>('/skills/reorder', { items }),

  // Projects
  getProjects: () => api.get<ApiResponse<Project[]>>('/projects/all'),
  createProject: (data: Partial<Project>) => api.post<ApiResponse<Project>>('/projects', data),
  updateProject: (id: string, data: Partial<Project>) => api.put<ApiResponse<Project>>(`/projects/${id}`, data),
  deleteProject: (id: string) => api.delete<ApiResponse<null>>(`/projects/${id}`),
  toggleProject: (id: string) => api.patch<ApiResponse<Project>>(`/projects/${id}/toggle`),

  // Experience
  getExperiences: () => api.get<ApiResponse<Experience[]>>('/experiences/all'),
  createExperience: (data: Partial<Experience>) => api.post<ApiResponse<Experience>>('/experiences', data),
  updateExperience: (id: string, data: Partial<Experience>) => api.put<ApiResponse<Experience>>(`/experiences/${id}`, data),
  deleteExperience: (id: string) => api.delete<ApiResponse<null>>(`/experiences/${id}`),

  // Education
  getEducation: () => api.get<ApiResponse<Education[]>>('/education/all'),
  createEducation: (data: Partial<Education>) => api.post<ApiResponse<Education>>('/education', data),
  updateEducation: (id: string, data: Partial<Education>) => api.put<ApiResponse<Education>>(`/education/${id}`, data),
  deleteEducation: (id: string) => api.delete<ApiResponse<null>>(`/education/${id}`),

  // Certificates
  getCertificates: () => api.get<ApiResponse<Certificate[]>>('/certificates?all=true'),
  createCertificate: (data: FormData) => api.post<ApiResponse<Certificate>>('/certificates', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateCertificate: (id: string, data: FormData) => api.put<ApiResponse<Certificate>>(`/certificates/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteCertificate: (id: string) => api.delete<ApiResponse<null>>(`/certificates/${id}`),

  // Blog
  getBlogs: () => api.get<ApiResponse<Blog[]>>('/blogs/all'),
  createBlog: (data: Partial<Blog>) => api.post<ApiResponse<Blog>>('/blogs', data),
  updateBlog: (id: string, data: Partial<Blog>) => api.put<ApiResponse<Blog>>(`/blogs/${id}`, data),
  deleteBlog: (id: string) => api.delete<ApiResponse<null>>(`/blogs/${id}`),

  // Services
  getServices: () => api.get<ApiResponse<Service[]>>('/services/all'),
  createService: (data: Partial<Service>) => api.post<ApiResponse<Service>>('/services', data),
  updateService: (id: string, data: Partial<Service>) => api.put<ApiResponse<Service>>(`/services/${id}`, data),
  deleteService: (id: string) => api.delete<ApiResponse<null>>(`/services/${id}`),

  // Testimonials
  getTestimonials: () => api.get<ApiResponse<Testimonial[]>>('/testimonials/all'),
  createTestimonial: (data: Partial<Testimonial>) => api.post<ApiResponse<Testimonial>>('/testimonials', data),
  updateTestimonial: (id: string, data: Partial<Testimonial>) => api.put<ApiResponse<Testimonial>>(`/testimonials/${id}`, data),
  deleteTestimonial: (id: string) => api.delete<ApiResponse<null>>(`/testimonials/${id}`),

  // Messages
  getMessages: (params?: Record<string, unknown>) => api.get<ApiResponse<Message[]>>('/messages', { params }),
  getMessage: (id: string) => api.get<ApiResponse<Message>>(`/messages/${id}`),
  replyMessage: (id: string, data: { replyContent: string }) => api.put<ApiResponse<Message>>(`/messages/${id}/reply`, data),
  deleteMessage: (id: string) => api.delete<ApiResponse<null>>(`/messages/${id}`),
  markAsRead: (id: string) => api.patch<ApiResponse<Message>>(`/messages/${id}/read`),

  // Media
  getMedia: (params?: { category?: string; folder?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<Media[]>>('/media', { params }),
  getMediaStats: () => api.get('/media/stats'),
  uploadMedia: (formData: FormData) => api.post<ApiResponse<Media>>('/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteMedia: (id: string) => api.delete<ApiResponse<null>>(`/media/${id}`),
  updateMedia: (id: string, data: { name?: string; category?: string; folder?: string }) =>
    api.put<ApiResponse<Media>>(`/media/${id}`, data),
  getFolders: () => api.get<ApiResponse<string[]>>('/media/folders'),

  // SEO
  getSEO: () => api.get<ApiResponse<Record<string, unknown>[]>>('/seo'),
  updateSEO: (page: string, data: Record<string, unknown>) => api.put<ApiResponse<Record<string, unknown>>>(`/seo/page/${page}`, data),

  // Settings
  getSettings: () => api.get<ApiResponse<Setting>>('/settings'),
  updateSettings: (data: FormData) => api.put<ApiResponse<Setting>>('/settings', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Pages (Dynamic Page Builder)
  getPages: () => api.get<ApiResponse<PortfolioPage[]>>('/pages'),
  createPage: (data: { title: string; slug: string; description?: string; insertAfter?: string }) =>
    api.post<ApiResponse<PortfolioPage>>('/pages', data),
  updatePage: (id: string, data: Partial<PortfolioPage>) =>
    api.put<ApiResponse<PortfolioPage>>(`/pages/${id}`, data),
  deletePage: (id: string) => api.delete<ApiResponse<null>>(`/pages/${id}`),
  duplicatePage: (id: string) => api.post<ApiResponse<PortfolioPage>>(`/pages/${id}/duplicate`),
  reorderPages: (items: { _id: string; order: number }[]) =>
    api.put<ApiResponse<null>>('/pages/reorder', { items }),
  togglePage: (id: string) => api.patch<ApiResponse<PortfolioPage>>(`/pages/${id}/toggle`),

  // Components (Dynamic Component Builder)
  getPageComponents: (pageId: string) => api.get<ApiResponse<PageComponent[]>>(`/pages/${pageId}/components`),
  addComponent: (pageId: string, data: { type: string; title?: string }) =>
    api.post<ApiResponse<PageComponent>>(`/pages/${pageId}/components`, data),
  updateComponent: (pageId: string, componentId: string, data: Partial<PageComponent>) =>
    api.put<ApiResponse<PageComponent>>(`/pages/${pageId}/components/${componentId}`, data),
  deleteComponent: (pageId: string, componentId: string) =>
    api.delete<ApiResponse<null>>(`/pages/${pageId}/components/${componentId}`),
  duplicateComponent: (pageId: string, componentId: string) =>
    api.post<ApiResponse<PageComponent>>(`/pages/${pageId}/components/${componentId}/duplicate`),
  reorderComponents: (pageId: string, items: { _id: string; order: number }[]) =>
    api.put<ApiResponse<null>>(`/pages/${pageId}/components/reorder`, { items }),
  toggleComponent: (pageId: string, componentId: string) =>
    api.patch<ApiResponse<PageComponent>>(`/pages/${pageId}/components/${componentId}/toggle`),
  moveComponent: (pageId: string, componentId: string, targetPageId: string) =>
    api.post<ApiResponse<PageComponent>>(`/pages/${pageId}/components/${componentId}/move`, { targetPageId }),

  // Theme
  getTheme: () => api.get<ApiResponse<ThemeSettings>>('/theme'),
  updateTheme: (data: Partial<ThemeSettings>) => api.put<ApiResponse<ThemeSettings>>('/theme', data),
  resetTheme: () => api.post<ApiResponse<ThemeSettings>>('/theme/reset'),

  // Backups
  getBackups: () => api.get<ApiResponse<Backup[]>>('/backups'),
  createBackup: (data?: { name?: string }) => api.post<ApiResponse<Backup>>('/backups', data || {}),
  restoreBackup: (id: string) => api.post<ApiResponse<null>>(`/backups/${id}/restore`),
  deleteBackup: (id: string) => api.delete<ApiResponse<null>>(`/backups/${id}`),
  exportData: (type: string) => api.get(`/backups/export/${type}`, { responseType: 'blob' }),
  importData: (formData: FormData) => api.post<ApiResponse<{ imported: number }>>('/backups/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Activity Logs
  getActivityLogs: () => api.get<ApiResponse<ActivityLog[]>>('/activity-logs'),

  // Admin
  getAdminUser: () => api.get<ApiResponse<{ user: User }>>('/auth/me'),
};

const apiHost: string = (import.meta.env.VITE_API_URL || '').replace(/\/api$/, '') || '';

export function imageUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return apiHost + url;
}

export default api;
