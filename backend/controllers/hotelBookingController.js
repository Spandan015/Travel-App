const HotelBooking = require('../models/HotelBooking');
const Hotel        = require('../models/Hotel');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/hotel-bookings
// Creates booking with status=pending, paymentStatus=unpaid
// Frontend then calls /api/esewa/initiate to pay
// ─────────────────────────────────────────────────────────────────────────────
exports.createHotelBooking = async (req, res) => {
  try {
    const {
      hotelId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      numberOfRooms,
      specialRequests
    } = req.body;

    const checkIn  = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }
    if (checkIn < new Date()) {
      return res.status(400).json({ message: 'Check-in date cannot be in the past' });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel)            return res.status(404).json({ message: 'Hotel not found' });
    if (!hotel.isActive)   return res.status(400).json({ message: 'Hotel is not available for booking' });

    const nights     = Math.ceil((checkOut - checkIn) / (1000 * 3600 * 24));
    const totalPrice = hotel.pricePerNight * nights * numberOfRooms;

    const booking = await HotelBooking.create({
      hotel:          hotelId,
      user:           req.user.id,
      checkInDate:    checkIn,
      checkOutDate:   checkOut,
      numberOfGuests,
      numberOfRooms,
      totalPrice,
      pricePerNight:  hotel.pricePerNight,
      status:         'pending',      // confirmed only after payment
      paymentStatus:  'unpaid',
      specialRequests,
      contactInfo: {
        name:  req.user.username,
        email: req.user.email,
        phone: req.user.phone,
      },
    });

    try {
      await booking.populate([
        { path: 'hotel', select: 'name location images pricePerNight' },
        { path: 'user',  select: 'username email phone' },
      ]);
    } catch (_) {}

    res.status(201).json({
      success: true,
      message: 'Booking created — please complete payment',
      booking,
    });
  } catch (err) {
    console.error('Error creating hotel booking:', err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/hotel-bookings/my
exports.getUserHotelBookings = async (req, res) => {
  try {
    const bookings = await HotelBooking.find({ user: req.user.id })
      .populate('hotel', 'name location images pricePerNight starRating')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/hotel-bookings/:id
exports.getHotelBookingById = async (req, res) => {
  try {
    const booking = await HotelBooking.findById(req.params.id)
      .populate('hotel', 'name location images pricePerNight starRating amenities description')
      .populate('user',  'username email phone');

    if (!booking) return res.status(404).json({ message: 'Hotel booking not found' });
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/hotel-bookings/:id/cancel
exports.cancelHotelBooking = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const booking = await HotelBooking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: 'Hotel booking not found' });
    if (booking.user.toString() !== req.user.id) return res.status(403).json({ message: 'Access denied' });
    if (['cancelled', 'completed'].includes(booking.status)) {
      return res.status(400).json({ message: 'Booking cannot be cancelled' });
    }

    booking.status             = 'cancelled';
    booking.cancellationReason = cancellationReason;
    await booking.save();

    res.json({ success: true, message: 'Hotel booking cancelled successfully', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/hotel-bookings/admin/all
exports.getAllHotelBookings = async (req, res) => {
  try {
    const { status, hotel, user, paymentStatus } = req.query;
    const filter = {};
    if (status)        filter.status        = status;
    if (hotel)         filter.hotel         = hotel;
    if (user)          filter.user          = user;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const bookings = await HotelBooking.find(filter)
      .populate('hotel', 'name location')
      .populate('user',  'username email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/hotel-bookings/:id/status
exports.updateHotelBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await HotelBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Hotel booking not found' });

    booking.status = status;
    await booking.save();

    res.json({ success: true, message: 'Hotel booking status updated successfully', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};