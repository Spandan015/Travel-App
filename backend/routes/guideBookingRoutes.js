const express    = require('express');
const router     = express.Router();
const mongoose   = require('mongoose');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ── Try to load a GuideBooking model if it exists, otherwise use Booking ──────
// Adjust the model name/path to match whatever model stores guide bookings
// in your project (common names: GuideBooking, GuideTour, Booking with type:'guide')
let GuideBooking;
try {
  GuideBooking = require('../models/GuideBooking');
} catch {
  try {
    // Fallback: some projects reuse the main Booking model filtered by type
    GuideBooking = require('../models/Booking');
  } catch {
    GuideBooking = null;
  }
}

// ─── Admin: get all guide bookings ───────────────────────────────────────────
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    if (!GuideBooking) {
      return res.status(200).json({ success: true, bookings: [] });
    }

    const bookings = await GuideBooking.find()
      .populate('user',  'name email')
      .populate('guide', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (err) {
    console.error('Error fetching guide bookings:', err);
    res.status(500).json({ message: 'Error fetching guide bookings' });
  }
});

// ─── Admin: update status ─────────────────────────────────────────────────────
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    if (!GuideBooking) return res.status(404).json({ message: 'Model not found' });
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

// ─── User: get own guide bookings ─────────────────────────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    if (!GuideBooking) return res.json({ success: true, bookings: [] });
    const bookings = await GuideBooking.find({ user: req.user.id })
      .populate('guide', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;