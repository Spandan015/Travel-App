const express = require('express');
const router  = express.Router();
const {
  createTrekBooking,
  getUserTrekBookings,
  getAllTrekBookings,
  cancelTrekBooking,
  updateTrekBookingStatus,
  assignGuideToTrekBooking,
  getAssignedTrekBookings,
  getTrekBookingById,
} = require('../controllers/trekBookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/',                protect,              createTrekBooking);
router.get('/my',               protect,              getUserTrekBookings);
router.get('/guide/assigned',   protect,              getAssignedTrekBookings);
router.get('/admin/all',        protect, adminOnly,   getAllTrekBookings);
router.put('/:id/cancel',       protect,              cancelTrekBooking);
router.put('/:id/status',       protect, adminOnly,   updateTrekBookingStatus);
router.put('/:id/assign-guide', protect, adminOnly,   assignGuideToTrekBooking);
router.get('/:id', protect, getTrekBookingById); 
module.exports = router;