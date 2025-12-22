const express = require('express');
const router = express.Router();
const {
  getAllHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  toggleHotelStatus
} = require('../controllers/hotelController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllHotels);
router.get('/:id', getHotelById);

// Admin routes
router.post('/', protect, adminOnly, createHotel);
router.put('/:id', protect, adminOnly, updateHotel);
router.delete('/:id', protect, adminOnly, deleteHotel);
router.put('/:id/toggle-status', protect, adminOnly, toggleHotelStatus);

module.exports = router;