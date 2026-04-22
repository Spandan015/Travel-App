const GuideBooking = require('../models/GuideBooking');
const User         = require('../models/User');

// User: Create a guide booking request
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
      tourType
    } = req.body;

    // Validation
    if (!guide || !startDate || !endDate || !durationType || !duration || !numberOfPeople) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if guide exists and is approved
    const guideUser = await User.findById(guide);
    if (!guideUser || guideUser.role !== 'guide') {
      return res.status(404).json({ message: 'Guide not found' });
    }

    if (!guideUser.guideProfile?.isApproved) {
      return res.status(400).json({ message: 'Guide is not yet approved' });
    }

    if (!guideUser.guideProfile?.availability) {
      return res.status(400).json({ message: 'Guide is currently unavailable' });
    }

    // Calculate price
    const pricePerUnit = durationType === 'hourly'
      ? guideUser.guideProfile.hourlyRate
      : guideUser.guideProfile.dailyRate;

    const totalPrice = pricePerUnit * duration;

    const booking = await GuideBooking.create({
      user: req.user.id,
      guide,
      destination,
      startDate,
      endDate,
      durationType,
      duration,
      pricePerUnit,
      totalPrice,
      numberOfPeople,
      specialRequests,
      tourType
    });

    const populatedBooking = await GuideBooking.findById(booking._id)
      .populate('user',        'username email phone')
      .populate('guide',       'username email phone guideProfile')
      .populate('destination', 'name location');



    res.status(201).json({
      success: true,
      message: 'Guide booking request created successfully',
      booking: populatedBooking
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// User: Get my guide bookings
exports.getMyGuideBookings = async (req, res) => {
  try {
    const bookings = await GuideBooking.find({ user: req.user.id })
      .populate('guide',       'username email phone guideProfile')
      .populate('destination', 'name location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Guide: Get bookings for my guide services
exports.getMyGuideRequests = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = { guide: req.user.id };
    if (status) {
      filter.status = status;
    }

    const bookings = await GuideBooking.find(filter)
      .populate('user',        'username email phone')
      .populate('destination', 'name location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single guide booking
exports.getGuideBookingById = async (req, res) => {
  try {
    const booking = await GuideBooking.findById(req.params.id)
      .populate('user',        'username email phone')
      .populate('guide',       'username email phone guideProfile')
      .populate('destination', 'name location');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const isUser  = booking.user._id.toString()  === req.user.id;
    const isGuide = booking.guide._id.toString()  === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isUser && !isGuide && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Guide: Accept a booking request
exports.acceptGuideBooking = async (req, res) => {
  try {
    const booking = await GuideBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.guide.toString() !== req.user.id) return res.status(403).json({ message: 'Access denied' });
    if (booking.status !== 'pending') return res.status(400).json({ message: 'Booking is no longer pending' });

    booking.status               = 'accepted';
    booking.guideResponse        = { respondedAt: new Date(), message: req.body.message || '' };
    await booking.save();

    res.json({ success: true, message: 'Booking accepted', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Guide: Reject a booking request
exports.rejectGuideBooking = async (req, res) => {
  try {
    const booking = await GuideBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.guide.toString() !== req.user.id) return res.status(403).json({ message: 'Access denied' });
    if (booking.status !== 'pending') return res.status(400).json({ message: 'Booking is no longer pending' });

    booking.status               = 'rejected';
    booking.guideResponse        = { respondedAt: new Date(), message: req.body.message || '' };
    await booking.save();

    res.json({ success: true, message: 'Booking rejected', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// User or Guide: Cancel a booking
exports.cancelGuideBooking = async (req, res) => {
  try {
    const booking = await GuideBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const isUser  = booking.user.toString()  === req.user.id;
    const isGuide = booking.guide.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isUser && !isGuide && !isAdmin) return res.status(403).json({ message: 'Access denied' });
    if (['completed', 'cancelled'].includes(booking.status))
      return res.status(400).json({ message: 'Booking cannot be cancelled' });

    booking.status             = 'cancelled';
    booking.cancelledBy        = isAdmin ? 'admin' : isGuide ? 'guide' : 'user';
    booking.cancellationReason = req.body.cancellationReason;
    booking.cancelledAt        = new Date();
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark booking as completed
exports.completeGuideBooking = async (req, res) => {
  try {
    const booking = await GuideBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const isGuide = booking.guide.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isGuide && !isAdmin) return res.status(403).json({ message: 'Access denied' });
    if (booking.status !== 'accepted') return res.status(400).json({ message: 'Only accepted bookings can be completed' });

    booking.status        = 'completed';
    booking.paymentStatus = 'paid';
    await booking.save();

    res.json({ success: true, message: 'Booking marked as completed', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get all guide bookings
exports.getAllGuideBookings = async (req, res) => {
  try {
    const bookings = await GuideBooking.find()
      .populate('user',        'username email phone')
      .populate('guide',       'username email phone guideProfile')
      .populate('destination', 'name location')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};