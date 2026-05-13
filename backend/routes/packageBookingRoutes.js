const express = require('express');
const router  = express.Router();
const {
  createPackageBooking,
  getUserPackageBookings,
  getAllPackageBookings,
  cancelPackageBooking,
  updatePackageBookingStatus,
  assignGuideToPackageBooking,
  getAssignedPackageBookings,
  getPackageBookingById, 
} = require('../controllers/packageBookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/',                    protect,              createPackageBooking);
router.get('/my',                   protect,              getUserPackageBookings);
router.get('/guide/assigned',       protect,              getAssignedPackageBookings);
router.get('/admin/all',            protect, adminOnly,   getAllPackageBookings);
router.put('/:id/cancel',           protect,              cancelPackageBooking);
router.put('/:id/status',           protect, adminOnly,   updatePackageBookingStatus);
router.put('/:id/assign-guide',     protect, adminOnly,   assignGuideToPackageBooking);
router.get('/:id', protect, getPackageBookingById);

module.exports = router;