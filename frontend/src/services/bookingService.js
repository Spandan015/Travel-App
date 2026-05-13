import api from './api';

const bookingService = {
  // ===== PACKAGE BOOKINGS =====
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },
  getUserBookings: async () => {
    const response = await api.get('/bookings/my');
    return response.data;
  },
  getPackageBookingById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },
  cancelPackageBooking: async (id) => {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
  },

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

  // ===== TREK BOOKINGS =====
  createTrekBooking: async (bookingData) => {
    const response = await api.post('/trek-bookings', bookingData);
    return response.data;
  },
  getUserTrekBookings: async () => {
    const response = await api.get('/trek-bookings/my');
    return response.data;
  },
  getTrekBookingById: async (id) => {
    const response = await api.get(`/trek-bookings/${id}`);
    return response.data;
  },
  cancelTrekBooking: async (id) => {
    const response = await api.put(`/trek-bookings/${id}/cancel`);
    return response.data;
  },

  // ===== GUIDE BOOKINGS =====
  createGuideBooking: async (bookingData) => {
    const response = await api.post('/guide-bookings', bookingData);
    return response.data;
  },
  getUserGuideBookings: async () => {
    const response = await api.get('/guide-bookings/my');
    return response.data;
  },
  getMyGuideBookings: async () => {
    const response = await api.get('/guide-bookings/my');
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
  },
};

export default bookingService;