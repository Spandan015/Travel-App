const GuideBooking = require('../models/GuideBooking');
const User         = require('../models/User');
const { sendGuideBookingConfirmation } = require('../utils/emailService');

// ─── Helper: safe populate ───────────────────────────────────────────────────
const populateBooking = (query) =>
  query
    .populate('user',        'username firstName lastName email phone')
    .populate('guide',       'username firstName lastName email phone guideProfile')
    .populate('destination', 'name location');

// ════════════════════════════════════════════════════════════
// CREATE BOOKING  POST /api/guide-bookings
// ════════════════════════════════════════════════════════════
exports.createGuideBooking = async (req, res) => {
  try {
    const {
      guide,
      destination,
      startDate,
      endDate,
      durationType,
      duration,
      numberOfPeople,
      specialRequests,
      tourType,
      // legacy field names from old GuideDetails.jsx
      guideId,
      date,
      type,
      location,
    } = req.body;

    // ── Normalise field names (handle both old and new form shapes) ──────────
    const guideIdFinal      = guide      || guideId;
    const durationTypeFinal = durationType || type || 'daily';
    const durationFinal     = Number(duration || 1);
    const peopleFinal       = Number(numberOfPeople || 1);
    const startFinal        = startDate  || date;
    const endFinal          = endDate    || date; // fallback same day

    // ── Required field check ─────────────────────────────────────────────────
    if (!guideIdFinal) {
      return res.status(400).json({ message: 'Guide ID is required.' });
    }
    if (!startFinal) {
      return res.status(400).json({ message: 'Start date is required.' });
    }
    if (!durationTypeFinal || !['hourly', 'daily'].includes(durationTypeFinal)) {
      return res.status(400).json({ message: 'Duration type must be "hourly" or "daily".' });
    }
    if (!durationFinal || durationFinal < 1) {
      return res.status(400).json({ message: 'Duration must be at least 1.' });
    }

    // ── Find guide user ──────────────────────────────────────────────────────
    const guideUser = await User.findById(guideIdFinal);

    if (!guideUser) {
      return res.status(404).json({ message: `Guide not found with ID: ${guideIdFinal}` });
    }

    if (guideUser.role !== 'guide') {
      return res.status(400).json({
        message: `This user is not a guide (role: ${guideUser.role}). Only approved guides can be booked.`,
      });
    }

    // ── isApproved check — be lenient for legacy accounts ───────────────────
    // Some guides were approved before isApproved field existed
    const gp         = guideUser.guideProfile || {};
    const isApproved = gp.isApproved === true || gp.isApproved === undefined;
    // If guideProfile is completely missing but role is 'guide', allow it
    if (gp.isApproved === false) {
      return res.status(400).json({ message: 'This guide has not been approved yet.' });
    }

    // ── Availability check ───────────────────────────────────────────────────
    // Only block if explicitly set to false
    if (gp.availability === false) {
      return res.status(400).json({ message: 'This guide is currently unavailable for new bookings.' });
    }

    // ── Prevent self-booking ─────────────────────────────────────────────────
    if (guideUser._id.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: 'You cannot book yourself as a guide.' });
    }

    // ── Calculate price ──────────────────────────────────────────────────────
    const pricePerUnit =
      durationTypeFinal === 'hourly'
        ? (gp.hourlyRate || 0)
        : (gp.dailyRate  || 0);

    const totalPrice = pricePerUnit * durationFinal;

    // ── Calculate end date if not provided ───────────────────────────────────
    let computedEndDate = endFinal;
    if (!computedEndDate) {
      const start = new Date(startFinal);
      if (durationTypeFinal === 'daily') {
        computedEndDate = new Date(start.getTime() + durationFinal * 24 * 3600 * 1000);
      } else {
        computedEndDate = start; // same day for hourly
      }
    }

    // ── Create booking ───────────────────────────────────────────────────────
    const booking = await GuideBooking.create({
      user:            req.user.id,
      guide:           guideUser._id,
      destination:     destination || null,
      startDate:       new Date(startFinal),
      endDate:         new Date(computedEndDate),
      durationType:    durationTypeFinal,
      duration:        durationFinal,
      pricePerUnit,
      totalPrice,
      numberOfPeople:  peopleFinal,
      specialRequests: specialRequests || location || '',
      tourType:        tourType || '',
      status:          'pending',
      paymentStatus:   'pending',
    });

    const populatedBooking = await populateBooking(
      GuideBooking.findById(booking._id)
    );

    // ── Send confirmation email ──────────────────────────────────────────────
    try {
      await sendGuideBookingConfirmation({
        ...populatedBooking.toObject(),
        user:  { ...populatedBooking.user.toObject(), email: req.user.email },
        guide: populatedBooking.guide,
      });
    } catch (emailErr) {
      console.error('Guide booking email failed (non-fatal):', emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Booking request sent successfully! The guide will review and respond soon.',
      booking: populatedBooking,
    });
  } catch (err) {
    console.error('createGuideBooking error:', err);
    // Return the actual error message in development
    res.status(500).json({
      message: 'Server error creating booking.',
      error:   process.env.NODE_ENV !== 'production' ? err.message : undefined,
    });
  }
};

// ════════════════════════════════════════════════════════════
// GET MY BOOKINGS (tourist)  GET /api/guide-bookings/my
// ════════════════════════════════════════════════════════════
exports.getMyGuideBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { user: req.user.id };
    if (status && status !== 'all') filter.status = status;

    const bookings = await populateBooking(
      GuideBooking.find(filter).sort({ createdAt: -1 })
    );

    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ════════════════════════════════════════════════════════════
// GET MY REQUESTS (guide)  GET /api/guide-bookings/my-requests
// ════════════════════════════════════════════════════════════
exports.getMyGuideRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { guide: req.user.id };
    if (status && status !== 'all') filter.status = status;

    const bookings = await populateBooking(
      GuideBooking.find(filter).sort({ createdAt: -1 })
    );

    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ════════════════════════════════════════════════════════════
// GET SINGLE BOOKING  GET /api/guide-bookings/:id
// ════════════════════════════════════════════════════════════
exports.getGuideBookingById = async (req, res) => {
  try {
    const booking = await populateBooking(
      GuideBooking.findById(req.params.id)
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const isUser  = booking.user._id.toString() === req.user.id;
    const isGuide = booking.guide._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isUser && !isGuide && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ════════════════════════════════════════════════════════════
// ACCEPT  PUT /api/guide-bookings/:id/accept
// ════════════════════════════════════════════════════════════
exports.acceptGuideBooking = async (req, res) => {
  try {
    const booking = await GuideBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.guide.toString() !== req.user.id)
      return res.status(403).json({ message: 'Access denied' });
    if (booking.status !== 'pending')
      return res.status(400).json({ message: 'Booking is no longer pending' });

    booking.status        = 'accepted';
    booking.guideResponse = { respondedAt: new Date(), message: req.body.message || 'Booking confirmed!' };
    await booking.save();

    res.json({ success: true, message: 'Booking accepted', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ════════════════════════════════════════════════════════════
// REJECT  PUT /api/guide-bookings/:id/reject
// ════════════════════════════════════════════════════════════
exports.rejectGuideBooking = async (req, res) => {
  try {
    const booking = await GuideBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.guide.toString() !== req.user.id)
      return res.status(403).json({ message: 'Access denied' });
    if (booking.status !== 'pending')
      return res.status(400).json({ message: 'Booking is no longer pending' });

    booking.status        = 'rejected';
    booking.guideResponse = { respondedAt: new Date(), message: req.body.message || '' };
    await booking.save();

    res.json({ success: true, message: 'Booking rejected', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ════════════════════════════════════════════════════════════
// CANCEL  PUT /api/guide-bookings/:id/cancel
// ════════════════════════════════════════════════════════════
exports.cancelGuideBooking = async (req, res) => {
  try {
    const booking = await GuideBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const isUser  = booking.user.toString()  === req.user.id;
    const isGuide = booking.guide.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isUser && !isGuide && !isAdmin)
      return res.status(403).json({ message: 'Access denied' });
    if (['completed', 'cancelled'].includes(booking.status))
      return res.status(400).json({ message: 'Booking cannot be cancelled' });

    booking.status             = 'cancelled';
    booking.cancelledBy        = isAdmin ? 'admin' : isGuide ? 'guide' : 'user';
    booking.cancellationReason = req.body.cancellationReason || req.body.reason || '';
    booking.cancelledAt        = new Date();
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ════════════════════════════════════════════════════════════
// COMPLETE  PUT /api/guide-bookings/:id/complete
// ════════════════════════════════════════════════════════════
exports.completeGuideBooking = async (req, res) => {
  try {
    const booking = await GuideBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const isGuide = booking.guide.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isGuide && !isAdmin)
      return res.status(403).json({ message: 'Access denied' });
    if (booking.status !== 'accepted')
      return res.status(400).json({ message: 'Only accepted bookings can be completed' });

    booking.status        = 'completed';
    booking.paymentStatus = 'paid';
    await booking.save();

    res.json({ success: true, message: 'Booking marked as completed', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ════════════════════════════════════════════════════════════
// ADD REVIEW  POST /api/guide-bookings/:id/review
// ════════════════════════════════════════════════════════════
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });

    const booking = await GuideBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user.id)
      return res.status(403).json({ message: 'Only the tourist can leave a review' });
    if (booking.status !== 'completed')
      return res.status(400).json({ message: 'Can only review completed bookings' });
    if (booking.review?.rating)
      return res.status(400).json({ message: 'Review already submitted' });

    booking.review = { rating, comment, reviewedAt: new Date() };
    await booking.save();

    res.json({ success: true, message: 'Review submitted', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ════════════════════════════════════════════════════════════
// ADMIN: GET ALL  GET /api/guide-bookings/admin/all
// ════════════════════════════════════════════════════════════
exports.getAllGuideBookings = async (req, res) => {
  try {
    const bookings = await populateBooking(
      GuideBooking.find().sort({ createdAt: -1 })
    );
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};