const Region = require('../models/Region');
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// ─── Multer setup ─────────────────────────────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, '../uploads/regions');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename:    (_req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = `region-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only image files are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// Export the multer middleware so the router can use it
exports.uploadMiddleware = upload.single('image');

// Admin: upload region cover image
// POST /api/regions/upload-image
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file received' });

    // Build a public URL.
    // If you use a CDN / cloud storage later, replace this with the remote URL.
    const baseUrl  = process.env.BASE_URL || `http://localhost:3000`;
    const imageUrl = `${baseUrl}/uploads/regions/${req.file.filename}`;

    res.json({ success: true, url: imageUrl });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Image upload failed' });
  }
};

// ─── Region CRUD ──────────────────────────────────────────────────────────────

// Public: get all active regions
exports.getAll = async (req, res) => {
  try {
    const regions = await Region.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 });
    res.json({ success: true, regions });
  } catch {
    res.status(500).json({ message: 'Error fetching regions' });
  }
};

// Public: get region by slug
exports.getBySlug = async (req, res) => {
  try {
    const region = await Region.findOne({ slug: req.params.slug, isActive: true });
    if (!region) return res.status(404).json({ message: 'Region not found' });
    res.json({ success: true, region });
  } catch {
    res.status(500).json({ message: 'Error fetching region' });
  }
};

// Admin: get all regions (including inactive)
exports.getAllAdmin = async (req, res) => {
  try {
    const regions = await Region.find().sort({ sortOrder: 1, createdAt: 1 });
    res.json({ success: true, regions });
  } catch {
    res.status(500).json({ message: 'Error fetching regions' });
  }
};

// Admin: create region
exports.create = async (req, res) => {
  try {
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
  } catch {
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
  } catch {
    res.status(500).json({ message: 'Error updating region' });
  }
};