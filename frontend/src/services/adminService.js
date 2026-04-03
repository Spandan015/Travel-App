import api from './api';

const adminService = {
  // Get all guide applications
  getAllApplications: async (status) => {
    const params = status ? `?status=${status}` : '';
    const response = await api.get(`/guide-applications${params}`);
    return response.data;
  },

  // Get application by ID
  getApplicationById: async (id) => {
    const response = await api.get(`/guide-applications/${id}`);
    return response.data;
  },

  // Approve application
  approveApplication: async (id, notes) => {
    const response = await api.put(`/guide-applications/${id}/approve`, { adminNotes: notes });
    return response.data;
  },

  // Reject application
  rejectApplication: async (id, reason, notes) => {
    const response = await api.put(`/guide-applications/${id}/reject`, { 
      rejectionReason: reason,
      adminNotes: notes 
    });
    return response.data;
  },

  // Get all bookings
  getAllBookings: async () => {
    const response = await api.get('/guide-bookings/admin/all');
    return response.data;
  },

  // Get analytics data
  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },

  // Get all users
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  // Get all packages
  getAllPackages: async () => {
    const response = await api.get('/packages');
    return response.data;
  },

  // Get all hotels
  getAllHotels: async () => {
    const response = await api.get('/hotels');
    return response.data;
  },

  // Get all destinations
  getAllDestinations: async () => {
    const response = await api.get('/destinations');
    return response.data;
  },

  // Create destination
  createDestination: async (destinationData) => {
    const response = await api.post('/destinations', destinationData);
    return response.data;
  },

  // Update destination
  updateDestination: async (id, destinationData) => {
    const response = await api.put(`/destinations/${id}`, destinationData);
    return response.data;
  },

  // Delete destination
  deleteDestination: async (id) => {
    const response = await api.delete(`/destinations/${id}`);
    return response.data;
  },

  // Toggle destination status
  toggleDestinationStatus: async (id) => {
    const response = await api.put(`/destinations/${id}/toggle-status`);
    return response.data;
  },

  // Toggle destination popular status
  toggleDestinationPopular: async (id) => {
    const response = await api.put(`/destinations/${id}/toggle-popular`);
    return response.data;
  },

  // Toggle destination featured status
  toggleDestinationFeatured: async (id) => {
    const response = await api.put(`/destinations/${id}/toggle-featured`);
    return response.data;
  }
};

export default adminService;