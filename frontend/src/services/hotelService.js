import api from './api';

const hotelService = {
  // Get all hotels
  getAllHotels: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/hotels?${params}`);
    return response.data.hotels || response.data; // Handle both response formats
  },

  // Get hotel by ID
  getHotelById: async (id) => {
    const response = await api.get(`/hotels/${id}`);
    return response.data;
  },

  // Admin: Create hotel
  createHotel: async (hotelData) => {
    const response = await api.post('/hotels', hotelData);
    return response.data;
  },

  // Admin: Update hotel
  updateHotel: async (id, hotelData) => {
    const response = await api.put(`/hotels/${id}`, hotelData);
    return response.data;
  },

  // Admin: Delete hotel
  deleteHotel: async (id) => {
    const response = await api.delete(`/hotels/${id}`);
    return response.data;
  },

  // Admin: Toggle hotel status
  toggleHotelStatus: async (id) => {
    const response = await api.put(`/hotels/${id}/toggle-status`);
    return response.data;
  }
};

export default hotelService;