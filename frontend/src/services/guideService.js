import api from './api';

const guideService = {
  // Get all guides
  getAllGuides: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/guides?${params}`);
    return response.data;
  },

  // Get guide by ID
  getGuideById: async (id) => {
    const response = await api.get(`/guides/${id}`);
    return response.data;
  },

  // Search guides
  searchGuides: async (query) => {
    const response = await api.get(`/guides/search?query=${query}`);
    return response.data;
  },

  // Apply as guide
  applyAsGuide: async (applicationData) => {
    const response = await api.post('/guide-applications', applicationData);
    return response.data;
  },

  // Get my application
  getMyApplication: async () => {
    const response = await api.get('/guide-applications/my');
    return response.data;
  },

  // Update guide profile
  updateGuideProfile: async (profileData) => {
    const response = await api.put('/guide-applications/profile', profileData);
    return response.data;
  }
};

export default guideService;