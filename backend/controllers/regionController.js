const Region = require('../models/Region');

// Public: get all active regions
exports.getAll = async (req, res) => {
  try {
    const regions = await Region.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 });
    res.json({ success: true, regions });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching regions' });
  }
};

// Public: get region by slug
exports.getBySlug = async (req, res) => {
  try {
    const region = await Region.findOne({ slug: req.params.slug, isActive: true });
    if (!region) return res.status(404).json({ message: 'Region not found' });
    res.json({ success: true, region });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching region' });
  }
};

// Admin: get all regions (including inactive)
exports.getAllAdmin = async (req, res) => {
  try {
    const regions = await Region.find().sort({ sortOrder: 1, createdAt: 1 });
    res.json({ success: true, regions });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching regions' });
  }
};

// Admin: create region
exports.create = async (req, res) => {
  try {
    // Auto-generate slug if not provided
    if (!req.body.slug && req.body.name) {
      req.body.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    const region = await Region.create({ ...req.body, addedBy: req.user.id });
    res.status(201).json({ success: true, message: 'Region created successfully', region });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'A region with this slug already exists' });
    res.status(500).json({ message: err.message || 'Error creating region' });
  }
};

// Admin: update region
exports.update = async (req, res) => {
  try {
    const region = await Region.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!region) return res.status(404).json({ message: 'Region not found' });
    res.json({ success: true, message: 'Region updated successfully', region });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error updating region' });
  }
};

// Admin: delete region
exports.delete = async (req, res) => {
  try {
    const region = await Region.findByIdAndDelete(req.params.id);
    if (!region) return res.status(404).json({ message: 'Region not found' });
    res.json({ success: true, message: 'Region deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting region' });
  }
};

// Admin: toggle active status
exports.toggleStatus = async (req, res) => {
  try {
    const region = await Region.findById(req.params.id);
    if (!region) return res.status(404).json({ message: 'Region not found' });
    region.isActive = !region.isActive;
    await region.save();
    res.json({ success: true, message: `Region ${region.isActive ? 'activated' : 'deactivated'}`, region });
  } catch (err) {
    res.status(500).json({ message: 'Error updating region' });
  }
};