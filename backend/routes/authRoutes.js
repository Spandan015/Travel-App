const express = require('express');
const router = express.Router();

const {
  sendRegistrationOTP,
  verifyRegistrationOTP,
  sendAdminRegistrationOTP,
  verifyAdminRegistrationOTP,
  sendGuideRegistrationOTP,
  verifyGuideRegistrationOTP,
  login,
  getUserProfile,
  updateProfile,
  changePassword,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// ─── Public ───────────────────────────────────────────────────────────────────
router.post('/login', login);

// User registration (OTP flow)
router.post('/register/send-otp', sendRegistrationOTP);
router.post('/register/verify-otp', verifyRegistrationOTP);

// Admin registration (secret key + OTP flow)
router.post('/register-admin/send-otp', sendAdminRegistrationOTP);
router.post('/register-admin/verify-otp', verifyAdminRegistrationOTP);

// Guide registration (OTP + guide profile fields)
router.post('/register-guide/send-otp', sendGuideRegistrationOTP);
router.post('/register-guide/verify-otp', verifyGuideRegistrationOTP);

// ─── Protected ────────────────────────────────────────────────────────────────
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;