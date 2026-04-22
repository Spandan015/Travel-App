import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    // ✅ FIXED: use 'nt_token' to match AuthContext.jsx
    const token = localStorage.getItem('nt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // ✅ FIXED: use 'nt_token' / 'nt_user' to match AuthContext.jsx
      localStorage.removeItem('nt_token');
      localStorage.removeItem('nt_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;