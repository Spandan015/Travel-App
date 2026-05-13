const Trek   = require('../models/Trek');
const Region = require('../models/Region');
const User   = require('../models/User');

const autoSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// GET /api/treks
exports.getAll = async (req, res) => {
  try {
    const { region, difficulty, search, featured, popular } = req.query;
    const filter = { isActive: true };
    if (difficulty)        filter.difficulty = difficulty;
    if (featured === 'true') filter.isFeatured = true;
    if (popular  === 'true') filter.isPopular  = true;
    if (search)            filter.$text = { $search: search };
    if (region) {
      if (region.match(/^[0-9a-fA-F]{24}$/)) {
        filter.region = region;
      } else {
        const r = await Region.findOne({ slug: region });
        if (r) filter.region = r._id;
      }
    }
    const treks = await Trek.find(filter)
      .populate('region', 'name slug coverGradient image')
      .populate('availableGuides', 'username firstName lastName email guideProfile')
      .sort({ isPopular: -1, createdAt: -1 });
    res.json({ success: true, treks, total: treks.length });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching treks' });
  }
};

// GET /api/treks/:slug
exports.getBySlug = async (req, res) => {
  try {
    const trek = await Trek.findOne({ slug: req.params.slug, isActive: true })
      .populate('region', 'name slug coverGradient image tagline')
      .populate('availableGuides', 'username firstName lastName email guideProfile');
    if (!trek) return res.status(404).json({ message: 'Trek not found' });
    res.json({ success: true, trek });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching trek' });
  }
};

// GET /api/treks/region/:regionId
exports.getByRegion = async (req, res) => {
  try {
    const treks = await Trek.find({ region: req.params.regionId, isActive: true })
      .populate('region', 'name slug')
      .populate('availableGuides', 'username firstName lastName guideProfile')
      .sort({ isPopular: -1, price: 1 });
    res.json({ success: true, treks });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching treks for region' });
  }
};

// GET /api/treks/admin/all
exports.getAllAdmin = async (req, res) => {
  try {
    const treks = await Trek.find()
      .populate('region', 'name slug')
      .populate('availableGuides', 'username firstName lastName email guideProfile')
      .sort({ createdAt: -1 });
    res.json({ success: true, treks });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching treks' });
  }
};

// POST /api/treks
exports.create = async (req, res) => {
  try {
    const body = req.body;
    if (!body.slug && body.name) body.slug = autoSlug(body.name);
    const trek = await Trek.create({ ...body, addedBy: req.user.id });
    await trek.populate('region', 'name slug');
    res.status(201).json({ success: true, message: 'Trek created successfully', trek });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'A trek with this slug already exists' });
    res.status(500).json({ message: err.message || 'Error creating trek' });
  }
};

// PUT /api/treks/:id
exports.update = async (req, res) => {
  try {
    const trek = await Trek.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('region', 'name slug')
      .populate('availableGuides', 'username firstName lastName email guideProfile');
    if (!trek) return res.status(404).json({ message: 'Trek not found' });
    res.json({ success: true, message: 'Trek updated successfully', trek });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error updating trek' });
  }
};

// DELETE /api/treks/:id
exports.delete = async (req, res) => {
  try {
    const trek = await Trek.findByIdAndDelete(req.params.id);
    if (!trek) return res.status(404).json({ message: 'Trek not found' });
    res.json({ success: true, message: 'Trek deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting trek' });
  }
};

// PUT /api/treks/:id/toggle-status
exports.toggleStatus = async (req, res) => {
  try {
    const trek = await Trek.findById(req.params.id);
    if (!trek) return res.status(404).json({ message: 'Trek not found' });
    trek.isActive = !trek.isActive;
    await trek.save();
    res.json({ success: true, message: `Trek ${trek.isActive ? 'activated' : 'deactivated'}`, trek });
  } catch (err) {
    res.status(500).json({ message: 'Error updating trek' });
  }
};

// PUT /api/treks/:id/toggle-popular
exports.togglePopular = async (req, res) => {
  try {
    const trek = await Trek.findById(req.params.id);
    if (!trek) return res.status(404).json({ message: 'Trek not found' });
    trek.isPopular = !trek.isPopular;
    await trek.save();
    res.json({ success: true, trek });
  } catch (err) {
    res.status(500).json({ message: 'Error updating trek' });
  }
};

// ════════════════════════════════════════════════════════
// PUT /api/treks/:id/guides  (admin)
// Body: { guideIds: ['userId1', 'userId2', ...] }
// Sets which guides are available for this trek
// ════════════════════════════════════════════════════════
exports.manageTrekGuides = async (req, res) => {
  try {
    const { guideIds } = req.body;
    if (!Array.isArray(guideIds)) {
      return res.status(400).json({ message: 'guideIds must be an array' });
    }

    // Validate all IDs are real guide users
    const guides = await User.find({
      _id: { $in: guideIds },
      role: 'guide',
    }).select('_id username firstName lastName guideProfile');

    const validIds = guides.map(g => g._id);

    const trek = await Trek.findByIdAndUpdate(
      req.params.id,
      { availableGuides: validIds },
      { new: true }
    ).populate('availableGuides', 'username firstName lastName email guideProfile');

    if (!trek) return res.status(404).json({ message: 'Trek not found' });

    res.json({
      success: true,
      message: `${validIds.length} guide(s) linked to this trek`,
      availableGuides: trek.availableGuides,
    });
  } catch (err) {
    console.error('manageTrekGuides error:', err);
    res.status(500).json({ message: err.message });
  }
};