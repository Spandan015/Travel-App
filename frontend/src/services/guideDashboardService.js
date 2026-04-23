import api from './api';

const guideDashboardService = {
  // ── Overview stats ────────────────────────────────────────
  // Tries new route first, falls back to building stats from guide-bookings
  getStats: async () => {
    try {
      const r = await api.get('/guide-dashboard/stats');
      return r.data;
    } catch (err) {
      // Fallback: build stats from the old guide-bookings route
      try {
        const r = await api.get('/guide-bookings/my-requests');
        const bookings = r.data?.bookings || [];
        const completed = bookings.filter((b) => b.status === 'completed');
        const accepted  = bookings.filter((b) => b.status === 'accepted');
        const pending   = bookings.filter((b) => b.status === 'pending');
        const now       = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalEarnings   = completed.reduce((s, b) => s + (b.totalPrice || 0), 0);
        const monthlyEarnings = completed
          .filter((b) => new Date(b.updatedAt) >= monthStart)
          .reduce((s, b) => s + (b.totalPrice || 0), 0);

        const ratings = bookings.filter((b) => b.review?.rating).map((b) => b.review.rating);
        const avgRating = ratings.length ? (ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1) : 0;

        const upcoming = accepted
          .filter((b) => new Date(b.startDate) >= now)
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .slice(0, 5);

        // Build 6-month breakdown
        const monthlyBreakdown = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const e = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
          const earned = completed
            .filter((b) => { const u = new Date(b.updatedAt); return u >= d && u <= e; })
            .reduce((s, b) => s + (b.totalPrice || 0), 0);
          monthlyBreakdown.push({ month: d.toLocaleString('default', { month: 'short' }), earnings: earned });
        }

        return {
          success: true,
          stats: {
            totalBookings:   bookings.length,
            pendingCount:    pending.length,
            acceptedCount:   accepted.length,
            completedCount:  completed.length,
            cancelledCount:  bookings.filter((b) => b.status === 'cancelled').length,
            totalEarnings,
            monthlyEarnings,
            weeklyEarnings:  0,
            pendingEarnings: accepted.reduce((s, b) => s + (b.totalPrice || 0), 0),
            avgRating:       Number(avgRating),
            totalReviews:    ratings.length,
            upcoming,
            recentBookings:  bookings.slice(0, 5),
            monthlyBreakdown,
          },
        };
      } catch {
        return { success: true, stats: null };
      }
    }
  },

  // ── Bookings ──────────────────────────────────────────────
  getBookings: async (status = 'all') => {
    try {
      // Try new route first
      const r = await api.get(`/guide-dashboard/bookings?status=${status}`);
      return r.data;
    } catch {
      // Fallback to old route
      try {
        const params = status && status !== 'all' ? `?status=${status}` : '';
        const r = await api.get(`/guide-bookings/my-requests${params}`);
        return r.data;
      } catch {
        return { bookings: [] };
      }
    }
  },

  acceptBooking: async (id, message = '') => {
    try {
      const r = await api.put(`/guide-dashboard/bookings/${id}/accept`, { message });
      return r.data;
    } catch {
      const r = await api.put(`/guide-bookings/${id}/accept`, { message });
      return r.data;
    }
  },

  rejectBooking: async (id, message = '') => {
    try {
      const r = await api.put(`/guide-dashboard/bookings/${id}/reject`, { message });
      return r.data;
    } catch {
      const r = await api.put(`/guide-bookings/${id}/reject`, { message });
      return r.data;
    }
  },

  completeBooking: async (id) => {
    try {
      const r = await api.put(`/guide-dashboard/bookings/${id}/complete`);
      return r.data;
    } catch {
      const r = await api.put(`/guide-bookings/${id}/complete`);
      return r.data;
    }
  },

  cancelBooking: async (id, reason = '') => {
    try {
      const r = await api.put(`/guide-dashboard/bookings/${id}/cancel`, { reason });
      return r.data;
    } catch {
      const r = await api.put(`/guide-bookings/${id}/cancel`, { cancellationReason: reason });
      return r.data;
    }
  },

  // ── Reviews ───────────────────────────────────────────────
  getReviews: async () => {
    try {
      const r = await api.get('/guide-dashboard/reviews');
      return r.data;
    } catch {
      return { reviews: [], avgRating: 0, total: 0 };
    }
  },

  addReview: (bookingId, { rating, comment }) =>
    api.post(`/guide-dashboard/bookings/${bookingId}/review`, { rating, comment }).then((r) => r.data),

  // ── Profile & Availability ────────────────────────────────
  updateProfile: (data) =>
    api.put('/guide-dashboard/profile', data).then((r) => r.data),

  updateAvailability: (data) =>
    api.put('/guide-dashboard/availability', data).then((r) => r.data),

  // ── Earnings ──────────────────────────────────────────────
  getEarnings: async () => {
    try {
      const r = await api.get('/guide-dashboard/earnings');
      return r.data;
    } catch {
      // Build from bookings fallback
      try {
        const r = await api.get('/guide-bookings/my-requests');
        const bookings  = r.data?.bookings || [];
        const completed = bookings.filter((b) => b.status === 'completed');
        const accepted  = bookings.filter((b) => b.status === 'accepted');
        const now       = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const weekStart  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const total   = completed.reduce((s, b) => s + (b.totalPrice || 0), 0);
        const monthly = completed.filter((b) => new Date(b.updatedAt) >= monthStart).reduce((s, b) => s + (b.totalPrice || 0), 0);
        const weekly  = completed.filter((b) => new Date(b.updatedAt) >= weekStart).reduce((s, b) => s + (b.totalPrice || 0), 0);
        const pending = accepted.reduce((s, b) => s + (b.totalPrice || 0), 0);

        const breakdown = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const e = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
          const earned = completed.filter((b) => { const u = new Date(b.updatedAt); return u >= d && u <= e; }).reduce((s, b) => s + (b.totalPrice || 0), 0);
          breakdown.push({ month: d.toLocaleString('default', { month: 'short' }), earnings: earned });
        }

        return { success: true, earnings: { total, monthly, weekly, pending }, history: completed, breakdown };
      } catch {
        return { earnings: { total: 0, monthly: 0, weekly: 0, pending: 0 }, history: [], breakdown: [] };
      }
    }
  },
};

export default guideDashboardService;