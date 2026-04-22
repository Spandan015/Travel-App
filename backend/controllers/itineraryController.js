const Itinerary = require('../models/Itinerary');
const { generatePlan } = require('../utils/nepalItineraryData');

// POST /api/itinerary — create new itinerary
const createItinerary = async (req, res) => {
  try {
    const { destination, days, title, notes } = req.body;
    const userId = req.user._id;

    if (!destination || !days) {
      return res.status(400).json({ message: 'Destination and days are required.' });
    }

    const plan = generatePlan(destination, Number(days));

    const itinerary = await Itinerary.create({
      userId,
      destination,
      days: Number(days),
      plan,
      title: title || `${destination} — ${days}-Day Trip`,
      notes: notes || '',
    });

    return res.status(201).json({ message: 'Itinerary created', itinerary });
  } catch (err) {
    console.error('createItinerary error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/itinerary/user/:userId — all itineraries for a user
const getUserItineraries = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const itineraries = await Itinerary.find({ userId }).sort({ createdAt: -1 });
    return res.json({ itineraries });
  } catch (err) {
    console.error('getUserItineraries error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/itinerary/:id — single itinerary
const getItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' });
    return res.json({ itinerary });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/itinerary/:id — update plan (reorder / add / delete activities)
const updateItinerary = async (req, res) => {
  try {
    const { plan, title, notes } = req.body;
    const updated = await Itinerary.findByIdAndUpdate(
      req.params.id,
      { plan, title, notes },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Itinerary not found' });
    return res.json({ message: 'Itinerary updated', itinerary: updated });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/itinerary/:id
const deleteItinerary = async (req, res) => {
  try {
    await Itinerary.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Itinerary deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/itinerary/generate — generate a plan without saving
const generatePreview = async (req, res) => {
  try {
    const { destination, days } = req.body;
    if (!destination || !days) {
      return res.status(400).json({ message: 'Destination and days required.' });
    }
    const plan = generatePlan(destination, Number(days));
    return res.json({ plan });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createItinerary, getUserItineraries, getItinerary, updateItinerary, deleteItinerary, generatePreview };