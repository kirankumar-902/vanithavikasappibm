import axios from 'axios';

const API_BASE_URL = 'http://localhost:6969/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (formData) => api.put('/auth/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Services API calls
export const servicesAPI = {
  getAll: (params) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  getMy: () => api.get('/services/my'),
  create: (formData) => api.post('/services', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/services/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/services/${id}`),
};

// Location API calls
export const locationAPI = {
  autocomplete: (text, country = 'in') => api.get('/location/autocomplete', {
    params: { text, country }
  }),
  reverse: (lat, lon) => api.get('/location/reverse', {
    params: { lat, lon }
  }),
};

// Chat API calls
export const chatAPI = {
  startChat: (serviceId) => api.post('/chat/start', { serviceId }),
  getMyChats: () => api.get('/chat/my'),
  getMessages: (chatId, params) => api.get(`/chat/${chatId}/messages`, { params }),
  sendMessage: (chatId, content) => api.post(`/chat/${chatId}/messages`, { content }),
};

export default api;