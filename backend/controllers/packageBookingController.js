const PackageBooking = require('../models/PackageBooking');
const TravelPackage  = require('../models/TravelPackage');
const User           = require('../models/User');
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

// POST /api/bookings
exports.createPackageBooking = async (req, res) => {
  try {
    const {
      packageId,
      startDate,
      numberOfGuests,
      specialRequests,
      // Guide fields (Phase 2 — optional at booking time)
      guideId,
      guideRequested,
    } = req.body;

    const pkg = await TravelPackage.findById(packageId);
    if (!pkg)                   return res.status(404).json({ message: 'Package not found' });
    if (pkg.isActive === false) return res.status(400).json({ message: 'Package is not available' });

    const price      = typeof pkg.price === 'object' ? pkg.price?.amount : pkg.price;
    let   totalPrice = Number(price || 0) * Number(numberOfGuests || 1);

    // Calculate end date
    let endDate;
    if (startDate && pkg.duration) {
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Number(pkg.duration));
    }

    // ── Guide assignment at booking time ────────────────────────────────────
    let guideData   = null;
    let guidePayment = { guideFee: 0, platformFee: 0, splitPercent: 75, status: 'na' };

    if (guideId && guideRequested) {
      const guideUser = await User.findById(guideId);
      if (guideUser && guideUser.role === 'guide') {
        guideData = guideUser;
        const durationDays = pkg.duration || 1;
        const fees = computeGuideFees(guideUser, durationDays);
        totalPrice  += fees.rawGuideFee; // add guide fee to total
        guidePayment = {
          guideFee:     fees.guideFee,
          platformFee:  fees.platformFee,
          splitPercent: 75,
          status:       'pending',
        };
      }
    }

    const booking = await PackageBooking.create({
      package:        packageId,
      user:           req.user.id,
      startDate:      startDate ? new Date(startDate) : undefined,
      endDate,
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
      { path: 'package',       select: 'name price duration mainImage' },
      { path: 'user',          select: 'username email phone' },
      { path: 'assignedGuide', select: 'username firstName lastName email phone guideProfile' },
    ]);

    // Notify guide if assigned
    if (guideData) {
      try {
        await sendGuideAssignmentEmail({
          booking,
          guide: guideData,
          bookingType: 'package',
          itemName: pkg.name,
        });
      } catch (e) { console.error('Guide assignment email failed:', e.message); }
    }

    res.status(201).json({
      success: true,
      message: 'Package booking created — please complete payment',
      booking,
    });
  } catch (err) {
    console.error('Error creating package booking:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/bookings/my
exports.getUserPackageBookings = async (req, res) => {
  try {
    const bookings = await PackageBooking.find({ user: req.user.id })
      .populate('package',       'name price duration mainImage')
      .populate('assignedGuide', 'username firstName lastName email phone guideProfile')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/bookings/admin/all  (admin)
exports.getAllPackageBookings = async (req, res) => {
  try {
    const bookings = await PackageBooking.find()
      .populate('package',       'name price')
      .populate('user',          'username email')
      .populate('assignedGuide', 'username firstName lastName email guideProfile')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/bookings/:id/cancel
exports.cancelPackageBooking = async (req, res) => {
  console.log('[cancel] id:', req.params.id);
  try {
    const booking = await PackageBooking.findById(req.params.id);
    console.log('[cancel] found booking status:', booking?.status);
    console.log('[cancel] booking.user:', booking?.user?.toString());
    console.log('[cancel] req.user.id:', req.user?.id);
    console.log('[cancel] req.user._id:', req.user?._id?.toString());

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const userId = (req.user.id || req.user._id)?.toString();
    if (booking.user.toString() !== userId)
      return res.status(403).json({ message: 'Access denied' });

    if (['cancelled', 'completed'].includes(booking.status))
      return res.status(400).json({ message: 'Booking cannot be cancelled' });

    booking.status             = 'cancelled';
    booking.cancellationReason = req.body?.cancellationReason || '';
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled successfully', booking });
  } catch (err) {
    console.error('[cancelPackageBooking] ERROR:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// PUT /api/bookings/:id/status  (admin)
exports.updatePackageBookingStatus = async (req, res) => {
  try {
    const booking = await PackageBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = req.body.status;
    await booking.save();

    res.json({ success: true, message: 'Booking status updated', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ════════════════════════════════════════════════════════════
// PUT /api/bookings/:id/assign-guide  (admin)
// Phase 1: Admin assigns a guide to an existing package booking
// ════════════════════════════════════════════════════════════
exports.assignGuideToPackageBooking = async (req, res) => {
  try {
    const { guideId, notes } = req.body;

    const booking = await PackageBooking.findById(req.params.id)
      .populate('package', 'name duration price');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Allow unassigning by passing guideId = null
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
    if (!guideUser)               return res.status(404).json({ message: 'Guide not found' });
    if (guideUser.role !== 'guide') return res.status(400).json({ message: 'User is not a guide' });

    const durationDays = booking.package?.duration || 1;
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

    // Notify guide by email
    try {
      await sendGuideAssignmentEmail({
        booking,
        guide: guideUser,
        bookingType: 'package',
        itemName: booking.package?.name || 'Package',
      });
    } catch (e) { console.error('Guide assignment email failed (non-fatal):', e.message); }

    res.json({ success: true, message: `Guide ${guideUser.username} assigned successfully`, booking });
  } catch (err) {
    console.error('assignGuideToPackageBooking error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/bookings/guide/assigned  (guide)
// Guide sees package bookings assigned to them
exports.getAssignedPackageBookings = async (req, res) => {
  try {
    const bookings = await PackageBooking.find({ assignedGuide: req.user.id })
      .populate('package', 'name price duration mainImage itinerary')
      .populate('user',    'username firstName lastName email phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};




// GET /api/bookings/:id
exports.getPackageBookingById = async (req, res) => {
  try {
    const booking = await PackageBooking.findById(req.params.id)
      .populate('package',       'name price duration mainImage description itinerary')
      .populate('user',          'username firstName lastName email phone')
      .populate('assignedGuide', 'username firstName lastName email phone guideProfile');
 
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied' });
 
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};