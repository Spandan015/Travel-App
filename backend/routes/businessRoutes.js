const express = require('express');
const router = express.Router();

const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getPendingBusinesses, approveBusiness, rejectBusiness } = require('../controllers/businessController');

router.use(protect);
router.use(adminOnly);

router.get('/pending', getPendingBusinesses);
router.put('/:id/approve', approveBusiness);
router.put('/:id/reject', rejectBusiness);

module.exports = router;

