import api from './api';

const bookingService = {
  // ===== HOTEL BOOKINGS =====
  createHotelBooking: async (bookingData) => {
    const response = await api.post('/hotel-bookings', bookingData);
    return response.data;
  },

  getUserHotelBookings: async () => {
    const response = await api.get('/hotel-bookings/my');
    return response.data;
  },

  getHotelBookingById: async (id) => {
    const response = await api.get(`/hotel-bookings/${id}`);
    return response.data;
  },

  cancelHotelBooking: async (id, reason) => {
    const response = await api.put(`/hotel-bookings/${id}/cancel`, { cancellationReason: reason });
    return response.data;
  },

  // ===== GUIDE BOOKINGS =====
  createGuideBooking: async (bookingData) => {
    const response = await api.post('/guide-bookings', bookingData);
    return response.data;
  },

  // ── FIX: was getMyGuideBookings, UserBookings.jsx calls getUserGuideBookings ──
  getUserGuideBookings: async () => {
    const response = await api.get('/guide-bookings/my');
    return response.data;
  },

  // Keep old name as alias so nothing else breaks
  getMyGuideBookings: async () => {
    const response = await api.get('/guide-bookings/my');
    return response.data;
  },

  // ===== PACKAGE BOOKINGS =====
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  getUserBookings: async () => {
    const response = await api.get('/bookings/my');
    return response.data;
  },

  getBookingById: async (id) => {
    const response = await api.get(`/guide-bookings/${id}`);
    return response.data;
  },

  cancelGuideBooking: async (id, reason) => {
    const response = await api.put(`/guide-bookings/${id}/cancel`, { cancellationReason: reason });
    return response.data;
  },

  cancelPackageBooking: async (id) => {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
  },

  addReview: async (id, reviewData) => {
    const response = await api.post(`/guide-bookings/${id}/review`, reviewData);
    return response.data;
  },

  getBookingRequests: async (status) => {
    const params = status ? `?status=${status}` : '';
    const response = await api.get(`/guide-bookings/requests${params}`);
    return response.data;
  },

  acceptBooking: async (id, message) => {
    const response = await api.put(`/guide-bookings/${id}/accept`, { message });
    return response.data;
  },

  rejectBooking: async (id, message) => {
    const response = await api.put(`/guide-bookings/${id}/reject`, { message });
    return response.data;
  },

  completeBooking: async (id) => {
    const response = await api.put(`/guide-bookings/${id}/complete`);
    return response.data;
  }
};

export default bookingService;