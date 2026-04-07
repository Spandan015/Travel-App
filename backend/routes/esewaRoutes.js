const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  initiatePayment,
  verifyPayment,
  getPaymentStatus,
} = require('../controllers/esewaController');

// POST /api/esewa/initiate  — create payment form data
router.post('/initiate', protect, initiatePayment);

// POST /api/esewa/verify    — verify after eSewa redirect
router.post('/verify', protect, verifyPayment);

// GET  /api/esewa/status/:bookingType/:bookingId
router.get('/status/:bookingType/:bookingId', protect, getPaymentStatus);

module.exports = router;