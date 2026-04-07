const Booking = require('../models/booking');

// Get all bookings (admin only)
exports.getAll = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'username email')
      .populate('package', 'name price duration images mainImage')
      .populate('destination', 'name location');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user's bookings
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('package', 'name price duration images mainImage')
      .populate('destination', 'name location')
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get booking by ID
exports.getById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'username email')
      .populate('package', 'name price duration images mainImage')
      .populate('destination', 'name location');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create new booking
exports.create = async (req, res) => {
  try {
    const bookingData = {
      ...req.body,
      user: req.user._id
    };
    const booking = await Booking.create(bookingData);
    const populatedBooking = await Booking.findById(booking._id)
      .populate('package', 'name price duration images mainImage')
      .populate('destination', 'name location');
    res.status(201).json(populatedBooking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update booking status
exports.updateStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
      .populate('package', 'name price duration images mainImage')
      .populate('destination', 'name location');

    res.json(updatedBooking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    )
      .populate('package', 'name price duration images mainImage')
      .populate('destination', 'name location');

    res.json(updatedBooking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};