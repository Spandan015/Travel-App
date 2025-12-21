const Destination = require('../models/destination');

exports.getAll = async (req, res) => {
  try {
    const destinations = await Destination.find();
    res.json(destinations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const dest = await Destination.findById(req.params.id);
    if (!dest) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    res.json(dest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = req.body;
    const dest = await Destination.create(data);
    res.status(201).json(dest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};