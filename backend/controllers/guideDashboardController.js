const GuideBooking = require('../models/GuideBooking');
const User         = require('../models/User');
const Guide        = require('../models/Guide');
const Notification = require('../models/Notification');

// GET /api/guide/dashboard-stats
// Returns overview stats for the guide dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const guideId = req.user.id;

    const [all, reviews] = await Promise.all([
      GuideBooking.find({ guide: guideId })
        .populate('user', 'firstName lastName username profileImage email phone')
        .populate('destination', 'name location')
        .sort({ createdAt: -1 })
        .lean(),
      // Reviews are embedded in completed bookings
      GuideBooking.find({ guide: guideId, 'review.rating': { $exists: true } }).lean(),
    ]);

    const now   = new Date();
    const month = new Date(now.getFullYear(), now.getMonth(), 1);
    const week  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const byStatus = (s) => all.filter((b) => b.status === s);

    const completed = byStatus('completed');
    const accepted  = byStatus('accepted');
    const pending   = byStatus('pending');
    const cancelled = byStatus('cancelled');

    const totalEarnings     = completed.reduce((s, b) => s + (b.totalPrice || 0), 0);
    const monthlyEarnings   = completed
      .filter((b) => new Date(b.updatedAt) >= month)
      .reduce((s, b) => s + (b.totalPrice || 0), 0);
    const weeklyEarnings    = completed
      .filter((b) => new Date(b.updatedAt) >= week)
      .reduce((s, b) => s + (b.totalPrice || 0), 0);
    const pendingEarnings   = accepted.reduce((s, b) => s + (b.totalPrice || 0), 0);

    const allRatings = reviews.map((b) => b.review.rating).filter(Boolean);
    const avgRating  = allRatings.length
      ? (allRatings.reduce((s, r) => s + r, 0) / allRatings.length).toFixed(1)
      : 0;

    const upcoming = accepted
      .filter((b) => new Date(b.startDate) >= now)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, 5);

    // Monthly earnings breakdown (last 6 months)
    const monthlyBreakdown = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const e = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const earned = completed
        .filter((b) => {
          const u = new Date(b.updatedAt);
          return u >= d && u <= e;
        })
        .reduce((s, b) => s + (b.totalPrice || 0), 0);
      monthlyBreakdown.push({
        month: d.toLocaleString('default', { month: 'short' }),
        earnings: earned,
      });
    }

    res.json({
      success: true,
      stats: {
        totalBookings:   all.length,
        pendingCount:    pending.length,
        acceptedCount:   accepted.length,
        completedCount:  completed.length,
        cancelledCount:  cancelled.length,
        totalEarnings,
        monthlyEarnings,
        weeklyEarnings,
        pendingEarnings,
        avgRating:       Number(avgRating),
        totalReviews:    allRatings.length,
        upcoming,
        recentBookings:  all.slice(0, 5),
        monthlyBreakdown,
      },
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/guide/bookings
// Guide's bookings with optional status filter
exports.getGuideBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { guide: req.user.id };
    if (status && status !== 'all') filter.status = status;

    const bookings = await GuideBooking.find(filter)
      .populate('user',        'firstName lastName username profileImage email phone')
      .populate('destination', 'name location')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/guide/bookings/:id/accept
exports.acceptBooking = async (req, res) => {
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

    // Notify tourist
    await Notification.create({
      user:       booking.user,
      type:       'booking_accepted',
      title:      'Booking Accepted! 🎉',
      body:       `Your guide booking has been accepted. You can now chat with your guide.`,
      link:       `/my-bookings`,
      refBooking: booking._id,
    });

    res.json({ success: true, message: 'Booking accepted', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/guide/bookings/:id/reject
exports.rejectBooking = async (req, res) => {
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

    await Notification.create({
      user:       booking.user,
      type:       'booking_rejected',
      title:      'Booking Update',
      body:       `Your guide booking request was not accepted. You may book another guide.`,
      link:       `/browse-guides`,
      refBooking: booking._id,
    });

    res.json({ success: true, message: 'Booking rejected', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/guide/bookings/:id/complete
exports.completeBooking = async (req, res) => {
  try {
    const booking = await GuideBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.guide.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied' });
    if (booking.status !== 'accepted')
      return res.status(400).json({ message: 'Only accepted bookings can be completed' });

    booking.status        = 'completed';
    booking.paymentStatus = 'paid';
    await booking.save();

    await Notification.create({
      user:       booking.user,
      type:       'booking_completed',
      title:      'Tour Completed',
      body:       `Your tour has been marked as completed. Please leave a review!`,
      link:       `/my-bookings`,
      refBooking: booking._id,
    });

    res.json({ success: true, message: 'Booking completed', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/guide/bookings/:id/cancel
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await GuideBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const isGuide = booking.guide.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isGuide && !isAdmin) return res.status(403).json({ message: 'Access denied' });
    if (['completed', 'cancelled'].includes(booking.status))
      return res.status(400).json({ message: 'Booking cannot be cancelled' });

    booking.status             = 'cancelled';
    booking.cancelledBy        = isAdmin ? 'admin' : 'guide';
    booking.cancellationReason = req.body.reason || '';
    booking.cancelledAt        = new Date();
    await booking.save();

    await Notification.create({
      user:       booking.user,
      type:       'booking_cancelled',
      title:      'Booking Cancelled',
      body:       `Your booking was cancelled by the guide.`,
      link:       `/my-bookings`,
      refBooking: booking._id,
    });

    res.json({ success: true, message: 'Booking cancelled', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/guide/reviews
exports.getGuideReviews = async (req, res) => {
  try {
    const bookings = await GuideBooking.find({
      guide:           req.user.id,
      'review.rating': { $exists: true },
    })
      .populate('user', 'firstName lastName username profileImage')
      .sort({ 'review.reviewedAt': -1 });

    const reviews = bookings.map((b) => ({
      _id:       b._id,
      tourist:   b.user,
      rating:    b.review.rating,
      comment:   b.review.comment,
      date:      b.review.reviewedAt,
      tourType:  b.tourType,
      startDate: b.startDate,
    }));

    const avg = reviews.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({ success: true, reviews, avgRating: Number(avg), total: reviews.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/guide/bookings/:id/review
// Tourist leaves a review on a completed booking
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

    await Notification.create({
      user:       booking.guide,
      type:       'review_received',
      title:      'New Review Received ⭐',
      body:       `A tourist left you a ${rating}-star review.`,
      link:       `/guide/reviews`,
      refBooking: booking._id,
    });

    res.json({ success: true, message: 'Review submitted', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/guide/availability
exports.updateAvailability = async (req, res) => {
  try {
    const { isAvailable, blockedDates } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.guideProfile) user.guideProfile = {};
    if (typeof isAvailable !== 'undefined') user.guideProfile.availability = isAvailable;
    if (blockedDates) user.guideProfile.blockedDates = blockedDates;

    await user.save();
    res.json({ success: true, message: 'Availability updated', guideProfile: user.guideProfile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/guide/profile
exports.updateProfile = async (req, res) => {
  try {
    const { bio, languages, specialties, hourlyRate, dailyRate, profileImage } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.guideProfile) return res.status(400).json({ message: 'Guide profile not found' });

    if (bio)          user.guideProfile.bio          = bio;
    if (languages)    user.guideProfile.languages    = languages;
    if (specialties)  user.guideProfile.specialties  = specialties;
    if (hourlyRate)   user.guideProfile.hourlyRate   = Number(hourlyRate);
    if (dailyRate)    user.guideProfile.dailyRate    = Number(dailyRate);
    if (profileImage) user.guideProfile.profileImage = profileImage;

    await user.save();

    const safe = user.toObject();
    delete safe.password;
    res.json({ success: true, message: 'Profile updated', user: safe });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/guide/earnings
exports.getEarnings = async (req, res) => {
  try {
    const bookings = await GuideBooking.find({
      guide:  req.user.id,
      status: 'completed',
    })
      .populate('user',        'firstName lastName username')
      .populate('destination', 'name')
      .sort({ updatedAt: -1 });

    const now   = new Date();
    const month = new Date(now.getFullYear(), now.getMonth(), 1);
    const week  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const total   = bookings.reduce((s, b) => s + (b.totalPrice || 0), 0);
    const monthly = bookings
      .filter((b) => new Date(b.updatedAt) >= month)
      .reduce((s, b) => s + (b.totalPrice || 0), 0);
    const weekly  = bookings
      .filter((b) => new Date(b.updatedAt) >= week)
      .reduce((s, b) => s + (b.totalPrice || 0), 0);

    // Pending from accepted bookings
    const acceptedBookings = await GuideBooking.find({
      guide:  req.user.id,
      status: 'accepted',
    });
    const pending = acceptedBookings.reduce((s, b) => s + (b.totalPrice || 0), 0);

    // Monthly breakdown - last 6 months
    const breakdown = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const e = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const earned = bookings
        .filter((b) => { const u = new Date(b.updatedAt); return u >= d && u <= e; })
        .reduce((s, b) => s + (b.totalPrice || 0), 0);
      breakdown.push({ month: d.toLocaleString('default', { month: 'short' }), earnings: earned });
    }

    res.json({
      success: true,
      earnings: { total, monthly, weekly, pending },
      history:  bookings,
      breakdown,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
