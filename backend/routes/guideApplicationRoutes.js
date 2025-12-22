const express = require('express');
const router = express.Router();
const {
  applyAsGuide,
  getMyApplication,
  getAllApplications,
  getApplicationById,
  approveApplication,
  rejectApplication,
  updateGuideProfile
} = require('../controllers/guideApplicationController');
const { protect, adminOnly, guideOnly } = require('../middleware/authMiddleware');

// User routes
router.post('/', protect, applyAsGuide);
router.get('/my', protect, getMyApplication);

// Guide routes
router.put('/profile', protect, guideOnly, updateGuideProfile);

// Admin routes
router.get('/', protect, adminOnly, getAllApplications);
router.get('/:id', protect, adminOnly, getApplicationById);
router.put('/:id/approve', protect, adminOnly, approveApplication);
router.put('/:id/reject', protect, adminOnly, rejectApplication);

module.exports = router;