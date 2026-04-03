const HotelBooking = require('../models/HotelBooking');
const Hotel = require('../models/Hotel');

// Create hotel booking
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


    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    if (checkIn < new Date()) {
      return res.status(400).json({ message: 'Check-in date cannot be in the past' });
    }

    // Get hotel details
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    if (!hotel.isActive) {
      return res.status(400).json({ message: 'Hotel is not available for booking' });
    }

    // Calculate number of nights
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Calculate total price
    const totalPrice = hotel.pricePerNight * nights * numberOfRooms;

    // Create booking with confirmed status
    let booking;
    try {
      booking = await HotelBooking.create({
        hotel: hotelId,
        user: req.user.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfGuests,
        numberOfRooms,
        totalPrice,
        pricePerNight: hotel.pricePerNight,
        status: 'confirmed', // Auto-confirm bookings
        specialRequests,
        contactInfo: {
          name: req.user.username,
          email: req.user.email,
          phone: req.user.phone
        }
      });
    } catch (saveError) {
      console.error('Error saving hotel booking:', saveError);
      return res.status(500).json({ message: 'Failed to save booking', error: saveError.message });
    }

    // Populate hotel and user data (optional - skip if not needed)
    try {
      await booking.populate([
        { path: 'hotel', select: 'name location images pricePerNight' },
        { path: 'user', select: 'username email phone' }
      ]);
    } catch (populateError) {
    }

    res.status(201).json({
      success: true,
      message: 'Hotel booking created successfully',
      booking
    });
  } catch (err) {
    console.error('Error creating hotel booking:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get user's hotel bookings
exports.getUserHotelBookings = async (req, res) => {
  try {
    const bookings = await HotelBooking.find({ user: req.user.id })
      .populate('hotel', 'name location images pricePerNight starRating')
      .sort({ createdAt: -1 });


    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get hotel booking by ID
exports.getHotelBookingById = async (req, res) => {
  try {
    const booking = await HotelBooking.findById(req.params.id)
      .populate('hotel', 'name location images pricePerNight starRating amenities description')
      .populate('user', 'username email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Hotel booking not found' });
    }

    // Check if user owns this booking
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      booking
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel hotel booking
exports.cancelHotelBooking = async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const booking = await HotelBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Hotel booking not found' });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if booking can be cancelled (not already completed or cancelled)
    if (['cancelled', 'completed'].includes(booking.status)) {
      return res.status(400).json({ message: 'Booking cannot be cancelled' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason;
    await booking.save();

    res.json({
      success: true,
      message: 'Hotel booking cancelled successfully',
      booking
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all hotel bookings (Admin only)
exports.getAllHotelBookings = async (req, res) => {
  try {
    const { status, hotel, user } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (hotel) filter.hotel = hotel;
    if (user) filter.user = user;

    const bookings = await HotelBooking.find(filter)
      .populate('hotel', 'name location')
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update hotel booking status (Admin only)
exports.updateHotelBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await HotelBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Hotel booking not found' });
    }

    booking.status = status;
    await booking.save();

    res.json({
      success: true,
      message: 'Hotel booking status updated successfully',
      booking
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
