const express = require('express');
const router  = express.Router();
const { getProfile, updateProfile, changePassword } = require('../controllers/adminProfileController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/profile',         protect, adminOnly, getProfile);
router.put('/profile',         protect, adminOnly, updateProfile);
router.put('/change-password', protect, adminOnly, changePassword);

module.exports = router;