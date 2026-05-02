const TrekBooking = require('../models/TrekBooking');
const Trek        = require('../models/Trek');
const User        = require('../models/User');
const { sendGuideAssignmentEmail } = require('../utils/emailService');

const GUIDE_SPLIT = 0.75; // guide gets 75%

// ── Helper: compute guide fees ────────────────────────────────────────────────
const computeGuideFees = (guideUser, durationDays) => {
  const gp          = guideUser.guideProfile || {};
  const dailyRate   = gp.dailyRate || 0;
  const guideFee    = dailyRate * durationDays;
  const platformFee = Math.round(guideFee * (1 - GUIDE_SPLIT));
  const guideEarns  = Math.round(guideFee * GUIDE_SPLIT);
  return { guideFee: guideEarns, platformFee, rawGuideFee: guideFee };
};

// POST /api/trek-bookings
exports.createTrekBooking = async (req, res) => {
  try {
    const {
      trekId,
      startDate,
      numberOfGuests,
      specialRequests,
      // Guide fields (Phase 2 — optional at booking time)
      guideId,
      guideRequested,
    } = req.body;

    const trek = await Trek.findById(trekId);
    if (!trek)                   return res.status(404).json({ message: 'Trek not found' });
    if (trek.isActive === false) return res.status(400).json({ message: 'Trek is not available' });

    let totalPrice = Number(trek.price || 0) * Number(numberOfGuests || 1);

    // ── Guide assignment at booking time ────────────────────────────────────
    let guideData    = null;
    let guidePayment = { guideFee: 0, platformFee: 0, splitPercent: 75, status: 'na' };

    if (guideId && guideRequested) {
      const guideUser = await User.findById(guideId);
      if (guideUser && guideUser.role === 'guide') {
        guideData = guideUser;
        const durationDays = trek.duration || 1;
        const fees = computeGuideFees(guideUser, durationDays);
        totalPrice  += fees.rawGuideFee;
        guidePayment = {
          guideFee:     fees.guideFee,
          platformFee:  fees.platformFee,
          splitPercent: 75,
          status:       'pending',
        };
      }
    }

    const booking = await TrekBooking.create({
      trek:           trekId,
      user:           req.user.id,
      startDate:      startDate ? new Date(startDate) : undefined,
      numberOfGuests: Number(numberOfGuests || 1),
      specialRequests,
      totalPrice,
      status:         'pending',
      paymentStatus:  'unpaid',
      contactInfo: {
        name:  req.user.username,
        email: req.user.email,
        phone: req.user.phone,
      },
      // Guide fields
      assignedGuide:   guideData?._id || null,
      guideRequested:  !!guideRequested,
      guidePayment,
      guideAssignedAt: guideData ? new Date() : null,
      guideAssignedBy: guideData ? 'user' : 'user',
    });

    await booking.populate([
      { path: 'trek',          select: 'name price duration coverImage' },
      { path: 'user',          select: 'username email phone' },
      { path: 'assignedGuide', select: 'username firstName lastName email phone guideProfile' },
    ]);

    if (guideData) {
      try {
        await sendGuideAssignmentEmail({
          booking,
          guide: guideData,
          bookingType: 'trek',
          itemName: trek.name,
        });
      } catch (e) { console.error('Guide assignment email failed:', e.message); }
    }

    res.status(201).json({
      success: true,
      message: 'Trek booking created — please complete payment',
      booking,
    });
  } catch (err) {
    console.error('Error creating trek booking:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/trek-bookings/my
exports.getUserTrekBookings = async (req, res) => {
  try {
    const bookings = await TrekBooking.find({ user: req.user.id })
      .populate('trek',          'name price duration coverImage')
      .populate('assignedGuide', 'username firstName lastName email phone guideProfile')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/trek-bookings/admin/all
exports.getAllTrekBookings = async (req, res) => {
  try {
    const bookings = await TrekBooking.find()
      .populate('trek',          'name price')
      .populate('user',          'username email')
      .populate('assignedGuide', 'username firstName lastName email guideProfile')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/trek-bookings/:id/cancel
exports.cancelTrekBooking = async (req, res) => {
  try {
    const booking = await TrekBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user.id)
      return res.status(403).json({ message: 'Access denied' });
    if (['cancelled', 'completed'].includes(booking.status))
      return res.status(400).json({ message: 'Booking cannot be cancelled' });

    booking.status             = 'cancelled';
    booking.cancellationReason = req.body.cancellationReason;
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/trek-bookings/:id/status  (admin)
exports.updateTrekBookingStatus = async (req, res) => {
  try {
    const booking = await TrekBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = req.body.status;
    await booking.save();

    res.json({ success: true, message: 'Booking status updated', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ════════════════════════════════════════════════════════════
// PUT /api/trek-bookings/:id/assign-guide  (admin)
// Phase 1: Admin assigns a guide to an existing trek booking
// ════════════════════════════════════════════════════════════
exports.assignGuideToTrekBooking = async (req, res) => {
  try {
    const { guideId, notes } = req.body;

    const booking = await TrekBooking.findById(req.params.id)
      .populate('trek', 'name duration price');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (!guideId) {
      booking.assignedGuide   = null;
      booking.guideRequested  = false;
      booking.guideAssignedAt = null;
      booking.guideNotes      = notes || '';
      booking.guidePayment    = { guideFee: 0, platformFee: 0, splitPercent: 75, status: 'na' };
      await booking.save();
      return res.json({ success: true, message: 'Guide unassigned', booking });
    }

    const guideUser = await User.findById(guideId);
    if (!guideUser)                 return res.status(404).json({ message: 'Guide not found' });
    if (guideUser.role !== 'guide') return res.status(400).json({ message: 'User is not a guide' });

    const durationDays = booking.trek?.duration || 1;
    const fees = computeGuideFees(guideUser, durationDays);

    booking.assignedGuide   = guideUser._id;
    booking.guideRequested  = true;
    booking.guideAssignedAt = new Date();
    booking.guideAssignedBy = 'admin';
    booking.guideNotes      = notes || '';
    booking.guidePayment    = {
      guideFee:     fees.guideFee,
      platformFee:  fees.platformFee,
      splitPercent: 75,
      status:       'pending',
    };

    await booking.save();
    await booking.populate('assignedGuide', 'username firstName lastName email phone guideProfile');

    try {
      await sendGuideAssignmentEmail({
        booking,
        guide: guideUser,
        bookingType: 'trek',
        itemName: booking.trek?.name || 'Trek',
      });
    } catch (e) { console.error('Guide assignment email failed (non-fatal):', e.message); }

    res.json({ success: true, message: `Guide ${guideUser.username} assigned successfully`, booking });
  } catch (err) {
    console.error('assignGuideToTrekBooking error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/trek-bookings/guide/assigned  (guide)
exports.getAssignedTrekBookings = async (req, res) => {
  try {
    const bookings = await TrekBooking.find({ assignedGuide: req.user.id })
      .populate('trek', 'name price duration coverImage itinerary')
      .populate('user', 'username firstName lastName email phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};