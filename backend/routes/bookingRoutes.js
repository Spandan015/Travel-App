const express = require('express');
const router  = express.Router();
const {
  getAll,
  getUserBookings,
  getById,
  create,
  updateStatus,
  cancelBooking
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ─── Admin routes ─────────────────────────────────────────────────────────────
// ✅ Both GET / and GET /admin/all return all bookings for admin panel
router.get('/admin/all', protect, adminOnly, getAll);
router.get('/',          protect, adminOnly, getAll);   // ✅ ADDED — fixes 404 on /api/bookings

// ─── User routes ──────────────────────────────────────────────────────────────
router.get('/my',   protect, getUserBookings);
router.get('/:id',  protect, getById);
router.post('/',    protect, create);
router.patch('/:id/status', protect, updateStatus);
router.put('/:id/cancel',   protect, cancelBooking);

module.exports = router;