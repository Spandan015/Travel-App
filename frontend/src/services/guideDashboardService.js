import api from './api';

const guideDashboardService = {
  // ── Overview ──────────────────────────────────────────────
  getStats: () =>
    api.get('/guide-dashboard/stats').then((r) => r.data),

  getEarnings: () =>
    api.get('/guide-dashboard/earnings').then((r) => r.data),

  // ── Bookings ──────────────────────────────────────────────
  getBookings: (status = 'all') =>
    api.get(`/guide-dashboard/bookings?status=${status}`).then((r) => r.data),

  acceptBooking: (id, message = '') =>
    api.put(`/guide-dashboard/bookings/${id}/accept`, { message }).then((r) => r.data),

  rejectBooking: (id, message = '') =>
    api.put(`/guide-dashboard/bookings/${id}/reject`, { message }).then((r) => r.data),

  completeBooking: (id) =>
    api.put(`/guide-dashboard/bookings/${id}/complete`).then((r) => r.data),

  cancelBooking: (id, reason = '') =>
    api.put(`/guide-dashboard/bookings/${id}/cancel`, { reason }).then((r) => r.data),

  // ── Reviews ───────────────────────────────────────────────
  getReviews: () =>
    api.get('/guide-dashboard/reviews').then((r) => r.data),

  addReview: (bookingId, { rating, comment }) =>
    api.post(`/guide-dashboard/bookings/${bookingId}/review`, { rating, comment }).then((r) => r.data),

  // ── Profile & Availability ────────────────────────────────
  updateProfile: (data) =>
    api.put('/guide-dashboard/profile', data).then((r) => r.data),

  updateAvailability: (data) =>
    api.put('/guide-dashboard/availability', data).then((r) => r.data),
};

export default guideDashboardService;
