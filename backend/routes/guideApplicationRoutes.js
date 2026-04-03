const express = require('express');
const router = express.Router();
const {
  applyAsGuide,
  getMyApplication,
  getAllApplications,
  getApplicationById,
  approveApplication,
  rejectApplication,
  updateGuideProfile,
  getApplicationStats,
  bulkApproveApplications,
  bulkRejectApplications
} = require('../controllers/guideApplicationController');
const { protect, adminOnly, guideOnly } = require('../middleware/authMiddleware');

// User routes
router.post('/', protect, applyAsGuide);
router.get('/my', protect, getMyApplication);

// Guide routes
router.put('/profile', protect, guideOnly, updateGuideProfile);

// Admin routes
router.get('/stats', protect, adminOnly, getApplicationStats);
router.get('/', protect, adminOnly, getAllApplications);
router.get('/:id', protect, adminOnly, getApplicationById);
router.put('/:id/approve', protect, adminOnly, approveApplication);
router.put('/:id/reject', protect, adminOnly, rejectApplication);

// Admin bulk operations
router.post('/bulk-approve', protect, adminOnly, bulkApproveApplications);
router.post('/bulk-reject', protect, adminOnly, bulkRejectApplications);

module.exports = router;