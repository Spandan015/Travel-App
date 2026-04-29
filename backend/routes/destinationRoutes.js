const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAll, getById, getRelated, create, update,
  delete: deleteDestination,
  toggleStatus, togglePopular, toggleFeatured,
  getByCategory, getPopular, getFeatured, search,
} = require('../controllers/destinationController');

// Public routes
router.get('/',                    getAll);
router.get('/search',              search);
router.get('/popular',             getPopular);
router.get('/featured',            getFeatured);
router.get('/category/:category',  getByCategory);
router.get('/:id',                 getById);
router.get('/:id/related',         getRelated);   // ✅ NEW

// Admin-only routes
router.post('/',                   protect, adminOnly, create);
router.put('/:id',                 protect, adminOnly, update);
router.delete('/:id',              protect, adminOnly, deleteDestination);
router.put('/:id/toggle-status',   protect, adminOnly, toggleStatus);
router.put('/:id/toggle-popular',  protect, adminOnly, togglePopular);
router.put('/:id/toggle-featured', protect, adminOnly, toggleFeatured);

module.exports = router;