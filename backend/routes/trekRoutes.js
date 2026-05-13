const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAll, getBySlug, getByRegion,
  getAllAdmin, create, update,
  delete: deleteTrek, toggleStatus, togglePopular,
  manageTrekGuides,
} = require('../controllers/trekController');

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/',                    getAll);
router.get('/region/:regionId',    getByRegion);
router.get('/admin/all',           protect, adminOnly, getAllAdmin);
router.get('/:slug',               getBySlug);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.post('/',                   protect, adminOnly, create);
router.put('/:id',                 protect, adminOnly, update);
router.delete('/:id',              protect, adminOnly, deleteTrek);
router.put('/:id/toggle-status',   protect, adminOnly, toggleStatus);
router.put('/:id/toggle-popular',  protect, adminOnly, togglePopular);
router.put('/:id/guides',          protect, adminOnly, manageTrekGuides);

module.exports = router;