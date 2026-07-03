const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const getToken = () => localStorage.getItem('adminToken');

const headers = (isFormData = false) => {
  const h = {};
  if (!isFormData) h['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
};

const request = async (method, path, body = null, isFormData = false) => {
  const opts = { method, headers: headers(isFormData) };
  if (body) opts.body = isFormData ? body : JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

// Auth
export const login = (email, password) => request('POST', '/auth/login', { email, password });
export const getMe = () => request('GET', '/auth/me');

// Hero
export const getHero = () => request('GET', '/hero');
export const updateHero = (form) => request('PUT', '/hero', form, true);

// About
export const getAbout = () => request('GET', '/about');
export const updateAbout = (data) => request('PUT', '/about', data);

// Projects
export const getProjects = (params = '/public') => request('GET', `/projects${params}`);
export const getProject = (id) => request('GET', `/projects/${id}`);
export const createProject = (form) => request('POST', '/projects', form, true);
export const updateProject = (id, form) => request('PUT', `/projects/${id}`, form, true);
export const deleteProject = (id) => request('DELETE', `/projects/${id}`);
export const reorderProjects = (orders) => request('PUT', '/projects/reorder', { orders });

// Skills
export const getSkills = (all = false) => request('GET', `/skills${all ? '?all=true' : ''}`);
export const createSkill = (data) => request('POST', '/skills', data);
export const updateSkill = (id, data) => request('PUT', `/skills/${id}`, data);
export const deleteSkill = (id) => request('DELETE', `/skills/${id}`);

// Experience
export const getExperiences = (all = false) => request('GET', `/experience${all ? '?all=true' : ''}`);
export const createExperience = (form) => request('POST', '/experience', form, true);
export const updateExperience = (id, form) => request('PUT', `/experience/${id}`, form, true);
export const deleteExperience = (id) => request('DELETE', `/experience/${id}`);

// Education
export const getEducations = (all = false) => request('GET', `/education${all ? '?all=true' : ''}`);
export const createEducation = (form) => request('POST', '/education', form, true);
export const updateEducation = (id, form) => request('PUT', `/education/${id}`, form, true);
export const deleteEducation = (id) => request('DELETE', `/education/${id}`);

// Certificates
export const getCertificates = (all = false) => request('GET', `/certificates${all ? '?all=true' : ''}`);
export const createCertificate = (form) => request('POST', '/certificates', form, true);
export const updateCertificate = (id, form) => request('PUT', `/certificates/${id}`, form, true);
export const deleteCertificate = (id) => request('DELETE', `/certificates/${id}`);

// Services
export const getServices = (all = false) => request('GET', `/services${all ? '?all=true' : ''}`);
export const createService = (data) => request('POST', '/services', data);
export const updateService = (id, data) => request('PUT', `/services/${id}`, data);
export const deleteService = (id) => request('DELETE', `/services/${id}`);

// Testimonials
export const getTestimonials = (all = false) => request('GET', `/testimonials${all ? '?all=true' : ''}`);
export const createTestimonial = (form) => request('POST', '/testimonials', form, true);
export const updateTestimonial = (id, form) => request('PUT', `/testimonials/${id}`, form, true);
export const deleteTestimonial = (id) => request('DELETE', `/testimonials/${id}`);

// Messages
export const sendMessage = (data) => request('POST', '/messages', data);
export const getMessages = (params = '') => request('GET', `/messages${params}`);
export const markMessageRead = (id, read) => request('PUT', `/messages/${id}/read`, { read });
export const deleteMessage = (id) => request('DELETE', `/messages/${id}`);
export const getUnreadCount = () => request('GET', '/messages/unread-count');

// Blog
export const getBlogs = (params = '') => request('GET', `/blog${params}`);
export const getBlog = (slug) => request('GET', `/blog/${slug}`);
export const createBlog = (form) => request('POST', '/blog', form, true);
export const updateBlog = (id, form) => request('PUT', `/blog/${id}`, form, true);
export const deleteBlog = (id) => request('DELETE', `/blog/${id}`);

// Settings
export const getSettings = () => request('GET', '/settings');
export const updateSettings = (form) => request('PUT', '/settings', form, true);
