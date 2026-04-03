import api from './api';

const authService = {
  signup: async (payload, { rememberMe = true } = {}) => {
    const response = await api.post('/auth/signup', payload);
    if (response.data.token) {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', response.data.token);
      storage.setItem('user', JSON.stringify(response.data.user));
      // keep other storage clean
      (rememberMe ? sessionStorage : localStorage).removeItem('token');
      (rememberMe ? sessionStorage : localStorage).removeItem('user');
    }
    return response.data;
  },

  loginUnified: async ({ email, password }, { rememberMe = true } = {}) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', response.data.token);
      storage.setItem('user', JSON.stringify(response.data.user));
      (rememberMe ? sessionStorage : localStorage).removeItem('token');
      (rememberMe ? sessionStorage : localStorage).removeItem('user');
    }
    return response.data;
  },

  // Step 1: Send OTP for registration
  sendRegistrationOTP: async (userData) => {
    const response = await api.post('/auth/register/send-otp', userData);
    return response.data;
  },

  // Step 2: Verify OTP and complete registration
  verifyRegistrationOTP: async (verificationData) => {
    console.log('AuthService: Sending verification data:', verificationData);
    const response = await api.post('/auth/register/verify-otp', verificationData);
    console.log('AuthService: Response:', response.data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Step 1: Send OTP for admin registration
  sendAdminRegistrationOTP: async (userData) => {
    const response = await api.post('/auth/register-admin/send-otp', userData);
    return response.data;
  },

  // Step 2: Verify OTP and complete admin registration
  verifyAdminRegistrationOTP: async (verificationData) => {
    const response = await api.post('/auth/register-admin/verify-otp', verificationData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Step 1: Send OTP for login
  sendLoginOTP: async (email) => {
    const response = await api.post('/auth/login/send-otp', { email });
    return response.data;
  },

  // Step 2: Verify login OTP
  verifyLoginOTP: async (verificationData) => {
    const response = await api.post('/auth/login/verify-otp', verificationData);

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Password-based login
  loginWithPassword: async (credentials) => {
    const response = await api.post('/auth/login/password', credentials);

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Send OTP for guide application
  sendGuideApplicationOTP: async (userData) => {
    const response = await api.post('/auth/apply-guide/send-otp', userData);
    return response.data;
  },

  // Legacy methods for backward compatibility
  register: async (userData) => {
    return await authService.sendRegistrationOTP(userData);
  },

  registerAdmin: async (userData) => {
    return await authService.sendAdminRegistrationOTP(userData);
  },

  login: async (credentials) => {
    return await authService.sendLoginOTP(credentials.email);
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
  },

  // Get profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Change password
  changePassword: async (passwords) => {
    const response = await api.put('/auth/change-password', passwords);
    return response.data;
  },

  // Check if user is authenticated
  // Get user role
  getUserRole: () => {
    const user = authService.getCurrentUser();
    return user?.role || null;
  }
};

export default authService;