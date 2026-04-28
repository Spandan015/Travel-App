const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  submitApplication,
  getAllApplications,
  getApplicationById,
  approveApplication,
  rejectApplication,
  markUnderReview,
  saveScores,
  suspendGuide,
  reactivateGuide,
  getAllGuides,
  changePassword,
  getEmailLogs,
} = require('../controllers/guideApplicationController');

// ── Public / User ──────────────────────────────────────────
router.post('/', protect, submitApplication);

// ── Admin: applications ────────────────────────────────────
router.get('/',                        protect, adminOnly, getAllApplications);
router.get('/email-logs',              protect, adminOnly, getEmailLogs);
router.get('/guides',                  protect, adminOnly, getAllGuides);
router.get('/:id',                     protect, adminOnly, getApplicationById);
router.put('/:id/approve',             protect, adminOnly, approveApplication);
router.put('/:id/reject',              protect, adminOnly, rejectApplication);
router.put('/:id/review',              protect, adminOnly, markUnderReview);
router.put('/:id/score',               protect, adminOnly, saveScores);

// ── Admin: guide management ────────────────────────────────
router.put('/guides/:userId/suspend',    protect, adminOnly, suspendGuide);
router.put('/guides/:userId/reactivate', protect, adminOnly, reactivateGuide);

// ── Guide: force change password on first login ────────────
router.put('/change-password', protect, changePassword);

module.exports = router;