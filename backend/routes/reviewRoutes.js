const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createReview,
  getGuideReviews,
  getMyGuideReviews,
  checkReview,
} = require('../controllers/reviewController');

// Public
router.get('/guide/:guideId', getGuideReviews);

// Protected
router.post('/',                  protect, createReview);
router.get('/my-guide',           protect, getMyGuideReviews);
router.get('/check/:bookingId',   protect, checkReview);

module.exports = router;
