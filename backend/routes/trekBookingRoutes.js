const express = require('express');
const router  = express.Router();
const {
  createTrekBooking,
  getUserTrekBookings,
  getAllTrekBookings,
  cancelTrekBooking,
} = require('../controllers/trekBookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/',          protect, createTrekBooking);
router.get('/my',         protect, getUserTrekBookings);
router.get('/admin/all',  protect, adminOnly, getAllTrekBookings);
router.put('/:id/cancel', protect, cancelTrekBooking);

module.exports = router;