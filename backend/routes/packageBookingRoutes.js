const express = require('express');
const router  = express.Router();
const {
  createPackageBooking,
  getUserPackageBookings,
  getAllPackageBookings,
  cancelPackageBooking,
} = require('../controllers/packageBookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/',          protect, createPackageBooking);
router.get('/my',         protect, getUserPackageBookings);
router.get('/admin/all',  protect, adminOnly, getAllPackageBookings);
router.put('/:id/cancel', protect, cancelPackageBooking);

module.exports = router;