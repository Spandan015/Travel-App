const Trek   = require('../models/Trek');
const Region = require('../models/Region');

// ── helpers ───────────────────────────────────────────────────────────────────
const autoSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ── PUBLIC ────────────────────────────────────────────────────────────────────

// GET /api/treks  — all active treks, optional ?region=<regionId or slug>
exports.getAll = async (req, res) => {
  try {
    const { region, difficulty, search, featured, popular } = req.query;
    const filter = { isActive: true };

    if (difficulty) filter.difficulty = difficulty;
    if (featured === 'true') filter.isFeatured = true;
    if (popular  === 'true') filter.isPopular  = true;
    if (search) filter.$text = { $search: search };

    if (region) {
      // region can be a Mongo ID or a slug — handle both
      if (region.match(/^[0-9a-fA-F]{24}$/)) {
        filter.region = region;
      } else {
        const r = await Region.findOne({ slug: region });
        if (r) filter.region = r._id;
      }
    }

    const treks = await Trek.find(filter)
      .populate('region', 'name slug coverGradient image')
      .sort({ isPopular: -1, createdAt: -1 });

    res.json({ success: true, treks, total: treks.length });
  } catch (err) {
    console.error('getAll treks error:', err);
    res.status(500).json({ message: 'Error fetching treks' });
  }
};

// GET /api/treks/:slug
exports.getBySlug = async (req, res) => {
  try {
    const trek = await Trek.findOne({ slug: req.params.slug, isActive: true })
      .populate('region', 'name slug coverGradient image tagline');
    if (!trek) return res.status(404).json({ message: 'Trek not found' });
    res.json({ success: true, trek });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching trek' });
  }
};

// GET /api/treks/region/:regionId  — treks for a specific region (by Mongo ID)
exports.getByRegion = async (req, res) => {
  try {
    const treks = await Trek.find({ region: req.params.regionId, isActive: true })
      .populate('region', 'name slug')
      .sort({ isPopular: -1, price: 1 });
    res.json({ success: true, treks });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching treks for region' });
  }
};

// ── ADMIN ─────────────────────────────────────────────────────────────────────

// GET /api/treks/admin/all
exports.getAllAdmin = async (req, res) => {
  try {
    const treks = await Trek.find()
      .populate('region', 'name slug')
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
      .populate('region', 'name slug');
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