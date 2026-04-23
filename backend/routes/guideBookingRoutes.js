const express    = require('express');
const router     = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  createGuideBooking,
  getMyGuideBookings,
  getMyGuideRequests,
  getGuideBookingById,
  acceptGuideBooking,
  rejectGuideBooking,
  cancelGuideBooking,
  completeGuideBooking,
  getAllGuideBookings,
} = require('../controllers/guideBookingController');

// ── Tourist routes ────────────────────────────────────────────────────────────
// Create a new booking request
router.post('/',    protect, createGuideBooking);

// Tourist: get their own bookings
router.get('/my',   protect, getMyGuideBookings);

// ── Guide routes ──────────────────────────────────────────────────────────────
// ✅ Guide: get bookings assigned to them (used by dashboard)
router.get('/my-requests', protect, getMyGuideRequests);

// Guide: accept / reject / complete
router.put('/:id/accept',   protect, acceptGuideBooking);
router.put('/:id/reject',   protect, rejectGuideBooking);
router.put('/:id/complete', protect, completeGuideBooking);

// Either party: cancel
router.put('/:id/cancel',   protect, cancelGuideBooking);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get('/admin/all',    protect, adminOnly, getAllGuideBookings);
router.put('/:id/status',   protect, adminOnly, async (req, res) => {
  try {
    const GuideBooking = require('../models/GuideBooking');
    const booking = await GuideBooking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Single booking (auth checked inside controller) ───────────────────────────
router.get('/:id', protect, getGuideBookingById);

module.exports = router;