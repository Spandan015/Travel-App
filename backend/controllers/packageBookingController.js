const PackageBooking = require('../models/PackageBooking');
const TravelPackage  = require('../models/TravelPackage');

// POST /api/package-bookings
exports.createPackageBooking = async (req, res) => {
  try {
    const { packageId, startDate, numberOfGuests, specialRequests } = req.body;

    const pkg = await TravelPackage.findById(packageId);
    if (!pkg)                  return res.status(404).json({ message: 'Package not found' });
    if (pkg.isActive === false) return res.status(400).json({ message: 'Package is not available' });

    const price      = typeof pkg.price === 'object' ? pkg.price?.amount : pkg.price;
    const totalPrice = Number(price || 0) * Number(numberOfGuests || 1);

    // Calculate end date from duration
    let endDate;
    if (startDate && pkg.duration) {
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Number(pkg.duration));
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
    });

    try {
      await booking.populate([
        { path: 'package', select: 'name price duration mainImage' },
        { path: 'user',    select: 'username email phone' },
      ]);
    } catch (_) {}



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

// GET /api/package-bookings/my
exports.getUserPackageBookings = async (req, res) => {
  try {
    const bookings = await PackageBooking.find({ user: req.user.id })
      .populate('package', 'name price duration mainImage')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/package-bookings/admin/all
exports.getAllPackageBookings = async (req, res) => {
  try {
    const bookings = await PackageBooking.find()
      .populate('package', 'name price')
      .populate('user', 'username email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/package-bookings/:id/cancel
exports.cancelPackageBooking = async (req, res) => {
  try {
    const booking = await PackageBooking.findById(req.params.id);
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

// PUT /api/package-bookings/:id/status  (admin)
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