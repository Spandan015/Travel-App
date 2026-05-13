const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

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

// ── Multer for user profile image uploads ─────────────────────────
const userImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/user-profiles'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `user-${req.user._id}-${Date.now()}${ext}`);
  },
});
const uploadUserImage = multer({
  storage: userImageStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ─── Public ───────────────────────────────────────────────────────
router.post('/login', login);
router.post('/register/send-otp',         sendRegistrationOTP);
router.post('/register/verify-otp',       verifyRegistrationOTP);
router.post('/register-admin/send-otp',   sendAdminRegistrationOTP);
router.post('/register-admin/verify-otp', verifyAdminRegistrationOTP);
router.post('/register-guide/send-otp',   sendGuideRegistrationOTP);
router.post('/register-guide/verify-otp', verifyGuideRegistrationOTP);

// ─── Protected ────────────────────────────────────────────────────
router.get('/profile',         protect, getUserProfile);
router.put('/profile',         protect, uploadUserImage.single('profileImage'), updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;