const HotelBooking = require('../models/HotelBooking');
const Hotel        = require('../models/Hotel');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/hotel-bookings
// Creates booking with status=pending, paymentStatus=unpaid.
// If a roomType is supplied, atomically decrements availableRooms for that type.
// Frontend then calls /api/esewa/initiate to complete payment.
// ─────────────────────────────────────────────────────────────────────────────
exports.createHotelBooking = async (req, res) => {
  try {
    const {
      hotelId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      numberOfRooms  = 1,
      roomType,          // NEW – optional room type name (e.g. "Deluxe")
      specialRequests
    } = req.body;

    // ── Date validation ───────────────────────────────────────────────────────
    const checkIn  = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }
    if (checkIn < new Date()) {
      return res.status(400).json({ message: 'Check-in date cannot be in the past' });
    }

    // ── Fetch hotel ───────────────────────────────────────────────────────────
    const hotel = await Hotel.findById(hotelId);
    if (!hotel)          return res.status(404).json({ message: 'Hotel not found' });
    if (!hotel.isActive) return res.status(400).json({ message: 'Hotel is not available for booking' });

    // ── Room-type availability check & atomic decrement ───────────────────────
    let pricePerNight = hotel.pricePerNight;

    if (roomType) {
      // Find the requested room type inside the hotel document
      const rtIndex = hotel.roomTypes.findIndex(
        rt => rt.type && rt.type.toLowerCase() === roomType.toLowerCase()
      );

      if (rtIndex === -1) {
        return res.status(400).json({ message: `Room type "${roomType}" not found for this hotel` });
      }

      const rt = hotel.roomTypes[rtIndex];

      // Check availability BEFORE touching DB
      if (rt.availableRooms < numberOfRooms) {
        return res.status(400).json({
          message: rt.availableRooms <= 0
            ? `No ${roomType} rooms are available at this time`
            : `Only ${rt.availableRooms} ${roomType} room(s) available (you requested ${numberOfRooms})`
        });
      }

      // Atomic decrement – uses arrayFilters to target the exact room type
      // by its subdocument _id to avoid race conditions / overbooking.
      const updated = await Hotel.findOneAndUpdate(
        {
          _id: hotelId,
          // Ensure the room still has enough availability at update time
          'roomTypes._id': rt._id,
          [`roomTypes.${rtIndex}.availableRooms`]: { $gte: numberOfRooms }
        },
        {
          $inc: { [`roomTypes.${rtIndex}.availableRooms`]: -numberOfRooms }
        },
        { new: true }
      );

      if (!updated) {
        // Another request grabbed the last room(s) between our check and update
        return res.status(409).json({
          message: `Sorry, ${roomType} rooms just became unavailable. Please refresh and try again.`
        });
      }

      // Use the room-type price if set, otherwise fall back to hotel base price
      pricePerNight = rt.price || hotel.pricePerNight;
    }

    // ── Calculate total price ─────────────────────────────────────────────────
    const nights     = Math.ceil((checkOut - checkIn) / (1000 * 3600 * 24));
    const totalPrice = pricePerNight * nights * numberOfRooms;

    // ── Create the booking ────────────────────────────────────────────────────
    const booking = await HotelBooking.create({
      hotel:         hotelId,
      user:          req.user.id,
      checkInDate:   checkIn,
      checkOutDate:  checkOut,
      numberOfGuests,
      numberOfRooms,
      roomType:      roomType || null,   // NEW – persisted on the booking
      totalPrice,
      pricePerNight,
      status:        'pending',          // confirmed only after payment
      paymentStatus: 'unpaid',
      specialRequests,
      contactInfo: {
        name:  req.user.username,
        email: req.user.email,
        phone: req.user.phone,
      },
    });

    try {
      await booking.populate([
        { path: 'hotel', select: 'name location images pricePerNight roomTypes' },
        { path: 'user',  select: 'username email phone' },
      ]);
    } catch (_) {}

    res.status(201).json({
      success: true,
      message: 'Booking created – please complete payment',
      booking,
    });
  } catch (err) {
    console.error('Error creating hotel booking:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/hotel-bookings/my
// ─────────────────────────────────────────────────────────────────────────────
exports.getUserHotelBookings = async (req, res) => {
  try {
    const bookings = await HotelBooking.find({ user: req.user.id })
      .populate('hotel', 'name location images pricePerNight starRating roomTypes')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/hotel-bookings/:id
// ─────────────────────────────────────────────────────────────────────────────
exports.getHotelBookingById = async (req, res) => {
  try {
    const booking = await HotelBooking.findById(req.params.id)
      .populate('hotel', 'name location images pricePerNight starRating amenities description roomTypes')
      .populate('user', 'username email phone');

    if (!booking) return res.status(404).json({ message: 'Hotel booking not found' });
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/hotel-bookings/:id/cancel
// Restores availableRooms when a booking is cancelled.
// ─────────────────────────────────────────────────────────────────────────────
exports.cancelHotelBooking = async (req, res) => {
  try {
    const booking = await HotelBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Hotel booking not found' });
 
    const userId = (req.user.id || req.user._id)?.toString();
    if (booking.user.toString() !== userId && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied' });
 
    if (['cancelled', 'completed'].includes(booking.status))
      return res.status(400).json({ message: 'Booking cannot be cancelled' });
 
    // Restore room availability if a room type was booked
    if (booking.roomType && booking.hotel) {
      const hotel = await Hotel.findById(booking.hotel);
      if (hotel) {
        const rtIndex = hotel.roomTypes.findIndex(
          rt => rt.type && rt.type.toLowerCase() === booking.roomType.toLowerCase()
        );
        if (rtIndex !== -1) {
          const rt = hotel.roomTypes[rtIndex];
          const newAvailable = Math.min(
            (rt.availableRooms || 0) + (booking.numberOfRooms || 1),
            rt.totalRooms || rt.availableRooms
          );
          await Hotel.findOneAndUpdate(
            { _id: booking.hotel, 'roomTypes._id': rt._id },
            { $set: { [`roomTypes.${rtIndex}.availableRooms`]: newAvailable } }
          );
        }
      }
    }
 
    booking.status             = 'cancelled';
    booking.cancellationReason = req.body.cancellationReason || '';
    await booking.save();
 
    res.json({ success: true, message: 'Hotel booking cancelled successfully', booking });
  } catch (err) {
    console.error('[cancelHotelBooking] ERROR:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/hotel-bookings/admin/all
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllHotelBookings = async (req, res) => {
  try {
    const bookings = await HotelBooking.find()
      .populate('hotel', 'name location')
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/hotel-bookings/:id/status  (admin)
// ─────────────────────────────────────────────────────────────────────────────
exports.updateHotelBookingStatus = async (req, res) => {
  try {
    const booking = await HotelBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Hotel booking not found' });

    const prevStatus = booking.status;
    booking.status   = req.body.status;
    await booking.save();

    // ── If admin manually cancels, also restore availability ─────────────────
    if (req.body.status === 'cancelled' && prevStatus !== 'cancelled' && booking.roomType) {
      const hotel = await Hotel.findById(booking.hotel);
      if (hotel) {
        const rtIndex = hotel.roomTypes.findIndex(
          rt => rt.type && rt.type.toLowerCase() === booking.roomType.toLowerCase()
        );
        if (rtIndex !== -1) {
          const rt = hotel.roomTypes[rtIndex];
          const newAvailable = Math.min(
            (rt.availableRooms || 0) + (booking.numberOfRooms || 1),
            rt.totalRooms || rt.availableRooms
          );
          await Hotel.findOneAndUpdate(
            { _id: booking.hotel, 'roomTypes._id': rt._id },
            { $set: { [`roomTypes.${rtIndex}.availableRooms`]: newAvailable } }
          );
        }
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    res.json({ success: true, message: 'Hotel booking status updated successfully', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};