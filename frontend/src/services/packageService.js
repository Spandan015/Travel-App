import api from './api';

const packageService = {
  // Get all packages
  getAllPackages: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/packages?${params}`);
    return response.data.packages || response.data; // Handle both response formats
  },

  // Get package by ID
  getPackageById: async (id) => {
    const response = await api.get(`/packages/${id}`);
    return response.data;
  },

  // Admin: Create package
  createPackage: async (packageData) => {
    const response = await api.post('/packages', packageData);
    return response.data;
  },

  // Admin: Update package
  updatePackage: async (id, packageData) => {
    const response = await api.put(`/packages/${id}`, packageData);
    return response.data;
  },

  // Admin: Delete package
  deletePackage: async (id) => {
    const response = await api.delete(`/packages/${id}`);
    return response.data;
  },

  // Admin: Toggle package status
  togglePackageStatus: async (id) => {
    const response = await api.put(`/packages/${id}/toggle-status`);
    return response.data;
  }
};

export default packageService;