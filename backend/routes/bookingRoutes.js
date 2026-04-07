const express = require('express');
const router  = express.Router();
const {
  getAll,
  getUserBookings,
  getById,
  create,
  updateStatus,
  cancelBooking
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/admin/all', protect, adminOnly, getAll);
router.get('/',          protect, adminOnly, getAll);   

router.get('/my',   protect, getUserBookings);
router.get('/:id',  protect, getById);
router.post('/',    protect, create);
router.patch('/:id/status', protect, updateStatus);
router.put('/:id/cancel',   protect, cancelBooking);

module.exports = router;