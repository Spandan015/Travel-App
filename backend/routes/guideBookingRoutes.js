const express = require('express');
const router = express.Router();
const {
  createGuideBooking,
  getMyGuideBookings,
  getMyGuideRequests,
  getGuideBookingById,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
  addGuideReview,
  getAllGuideBookings
} = require('../controllers/guideBookingController');
const { protect, guideOnly, adminOnly } = require('../middleware/authMiddleware');

// User routes
router.post('/', protect, createGuideBooking);
router.get('/my', protect, getMyGuideBookings);
router.post('/:id/review', protect, addGuideReview);

// Guide routes
router.get('/requests', protect, guideOnly, getMyGuideRequests);
router.put('/:id/accept', protect, guideOnly, acceptBooking);
router.put('/:id/reject', protect, guideOnly, rejectBooking);
router.put('/:id/complete', protect, guideOnly, completeBooking);

// User or Guide routes
router.get('/:id', protect, getGuideBookingById);
router.put('/:id/cancel', protect, cancelBooking);

// Admin routes
router.get('/admin/all', protect, adminOnly, getAllGuideBookings);

module.exports = router;