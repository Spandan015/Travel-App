const express = require('express');
const router  = express.Router();

const {
  getAll,
} = require('../controllers/bookingController');

const {
  getUserPackageBookings,
  cancelPackageBooking,
  getPackageBookingById,
  createPackageBooking,
  getAllPackageBookings,
  updatePackageBookingStatus,
} = require('../controllers/packageBookingController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// ── Admin ─────────────────────────────────────────────────────────
router.get('/admin/all', protect, adminOnly, getAllPackageBookings);

// ── User routes ───────────────────────────────────────────────────
router.get('/my',  protect, getUserPackageBookings);
router.post('/',   protect, createPackageBooking);

// Status update — support both PUT and PATCH for admin
router.put('/:id/status',   protect, adminOnly, updatePackageBookingStatus);
router.patch('/:id/status', protect, adminOnly, updatePackageBookingStatus);

// Cancel
router.put('/:id/cancel', protect, cancelPackageBooking);

// Single booking — must be last to avoid catching /my, /admin/all etc.
router.get('/:id', protect, getPackageBookingById);

module.exports = router;