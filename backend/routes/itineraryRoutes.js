const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createItinerary,
  getUserItineraries,
  getItinerary,
  updateItinerary,
  deleteItinerary,
  generatePreview,
} = require('../controllers/itineraryController');

router.post('/generate',        generatePreview);          // public — preview only
router.post('/',   protect,     createItinerary);          // save
router.get('/user/:userId', protect, getUserItineraries);  // user's saved itineraries
router.get('/:id', protect,     getItinerary);
router.put('/:id', protect,     updateItinerary);
router.delete('/:id', protect,  deleteItinerary);

module.exports = router;