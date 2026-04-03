import api from './api';

const bookingService = {
  // ===== HOTEL BOOKINGS =====
  // Create hotel booking
  createHotelBooking: async (bookingData) => {
    const response = await api.post('/hotel-bookings', bookingData);
    return response.data;
  },

  // Get user's hotel bookings
  getUserHotelBookings: async () => {
    const response = await api.get('/hotel-bookings/my');
    return response.data;
  },

  // Get hotel booking by ID
  getHotelBookingById: async (id) => {
    const response = await api.get(`/hotel-bookings/${id}`);
    return response.data;
  },

  // Cancel hotel booking
  cancelHotelBooking: async (id, reason) => {
    const response = await api.put(`/hotel-bookings/${id}/cancel`, { cancellationReason: reason });
    return response.data;
  },

  // ===== GUIDE BOOKINGS =====
  // Create guide booking
  createGuideBooking: async (bookingData) => {
    const response = await api.post('/guide-bookings', bookingData);
    return response.data;
  },

  // Get my guide bookings
  getMyGuideBookings: async () => {
    const response = await api.get('/guide-bookings/my');
    return response.data;
  },

  // ===== PACKAGE/DESTINATION BOOKINGS =====
  // Create package/destination booking
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  // Get my package bookings
  getUserBookings: async () => {
    const response = await api.get('/bookings/my');
    return response.data;
  },

  // Get booking by ID
  getBookingById: async (id) => {
    const response = await api.get(`/guide-bookings/${id}`);
    return response.data;
  },

  // Cancel guide booking
  cancelGuideBooking: async (id, reason) => {
    const response = await api.put(`/guide-bookings/${id}/cancel`, { cancellationReason: reason });
    return response.data;
  },

  // Cancel package booking
  cancelPackageBooking: async (id) => {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
  },

  // Add review
  addReview: async (id, reviewData) => {
    const response = await api.post(`/guide-bookings/${id}/review`, reviewData);
    return response.data;
  },

  // Guide: Get booking requests
  getBookingRequests: async (status) => {
    const params = status ? `?status=${status}` : '';
    const response = await api.get(`/guide-bookings/requests${params}`);
    return response.data;
  },

  // Guide: Accept booking
  acceptBooking: async (id, message) => {
    const response = await api.put(`/guide-bookings/${id}/accept`, { message });
    return response.data;
  },

  // Guide: Reject booking
  rejectBooking: async (id, message) => {
    const response = await api.put(`/guide-bookings/${id}/reject`, { message });
    return response.data;
  },

  // Guide: Complete booking
  completeBooking: async (id) => {
    const response = await api.put(`/guide-bookings/${id}/complete`);
    return response.data;
  }
};

export default bookingService;