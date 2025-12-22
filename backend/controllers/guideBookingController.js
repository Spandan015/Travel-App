const GuideBooking = require('../models/GuideBooking');
const User = require('../models/User');

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
      return res.status(400).json({ message: "Please provide all required fields" });
    }
    
    // Check if guide exists and is approved
    const guideUser = await User.findById(guide);
    if (!guideUser || guideUser.role !== 'guide') {
      return res.status(404).json({ message: "Guide not found" });
    }
    
    if (!guideUser.guideProfile?.isApproved) {
      return res.status(400).json({ message: "Guide is not approved" });
    }
    
    if (!guideUser.guideProfile?.availability) {
      return res.status(400).json({ message: "Guide is currently unavailable" });
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
      .populate('user', 'username email phone')
      .populate('guide', 'username email phone guideProfile')
      .populate('destination', 'name location');
    
    res.status(201).json({
      success: true,
      message: "Guide booking request created successfully",
      booking: populatedBooking
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// User: Get my guide bookings
exports.getMyGuideBookings = async (req, res) => {
  try {
    const bookings = await GuideBooking.find({ user: req.user.id })
      .populate('guide', 'username email phone guideProfile')
      .populate('destination', 'name location')
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

// Guide: Get bookings for my guide services
exports.getMyGuideRequests = async (req, res) => {
  try {
    const { status } = req.query;
    
    const filter = { guide: req.user.id };
    if (status) {
      filter.status = status;
    }
    
    const bookings = await GuideBooking.find(filter)
      .populate('user', 'username email phone')
      .populate('destination', 'name location')
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

// Get single guide booking
exports.getGuideBookingById = async (req, res) => {
  try {
    const booking = await GuideBooking.findById(req.params.id)
      .populate('user', 'username email phone')
      .populate('guide', 'username email phone guideProfile')
      .populate('destination', 'name location');
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    // Check if user is authorized to view this booking
    const isUser = booking.user._id.toString() === req.user.id;
    const isGuide = booking.guide._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isUser && !isGuide && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    res.json({
      success: true,
      booking
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Guide: Accept booking request
exports.acceptBooking = async (req, res) => {
  try {
    const { message } = req.body;
    
    const booking = await GuideBooking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    if (booking.guide.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to accept this booking" });
    }
    
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: "Booking has already been processed" });
    }
    
    booking.status = 'accepted';
    booking.guideResponse = {
      respondedAt: new Date(),
      message: message || "Booking accepted"
    };
    
    await booking.save();
    
    const populatedBooking = await GuideBooking.findById(booking._id)
      .populate('user', 'username email phone')
      .populate('guide', 'username email phone guideProfile')
      .populate('destination', 'name location');
    
    res.json({
      success: true,
      message: "Booking accepted successfully",
      booking: populatedBooking
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Guide: Reject booking request
exports.rejectBooking = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: "Please provide a reason for rejection" });
    }
    
    const booking = await GuideBooking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    if (booking.guide.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to reject this booking" });
    }
    
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: "Booking has already been processed" });
    }
    
    booking.status = 'rejected';
    booking.guideResponse = {
      respondedAt: new Date(),
      message
    };
    
    await booking.save();
    
    const populatedBooking = await GuideBooking.findById(booking._id)
      .populate('user', 'username email phone')
      .populate('guide', 'username email phone guideProfile')
      .populate('destination', 'name location');
    
    res.json({
      success: true,
      message: "Booking rejected",
      booking: populatedBooking
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// User/Guide: Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    
    if (!cancellationReason) {
      return res.status(400).json({ message: "Please provide cancellation reason" });
    }
    
    const booking = await GuideBooking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    const isUser = booking.user.toString() === req.user.id;
    const isGuide = booking.guide.toString() === req.user.id;
    
    if (!isUser && !isGuide) {
      return res.status(403).json({ message: "You are not authorized to cancel this booking" });
    }
    
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ message: "Cannot cancel this booking" });
    }
    
    booking.status = 'cancelled';
    booking.cancelledBy = isUser ? 'user' : 'guide';
    booking.cancellationReason = cancellationReason;
    booking.cancelledAt = new Date();
    
    await booking.save();
    
    res.json({
      success: true,
      message: "Booking cancelled successfully",
      booking
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Guide: Mark booking as completed
exports.completeBooking = async (req, res) => {
  try {
    const booking = await GuideBooking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    if (booking.guide.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to complete this booking" });
    }
    
    if (booking.status !== 'accepted') {
      return res.status(400).json({ message: "Only accepted bookings can be marked as completed" });
    }
    
    booking.status = 'completed';
    booking.paymentStatus = 'paid'; // Mark as paid (in real app, integrate payment gateway)
    
    await booking.save();
    
    res.json({
      success: true,
      message: "Booking marked as completed",
      booking
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// User: Add review for guide (after booking completion)
exports.addGuideReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || !comment) {
      return res.status(400).json({ message: "Please provide rating and comment" });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    
    const booking = await GuideBooking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only review your own bookings" });
    }
    
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: "You can only review completed bookings" });
    }
    
    if (booking.review?.rating) {
      return res.status(400).json({ message: "You have already reviewed this booking" });
    }
    
    booking.review = {
      rating,
      comment,
      reviewedAt: new Date()
    };
    
    await booking.save();
    
    // Update guide's average rating
    const guide = await User.findById(booking.guide);
    const allBookings = await GuideBooking.find({
      guide: booking.guide,
      'review.rating': { $exists: true }
    });
    
    const totalRating = allBookings.reduce((sum, b) => sum + b.review.rating, 0);
    const avgRating = totalRating / allBookings.length;
    
    guide.guideProfile.rating = avgRating;
    guide.guideProfile.totalReviews = allBookings.length;
    await guide.save();
    
    res.json({
      success: true,
      message: "Review added successfully",
      booking
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Get all guide bookings
exports.getAllGuideBookings = async (req, res) => {
  try {
    const { status } = req.query;
    
    const filter = {};
    if (status) {
      filter.status = status;
    }
    
    const bookings = await GuideBooking.find(filter)
      .populate('user', 'username email phone')
      .populate('guide', 'username email phone guideProfile')
      .populate('destination', 'name location')
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