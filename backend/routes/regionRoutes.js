const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAll,
  getBySlug,
  getAllAdmin,
  create,
  update,
  delete: deleteRegion,
  toggleStatus,
  uploadImage,
  uploadMiddleware,
} = require('../controllers/regionController');

// ─── Public routes ────────────────────────────────────────────────────────────
router.get('/', getAll);

// IMPORTANT: /admin/all and /upload-image must come BEFORE /:slug
// so Express does not treat "admin" or "upload-image" as a slug value
router.get('/admin/all',     protect, adminOnly, getAllAdmin);
router.post('/upload-image', protect, adminOnly, uploadMiddleware, uploadImage);

router.get('/:slug', getBySlug);

// ─── Admin CRUD routes ────────────────────────────────────────────────────────
router.post('/',                 protect, adminOnly, create);
router.put('/:id',               protect, adminOnly, update);
router.delete('/:id',            protect, adminOnly, deleteRegion);
router.put('/:id/toggle-status', protect, adminOnly, toggleStatus);

module.exports = router;