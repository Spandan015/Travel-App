const Budget = require('../models/Budget');
const { estimateBudget } = require('../utils/nepalItineraryData');

// POST /api/budget
const createBudget = async (req, res) => {
  try {
    const { destination, days, totalBudget, itineraryId, customExpenses } = req.body;
    const userId = req.user._id;

    const estimated = estimateBudget(destination, Number(days));

    const budget = await Budget.create({
      userId,
      itineraryId: itineraryId || null,
      destination,
      days: Number(days),
      totalBudget: Number(totalBudget),
      expenses: {
        hotel:      estimated.hotel,
        food:       estimated.food,
        transport:  estimated.transport,
        activities: estimated.activities,
      },
      customExpenses: customExpenses || [],
    });

    return res.status(201).json({ message: 'Budget saved', budget });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/budget/user — all budgets for logged-in user
const getUserBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ budgets });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/budget/estimate?destination=pokhara&days=5
const getEstimate = async (req, res) => {
  try {
    const { destination, days } = req.query;
    if (!destination || !days) {
      return res.status(400).json({ message: 'destination and days query params required.' });
    }
    const estimate = estimateBudget(destination, Number(days));
    return res.json({ estimate });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/budget/:id
const updateBudget = async (req, res) => {
  try {
    const updated = await Budget.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json({ message: 'Budget updated', budget: updated });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/budget/:id
const deleteBudget = async (req, res) => {
  try {
    await Budget.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Budget deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createBudget, getUserBudgets, getEstimate, updateBudget, deleteBudget };