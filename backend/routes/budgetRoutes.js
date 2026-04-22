const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createBudget,
  getUserBudgets,
  getEstimate,
  updateBudget,
  deleteBudget,
} = require('../controllers/budgetController');

router.get('/estimate',      getEstimate);              // public — no auth needed
router.post('/',  protect,   createBudget);
router.get('/user', protect, getUserBudgets);
router.put('/:id', protect,  updateBudget);
router.delete('/:id', protect, deleteBudget);

module.exports = router;