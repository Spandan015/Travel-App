const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Import guide-only middleware check inline (guideOnly may or may not exist)
const guideMiddleware = (req, res, next) => {
  if (req.user && (req.user.role === 'guide' || req.user.role === 'admin')) return next();
  return res.status(403).json({ message: 'Guide access required' });
};

const {
  getDashboardStats,
  getGuideBookings,
  acceptBooking,
  rejectBooking,
  completeBooking,
  cancelBooking,
  getGuideReviews,
  addReview,
  updateAvailability,
  updateProfile,
  getEarnings,
} = require('../controllers/guideDashboardController');

// Dashboard overview
router.get('/stats',               protect, guideMiddleware, getDashboardStats);
router.get('/earnings',            protect, guideMiddleware, getEarnings);
router.get('/reviews',             protect, guideMiddleware, getGuideReviews);

// Booking management
router.get('/bookings',            protect, guideMiddleware, getGuideBookings);
router.put('/bookings/:id/accept', protect, guideMiddleware, acceptBooking);
router.put('/bookings/:id/reject', protect, guideMiddleware, rejectBooking);
router.put('/bookings/:id/complete', protect, guideMiddleware, completeBooking);
router.put('/bookings/:id/cancel', protect, guideMiddleware, cancelBooking);

// Tourist: add review to completed booking
router.post('/bookings/:id/review', protect, addReview);

// Profile & availability
router.put('/profile',             protect, guideMiddleware, updateProfile);
router.put('/availability',        protect, guideMiddleware, updateAvailability);

module.exports = router;
