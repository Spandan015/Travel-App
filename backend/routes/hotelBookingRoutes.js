const express = require('express');
const router = express.Router();
const {
  createHotelBooking,
  getUserHotelBookings,
  getHotelBookingById,
  cancelHotelBooking,
  getAllHotelBookings,
  updateHotelBookingStatus
} = require('../controllers/hotelBookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// User routes
router.post('/', protect, createHotelBooking);
router.get('/my', protect, getUserHotelBookings);
router.get('/:id', protect, getHotelBookingById);
router.put('/:id/cancel', protect, cancelHotelBooking);

// Admin routes
router.get('/admin/all', protect, adminOnly, getAllHotelBookings);
router.put('/:id/status', protect, adminOnly, updateHotelBookingStatus);

module.exports = router;
