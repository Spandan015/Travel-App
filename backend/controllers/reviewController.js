const Review = require('../models/Review');
const User   = require('../models/User');

// ── POST /api/reviews ─────────────────────────────────────────────
// User submits a review after a completed booking
exports.createReview = async (req, res) => {
  try {
    const {
      reviewType, rating, comment,
      guideId, bookingId, bookingType,
      hotel, package: pkg, destination,
    } = req.body;

    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    if (!comment?.trim())
      return res.status(400).json({ message: 'Comment is required.' });

    // Prevent duplicate reviews for same booking
    if (bookingId) {
      const existing = await Review.findOne({ relatedBooking: bookingId, user: req.user.id });
      if (existing) return res.status(400).json({ message: 'You have already reviewed this booking.' });
    }

    const review = await Review.create({
      user:           req.user.id,
      reviewType:     reviewType || 'guide',
      rating:         Number(rating),
      comment:        comment.trim(),
      guide:          guideId   || null,
      hotel:          hotel     || null,
      package:        pkg       || null,
      destination:    destination || null,
      relatedBooking: bookingId || null,
      verified:       true, // verified because it comes from a booking
      isActive:       true,
    });

    // ── Update guide's average rating in User model ────────────────
    if (guideId) {
      const allGuideReviews = await Review.find({ guide: guideId, isActive: true });
      const avgRating = allGuideReviews.reduce((sum, r) => sum + r.rating, 0) / allGuideReviews.length;

      await User.findByIdAndUpdate(guideId, {
        $set: {
          'guideProfile.rating':       Math.round(avgRating * 10) / 10,
          'guideProfile.totalReviews': allGuideReviews.length,
        },
      });
    }

    await review.populate('user', 'firstName lastName username profileImage');

    res.status(201).json({ success: true, message: 'Review submitted successfully.', review });
  } catch (err) {
    console.error('[createReview] ERROR:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// ── GET /api/reviews/guide/:guideId ──────────────────────────────
// Get all reviews for a specific guide (for public profile + dashboard)
exports.getGuideReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      guide:    req.params.guideId,
      isActive: true,
    })
      .populate('user', 'firstName lastName username profileImage')
      .sort({ createdAt: -1 });

    const total     = reviews.length;
    const avgRating = total > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10
      : 0;

    res.json({ success: true, reviews, avgRating, total });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// ── GET /api/reviews/my-guide ─────────────────────────────────────
// Guide fetches their own reviews (for guide dashboard)
exports.getMyGuideReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      guide:    req.user.id,
      isActive: true,
    })
      .populate('user', 'firstName lastName username profileImage')
      .sort({ createdAt: -1 });

    const total     = reviews.length;
    const avgRating = total > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10
      : 0;

    res.json({ success: true, reviews, avgRating, total });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// ── GET /api/reviews/check/:bookingId ────────────────────────────
// Check if user already reviewed a booking
exports.checkReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      relatedBooking: req.params.bookingId,
      user:           req.user.id,
    });
    res.json({ success: true, hasReviewed: !!review, review: review || null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
