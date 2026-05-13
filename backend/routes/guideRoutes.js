const express = require('express');
const router = express.Router();
const {
  getAllGuides,
  getGuideById,
  searchGuides,
  updateMyProfile,
  uploadGuideImage,
} = require('../controllers/guideController');

const { protect, guideOnly } = require('../middleware/authMiddleware');

// ── Public routes ─────────────────────────────────────────────────
router.get('/',       getAllGuides);
router.get('/search', searchGuides);
router.get('/:id',    getGuideById);

// ── Protected: guide updates own profile ─────────────────────────
router.put('/me', protect, guideOnly, uploadGuideImage.single('profileImage'), updateMyProfile);

module.exports = router;