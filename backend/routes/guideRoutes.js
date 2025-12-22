const express = require('express');
const router = express.Router();
const {
  getAllGuides,
  getGuideById,
  searchGuides
} = require('../controllers/guideController');

// Public routes - anyone can browse guides
router.get('/', getAllGuides);
router.get('/search', searchGuides);
router.get('/:id', getGuideById);

module.exports = router;