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
} = require('../controllers/regionController');

// ─── Public routes ────────────────────────────────────────────────────────────
router.get('/', getAll);

// ✅ IMPORTANT: /admin/all MUST come BEFORE /:slug
// If /:slug is first, Express matches "admin" as a slug and returns 404
router.get('/admin/all', protect, adminOnly, getAllAdmin);

router.get('/:slug', getBySlug);

// ─── Admin routes ─────────────────────────────────────────────────────────────
router.post('/',                 protect, adminOnly, create);
router.put('/:id',               protect, adminOnly, update);
router.delete('/:id',            protect, adminOnly, deleteRegion);
router.put('/:id/toggle-status', protect, adminOnly, toggleStatus);

module.exports = router;