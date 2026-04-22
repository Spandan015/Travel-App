const TrekBooking = require('../models/TrekBooking');
const Trek        = require('../models/Trek');

// POST /api/trek-bookings
exports.createTrekBooking = async (req, res) => {
  try {
    const { trekId, startDate, numberOfGuests, specialRequests } = req.body;

    const trek = await Trek.findById(trekId);
    if (!trek)                  return res.status(404).json({ message: 'Trek not found' });
    if (trek.isActive === false) return res.status(400).json({ message: 'Trek is not available' });

    const totalPrice = Number(trek.price || 0) * Number(numberOfGuests || 1);

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
    });

    try {
      await booking.populate([
        { path: 'trek', select: 'name price duration coverImage' },
        { path: 'user', select: 'username email phone' },
      ]);
    } catch (_) {}



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
      .populate('trek', 'name price duration coverImage')
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
      .populate('trek', 'name price')
      .populate('user', 'username email')
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
    if (booking.user.toString() !== req.user.id) return res.status(403).json({ message: 'Access denied' });
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