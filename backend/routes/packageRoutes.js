const express = require('express');
const router  = express.Router();
const {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageStatus,
  managePackageGuides,
} = require('../controllers/packageController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes
router.get('/',    getAllPackages);
router.get('/:id', getPackageById);

// Admin routes
router.post('/',                    protect, adminOnly, createPackage);
router.put('/:id',                  protect, adminOnly, updatePackage);
router.delete('/:id',               protect, adminOnly, deletePackage);
router.put('/:id/toggle-status',    protect, adminOnly, togglePackageStatus);
router.put('/:id/guides',           protect, adminOnly, managePackageGuides);

module.exports = router;