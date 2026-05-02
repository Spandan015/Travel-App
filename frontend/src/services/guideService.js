import api from './api';

const guideService = {
  getAllGuides: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/guides?${params}`);
    return response.data;
  },

  getGuideById: async (id) => {
    const response = await api.get(`/guides/${id}`);
    return response.data;
  },

  searchGuides: async (query) => {
    const response = await api.get(`/guides/search?query=${query}`);
    return response.data;
  },

  applyAsGuide: async (applicationData) => {
    const response = await api.post('/guide-applications', applicationData);
    return response.data;
  },

  getMyApplication: async () => {
    const response = await api.get('/guide-applications/my');
    return response.data;
  },

  updateGuideProfile: async (profileData) => {
    const response = await api.put('/guide-applications/profile', profileData);
    return response.data;
  },

  // ── Phase 2: Get available guides for package/trek booking ────────────────
  // Uses the public /guides endpoint (no auth required)
  // Controller returns: { _id, firstName, lastName, specializations,
  //                       languages, rating, dailyRate, hourlyRate,
  //                       availability, userId, profileImage, bio }
  getAvailableGuides: async () => {
    try {
      const response = await api.get('/guides');
      const guides = response.data.guides || response.data || [];
      return guides.filter(g => g.availability !== false);
    } catch (err) {
      console.error('getAvailableGuides error:', err);
      return [];
    }
  },

  // Admin: also uses public /guides endpoint
  getApprovedGuides: async () => {
    try {
      const response = await api.get('/guides');
      const guides = response.data.guides || response.data || [];
      return guides.filter(g => g.availability !== false);
    } catch {
      return [];
    }
  },

  assignGuideToPackageBooking: async (bookingId, guideId, notes = '') => {
    const response = await api.put(`/bookings/${bookingId}/assign-guide`, { guideId, notes });
    return response.data;
  },

  assignGuideToTrekBooking: async (bookingId, guideId, notes = '') => {
    const response = await api.put(`/trek-bookings/${bookingId}/assign-guide`, { guideId, notes });
    return response.data;
  },

  getMyAssignedPackageBookings: async () => {
    const response = await api.get('/bookings/guide/assigned');
    return response.data;
  },

  getMyAssignedTrekBookings: async () => {
    const response = await api.get('/trek-bookings/guide/assigned');
    return response.data;
  },
};

export default guideService;